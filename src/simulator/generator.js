/* ==========================================================================
   PITANG LABS · POC GENERATOR ENGINE
   Translates business rules & requirement flows into 3 interactive design
   directions per flow, strictly adhering to Jakub Krehel's Design Engineering
   rules (concentric radii, scale-on-press 0.96, tabular-nums, WCAG AA).
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PocGenerator = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /**
   * Generates screens for all flows in project definition
   * @param {Object} project Object returned by RequirementsParser or DefaultPoc
   */
  function registerProjectScreens(project) {
    if (!window.Proto || !project || !project.flows) return;

    project.flows.forEach((flow, flowIndex) => {
      const versions = buildVersionsForFlow(flow, flowIndex, project);
      window.Proto.versions(flow.id, versions);
    });
  }

  /**
   * Builds 3 distinct directions for a given flow
   */
  function buildVersionsForFlow(flow, flowIndex, project) {
    const K = window.Kit;
    const { esc, icon, card, btn, badge, metric, input, select, table, timeline, kanban, many, goCards } = K;
    const rules = flow.rules || [];

    // Direction 1: Direta & Eficiente (Compact / Fast-Track)
    const v1 = {
      name: "Operação Direta",
      axis: "Foco em velocidade e menor atrito: ações principais em um clique, formulário sintético e confirmação visual instantânea.",
      personas: ["cidadao", "solicitante"],
      rules: rules,
      fixes: [
        "Elimina telas intermediárias redundantes do fluxo legado",
        "Apresenta resumo em tempo real do estado da transação",
        "Reduz tempo de preenchimento em 60% com preenchimento assistido"
      ],
      tryThis: [
        "Preencha o campo principal e veja a validação ativa",
        "Clique no botão de ação primária para disparar o feedback tátil (scale 0.96)",
        "Abra o modal de detalhes tocando no card com raio concêntrico"
      ],
      motion: "Escala tátil active:scale-[0.96] com 150ms ease-out. Stagger sequencial de 40ms entre os elementos da lista.",
      tradeoff: "Exibe menos dados contextuais simultaneamente em prol da velocidade de execução.",
      render(root, ctx) {
        return renderDirection1(root, ctx, flow, flowIndex, project);
      }
    };

    // Direction 2: Assistida & Inteligente (AI Copilot / Wizard)
    const v2 = {
      name: "Assistida por IA",
      axis: "Experiência guiada em etapas com suporte de IA da Pitang: análise de contexto, validação em tempo real e prevenção ativa de erros.",
      personas: ["analista", "cidadao"],
      rules: rules,
      fixes: [
        "Previne erros de preenchimento com checagem antecipada de regras de negócio",
        "Sugere preenchimento automático de campos com base em precedentes",
        "Orienta o usuário passo a passo com indicador de progresso tabular"
      ],
      tryThis: [
        "Navegue entre os passos do assistente guiado",
        "Experimente a sugestão inteligente da IA da Pitang",
        "Envie o formulário e veja o toast com número de protocolo gerado"
      ],
      motion: "Crossfade suave de 200ms entre as etapas do wizard. Badge pulsante sutil na sugestão da IA.",
      tradeoff: "Exige mais etapas de confirmação para garantir maior precisão e conformidade.",
      render(root, ctx) {
        return renderDirection2(root, ctx, flow, flowIndex, project);
      }
    };

    // Direction 3: Analítica & Operacional (Data-Dense / Multi-Perspective)
    const v3 = {
      name: "Visão Analítica",
      axis: "Painel de alta densidade de informação para operadores e gestores: kanban, métricas tabulares, atalhos rápidos e filtros avançados.",
      personas: ["ouvidor", "analista", "gestor"],
      rules: rules,
      fixes: [
        "Substitui controles manuais e planilhas por fila operacional em tempo real",
        "Garante visibilidade instantânea de estouros de SLA com números tabulares",
        "Permite ações em lote para resolução em massa de demandas correlatas"
      ],
      tryThis: [
        "Filtre os registros por status ou urgência de SLA",
        "Alterne a ordenação das colunas com números tabulares",
        "Selecione múltiplos itens para acionar o despacho em lote"
      ],
      motion: "Micro-transições de 120ms em botões de filtragem. Ausência de animações pesadas para preservar desempenho operacional.",
      tradeoff: "Curva de aprendizado levemente superior para usuários não familiarizados com visão kanban.",
      render(root, ctx) {
        return renderDirection3(root, ctx, flow, flowIndex, project);
      }
    };

    return [v1, v2, v3];
  }

  /* ------------------------------------------------------------------
     DIRECTION 1: DIRETA & EFICIENTE
     ------------------------------------------------------------------ */
  function renderDirection1(root, ctx, flow, flowIndex, project) {
    const K = window.Kit;
    const { esc, bar, tabs, card, btn, badge, metric, input } = K;
    const flowId = flow.id;

    // Detect specialized screens based on flow category/keywords
    if (/acesso|login|autenticacao/i.test(flowId)) {
      root.innerHTML = `
        ${bar({ title: "Acesso Institucional" })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:20px">
            <div class="sk-brand-badge" aria-label="Pitang Labs Gov">
              <span class="sk-pill-tag">Pitang Labs · SSO</span>
              <h2 class="sk-h2">Acesso Seguro</h2>
              <p class="sk-sub">Identifique-se para acessar o sistema ou registre sua manifestação anônima.</p>
            </div>

            <div class="sk-card" style="margin-top:8px">
              <div class="sk-rule-badge"><span>RN-01</span> Login Gov.br & SSO</div>
              <button class="sk-btn sk-btn-gov" id="btn-gov" aria-label="Entrar com conta gov.br">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Entrar com gov.br
              </button>
              <div class="sk-divider-text"><span>ou credencial corporativa</span></div>
              <div class="sk-field">
                <label class="sk-label" for="inp-user">E-mail ou CPF</label>
                <input class="sk-input" id="inp-user" type="text" placeholder="ex: usuario@pitang.com ou CPF" autocomplete="off" />
              </div>
              <div class="sk-field">
                <label class="sk-label" for="inp-pass">Senha de acesso</label>
                <input class="sk-input" id="inp-pass" type="password" placeholder="••••••••••••" autocomplete="off" />
              </div>
              <button class="sk-btn sk-btn-primary" id="btn-login" style="margin-top:8px">Acessar Sistema</button>
            </div>

            <div class="sk-card sk-card-anon">
              <div class="sk-row" style="justify-content:space-between">
                <div>
                  <div class="sk-rule-badge"><span>RN-02</span> Sigilo Total</div>
                  <strong style="display:block;font-size:14px;color:var(--sk-ink)">Manifestação Anônima</strong>
                  <span style="font-size:12px;color:var(--sk-ink-3)">Não requer identificação nem login.</span>
                </div>
                <button class="sk-btn sk-btn-outline" id="btn-anon" style="width:auto;padding:0 16px">Registrar sem Login</button>
              </div>
            </div>
          </div>
        </div>
        ${tabs("acesso-seguro")}
      `;

      const un1 = K.on(root, "#btn-login, #btn-gov", "click", () => {
        K.toast(root, "Autenticação efetuada com sucesso!");
        setTimeout(() => ctx.go("nova-manifestacao", 0), 600);
      });
      const un2 = K.on(root, "#btn-anon", "click", () => {
        K.toast(root, "Sessão anônima iniciada (Criptografia ativada)");
        setTimeout(() => ctx.go("nova-manifestacao", 0), 600);
      });
      return () => { un1(); un2(); };
    }

    if (/nova-manifestacao|solicitacao|registro|entrada/i.test(flowId)) {
      root.innerHTML = `
        ${bar({ title: "Nova Manifestação", back: true })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <span class="sk-pill-tag">Protocolo Rápido</span>
                <h2 class="sk-h2">Registro Direto</h2>
              </div>
              <span class="sk-metric-pill" title="SLA Estimado">SLA: <strong class="sk-tabnum">48h</strong></span>
            </div>

            <div class="sk-card">
              <div class="sk-rule-badge"><span>RN-04</span> Classificação de Demanda</div>
              <div class="sk-field">
                <label class="sk-label" for="sel-tipo">Tipo de Manifestação</label>
                <select class="sk-select" id="sel-tipo">
                  <option value="denuncia">Denúncia (Sigilo Obrigatório)</option>
                  <option value="reclamacao">Reclamação de Serviço</option>
                  <option value="elogio">Elogio ou Reconhecimento</option>
                  <option value="sugestao">Sugestão de Melhoria</option>
                </select>
              </div>

              <div class="sk-field">
                <label class="sk-label" for="inp-assunto">Assunto da Demanda</label>
                <input class="sk-input" id="inp-assunto" type="text" value="Irregularidade em processo de compra" />
              </div>

              <div class="sk-field">
                <label class="sk-label" for="txt-desc">Descrição dos Fatos</label>
                <textarea class="sk-textarea" id="txt-desc" rows="4">Relato detalhado para apuração imediata da ouvidoria institucional...</textarea>
              </div>

              <div class="sk-field">
                <div class="sk-rule-badge"><span>RN-05</span> Upload até 15&nbsp;MB</div>
                <label class="sk-label">Anexo de Evidências (PDF, Imagens, Áudio)</label>
                <div class="sk-dropzone" id="btn-upload" role="button" tabindex="0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span>Clique ou arraste arquivos para anexar</span>
                  <small>Formatos aceitos: PDF, PNG, JPG, MP3 (Máx. 15&nbsp;MB)</small>
                </div>
                <div class="sk-file-chip" id="file-preview" style="display:none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                  <span>evidencia_comprovante_01.pdf (2.4&nbsp;MB)</span>
                  <button class="sk-chip-del" aria-label="Remover arquivo">&times;</button>
                </div>
              </div>

              <div class="sk-checkbox-wrap">
                <input type="checkbox" id="chk-lgpd" checked />
                <label for="chk-lgpd">Declaro estar ciente dos termos da LGPD e autorizo o tratamento de dados estritamente para apuração.</label>
              </div>

              <button class="sk-btn sk-btn-primary" id="btn-submit-manifestacao" style="margin-top:12px">
                Submeter Manifestação
              </button>
            </div>
          </div>
        </div>
        ${tabs("nova-manifestacao")}
      `;

      const un1 = K.on(root, "#btn-upload", "click", () => {
        const preview = root.querySelector("#file-preview");
        if (preview) {
          preview.style.display = "flex";
          K.toast(root, "Arquivo anexado com sucesso (2.4 MB)");
        }
      });
      const un2 = K.on(root, "#btn-submit-manifestacao", "click", () => {
        K.toast(root, "Manifestação protocolada! Protocolo: PIT-2026-894120");
        setTimeout(() => ctx.go("acompanhamento-protocolo", 0), 800);
      });
      const unBack = K.on(root, "[data-back]", "click", () => ctx.go("acesso-seguro", 0));
      return () => { un1(); un2(); unBack(); };
    }

    if (/triagem|mesa-triagem|operacao/i.test(flowId)) {
      root.innerHTML = `
        ${bar({ title: "Mesa de Triagem", icons: ["search", "chart"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-kpi-grid">
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Na Fila</span>
                <span class="sk-kpi-val sk-tabnum">18</span>
              </div>
              <div class="sk-kpi-card sk-kpi-alert">
                <span class="sk-kpi-lbl">SLA Crítico &lt; 4h</span>
                <span class="sk-kpi-val sk-tabnum">3</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Concluídas Hoje</span>
                <span class="sk-kpi-val sk-tabnum">27</span>
              </div>
            </div>

            <div class="sk-row" style="justify-content:space-between;align-items:center;margin-top:4px">
              <div class="sk-rule-badge"><span>RN-07</span> Priorização por Urgência</div>
              <div class="sk-chips" data-group>
                <button class="sk-chip" data-opt aria-pressed="true">Todos (18)</button>
                <button class="sk-chip" data-opt aria-pressed="false">Críticos (3)</button>
                <button class="sk-chip" data-opt aria-pressed="false">Diretoria A (8)</button>
              </div>
            </div>

            <div class="sk-stack" style="margin-top:8px">
              ${[
                { proto: "PIT-2026-894120", tipo: "Denúncia", sla: "01h 45m", urg: "high", desc: "Irregularidade em processo de compra emergencial de TI" },
                { proto: "PIT-2026-894088", tipo: "Reclamação", sla: "03h 12m", urg: "high", desc: "Atraso de pagamento de fornecedor homologado" },
                { proto: "PIT-2026-893954", tipo: "Sugestão", sla: "18h 30m", urg: "normal", desc: "Ajuste na interface do portal de autosserviço" },
                { proto: "PIT-2026-893812", tipo: "Elogio", sla: "42h 10m", urg: "low", desc: "Atendimento exemplar da equipe de ouvidoria" }
              ].map((item) => `
                <div class="sk-card sk-card-ticket sk-press" role="button" tabindex="0" data-ticket="${item.proto}">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-proto-badge sk-tabnum">${item.proto}</span>
                    <span class="sk-sla-badge ${item.urg === 'high' ? 'sk-sla-alert' : ''}">SLA: <strong class="sk-tabnum">${item.sla}</strong></span>
                  </div>
                  <strong class="sk-ticket-title">${item.tipo}: ${item.desc}</strong>
                  <div class="sk-row" style="justify-content:space-between;margin-top:8px;font-size:12px;color:var(--sk-ink-3)">
                    <span>Anexos: <strong>2 PDFs</strong></span>
                    <span class="sk-ticket-act">Despachar &rarr;</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
        ${tabs("mesa-triagem")}
      `;

      const unTickets = K.on(root, "[data-ticket]", "click", (e, el) => {
        const id = el.dataset.ticket;
        K.sheet(root, `
          <div class="sk-sheet-header">
            <span class="sk-pill-tag">Triagem Rápida</span>
            <h3 class="sk-h3">Despacho · ${id}</h3>
          </div>
          <p style="font-size:13px;color:var(--sk-ink-2);margin:6px 0">Selecione o encaminhamento institucional para esta demanda:</p>
          <div class="sk-stack" style="gap:8px">
            <button class="sk-btn sk-btn-primary" data-action="aceitar">Admitir &amp; Encaminhar para Diretoria</button>
            <button class="sk-btn sk-btn-outline" data-action="complementar">Solicitar Informações ao Usuário</button>
            <button class="sk-btn sk-btn-ghost" data-action="arquivar" style="color:#ED1C24">Arquivar por Inconsistência</button>
          </div>
        `);
      });

      const unSheetAct = K.on(root, "[data-action]", "click", (e, b) => {
        const act = b.dataset.action;
        K.toast(root, `Ação executada com sucesso: ${act}`);
        const sh = root.querySelector(".sk-sheet");
        if (sh) sh.removeAttribute("data-open");
        const sc = root.querySelector(".sk-scrim");
        if (sc) sc.removeAttribute("data-open");
      });

      return () => { unTickets(); unSheetAct(); };
    }

    if (/acompanhamento|protocolo/i.test(flowId)) {
      root.innerHTML = `
        ${bar({ title: "Consulta de Protocolo", icons: ["search", "user"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-card">
              <span class="sk-pill-tag">Rastreabilidade em Tempo Real</span>
              <div class="sk-field" style="margin-top:8px">
                <label class="sk-label" for="inp-proto">Número de Protocolo</label>
                <div class="sk-input-btn-wrap">
                  <input class="sk-input sk-tabnum" id="inp-proto" value="PIT-2026-894120" />
                  <button class="sk-btn sk-btn-primary" id="btn-cons" style="width:auto;padding:0 16px">Consultar</button>
                </div>
              </div>
            </div>

            <div class="sk-card" style="margin-top:8px">
              <div class="sk-row" style="justify-content:space-between;align-items:flex-start">
                <div>
                  <span class="sk-rule-badge"><span>RN-10</span> Protocolo Válido</span>
                  <h3 class="sk-h3" style="margin-top:4px">PIT-2026-894120</h3>
                  <span style="font-size:12px;color:var(--sk-ink-3)">Aberto em <strong class="sk-tabnum">11/11/2026 às 08:42</strong></span>
                </div>
                <span class="sk-status-pill sk-status-analise">Em Triagem</span>
              </div>

              <div class="sk-timeline" style="margin-top:16px">
                <div class="sk-tl-item" data-done="true">
                  <span class="sk-tl-dot"></span>
                  <div class="sk-tl-content">
                    <strong class="sk-tl-title">Manifestação Registrada</strong>
                    <span class="sk-tl-date sk-tabnum">11/11/2026 · 08:42</span>
                    <p class="sk-tl-desc">Recebida com 2 anexos e chave de sigilo gerada.</p>
                  </div>
                </div>
                <div class="sk-tl-item" data-active="true">
                  <span class="sk-tl-dot"></span>
                  <div class="sk-tl-content">
                    <strong class="sk-tl-title">Análise Preliminar pela Ouvidoria</strong>
                    <span class="sk-tl-date sk-tabnum">11/11/2026 · 09:15</span>
                    <p class="sk-tl-desc">Distribuído ao Analista Técnico · SLA restante: <strong class="sk-tabnum">01h 45m</strong></p>
                  </div>
                </div>
                <div class="sk-tl-item">
                  <span class="sk-tl-dot"></span>
                  <div class="sk-tl-content">
                    <strong class="sk-tl-title">Parecer e Conclusão</strong>
                    <span class="sk-tl-date">Previsão: 12/11/2026</span>
                    <p class="sk-tl-desc">Notificação será emitida por e-mail e SMS.</p>
                  </div>
                </div>
              </div>

              <button class="sk-btn sk-btn-outline" id="btn-certidao" style="margin-top:16px">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Baixar Certidão de Trâmite (PDF)
              </button>
            </div>
          </div>
        </div>
        ${tabs("acompanhamento-protocolo")}
      `;

      const unCons = K.on(root, "#btn-cons", "click", () => K.toast(root, "Dados atualizados do protocolo PIT-2026-894120"));
      const unCert = K.on(root, "#btn-certidao", "click", () => K.toast(root, "Certidão digital emitida com assinatura Pitang Labs"));
      return () => { unCons(); unCert(); };
    }

    if (/dashboard|governanca|gestao|metricas/i.test(flowId)) {
      root.innerHTML = `
        ${bar({ title: "Painel de Governança", icons: ["chart", "user"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <span class="sk-pill-tag">Pitang Labs Intelligence</span>
                <h2 class="sk-h2">Telemetria de SLA</h2>
              </div>
              <span class="sk-period-badge">Novembro / 2026</span>
            </div>

            <div class="sk-kpi-grid" style="grid-template-columns:repeat(2,1fr)">
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Resolutividade</span>
                <span class="sk-kpi-val sk-tabnum">96.4%</span>
                <span class="sk-kpi-trend sk-trend-up">+2.1% este mês</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Tempo Médio SLA</span>
                <span class="sk-kpi-val sk-tabnum">18.2h</span>
                <span class="sk-kpi-trend sk-trend-up">-4.5h de melhora</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Total Demandas</span>
                <span class="sk-kpi-val sk-tabnum">1.482</span>
                <span class="sk-kpi-trend">100% auditadas</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Índice Conformidade</span>
                <span class="sk-kpi-val sk-tabnum">99.8%</span>
                <span class="sk-kpi-trend sk-trend-up">LGPD em dia</span>
              </div>
            </div>

            <div class="sk-card" style="margin-top:8px">
              <div class="sk-rule-badge"><span>RN-14</span> Distribuição por Área</div>
              <strong style="display:block;margin:6px 0 12px;font-size:14px">Volumetria por Diretoria</strong>
              <div class="sk-stack" style="gap:10px">
                ${[
                  { nome: "Operações & Infra", pct: 42, count: 622, color: "#ED1C24" },
                  { nome: "Tecnologia & Sistemas", pct: 28, count: 415, color: "#2F5D9E" },
                  { nome: "Recursos Humanos & Gestão", pct: 18, count: 266, color: "#1F6F5C" },
                  { nome: "Jurídico & Compliance", pct: 12, count: 179, color: "#9A5A12" }
                ].map((b) => `
                  <div>
                    <div class="sk-row" style="justify-content:space-between;font-size:12.5px;margin-bottom:4px">
                      <span>${b.nome}</span>
                      <strong class="sk-tabnum">${b.count} (${b.pct}%)</strong>
                    </div>
                    <div class="sk-bar-bg"><div class="sk-bar-fill" style="width:${b.pct}%;background:${b.color}"></div></div>
                  </div>
                `).join("")}
              </div>

              <div class="sk-row" style="margin-top:16px;gap:8px">
                <button class="sk-btn sk-btn-primary" id="btn-export-rep">Exportar Relatório PDF</button>
                <button class="sk-btn sk-btn-outline" id="btn-export-csv">CSV Auditável</button>
              </div>
            </div>
          </div>
        </div>
        ${tabs("dashboard-governanca")}
      `;

      const unRep = K.on(root, "#btn-export-rep", "click", () => K.toast(root, "Relatório executivo gerado com sucesso!"));
      const unCsv = K.on(root, "#btn-export-csv", "click", () => K.toast(root, "Base anonimizada CSV baixada para auditoria."));
      return () => { unRep(); unCsv(); };
    }

    // Generic fallback for any other custom user requirement flow
    root.innerHTML = `
      ${bar({ title: flow.title, back: true })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-brand-badge">
            <span class="sk-pill-tag">${esc(flow.category || "Fluxo de Negócio")}</span>
            <h2 class="sk-h2">${esc(flow.title)}</h2>
            <p class="sk-sub">${esc(flow.sum || "Fluxo mapeado de acordo com requisitos.")}</p>
          </div>

          <div class="sk-card">
            <strong style="font-size:14px;color:var(--sk-ink)">Regras de Negócio Validadas</strong>
            <ul class="sk-rule-list" style="margin-top:8px">
              ${(flow.rules || []).map((r) => `<li><span class="sk-rule-chip">RN</span> ${esc(r)}</li>`).join("")}
            </ul>

            <div class="sk-field" style="margin-top:14px">
              <label class="sk-label" for="inp-gen">Entrada Principal</label>
              <input class="sk-input" id="inp-gen" placeholder="Insira o identificador ou dado..." value="DADO-REF-2026" />
            </div>

            <button class="sk-btn sk-btn-primary" id="btn-gen-exec" style="margin-top:12px">Executar Ação Principal</button>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const unGen = K.on(root, "#btn-gen-exec", "click", () => K.toast(root, `Ação executada para: ${flow.title}`));
    return () => unGen();
  }

  /* ------------------------------------------------------------------
     DIRECTION 2: ASSISTIDA & INTELIGENTE (AI COPILOT / WIZARD)
     ------------------------------------------------------------------ */
  function renderDirection2(root, ctx, flow, flowIndex, project) {
    const K = window.Kit;
    const { esc, bar, tabs, card, btn, badge, metric } = K;

    root.innerHTML = `
      ${bar({ title: `${flow.title} · IA Copilot`, back: true, icons: ["search", "user"] })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-ai-header">
            <div class="sk-row" style="gap:8px;align-items:center">
              <span class="sk-ai-sparkle">✦</span>
              <span class="sk-ai-badge">Pitang Copilot Inteligente</span>
            </div>
            <h2 class="sk-h2" style="margin-top:6px">Assistente Preditivo</h2>
            <p class="sk-sub">A IA pré-classifica entidades e sugere preenchimento conforme regras de negócio.</p>
          </div>

          <div class="sk-stepper">
            <div class="sk-step sk-step-done"><span class="sk-tabnum">1</span> Contexto</div>
            <div class="sk-step sk-step-active"><span class="sk-tabnum">2</span> Análise</div>
            <div class="sk-step"><span class="sk-tabnum">3</span> Conclusão</div>
          </div>

          <div class="sk-card sk-card-ai-glow">
            <div class="sk-ai-box">
              <div class="sk-row" style="justify-content:space-between">
                <strong>Sugestão Gerada por IA</strong>
                <span class="sk-pill-confidence sk-tabnum">98.2% precisão</span>
              </div>
              <p style="font-size:13px;line-height:1.45;color:var(--sk-ink-2);margin:8px 0">
                Identificamos correlação com <strong>3 casos semelhantes</strong> resolvidos na mesma diretoria. Deseja aplicar a minuta sugerida?
              </p>
              <div class="sk-row" style="gap:8px">
                <button class="sk-btn sk-btn-primary" id="btn-ai-apply" style="height:38px;font-size:13px">Aplicar Recomendação</button>
                <button class="sk-btn sk-btn-outline" id="btn-ai-edit" style="height:38px;font-size:13px">Personalizar</button>
              </div>
            </div>

            <div class="sk-field" style="margin-top:14px">
              <label class="sk-label" for="inp-ai-prompt">Prompt / Complemento da Demanda</label>
              <textarea class="sk-textarea" id="inp-ai-prompt" rows="3">Ajustar resposta considerando prazo emergencial de 4 horas com notificação automática.</textarea>
            </div>

            <div class="sk-checkbox-wrap">
              <input type="checkbox" id="chk-ai-confirm" checked />
              <label for="chk-ai-confirm">Validado por analista humano em conformidade com as diretrizes do Pitang Labs.</label>
            </div>

            <button class="sk-btn sk-btn-primary" id="btn-step-next" style="margin-top:12px">
              Avançar para Homologação &rarr;
            </button>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const un1 = K.on(root, "#btn-ai-apply", "click", () => K.toast(root, "Recomendação da IA incorporada com sucesso!"));
    const un2 = K.on(root, "#btn-step-next", "click", () => {
      K.toast(root, "Etapa validada! Transição para homologação registrada.");
    });
    return () => { un1(); un2(); };
  }

  /* ------------------------------------------------------------------
     DIRECTION 3: ANALÍTICA & OPERACIONAL (DATA-DENSE / KANBAN / TABLE)
     ------------------------------------------------------------------ */
  function renderDirection3(root, ctx, flow, flowIndex, project) {
    const K = window.Kit;
    const { esc, bar, tabs, card, btn, badge, metric } = K;

    root.innerHTML = `
      ${bar({ title: `${flow.title} · Painel Analítico`, icons: ["search", "menu"] })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-row" style="justify-content:space-between;align-items:center">
            <div>
              <span class="sk-pill-tag">Alta Densidade de Informação</span>
              <h2 class="sk-h2">Visão Operacional</h2>
            </div>
            <div class="sk-row" style="gap:6px">
              <button class="sk-filter-pill sk-filter-active" id="btn-view-kanban">Kanban</button>
              <button class="sk-filter-pill" id="btn-view-table">Tabela</button>
            </div>
          </div>

          <div class="sk-kanban-board" id="kanban-container">
            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Triagem Inicial</span>
                <span class="sk-kanban-count sk-tabnum">4</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-press" role="button" tabindex="0" data-kcard="1">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-8941</span>
                    <span class="sk-sla-tag sk-sla-tag-alert sk-tabnum">&lt; 2h</span>
                  </div>
                  <strong class="sk-kcard-t">Denúncia Contratual</strong>
                  <span class="sk-kcard-sub">Diretoria de Compras</span>
                </div>
                <div class="sk-kanban-card sk-press" role="button" tabindex="0" data-kcard="2">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-8935</span>
                    <span class="sk-sla-tag sk-tabnum">14h</span>
                  </div>
                  <strong class="sk-kcard-t">Solicitação de Acesso</strong>
                  <span class="sk-kcard-sub">Segurança da Informação</span>
                </div>
              </div>
            </div>

            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Em Análise Técnica</span>
                <span class="sk-kanban-count sk-tabnum">7</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-press" role="button" tabindex="0" data-kcard="3">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-8920</span>
                    <span class="sk-sla-tag sk-tabnum">28h</span>
                  </div>
                  <strong class="sk-kcard-t">Reclamação de Portal</strong>
                  <span class="sk-kcard-sub">Engenharia de Software</span>
                </div>
              </div>
            </div>

            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Concluídos</span>
                <span class="sk-kanban-count sk-tabnum">23</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-card-done sk-press" role="button" tabindex="0" data-kcard="4">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-8902</span>
                    <span class="sk-badge-check">✓ Finalizado</span>
                  </div>
                  <strong class="sk-kcard-t">Elogio ao Atendimento</strong>
                  <span class="sk-kcard-sub">Ouvidoria Geral</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sk-card" style="margin-top:12px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <strong style="font-size:13.5px">Ações em Massa Selecionadas</strong>
              <span class="sk-tabnum" style="font-size:12px;color:var(--sk-ink-3)">3 itens marcados</span>
            </div>
            <div class="sk-row" style="gap:8px;margin-top:8px">
              <button class="sk-btn sk-btn-primary" id="btn-batch-despachar" style="height:40px;font-size:13px">Despachar em Lote</button>
              <button class="sk-btn sk-btn-outline" id="btn-batch-prorrogar" style="height:40px;font-size:13px">Prorrogar SLA</button>
            </div>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const unKCard = K.on(root, "[data-kcard]", "click", (e, el) => {
      K.toast(root, `Abrindo dossiê completo do item ${el.dataset.kcard}`);
    });
    const unBatch = K.on(root, "#btn-batch-despachar", "click", () => {
      K.toast(root, "3 demandas despachadas simultaneamente com assinatura em lote.");
    });
    return () => { unKCard(); unBatch(); };
  }

  return {
    registerProjectScreens,
    buildVersionsForFlow
  };
});
