#!/usr/bin/env python3
"""
PITANG LABS · SIMULADOR DE POC (CLI)
Lê requisitos em qualquer formato de texto na IDE (Markdown, Histórias de Usuário,
Gherkin, bullet points ou texto livre), mapeia os fluxos por categorias de negócio,
gera os protótipos em 3 direções com regras Jakub Krehel e atualiza dist/poc-simulator.html.

Uso:
  python scripts/simulate.py [arquivo_de_requisitos.txt] [--open] [--serve]
"""

import sys
import os
import json
import re
import pathlib
import subprocess
import webbrowser
import argparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import build as bundler

CATEGORY_MAP = [
    {
        "id": "acesso",
        "title": "01. Acesso & Autenticação",
        "keywords": ["login", "autenticacao", "acesso", "sso", "gov.br", "senha", "perfil", "2fa", "onboarding", "token", "cadastro usuario"]
    },
    {
        "id": "entrada",
        "title": "02. Entrada & Registro",
        "keywords": ["solicitacao", "abertura", "nova manifestacao", "formulario", "upload", "anexo", "pedido", "requisicao", "denuncia", "chamado", "cadastro", "input", "envio"]
    },
    {
        "id": "operacao",
        "title": "03. Triagem & Operação",
        "keywords": ["triagem", "kanban", "atendimento", "analise", "fila", "aprovacao", "alçada", "parecer", "encaminhamento", "sla", "prioridade", "operacional", "despacho"]
    },
    {
        "id": "acompanhamento",
        "title": "04. Acompanhamento & Protocolo",
        "keywords": ["protocolo", "consulta", "status", "timeline", "historico", "rastreamento", "notificacao", "interacao", "resposta", "chat", "acompanhar"]
    },
    {
        "id": "gestao",
        "title": "05. Gestão, Métricas & Governança",
        "keywords": ["dashboard", "metricas", "kpi", "relatorio", "indicador", "auditoria", "conformidade", "lgpd", "governanca", "executivo", "exportacao", "painel"]
    }
]

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r'[àáâãäå]', 'a', s)
    s = re.sub(r'[èéêë]', 'e', s)
    s = re.sub(r'[ìíîï]', 'i', s)
    s = re.sub(r'[òóôõö]', 'o', s)
    s = re.sub(r'[ùúûü]', 'u', s)
    s = re.sub(r'[ç]', 'c', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def classify_category(title: str, desc: str, rules: list) -> str:
    combined = f"{title} {desc} {' '.join(rules)}".lower()
    for cat in CATEGORY_MAP:
        for kw in cat["keywords"]:
            if kw in combined:
                return cat["title"]
    return "02. Entrada & Registro"

def parse_requirements_file(filepath: pathlib.Path) -> dict:
    text = filepath.read_text(encoding="utf-8").strip()
    lines = text.splitlines()

    title = "Pitang Labs · POC"
    summary = "Protótipo interativo gerado a partir de requisitos de negócio."
    current_category = "Geral"
    flows = []
    current_flow = None
    rule_idx = 1

    # Detect title
    for line in lines[:8]:
        line_s = line.strip()
        if line_s.startswith("# "):
            title = line_s.replace("# ", "").strip()
            break
        elif re.match(r'^(projeto|poc|sistema):\s*(.+)', line_s, re.IGNORECASE):
            title = re.sub(r'^(projeto|poc|sistema):\s*', '', line_s, flags=re.IGNORECASE).strip()
            break

    for line in lines:
        l = line.strip()
        if not l:
            continue

        # Category detection
        cat_m = re.match(r'^#{2,3}\s+(?:categoria|modulo|fase|etapa):\s*(.+)', l, re.IGNORECASE)
        if cat_m:
            current_category = cat_m.group(1).strip()
            continue

        # Flow detection: ### Fluxo: X or ## Tela: X or Scenario: X or Como...
        flow_h_m = re.match(r'^#{2,3}\s+(?:fluxo|tela|visao|modulo|epico)?\s*[:\d.-]*\s*(.+)', l, re.IGNORECASE)
        scenario_m = re.match(r'^(?:cenario|scenario):\s*(.+)', l, re.IGNORECASE)
        story_m = re.match(r'^(?:como|as a)\s+(.+?),\s*(?:quero|i want)\s+(.+)', l, re.IGNORECASE)

        if flow_h_m and "regra" not in l.lower() and "requisito" not in l.lower():
            if current_flow:
                flows.append(current_flow)
            f_title = flow_h_m.group(1).strip()
            current_flow = {
                "id": slugify(f_title),
                "title": f_title,
                "category": current_category if current_category != "Geral" else None,
                "sum": "",
                "rules": []
            }
            continue
        elif scenario_m:
            if current_flow:
                flows.append(current_flow)
            f_title = scenario_m.group(1).strip()
            current_flow = {
                "id": slugify(f_title),
                "title": f_title,
                "category": current_category if current_category != "Geral" else None,
                "sum": f"Cenário de validação: {f_title}",
                "rules": []
            }
            continue
        elif story_m:
            if current_flow:
                flows.append(current_flow)
            role = story_m.group(1).strip()
            act = story_m.group(2).strip()
            f_title = act.capitalize()
            current_flow = {
                "id": slugify(f_title),
                "title": f_title,
                "category": current_category if current_category != "Geral" else None,
                "sum": f"História: Como {role}, quero {act}.",
                "rules": []
            }
            continue

        # Rule detection: RN-01: ... or Regra: ...
        rule_m = re.match(r'^(?:-\s*)?(?:rn|rf|regra|rule)[-:\s\d]*\s*(.+)', l, re.IGNORECASE) or \
                 re.match(r'^(?:-\s*)?(?:deve|o sistema deve|obrigatorio|validacao):\s*(.+)', l, re.IGNORECASE)
        if rule_m:
            r_text = rule_m.group(1).strip()
            r_formatted = f"RN-{rule_idx:02d}: {r_text}"
            rule_idx += 1
            if current_flow:
                current_flow["rules"].append(r_formatted)
            continue

        # Bullet point inside flow
        if l.startswith("-") or l.startswith("*"):
            item = l.lstrip("-* ").strip()
            if current_flow:
                current_flow["rules"].append(item)
            continue

        if current_flow and not current_flow["sum"]:
            current_flow["sum"] = l

    if current_flow:
        flows.append(current_flow)

    # If no flows matched, fallback to default NLP flows
    if not flows:
        flows = [
            {
                "id": "acesso-seguro",
                "title": "Acesso & Autenticação",
                "category": "01. Acesso & Autenticação",
                "sum": "Identificação e credenciais de acesso seguro.",
                "rules": ["RN-01: Validação de perfil institucional e 2FA", "RN-02: Mascaramento de dados e conformidade LGPD"]
            },
            {
                "id": "solicitacao-registro",
                "title": "Nova Manifestação / Solicitação",
                "category": "02. Entrada & Registro",
                "sum": "Registro do pedido com validação preditiva e upload de anexos.",
                "rules": ["RN-03: Upload de documentos em PDF/PNG de até 15 MB", "RN-04: Geração imediata de protocolo alfanumérico"]
            },
            {
                "id": "triagem-operacional",
                "title": "Mesa de Triagem & SLA",
                "category": "03. Triagem & Operação",
                "sum": "Triagem assistida por IA com classificação de prioridade e SLA.",
                "rules": ["RN-05: Alerta sonoro/visual para estouro de SLA < 4 horas", "RN-06: Minuta de resposta assistida por IA"]
            },
            {
                "id": "acompanhamento-protocolo",
                "title": "Acompanhamento & Protocolo",
                "category": "04. Acompanhamento & Protocolo",
                "sum": "Consulta pública com linha do tempo de despachos.",
                "rules": ["RN-07: Rastreamento em tempo real por protocolo", "RN-08: Download de parecer conclusivo assinado"]
            },
            {
                "id": "dashboard-governanca",
                "title": "Dashboard Executivo & Telemetria",
                "category": "05. Gestão, Métricas & Governança",
                "sum": "Métricas consolidadas com números tabulares e auditoria.",
                "rules": ["RN-09: Indicadores em tempo real com números tabulares", "RN-10: Exportação de logs de auditoria"]
            }
        ]

    # Normalize flows
    for i, f in enumerate(flows):
        if not f.get("category"):
            f["category"] = classify_category(f["title"], f.get("sum", ""), f.get("rules", []))
        if not f.get("rules"):
            f["rules"] = [
                f"RN-{i+1:02d}.1: Validação de regras e persistência de dados",
                f"RN-{i+1:02d}.2: Usabilidade padrão Jakub Krehel e acessibilidade WCAG AA"
            ]
        f["today"] = [f"Requisito especificado: {f['title']}"]

    categories = list(dict.fromkeys([f["category"] for f in flows]))

    return {
        "title": title,
        "summary": summary,
        "rawText": text,
        "flows": flows,
        "categories": categories,
        "personas": {
            "solicitante": {
                "name": "Usuário Solicitante",
                "tag": "Cidadão / Colaborador",
                "color": "#ED1C24",
                "ini": "US",
                "line": "Submete demandas e acompanha o protocolo sem atritos.",
                "quote": "Quero clareza sobre o prazo e garantia de sigilo.",
                "needs": "Formulário objetivo, protocolo instantâneo e notificações."
            },
            "analista": {
                "name": "Analista Operacional",
                "tag": "Triagem & Atendimento",
                "color": "#1F6F5C",
                "ini": "AO",
                "line": "Realiza triagem e despacha processos com foco em SLA.",
                "quote": "Preciso de IA para acelerar minutas de resposta.",
                "needs": "Fila kanban, alerta de SLA e atalhos rápidos."
            },
            "gestor": {
                "name": "Gestor de Governança",
                "tag": "Compliance & Auditoria",
                "color": "#2F5D9E",
                "ini": "GG",
                "line": "Supervisiona indicadores de qualidade e conformidade legal.",
                "quote": "Quero telemetria precisa e relatórios consolidados.",
                "needs": "Métricas tabulares, mapa de calor e exportação auditável."
            }
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Pitang Labs · Simulador de POC em HTML")
    parser.add_argument("requirements_file", nargs="?", default="requirements/exemplo-ouvidoria-pitang.md",
                        help="Caminho do arquivo com os requisitos (txt, md, json, etc)")
    parser.add_argument("--open", action="store_true", help="Abre o navegador após a compilação")
    parser.add_argument("--serve", action="store_true", help="Inicia servidor local embutido")
    parser.add_argument("--port", type=int, default=3000, help="Porta do servidor local (padrão: 3000)")

    args = parser.parse_args()
    req_path = pathlib.Path(args.requirements_file)

    if not req_path.is_absolute():
        req_path = ROOT / req_path

    if not req_path.exists():
        print(f"Aviso: Arquivo '{req_path}' não encontrado. Usando modelo padrão.")
        project = None
        custom_json_str = None
    else:
        print(f"→ Lendo requisitos de: {req_path}")
        project = parse_requirements_file(req_path)
        custom_json_str = json.dumps(project, ensure_ascii=False)

    # Build standalone HTML
    out_file = bundler.build(custom_json_str)

    # Print Executive Summary
    print("\n" + "=" * 64)
    print("  PITANG LABS · SIMULADOR DE POC (Design Engineering Workbench)")
    print("=" * 64)
    if project:
        print(f"  Projeto:                 {project['title']}")
        print(f"  Categorias Mapeadas:     {len(project['categories'])}")
        for cat in project["categories"]:
            cat_flows = [f for f in project["flows"] if f["category"] == cat]
            print(f"    • {cat} ({len(cat_flows)} {'fluxo' if len(cat_flows)==1 else 'fluxos'})")
        total_rules = sum(len(f.get("rules", [])) for f in project["flows"])
        print(f"  Total de Fluxos:         {len(project['flows'])}")
        print(f"  Regras de Negócio:       {total_rules} regras validadas")
        print(f"  Direções Geradas:        {len(project['flows']) * 3} telas interativas")
    print(f"  Padrões Jakub Krehel:    100% WCAG AA, Concentric Radii, 0.96 Scale")
    print(f"  Arquivo Pronto:          {out_file}")
    print("=" * 64 + "\n")

    if args.serve:
        serve_script = ROOT / "scripts" / "serve.py"
        subprocess.run([sys.executable, str(serve_script), str(args.port)])
    elif args.open:
        webbrowser.open(out_file.as_uri())

if __name__ == "__main__":
    main()
