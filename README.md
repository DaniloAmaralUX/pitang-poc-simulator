# Pitang Labs · Simulador de POC em HTML

> **Simulador de POCs e Protótipos Interativos orientados a Requisitos de Negócio e Engenharia de Usabilidade (Jakub Krehel & Pitang Labs).**

O **Pitang Labs · Simulador de POC** organiza requisitos e apresenta modelos de interface em molduras iOS, Android e Web. Texto livre é preservado como briefing; fluxos estruturados podem ser explorados com modelos. A quantidade de direções depende do modelo disponível. Regras mapeadas e orientações de usabilidade não representam validação automática.

Use **Abrir POC HTML** para visualizar uma aplicação funcional criada pelo agente na IDE. O viewer incorpora esse HTML ao exportar o projeto. A ferramenta local não executa um modelo de IA para gerar aplicações a partir do texto.

---

## ✦ Como Funciona

```
                                      FLUXO NA IDE
   ┌───────────────────────────┐         ┌───────────────────────────────┐
   │  1. Insira os Requisitos   │  ─────> │  2. Execute o Simulador (CLI) │
   │  Texto em qualquer formato │         │  python scripts/simulate.py   │
   │  (MD, User Stories, BDD)   │         │  ou npm run simulate          │
   └───────────────────────────┘         └───────────────────────────────┘
                                                         │
                                                         ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │  3. Abra no Browser da sua IDE (ou navegador padrão)                │
   │                                                                     │
   │   [Fluxos Categorizados]       [Mock-up Interativo]   [Racional]    │
   │   • 01. Acesso & Auth          • iPhone 15 Pro        • Regras RN   │
   │   • 02. Entrada & Registro     • Android Pixel 8      • Personas    │
   │   • 03. Triagem & Operação     • Desktop Web          • Movimento   │
   │   • 04. Acompanhamento         ───────────────────    • Usabilidade │
   │   • 05. Gestão & Métricas      [1] [2] [3] Direções   • Checklist   │
   └─────────────────────────────────────────────────────────────────────┘
```

1. **Na IDE:** Crie ou edite um arquivo de texto com os requisitos do sistema (ex: `requirements/exemplo-ouvidoria-pitang.md`). Não há regras rígidas de formatação: o motor NLP reconhece módulos, categorias, histórias, cenários e regras (`RN-01`, `RN-02`, etc.).
2. **Gere a POC:** Execute `python scripts/simulate.py [arquivo]` ou `npm run simulate`. O script processa as regras de negócio, categoriza os fluxos, sintetiza 3 direções de design para cada etapa e gera o arquivo `dist/poc-simulator.html`.
3. **Explore no Browser:** Abra o arquivo na IDE (Antigravity Simple Browser, VS Code Live Server ou navegador padrão). Você verá todos os fluxos agrupados por categorias, telas funcionais com feedback tátil e o painel de defesa das decisões de design engineering.

---

## ✦ Características Principais

### 1. Mapeamento Automático por Categorias de Negócio
Ao invés de layouts estáticos desconectados, a ferramenta mapeia a jornada completa da aplicação em categorias corporativas:
- **01. Acesso & Autenticação:** Login corporativo Gov.br, SSO, perfil multi-tenant e manifestação anônima segura.
- **02. Entrada & Registro:** Formulários preditivos, upload de evidências com validação até 15&nbsp;MB e conformidade LGPD.
- **03. Triagem & Operação:** Cockpit operacional com kanban ágil, SLA com contagem regressiva e suporte de IA generativa.
- **04. Acompanhamento & Protocolo:** Linha do tempo de tramitação, consulta pública por número de protocolo e emissão de certidão digital.
- **05. Gestão, Métricas & Governança:** Telemetria de SLA, mapas de calor por diretoria e relatórios auditáveis com números tabulares.

### 2. Três Direções de Design por Fluxo (Teclas `1`, `2`, `3`)
Para cada fluxo mapeado, o simulador projeta 3 hipóteses de solução com prós, contras e tradeoffs:
- **Direção 1 (Operação Direta):** Foco em velocidade, menor número de cliques e execução compacta.
- **Direção 2 (Assistida por IA):** Wizard guiado passo a passo com copilot preditivo, validação antecipada e prevenção de erros.
- **Direção 3 (Visão Analítica):** Alta densidade de informação para operadores (kanban, tabelas com números tabulares e ações em lote).

### 3. Editor de Requisitos & Simulação em Tempo Real no Browser (`⌘K`)
Você não precisa reiniciar o processo para testar novas hipóteses:
- Pressione <kbd>⌘K</kbd> ou <kbd>Ctrl+K</kbd> (ou clique no botão **Requisitos & Regras** no topo da barra lateral).
- Cole novos requisitos em texto, selecione um dos *presets* oficiais do Pitang Labs (Ouvidoria, AGS Bafômetro, Compras B2B) e clique em **Simular POC em Tempo Real**.
- O protótipo se recompila no próprio navegador, atualizando fluxos, telas e regras instantaneamente.

### 4. Padrões Estritos de Design Engineering de Jakub Krehel
Todos os componentes e telas geradas seguem rigorosamente as heurísticas de Jakub Krehel e o guia de design do Pitang Labs:
- **Raios Concêntricos:** Fórmula geométrica rigorosa: $\text{Raio Externo} = \text{Raio Interno} + \text{Padding} + \text{Borda}$. Sem cantos deformados ou comprimidos.
- **Feedback Tátil ao Pressionar:** Efeito táctil `active:scale-[0.96]` (duração de 150ms `ease-out`, rigorosamente $\ge 0.95$).
- **Precisão Numérica Tabular:** `tabular-nums` obrigatório em todos os contadores, prazos, moedas e SLAs para eliminar trepidação de layout (*jitter*).
- **Alinhamento Óptico:** Compensação de padding visual em ícones e centralização geométrica corrigida.
- **Áreas de Toque Mínimas:** $\ge 44\times 44$px para mobile e $\ge 40\times 40$px para desktop corporativo.
- **Acessibilidade WCAG AA:** Contraste $\ge 4.5:1$, foco visível de alto contraste (`#ED1C24`) e nomes acessíveis em todos os elementos interativos.
- **Isolamento de Rolagem:** Gavetas, modais e planilhas contêm rolagem independente (`overscroll-behavior: contain`).

### 5. Multiplataforma Nativo (iOS · Android · Web)
Alterne entre iPhone 15 Pro (com Dynamic Island), Android Pixel 8 (Material 3) e Web Desktop responsivo mantendo os mesmos componentes adaptados semanticamente via CSS.

### 6. Exportação Autônoma (Zero Dependências)
O botão **Exportar POC (.html)** gera um arquivo HTML 100% autônomo com todas as fontes, ícones SVG, lógica de roteamento e regras inlined. Pode ser enviado por e-mail, hospedado no GitHub Pages, Vercel ou aberto offline sem necessidade de instalar Node ou Figma.

---

## ✦ Estrutura do Projeto

```
pitang-poc-simulator/
├── dist/
│   └── poc-simulator.html          # Arquivo HTML único autocontido gerado
├── requirements/                   # Diretório de requisitos da IDE
│   ├── exemplo-ouvidoria-pitang.md # Requisitos: Ouvidoria & Atendimento
│   ├── exemplo-portal-ags-compliance.md # Requisitos: AGS Bafômetro & Compliance
│   ├── exemplo-b2b-procurement.md  # Requisitos: Compras & Cotações B2B
│   └── template-requisitos.txt     # Template livre para novos projetos
├── src/
│   ├── index.html                  # Esqueleto HTML com logotipo Pitang Labs
│   ├── shell.css / shell.js        # Layout da ferramenta, busca e gaveta de requisitos
│   ├── kit.css / kit.js            # Design System Jakub Krehel e componentes táteis
│   ├── picker.css                  # Seletor de versões (Emil Kowalski)
│   ├── tour.js                     # Tour guiado de primeiro acesso
│   ├── simulator/
│   │   ├── parser.js               # Motor NLP: extrai regras, fluxos e categorias
│   │   ├── default-poc.js          # POC corporativa padrão Pitang Labs
│   │   └── generator.js            # Gerador de 3 direções de design funcionais
│   └── assets/
│       ├── pitang-logo.svg         # Logotipo vetorial oficial do Pitang Labs
│       └── jakub-rules.md          # Especificação de design engineering Jakub
├── scripts/
│   ├── build.py                    # Script de empacotamento em arquivo único
│   ├── simulate.py                 # CLI para processar requisitos na IDE
│   ├── serve.py                    # Servidor local leve para browser da IDE
│   └── test.mjs                    # Suite de testes e validação
├── package.json                    # Scripts npm (simulate, build, serve, test)
└── README.md
```

---

## ✦ Como Utilizar na IDE

### Pré-requisitos
- Python 3.8+ instalado (ou Node.js 18+)
- Nenhum pacote externo obrigatório: utiliza apenas bibliotecas nativas!

### 1. Iniciar Simulação com Requisitos Próprios
Para transformar seus requisitos de texto em um protótipo:

```bash
# Executa com um arquivo de requisitos específico
python scripts/simulate.py requirements/exemplo-ouvidoria-pitang.md

# Ou via npm
npm run simulate -- requirements/exemplo-ouvidoria-pitang.md
```

### 2. Abrir o Visualizador no Browser
```bash
# Inicia o servidor local para abrir no browser da IDE (porta 3000)
python scripts/serve.py

# Ou
npm start
```
Acesse `http://localhost:3000` na visualização interna da sua IDE (Simple Browser / Preview) ou em qualquer navegador.

### 3. Atalhos de Teclado no Simulador
| Tecla | Ação |
|---|---|
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> ou <kbd>←</kbd> <kbd>→</kbd> | Alterna entre as 3 direções de design daquele fluxo |
| <kbd>↑</kbd> <kbd>↓</kbd> | Navega entre os fluxos da aplicação |
| <kbd>R</kbd> | Reinicia a tela e animações de entrada |
| <kbd>⌘K</kbd> ou <kbd>Ctrl+K</kbd> | Abre o editor de requisitos e simulador em tempo real |
| <kbd>Esc</kbd> | Fecha gavetas, modais e cartões de persona |

---

## ✦ Regras Jakub Krehel x Diretrizes Pitang Labs

| Padrão | Especificação Implementada | Benefício no Protótipo |
|---|---|---|
| **Raios Concêntricos** | $R_{outer} = R_{inner} + \text{Padding}$ | Elimina cantos comprimidos ou deformados em cards e botões |
| **Escala Tátil** | `active:scale-[0.96]` (150ms `ease-out`) | Proporciona feedback físico tátil imediato em cliques |
| **Números Tabulares** | `tabular-nums` em todas as métricas e SLAs | Previne trepidação horizontal quando valores mudam |
| **Alinhamento Óptico** | Ícones com compensação de 2px de padding | Alinhamento visual harmônico compensando a massa geométrica |
| **Áreas de Toque** | $\ge 44\times 44$px (mobile) / $\ge 40\times 40$px (web) | Erradica cliques acidentais e atende 100% WCAG AA |
| **Isolamento de Scroll** | `overscroll-behavior: contain` | Impede que a rolagem de um modal transfira para o fundo |
| **Movimento Reduzido** | `@media (prefers-reduced-motion: reduce)` | Acessibilidade completa para usuários sensíveis a movimento |

---

## ✦ Licença & Créditos

- Desenvolvido no **Pitang Labs** (Porto Digital, Recife/PE).
- Base arquitetural inspirada no `prototype-viewer` de Apparício Junior.
- Seletor de versões adaptado do design de Emil Kowalski.
- Princípios de Design Engineering formulados por Jakub Krehel e Vercel Interface Guidelines.
- Licença: MIT.

## Limites e verificação da prévia

O editor local organiza briefings e apresenta modelos; não executa um agente de IA nem implementa automaticamente todas as regras do texto. Texto livre é preservado como briefing. Use títulos `### Fluxo: Nome` para mapear fluxos explícitos, ou JSON com `flows`. JSON inválido mantém o projeto anterior e mostra orientação para correção.

Requisitos mapeados não significam requisitos verificados. Integrações e dados dos modelos são exemplos. Acesso tem uma única direção porque o modelo não oferece três implementações distintas. A exportação inclui os dados do projeto atual, inclusive ao abrir em outro navegador.

Verificação: `python scripts/build.py` e `node scripts/test.mjs`. A suíte inclui regressões de fidelidade do texto, JSON inválido, exportação segura e quantidade de alternativas.

### Visualizar um HTML funcional

Use **Abrir POC HTML** para carregar o arquivo gerado pelo agente na IDE (até 5 MB). A aplicação é exibida em iframe isolado, com as molduras do viewer. O arquivo é incorporado na exportação e lembrado localmente quando o armazenamento permitir. O isolamento bloqueia localStorage dentro da prévia; use o HTML original ou a exportação de dados da própria aplicação para reter dados. A moldura não converte uma aplicação web em um app nativo.
