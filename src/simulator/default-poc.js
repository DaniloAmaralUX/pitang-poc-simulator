/* ==========================================================================
   PITANG LABS · DEFAULT ENTERPRISE POC DEFINITION
   Comprehensive reference application: "Sistema Integrado de Atendimento,
   Ouvidoria & Inteligência Operacional" (Pitang Labs).
   Used as the default high-craft demonstration and test bench.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DefaultPoc = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DEFAULT_POC = {
    title: "Pitang Labs · Ouvidoria & Inteligência Operacional",
    summary: "Simulador de POC corporativa para atendimento, triagem inteligente e governança com design engineering de alta fidelidade.",
    categories: [
      "01. Acesso & Autenticação",
      "02. Entrada & Registro",
      "03. Triagem & Operação",
      "04. Acompanhamento & Protocolo",
      "05. Gestão, Métricas & Governança"
    ],
    flows: [
      {
        id: "acesso-seguro",
        title: "Acesso & Identificação Institucional",
        category: "01. Acesso & Autenticação",
        sum: "Identificação unificada com Gov.br, SSO corporativo e protocolo anônimo.",
        rules: [
          "RN-01: Autenticação via Gov.br (Prata/Ouro) e SSO corporativo com chave SAML 2.0 / OAuth2",
          "RN-02: Garantia de manifestação anônima com chave de acesso criptográfica de 16 caracteres",
          "RN-03: Bloqueio temporário após 5 tentativas inválidas e sessão com expiração em 15 minutos"
        ],
        today: [
          "Tela legada de login: formulário rígido sem integração Gov.br",
          "Inexistência de opção de manifestação anônima segura"
        ]
      },
      {
        id: "nova-manifestacao",
        title: "Nova Manifestação & Registro de Ocorrência",
        category: "02. Entrada & Registro",
        sum: "Formulário inteligente com triagem preditiva, upload validado e geração de protocolo.",
        rules: [
          "RN-04: Classificação automatizada do tipo (Denúncia, Reclamação, Elogio, Sugestão) por IA",
          "RN-05: Upload obrigatório de evidências em PDF, JPG, MP3 ou MP4 com limite total de 15&nbsp;MB",
          "RN-06: Consentimento explícito de tratamento de dados sensíveis conforme Lei Geral de Proteção de Dados (LGPD)"
        ],
        today: [
          "Formulário legado em página única com mais de 30 campos desnecessários",
          "Erros de upload silenciosos sem barra de progresso ou retorno ao usuário"
        ]
      },
      {
        id: "mesa-triagem",
        title: "Mesa de Triagem & Fila Operacional",
        category: "03. Triagem & Operação",
        sum: "Cockpit do analista com kanban de SLA, sugestão de parecer por IA e despacho rápido.",
        rules: [
          "RN-07: Priorização automática por criticidade de SLA (Alta &lt; 4h, Média &lt; 24h, Baixa &lt; 72h)",
          "RN-08: Geração assistida de minuta de resposta com revisão e validação humana obrigatória",
          "RN-09: Tramitação com registro indelével de histórico de despachos para auditoria"
        ],
        today: [
          "Planilhas desconectadas para controle de SLA de analistas",
          "Falta de automação na classificação de urgência de manifestações"
        ]
      },
      {
        id: "acompanhamento-protocolo",
        title: "Consulta Pública & Linha do Tempo",
        category: "04. Acompanhamento & Protocolo",
        sum: "Rastreamento em tempo real com linha do tempo de despachos e canal de interação.",
        rules: [
          "RN-10: Consulta pública por número de protocolo no formato PIT-2026-XXXXXX",
          "RN-11: Linha do tempo com datas, despachos públicos e download de certidão conclusiva assinada",
          "RN-12: Canal seguro para envio de complementação de informações solicitadas pelo analista"
        ],
        today: [
          "Cidadão obrigado a ligar para central para saber o andamento do protocolo",
          "Informações de tramitação opacas sem histórico visível"
        ]
      },
      {
        id: "dashboard-governanca",
        title: "Dashboard Executivo & Telemetria",
        category: "05. Gestão, Métricas & Governança",
        sum: "Indicadores em tempo real, resolutividade por diretoria e alertas de conformidade.",
        rules: [
          "RN-13: Apresentação de KPIs com números tabulares e comparativo temporal mensal",
          "RN-14: Mapa de calor de manifestações por região e diretoria responsável",
          "RN-15: Exportação de relatórios gerenciais nos formatos CSV e PDF com assinatura de conformidade"
        ],
        today: [
          "Relatórios mensais gerados manualmente após 15 dias do fechamento",
          "Impossibilidade de identificar gargalos de SLA em tempo real"
        ]
      }
    ],
    personas: {
      cidadao: {
        name: "Cidadão / Usuário",
        tag: "Sociedade / Usuário Final",
        color: "#ED1C24",
        ini: "C",
        line: "Busca canal seguro e acessível para registrar manifestações sem burocracia.",
        quote: "Quero enviar minha denúncia com sigilo e saber exatamente quando serei respondido.",
        needs: "Formulários objetivos, upload fácil no celular, protocolo imediato e notificações por e-mail/SMS."
      },
      analista: {
        name: "Analista de Ouvidoria",
        tag: "Equipe de Atendimento",
        color: "#1F6F5C",
        ini: "A",
        line: "Responsável pela triagem diária, análise técnica e elaboração de respostas e despachos.",
        quote: "Preciso identificar casos urgentes rapidamente e ter modelos de parecer assistidos por IA.",
        needs: "Kanban ágil, atalhos de teclado, alerta de SLA e integração direta com diretorias."
      },
      ouvidor: {
        name: "Ouvidor Geral / Gestor",
        tag: "Diretoria & Compliance",
        color: "#2F5D9E",
        ini: "O",
        line: "Garante conformidade institucional, cumprimento de prazos legais e transparência pública.",
        quote: "Preciso de visão panorâmica em tempo real de todas as diretorias e gargalos de atendimento.",
        needs: "Painel executivo com números tabulares, gráficos de tendência e relatórios auditáveis."
      }
    }
  };

  return DEFAULT_POC;
});
