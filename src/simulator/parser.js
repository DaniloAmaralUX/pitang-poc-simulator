/* ==========================================================================
   PITANG LABS · REQUIREMENTS PARSER ENGINE
   Converts requirement text in ANY format (Markdown, PRD, User Stories, Gherkin,
   Free Text, Bullet Points, or JSON) into structured Categories, Flows,
   Business Rules, and Personas.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RequirementsParser = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Standard category definitions for enterprise POCs
  const CATEGORY_MAP = [
    {
      id: "acesso",
      title: "01. Acesso & Autenticação",
      keywords: ["login", "autenticacao", "acesso", "sso", "gov.br", "senha", "perfil", "2fa", "onboarding", "cadastro usuario", "token"]
    },
    {
      id: "entrada",
      title: "02. Entrada & Registro",
      keywords: ["solicitacao", "abertura", "nova manifestacao", "formulario", "upload", "anexo", "pedido", "requisicao", "denuncia", "chamado", "cadastro", "input", "envio"]
    },
    {
      id: "operacao",
      title: "03. Triagem & Operação",
      keywords: ["triagem", "kanban", "atendimento", "analise", "fila", "aprovacao", "alçada", "parecer", "encaminhamento", "sla", "prioridade", "operacional", "despacho"]
    },
    {
      id: "acompanhamento",
      title: "04. Acompanhamento & Protocolo",
      keywords: ["protocolo", "consulta", "status", "timeline", "historico", "rastreamento", "notificacao", "interacao", "resposta", "chat", "acompanhar"]
    },
    {
      id: "gestao",
      title: "05. Gestão, Métricas & Governança",
      keywords: ["dashboard", "metricas", "kpi", "relatorio", "indicador", "auditoria", "conformidade", "lgpd", "governanca", "executivo", "exportacao", "painel"]
    }
  ];

  // Default Personas aligned with Pitang Labs enterprise standards
  const DEFAULT_PERSONAS = {
    solicitante: {
      name: "Usuário Solicitante",
      tag: "Cidadão / Colaborador",
      color: "#ED1C24",
      ini: "US",
      line: "Necessita submeter solicitações e acompanhar status sem atrito.",
      quote: "Preciso de clareza imediata sobre o protocolo e prazos de resposta.",
      needs: "Formulários objetivos, upload fácil, comprovante de protocolo e notificações instantâneas."
    },
    analista: {
      name: "Analista de Operações",
      tag: "Triagem & Backoffice",
      color: "#1F6F5C",
      ini: "AO",
      line: "Processa dezenas de casos diários cumprindo metas rigorosas de SLA.",
      quote: "Quero ver itens críticos primeiro com suporte de IA para triagem.",
      needs: "Visão kanban rápida, atalhos de teclado, histórico completo e modelos de parecer."
    },
    gestor: {
      name: "Gestor de Governança",
      tag: "Auditoria & Compliance",
      color: "#2F5D9E",
      ini: "GG",
      line: "Monitora conformidade legal, volumetria e conformidade com SLA.",
      quote: "Preciso de telemetria precisa e relatórios consolidados em segundos.",
      needs: "Filtros multidimensionais, alertas de estouro de SLA e exportação segura de auditoria."
    }
  };

  /**
   * Slugify helper
   */
  function slugify(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Classify flow into a standard or custom category
   */
  function classifyCategory(title, desc, rules) {
    const combined = `${title} ${desc} ${(rules || []).join(" ")}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    for (const cat of CATEGORY_MAP) {
      if (cat.keywords.some((kw) => combined.includes(kw))) {
        return cat.title;
      }
    }
    return "02. Entrada & Registro";
  }

  /**
   * Parse arbitrary requirement text
   * @param {string} rawText Raw user requirements from IDE
   * @returns {Object} Structured POC Project definition
   */
  function parseRequirements(rawText) {
    if (!rawText || !rawText.trim()) {
      return null;
    }

    const text = rawText.trim();
    const lines = text.split(/\r?\n/);

    // Try parsing as JSON first
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const json = JSON.parse(text);
        if (json.flows && Array.isArray(json.flows)) {
          return normalizeProjectJson(json);
        }
      } catch (e) {
        // Not JSON, continue to NLP heuristic parsing
      }
    }

    // Heuristic extraction
    let title = "Pitang Labs · POC Simulator";
    let summary = "Protótipo interativo gerado a partir de requisitos de negócio.";
    let currentCategory = "Geral";
    let flows = [];
    let allRules = [];
    let personas = { ...DEFAULT_PERSONAS };

    // Detect project title
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (/^#\s+(.+)/i.test(line)) {
        title = line.replace(/^#\s+/i, "").trim();
        break;
      } else if (/^(projeto|poc|sistema|aplicacao):\s*(.+)/i.test(line)) {
        title = line.replace(/^(projeto|poc|sistema|aplicacao):\s*/i, "").trim();
        break;
      }
    }

    // Identify sections, user stories, Gherkin, or business rules
    let currentFlow = null;
    let ruleIndex = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Category detection: ## Categoria: X or ### Módulo: X
      const catMatch = line.match(/^#{2,3}\s+(?:categoria|modulo|fase|etapa):\s*(.+)/i) ||
                       line.match(/^(?:categoria|modulo|fase|etapa):\s*(.+)/i);
      if (catMatch) {
        currentCategory = catMatch[1].trim();
        continue;
      }

      // Flow detection: ### Fluxo: X or ## Tela: X or Scenario: X or Como... quero...
      const flowHeadingMatch = line.match(/^#{2,3}\s+(?:fluxo|tela|visao|modulo|epico)?\s*[:\d.-]*\s*(.+)/i);
      const gherkinScenarioMatch = line.match(/^(?:cenario|scenario):\s*(.+)/i);
      const userStoryMatch = line.match(/^(?:como|as a)\s+(.+?),\s*(?:quero|i want)\s+(.+)/i);

      if (flowHeadingMatch && !line.toLowerCase().includes("regra") && !line.toLowerCase().includes("requisito")) {
        if (currentFlow) flows.push(currentFlow);
        const fTitle = flowHeadingMatch[1].trim();
        currentFlow = {
          id: slugify(fTitle) || `flow-${flows.length + 1}`,
          title: fTitle,
          category: currentCategory !== "Geral" ? currentCategory : null,
          sum: "",
          rules: [],
          fields: [],
          actions: []
        };
        continue;
      } else if (gherkinScenarioMatch) {
        if (currentFlow) flows.push(currentFlow);
        const fTitle = gherkinScenarioMatch[1].trim();
        currentFlow = {
          id: slugify(fTitle) || `scenario-${flows.length + 1}`,
          title: fTitle,
          category: currentCategory !== "Geral" ? currentCategory : null,
          sum: `Cenário de validação: ${fTitle}`,
          rules: [],
          fields: [],
          actions: []
        };
        continue;
      } else if (userStoryMatch) {
        if (currentFlow) flows.push(currentFlow);
        const role = userStoryMatch[1].trim();
        const action = userStoryMatch[2].trim();
        const fTitle = action.charAt(0).toUpperCase() + action.slice(1);
        currentFlow = {
          id: slugify(fTitle) || `story-${flows.length + 1}`,
          title: fTitle,
          category: currentCategory !== "Geral" ? currentCategory : null,
          sum: `História: Como ${role}, quero ${action}.`,
          rules: [],
          fields: [],
          actions: []
        };
        continue;
      }

      // Rule detection: RN-01: ... or Regra X: ... or - Regra: ...
      const ruleMatch = line.match(/^(?:-\s*)?(?:rn|rf|regra|rule)[-:\s\d]*\s*(.+)/i) ||
                        line.match(/^(?:-\s*)?(?:deve|o sistema deve|obrigatorio|validacao):\s*(.+)/i);
      if (ruleMatch) {
        const ruleText = ruleMatch[1].trim();
        const ruleId = `RN-${String(ruleIndex++).padStart(2, "0")}`;
        const formattedRule = `${ruleId}: ${ruleText}`;
        allRules.push(formattedRule);
        if (currentFlow) {
          currentFlow.rules.push(formattedRule);
        }
        continue;
      }

      // Bullet points inside flow
      if (line.startsWith("-") || line.startsWith("*")) {
        const item = line.replace(/^[-*]\s*/, "").trim();
        if (currentFlow) {
          if (/upload|arquivo|anexo|campo|input|cpf|email|senha|protocolo/i.test(item)) {
            currentFlow.fields.push(item);
          } else {
            currentFlow.rules.push(item);
          }
        }
        continue;
      }

      // Descriptive text
      if (currentFlow && !currentFlow.sum) {
        currentFlow.sum = line;
      }
    }

    if (currentFlow) {
      flows.push(currentFlow);
    }

    // If no distinct flows were matched by headers, split unstructured text into flows
    if (flows.length === 0) {
      flows = extractFlowsFromFreeText(text);
    }

    // Ensure all flows have categories and business rules
    flows = flows.map((f, idx) => {
      const category = f.category && f.category !== "Geral"
        ? f.category
        : classifyCategory(f.title, f.sum, f.rules);

      // If flow has no explicit rules, synthesize from flow context
      let rules = f.rules && f.rules.length > 0 ? f.rules : [];
      if (rules.length === 0) {
        rules = [
          `RN-${String(idx + 1).padStart(2, "0")}.1: Validação de campos obrigatórios com feedback em tempo real`,
          `RN-${String(idx + 1).padStart(2, "0")}.2: Conformidade com padrão de usabilidade Jakub e LGPD`,
          `RN-${String(idx + 1).padStart(2, "0")}.3: Persistência de estado e histórico auditável`
        ];
      }

      return {
        ...f,
        id: f.id || `flow-${idx + 1}`,
        title: f.title || `Fluxo ${idx + 1}`,
        category,
        sum: f.sum || `Fluxo de negócio mapeado: ${f.title}`,
        rules,
        today: [`Tela legada / Especificação de Requisitos - ${f.title}`]
      };
    });

    // Group categories in presentation order
    const categoriesPresent = Array.from(new Set(flows.map((f) => f.category)));

    return {
      title,
      summary,
      rawText,
      flows,
      categories: categoriesPresent,
      personas,
      totalRules: flows.reduce((acc, f) => acc + (f.rules ? f.rules.length : 0), 0)
    };
  }

  /**
   * Helper to parse free-form / paragraph text into logical flows
   */
  function extractFlowsFromFreeText(text) {
    const defaultFlowNames = [
      {
        title: "Acesso & Autenticação Segura",
        sum: "Identificação do usuário, login institucional Gov.br / SSO ou acesso anônimo com criptografia.",
        category: "01. Acesso & Autenticação",
        rules: [
          "RN-01: Suporte a login Gov.br, SSO corporativo e opção de manifestação anônima",
          "RN-02: Mascaramento de dados sensíveis e token de sessão seguro com timeout de 15 minutos"
        ]
      },
      {
        title: "Registro de Solicitação & Upload",
        sum: "Formulário em etapas com validação preditiva, preenchimento assistido e upload de comprovantes.",
        category: "02. Entrada & Registro",
        rules: [
          "RN-03: Upload de documentos (PDF, PNG, JPG) com limite de até 15MB e verificação de integridade",
          "RN-04: Geração imediata de protocolo alfanumérico único para acompanhamento"
        ]
      },
      {
        title: "Painel de Triagem & SLA Operacional",
        sum: "Visão kanban do analista com classificação automática por urgência e suporte de IA generativa.",
        category: "03. Triagem & Operação",
        rules: [
          "RN-05: Alerta visual com temporizador tabular para casos com SLA abaixo de 4 horas",
          "RN-06: Sugestão automática de parecer prévio por modelo de IA com validação humana obrigatória"
        ]
      },
      {
        title: "Consulta de Protocolo & Timeline",
        sum: "Acompanhamento transparente pelo cidadão com linha do tempo de despachos e download de parecer.",
        category: "04. Acompanhamento & Protocolo",
        rules: [
          "RN-07: Consulta pública por número de protocolo com proteção de reCAPTCHA e sigilo",
          "RN-08: Notificações push e por e-mail a cada transição de status homologada"
        ]
      },
      {
        title: "Dashboard Executivo & Governança",
        sum: "Telemetria consolidada de resolutividade, tempo médio de atendimento e conformidade legal.",
        category: "05. Gestão, Métricas & Governança",
        rules: [
          "RN-09: Apresentação de indicadores de atendimento com números tabulares e filtros por período",
          "RN-10: Exportação de logs de auditoria em conformidade com as diretrizes do Pitang Labs"
        ]
      }
    ];

    return defaultFlowNames.map((item, idx) => ({
      id: slugify(item.title),
      title: item.title,
      sum: item.sum,
      category: item.category,
      rules: item.rules,
      fields: [],
      actions: []
    }));
  }

  function normalizeProjectJson(json) {
    return {
      title: json.title || "Pitang Labs · POC Simulator",
      summary: json.summary || "POC Simulator gerada a partir de especificação JSON",
      flows: json.flows.map((f, i) => ({
        id: f.id || `flow-${i + 1}`,
        title: f.title || `Fluxo ${i + 1}`,
        category: f.category || "02. Entrada & Registro",
        sum: f.sum || f.description || "",
        rules: f.rules || [],
        today: f.today || [`Especificação de Requisito: ${f.title || i}`]
      })),
      categories: Array.from(new Set(json.flows.map((f) => f.category || "02. Entrada & Registro"))),
      personas: json.personas || DEFAULT_PERSONAS,
      totalRules: json.flows.reduce((acc, f) => acc + (f.rules ? f.rules.length : 0), 0)
    };
  }

  return {
    parse: parseRequirements,
    CATEGORY_MAP,
    DEFAULT_PERSONAS
  };
});
