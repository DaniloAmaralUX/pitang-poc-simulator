/* ==========================================================================
   PITANG LABS · POC GENERATOR ENGINE (ENHANCED V2)
   Generates rich, fully interactive screens across 8 UI Archetypes
   (Form, Table, Kanban, Dashboard, Timeline, Auth, Copilot, Approval)
   strictly adhering to Emil Kowalski's prototype craftsmanship and
   Jakub Krehel's Design Engineering standards.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PocGenerator = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function registerProjectScreens(project) {
    if (!window.Proto || !project || !project.flows) return;

    project.flows.forEach((flow, flowIndex) => {
      const versions = buildVersionsForFlow(flow, flowIndex, project);
      window.Proto.versions(flow.id, versions);
    });
  }

  function buildVersionsForFlow(flow, flowIndex, project) {
    const rules = flow.rules || [];
    const archetype = flow.archetype || "form";

    const v1 = {
      name: "Operação Direta",
      axis: `Execução rápida e de menor atrito para ${flow.title}: ações principais em um clique, validação em tempo real e foco na tarefa.`,
      personas: ["solicitante", "cidadao"],
      rules: rules,
      fixes: [
        "Elimina telas intermediárias redundantes do fluxo legado",
        "Apresenta resumo em tempo real do estado da transação",
        "Reduz tempo de execução em 60% com preenchimento assistido"
      ],
      tryThis: [
        "Interaja com os campos e acione o botão principal com escala tátil (scale 0.96)",
        "Veja a validação em tempo real e o feedback em toast acessível",
        "Abra o modal de detalhes tocando no card com raio concêntrico"
      ],
      motion: "Escala tátil active:scale-[0.96] com 150ms ease-out. Stagger sequencial de 40ms entre os elementos da lista.",
      tradeoff: "Exibe menos dados contextuais simultaneamente em prol da velocidade de execução.",
      render(root, ctx) {
        return renderArchetypeScreen(root, ctx, flow, 1, project);
      }
    };

    const v2 = {
      name: "Assistida por IA",
      axis: `Experiência guiada em etapas para ${flow.title} com suporte de IA da Pitang: análise de contexto, validação em tempo real e prevenção ativa de erros.`,
      personas: ["analista", "solicitante"],
      rules: rules,
      fixes: [
        "Previne erros de preenchimento com checagem antecipada de regras de negócio",
        "Sugere preenchimento automático de campos com base em precedentes",
        "Orienta o usuário passo a passo com indicador de progresso tabular"
      ],
      tryThis: [
        "Navegue entre os passos do assistente guiado",
        "Experimente a sugestão inteligente da IA da Pitang",
        "Envie a solicitação e veja o toast com número de protocolo gerado"
      ],
      motion: "Crossfade suave de 200ms entre as etapas do wizard. Badge pulsante sutil na sugestão da IA.",
      tradeoff: "Exige mais etapas de confirmação para garantir maior precisão e conformidade.",
      render(root, ctx) {
        return renderArchetypeScreen(root, ctx, flow, 2, project);
      }
    };

    const v3 = {
      name: "Visão Analítica",
      axis: `Painel de alta densidade de informação para operadores e gestores: kanban, métricas tabulares, atalhos rápidos e filtros avançados.`,
      personas: ["gestor", "ouvidor", "analista"],
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
        return renderArchetypeScreen(root, ctx, flow, 3, project);
      }
    };

    return [v1, v2, v3];
  }

  function resolveArchetype(flow) {
    if (flow.archetype) return flow.archetype;
    const combined = `${flow.id} ${flow.title} ${flow.sum} ${(flow.rules || []).join(" ")}`.toLowerCase();
    if (/auth|login|acesso|identificacao|gov\.br|sso|autenticacao/i.test(combined)) return "auth";
    if (/kanban|fila|esteira|mesa|triagem|operacao/i.test(combined)) return "kanban";
    if (/dashboard|metrica|kpi|telemetria|governanca|painel/i.test(combined)) return "dashboard";
    if (/tabela|diretorio|pesquisa|relatorio|busca|consulta publica|registros/i.test(combined)) return "table";
    if (/linha do tempo|timeline|rastreamento|tramite|historico|protocolo/i.test(combined)) return "timeline";
    if (/copilot|ia|assistente|rag|minuta/i.test(combined)) return "copilot";
    if (/aprovacao|alcada|orcamento|pedido/i.test(combined)) return "approval";
    return "form";
  }

  function renderArchetypeScreen(root, ctx, flow, dirNumber, project) {
    const archetype = resolveArchetype(flow);

    if (archetype === "auth") {
      return renderAuthArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "kanban") {
      return renderKanbanArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "table") {
      return renderTableArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "dashboard") {
      return renderDashboardArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "timeline") {
      return renderTimelineArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "copilot") {
      return renderCopilotArchetype(root, ctx, flow, dirNumber);
    } else if (archetype === "approval") {
      return renderApprovalArchetype(root, ctx, flow, dirNumber);
    } else {
      return renderFormArchetype(root, ctx, flow, dirNumber);
    }
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: AUTH / ACCESS
     ------------------------------------------------------------------ */
  function renderAuthArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;

    root.innerHTML = `
      ${bar({ title: flow.title })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:20px">
          <div class="sk-brand-badge">
            <span class="sk-pill-tag">${esc(flow.category)}</span>
            <h2 class="sk-h2">Acesso Institucional</h2>
            <p class="sk-sub">${esc(flow.sum)}</p>
          </div>

          <div class="sk-card">
            <div class="sk-rule-badge"><span>RN-01</span> Gov.br &amp; SSO Corporativo</div>
            <button class="sk-btn sk-btn-gov" id="btn-gov">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Entrar com gov.br (Prata/Ouro)
            </button>
            <div class="sk-divider-text"><span>ou credencial institucional</span></div>
            <div class="sk-form-grid-2col">
              <div class="sk-field sk-span-2">
                <label class="sk-label" for="inp-email">E-mail corporativo ou CPF</label>
                <input class="sk-input" id="inp-email" type="text" placeholder="ex: usuario@pitang.com ou CPF" value="colaborador@pitang.com" autocomplete="off" />
              </div>
              <div class="sk-field sk-span-2">
                <label class="sk-label" for="inp-pass">Senha de acesso</label>
                <input class="sk-input" id="inp-pass" type="password" value="••••••••••••" autocomplete="off" />
              </div>
              <div class="sk-span-2">
                <button class="sk-btn sk-btn-primary" id="btn-login" style="margin-top:6px">Acessar Sistema</button>
              </div>
            </div>
          </div>

          <div class="sk-card">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <div class="sk-rule-badge"><span>RN-02</span> Sigilo &amp; Criptografia</div>
                <strong style="display:block;font-size:14px;color:var(--sk-ink);margin-top:2px">Acesso Anônimo Seguro</strong>
                <span style="font-size:12px;color:var(--sk-ink-3)">Gera chave de consulta única sem rastreamento de IP.</span>
              </div>
              <button class="sk-btn sk-btn-outline" id="btn-anon" style="width:auto;padding:0 16px">Entrada Anônima</button>
            </div>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const un1 = K.on(root, "#btn-login, #btn-gov", "click", () => {
      K.toast(root, "Autenticação efetuada com sucesso!");
    });
    const un2 = K.on(root, "#btn-anon", "click", () => {
      K.toast(root, "Sessão anônima iniciada (Token: PIT-ANON-9812)");
    });
    return () => { un1(); un2(); };
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: FORM / ENTRY & UPLOAD (Step Wizard in Dir 2)
     ------------------------------------------------------------------ */
  function renderFormArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;
    let step = 1;

    function renderView() {
      const isWizard = dir === 2;
      let formContentHtml = "";

      if (isWizard) {
        if (step === 1) {
          formContentHtml = `
            <div class="sk-rule-badge"><span>RN-01</span> Validação Preliminar dos Dados</div>
            <div class="sk-form-grid-2col">
              <div class="sk-field">
                <label class="sk-label" for="inp-titulo">Título / Assunto da Solicitação</label>
                <input class="sk-input" id="inp-titulo" type="text" value="Solicitação de Análise e Parecer Técnico" />
              </div>
              <div class="sk-field">
                <label class="sk-label" for="sel-cat">Categoria da Demanda</label>
                <select class="sk-select" id="sel-cat">
                  <option value="1">Operacional / Processos</option>
                  <option value="2">Infraestrutura &amp; Tecnologia</option>
                  <option value="3">Conformidade Legal &amp; Auditoria</option>
                </select>
              </div>
              <div class="sk-field sk-span-2">
                <label class="sk-label" for="txt-detalhes">Descrição Detalhada dos Fatos</label>
                <textarea class="sk-textarea" id="txt-detalhes" rows="3">Relato circunstanciado com apontamento de requisitos e datas de ocorrência...</textarea>
              </div>
            </div>
            <button class="sk-btn sk-btn-primary" id="btn-next-step" style="margin-top:10px">
              Avançar para Evidências &rarr;
            </button>
          `;
        } else if (step === 2) {
          formContentHtml = `
            <div class="sk-rule-badge"><span>RN-02</span> Upload Validado até 15&nbsp;MB</div>
            <label class="sk-label">Anexo de Documentos e Comprovantes</label>
            <div class="sk-dropzone" id="btn-drop">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <span>Clique para anexar arquivo (PDF, PNG, JPG)</span>
              <small>Limite por arquivo: 15&nbsp;MB com hash de integridade</small>
            </div>
            <div class="sk-file-chip" id="file-chip">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
              <span>evidencia_ouvidoria_v1.pdf (1.8&nbsp;MB)</span>
              <button class="sk-chip-del" id="btn-del-file" aria-label="Remover anexo">&times;</button>
            </div>
            <div class="sk-checkbox-wrap" style="margin-top:10px">
              <input type="checkbox" id="chk-termos" checked />
              <label for="chk-termos">Declaro a veracidade das evidências e autorizo o tratamento de dados conforme a LGPD.</label>
            </div>
            <div class="sk-row" style="gap:10px;margin-top:12px">
              <button class="sk-btn sk-btn-outline" id="btn-prev-step" style="width:auto;padding:0 18px">&larr; Voltar</button>
              <button class="sk-btn sk-btn-primary" id="btn-next-step" style="flex:1">Avançar para Revisão &rarr;</button>
            </div>
          `;
        } else {
          formContentHtml = `
            <div class="sk-rule-badge"><span>RN-03</span> Resumo de Conformidade</div>
            <div class="sk-stack" style="gap:8px;font-size:13px;color:var(--sk-ink-2)">
              <div class="sk-row" style="justify-content:space-between;padding:8px;background:var(--sk-surface-2);border-radius:6px">
                <span>Título:</span>
                <strong style="color:var(--sk-ink)">Solicitação de Análise e Parecer Técnico</strong>
              </div>
              <div class="sk-row" style="justify-content:space-between;padding:8px;background:var(--sk-surface-2);border-radius:6px">
                <span>Categoria:</span>
                <strong>Operacional / Processos</strong>
              </div>
              <div class="sk-row" style="justify-content:space-between;padding:8px;background:var(--sk-surface-2);border-radius:6px">
                <span>Evidências:</span>
                <strong style="color:var(--sk-success)">1 documento anexado (1.8&nbsp;MB)</strong>
              </div>
              <div class="sk-row" style="justify-content:space-between;padding:8px;background:var(--sk-surface-2);border-radius:6px">
                <span>SLA Calculado:</span>
                <strong class="sk-tabnum" style="color:var(--brand-pitang)">24h úteis</strong>
              </div>
            </div>
            <div class="sk-row" style="gap:10px;margin-top:14px">
              <button class="sk-btn sk-btn-outline" id="btn-prev-step" style="width:auto;padding:0 18px">&larr; Voltar</button>
              <button class="sk-btn sk-btn-primary" id="btn-enviar-form" style="flex:1">Concluir &amp; Gerar Protocolo</button>
            </div>
          `;
        }
      } else {
        // Direct / Analytical (Single View)
        formContentHtml = `
          <div class="sk-rule-badge"><span>RN-01</span> Validação Obrigatória de Requisitos</div>
          <div class="sk-form-grid-2col">
            <div class="sk-field">
              <label class="sk-label" for="inp-titulo">Título / Assunto da Solicitação</label>
              <input class="sk-input" id="inp-titulo" type="text" value="Solicitação de Análise e Parecer Técnico" />
            </div>

            <div class="sk-field">
              <label class="sk-label" for="sel-cat">Categoria da Demanda</label>
              <select class="sk-select" id="sel-cat">
                <option value="1">Operacional / Processos</option>
                <option value="2">Infraestrutura &amp; Tecnologia</option>
                <option value="3">Conformidade Legal &amp; Auditoria</option>
              </select>
            </div>

            <div class="sk-field sk-span-2">
              <label class="sk-label" for="txt-detalhes">Descrição Detalhada dos Fatos</label>
              <textarea class="sk-textarea" id="txt-detalhes" rows="3">Relato circunstanciado com apontamento de requisitos e datas de ocorrência...</textarea>
            </div>

            <div class="sk-field sk-span-2">
              <div class="sk-rule-badge"><span>RN-02</span> Upload Validado até 15&nbsp;MB</div>
              <label class="sk-label">Anexo de Documentos e Comprovantes</label>
              <div class="sk-dropzone" id="btn-drop">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <span>Clique para anexar arquivo (PDF, PNG, JPG)</span>
                <small>Limite por arquivo: 15&nbsp;MB com hash de integridade</small>
              </div>
              <div class="sk-file-chip" id="file-chip" style="display:none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                <span>documento_comprovatorio_v1.pdf (1.8&nbsp;MB)</span>
                <button class="sk-chip-del" id="btn-del-file" aria-label="Remover anexo">&times;</button>
              </div>
            </div>

            <div class="sk-checkbox-wrap sk-span-2">
              <input type="checkbox" id="chk-termos" checked />
              <label for="chk-termos">Declaro estar ciente dos termos de uso e autorizo o tratamento de dados conforme a LGPD.</label>
            </div>

            <div class="sk-span-2">
              <button class="sk-btn sk-btn-primary" id="btn-enviar-form" style="margin-top:6px">
                Submeter Solicitação
              </button>
            </div>
          </div>
        `;
      }

      root.innerHTML = `
        ${bar({ title: flow.title, back: true })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <span class="sk-pill-tag">${esc(flow.category)}</span>
                <h2 class="sk-h2">${esc(flow.title)}</h2>
              </div>
              <span class="sk-metric-pill">SLA Estimado: <strong class="sk-tabnum">24h</strong></span>
            </div>

            ${isWizard ? `
              <div class="sk-stepper">
                <div class="sk-step ${step >= 1 ? (step === 1 ? 'sk-step-active' : 'sk-step-done') : ''}" data-step-target="1"><span class="sk-tabnum">1</span> Dados</div>
                <div class="sk-step ${step >= 2 ? (step === 2 ? 'sk-step-active' : 'sk-step-done') : ''}" data-step-target="2"><span class="sk-tabnum">2</span> Evidências</div>
                <div class="sk-step ${step === 3 ? 'sk-step-active' : ''}" data-step-target="3"><span class="sk-tabnum">3</span> Revisão</div>
              </div>
              <div class="sk-ai-box" style="margin-top:2px">
                <div class="sk-row" style="gap:6px;align-items:center">
                  <span class="sk-ai-sparkle">✦</span>
                  <strong style="font-size:13px">Assistente Pitang de Preenchimento</strong>
                </div>
                <p style="font-size:12.5px;color:var(--sk-ink-2);margin:4px 0 0">
                  Campos pré-preenchidos a partir do histórico anterior. Verifique os dados abaixo.
                </p>
              </div>
            ` : ""}

            <div class="sk-card">
              ${formContentHtml}
            </div>
          </div>
        </div>
        ${tabs(flow.id)}
      `;

      // Event Wiring
      const btnNext = root.querySelector("#btn-next-step");
      if (btnNext) {
        btnNext.addEventListener("click", () => {
          step = Math.min(3, step + 1);
          renderView();
        });
      }

      const btnPrev = root.querySelector("#btn-prev-step");
      if (btnPrev) {
        btnPrev.addEventListener("click", () => {
          step = Math.max(1, step - 1);
          renderView();
        });
      }

      root.querySelectorAll("[data-step-target]").forEach(stEl => {
        stEl.addEventListener("click", () => {
          step = parseInt(stEl.dataset.stepTarget, 10);
          renderView();
        });
      });

      const btnDrop = root.querySelector("#btn-drop");
      if (btnDrop) {
        btnDrop.addEventListener("click", () => {
          const chip = root.querySelector("#file-chip");
          if (chip) {
            chip.style.display = "flex";
            K.toast(root, "Arquivo anexado com sucesso (1.8 MB)");
          }
        });
      }

      const btnDel = root.querySelector("#btn-del-file");
      if (btnDel) {
        btnDel.addEventListener("click", (e) => {
          e.stopPropagation();
          const chip = root.querySelector("#file-chip");
          if (chip) chip.style.display = "none";
        });
      }

      const btnSubmit = root.querySelector("#btn-enviar-form");
      if (btnSubmit) {
        btnSubmit.addEventListener("click", () => {
          K.toast(root, "Solicitação processada! Protocolo: PIT-2026-94812");
        });
      }
    }

    renderView();
    return () => {};
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: KANBAN & QUEUE
     ------------------------------------------------------------------ */
  function renderKanbanArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;

    root.innerHTML = `
      ${bar({ title: flow.title, icons: ["search", "filter"] })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-row" style="justify-content:space-between;align-items:center">
            <div>
              <span class="sk-pill-tag">${esc(flow.category)}</span>
              <h2 class="sk-h2">Esteira Operacional</h2>
            </div>
            <div class="sk-row" style="gap:4px">
              <span class="sk-kpi-val sk-tabnum" style="font-size:14px;color:var(--brand-pitang);font-weight:700">3 Críticos</span>
            </div>
          </div>

          <div class="sk-kanban-board">
            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Triagem Inicial</span>
                <span class="sk-kanban-count sk-tabnum">5</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-press" data-card-id="PIT-101" data-title="Denúncia Emergencial">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-101</span>
                    <span class="sk-sla-tag sk-sla-tag-alert sk-tabnum">&lt; 2h</span>
                  </div>
                  <strong class="sk-kcard-t">Denúncia Emergencial</strong>
                  <span class="sk-kcard-sub">Diretoria de Operações</span>
                </div>
                <div class="sk-kanban-card sk-press" data-card-id="PIT-102" data-title="Reclamação de SLA">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-102</span>
                    <span class="sk-sla-tag sk-tabnum">12h</span>
                  </div>
                  <strong class="sk-kcard-t">Reclamação de SLA</strong>
                  <span class="sk-kcard-sub">TI Corporativo</span>
                </div>
              </div>
            </div>

            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Em Análise</span>
                <span class="sk-kanban-count sk-tabnum">8</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-press" data-card-id="PIT-098" data-title="Auditoria de Dados">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-098</span>
                    <span class="sk-sla-tag sk-tabnum">28h</span>
                  </div>
                  <strong class="sk-kcard-t">Auditoria de Dados</strong>
                  <span class="sk-kcard-sub">Compliance LGPD</span>
                </div>
              </div>
            </div>

            <div class="sk-kanban-col">
              <div class="sk-kanban-col-h">
                <span>Finalizados</span>
                <span class="sk-kanban-count sk-tabnum">34</span>
              </div>
              <div class="sk-kanban-cards">
                <div class="sk-kanban-card sk-card-done sk-press" data-card-id="PIT-087" data-title="Elogio ao Atendimento">
                  <div class="sk-row" style="justify-content:space-between">
                    <span class="sk-badge-sm sk-tabnum">PIT-087</span>
                    <span class="sk-badge-check">✓ Despachado</span>
                  </div>
                  <strong class="sk-kcard-t">Elogio ao Atendimento</strong>
                  <span class="sk-kcard-sub">Ouvidoria Geral</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sk-card">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <strong style="font-size:13px">Ações em Lote Selecionadas</strong>
              <span class="sk-tabnum" style="font-size:12px;color:var(--sk-ink-3)">3 itens</span>
            </div>
            <div class="sk-row" style="gap:8px;margin-top:6px">
              <button class="sk-btn sk-btn-primary" id="btn-batch-ok" style="height:40px;font-size:13px">Despachar em Lote</button>
              <button class="sk-btn sk-btn-outline" id="btn-batch-escalar" style="height:40px;font-size:13px">Escalar SLA</button>
            </div>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const unCard = K.on(root, "[data-card-id]", "click", (e, el) => {
      const cId = el.dataset.cardId;
      const cTitle = el.dataset.title || "Demanda Operacional";
      const sheetInst = K.sheet(root, `
        <h3 class="sk-h3">Dossiê Operacional · ${cId}</h3>
        <p style="font-size:13px;color:var(--sk-ink-2);margin:8px 0">${esc(cTitle)}</p>
        <p style="font-size:12.5px;color:var(--sk-ink-3);margin-bottom:12px">Selecione o encaminhamento com base nas regras de negócio:</p>
        <div class="sk-stack" style="gap:8px">
          <button class="sk-btn sk-btn-primary" id="btn-admitir">Admitir &amp; Encaminhar</button>
          <button class="sk-btn sk-btn-outline" id="btn-diligencia">Abrir Diligência</button>
          <button class="sk-btn sk-btn-ghost" id="btn-concluir" style="color:var(--brand-pitang)">Arquivar Demanda</button>
        </div>
      `);

      sheetInst.el.querySelector("#btn-admitir")?.addEventListener("click", () => {
        sheetInst.close();
        K.toast(root, `Caso ${cId} admitido e encaminhado para diretoria.`);
      });
      sheetInst.el.querySelector("#btn-diligencia")?.addEventListener("click", () => {
        sheetInst.close();
        K.toast(root, `Diligência aberta para ${cId}. SLA pausado.`);
      });
      sheetInst.el.querySelector("#btn-concluir")?.addEventListener("click", () => {
        sheetInst.close();
        K.toast(root, `Caso ${cId} arquivado com sucesso.`);
      });
    });

    const unBatch = K.on(root, "#btn-batch-ok", "click", () => {
      K.toast(root, "Lote despachado com sucesso para a diretoria.");
    });
    const unEsc = K.on(root, "#btn-batch-escalar", "click", () => {
      K.toast(root, "Alerta de SLA escalado para a gerência.");
    });
    return () => { unCard(); unBatch(); unEsc(); };
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: TABLE & SEARCH (Interactive live filter & dossier)
     ------------------------------------------------------------------ */
  function renderTableArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;

    const rows = [
      { id: "PIT-8941", t: "Denúncia de Compras e Licitação", cat: "Operacional", user: "Carlos Eduardo", dt: "11/11 08:30", sla: "01h 45m", st: "Crítico", cls: "sk-sla-alert" },
      { id: "PIT-8938", t: "Atraso de Pagamento de Fornecedor", cat: "Financeiro", user: "Mariana Costa", dt: "11/11 09:12", sla: "03h 12m", st: "Urgente", cls: "sk-sla-alert" },
      { id: "PIT-8924", t: "Acesso a Sistema Corporativo", cat: "Tecnologia", user: "Rodrigo Silveira", dt: "10/11 16:40", sla: "18h 30m", st: "Em Análise", cls: "" },
      { id: "PIT-8910", t: "Elogio ao Atendimento Ouvidoria", cat: "Institucional", user: "Ana Paula Lima", dt: "10/11 14:15", sla: "42h 10m", st: "Concluído", cls: "" }
    ];

    let currentFilter = "";

    function renderView() {
      const filtered = rows.filter(r => {
        if (!currentFilter) return true;
        const q = currentFilter.toLowerCase();
        return r.id.toLowerCase().includes(q) || r.t.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q) || r.st.toLowerCase().includes(q);
      });

      root.innerHTML = `
        ${bar({ title: flow.title, icons: ["search", "download"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <span class="sk-pill-tag">${esc(flow.category)}</span>
                <h2 class="sk-h2">Diretório de Registros</h2>
              </div>
              <button class="sk-btn sk-btn-outline" id="btn-exp-csv" style="width:auto;height:34px;padding:0 14px;font-size:12px">
                Exportar CSV
              </button>
            </div>

            <div class="sk-field" style="margin-top:2px">
              <input class="sk-input" id="tbl-search-inp" type="search" placeholder="Filtrar por protocolo, assunto ou status..." value="${esc(currentFilter)}" />
            </div>

            <div class="sk-card" style="padding:4px;overflow-x:auto">
              <table class="sk-data-table">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Assunto</th>
                    <th>SLA Restante</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.length > 0 ? filtered.map((row) => `
                    <tr class="sk-press" data-row-id="${row.id}">
                      <td class="sk-tabnum"><strong>${row.id}</strong></td>
                      <td>${row.t}</td>
                      <td class="sk-tabnum ${row.cls}">${row.sla}</td>
                      <td><span class="sk-status-pill">${row.st}</span></td>
                    </tr>
                  `).join("") : `
                    <tr><td colspan="4" style="text-align:center;padding:24px;color:var(--sk-ink-3)">Nenhum registro encontrado.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        ${tabs(flow.id)}
      `;

      // Search input live wiring
      const searchInp = root.querySelector("#tbl-search-inp");
      if (searchInp) {
        searchInp.addEventListener("input", (e) => {
          currentFilter = e.target.value;
          renderView();
        });
      }

      root.querySelectorAll("[data-row-id]").forEach(tr => {
        tr.addEventListener("click", () => {
          const rId = tr.dataset.rowId;
          const found = rows.find(r => r.id === rId);
          if (found) {
            K.sheet(root, `
              <h3 class="sk-h3">Protocolo · ${found.id}</h3>
              <p style="font-size:13px;color:var(--sk-ink-2);margin:8px 0">${esc(found.t)}</p>
              <div class="sk-stack" style="gap:8px;font-size:12.5px;margin:12px 0">
                <div class="sk-row" style="justify-content:space-between;padding:6px 10px;background:var(--sk-surface-2);border-radius:6px">
                  <span>Categoria:</span>
                  <strong>${found.cat}</strong>
                </div>
                <div class="sk-row" style="justify-content:space-between;padding:6px 10px;background:var(--sk-surface-2);border-radius:6px">
                  <span>Requisitante:</span>
                  <strong>${found.user}</strong>
                </div>
                <div class="sk-row" style="justify-content:space-between;padding:6px 10px;background:var(--sk-surface-2);border-radius:6px">
                  <span>SLA Restante:</span>
                  <strong class="sk-tabnum" style="color:var(--brand-pitang)">${found.sla}</strong>
                </div>
              </div>
              <button class="sk-btn sk-btn-primary" data-close>Fechar Dossiê</button>
            `);
          }
        });
      });

      const btnExp = root.querySelector("#btn-exp-csv");
      if (btnExp) {
        btnExp.addEventListener("click", () => {
          K.toast(root, "Exportação CSV gerada em conformidade LGPD.");
        });
      }
    }

    renderView();
    return () => {};
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: DASHBOARD & TELEMETRY
     ------------------------------------------------------------------ */
  function renderDashboardArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;
    let period = "mes";

    function renderView() {
      root.innerHTML = `
        ${bar({ title: flow.title, icons: ["chart", "user"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-row" style="justify-content:space-between;align-items:center">
              <div>
                <span class="sk-pill-tag">Pitang Intelligence</span>
                <h2 class="sk-h2">Telemetria &amp; KPIs</h2>
              </div>
              <div class="sk-row" style="gap:4px">
                <button class="sk-btn sk-btn-outline ${period === 'mes' ? 'sk-period-active' : ''}" data-period="mes" style="height:28px;padding:0 8px;font-size:11px">Mês</button>
                <button class="sk-btn sk-btn-outline ${period === 'tri' ? 'sk-period-active' : ''}" data-period="tri" style="height:28px;padding:0 8px;font-size:11px">Trimestre</button>
                <button class="sk-btn sk-btn-outline ${period === 'ano' ? 'sk-period-active' : ''}" data-period="ano" style="height:28px;padding:0 8px;font-size:11px">Ano</button>
              </div>
            </div>

            <div class="sk-kpi-grid">
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Taxa de Resolução</span>
                <span class="sk-kpi-val sk-tabnum">${period === 'ano' ? '98.4%' : '96.8%'}</span>
                <span class="sk-kpi-trend sk-trend-up">+1.8% vs período ant.</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Tempo Médio SLA</span>
                <span class="sk-kpi-val sk-tabnum">${period === 'tri' ? '14.2h' : '16.4h'}</span>
                <span class="sk-kpi-trend sk-trend-up">-3.2h de redução</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Demandas Totais</span>
                <span class="sk-kpi-val sk-tabnum">${period === 'ano' ? '34.120' : (period === 'tri' ? '8.540' : '2.840')}</span>
                <span class="sk-kpi-trend">100% auditadas</span>
              </div>
              <div class="sk-kpi-card">
                <span class="sk-kpi-lbl">Conformidade LGPD</span>
                <span class="sk-kpi-val sk-tabnum">99.9%</span>
                <span class="sk-kpi-trend sk-trend-up">Em conformidade</span>
              </div>
            </div>

            <div class="sk-card">
              <div class="sk-rule-badge"><span>RN-03</span> Distribuição por Diretoria</div>
              <strong style="display:block;margin:6px 0 10px;font-size:13.5px">Volume por Área Responsável</strong>
              <div class="sk-stack" style="gap:10px">
                ${[
                  { n: "Operações & Infra", pct: 45, c: 1278, col: "#ED1C24" },
                  { n: "Tecnologia & Sistemas", pct: 30, c: 852, col: "#2F5D9E" },
                  { n: "Recursos Humanos & Gestão", pct: 15, c: 426, col: "#1F6F5C" },
                  { n: "Jurídico & Compliance", pct: 10, c: 284, col: "#9A5A12" }
                ].map((item) => `
                  <div class="sk-bar-row" style="cursor:pointer" data-bar-name="${item.n}">
                    <div class="sk-row" style="justify-content:space-between;font-size:12px;margin-bottom:4px">
                      <span>${item.n}</span>
                      <strong class="sk-tabnum">${item.c} (${item.pct}%)</strong>
                    </div>
                    <div class="sk-bar-bg"><div class="sk-bar-fill" style="width:${item.pct}%;background:${item.col}"></div></div>
                  </div>
                `).join("")}
              </div>

              <button class="sk-btn sk-btn-primary" id="btn-export-rep" style="margin-top:14px">
                Exportar Relatório Consolidado (PDF)
              </button>
            </div>
          </div>
        </div>
        ${tabs(flow.id)}
      `;

      root.querySelectorAll("[data-period]").forEach(btn => {
        btn.addEventListener("click", () => {
          period = btn.dataset.period;
          renderView();
        });
      });

      root.querySelectorAll("[data-bar-name]").forEach(barRow => {
        barRow.addEventListener("click", () => {
          K.toast(root, `Filtro ativo: ${barRow.dataset.barName}`);
        });
      });

      const btnExp = root.querySelector("#btn-export-rep");
      if (btnExp) {
        btnExp.addEventListener("click", () => {
          K.toast(root, "Relatório executivo gerado com assinatura digital.");
        });
      }
    }

    renderView();
    return () => {};
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: TIMELINE & PROTOCOL
     ------------------------------------------------------------------ */
  function renderTimelineArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;

    root.innerHTML = `
      ${bar({ title: flow.title, icons: ["search", "user"] })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-card">
            <span class="sk-pill-tag">Rastreamento em Tempo Real</span>
            <div class="sk-field" style="margin-top:6px">
              <label class="sk-label" for="inp-proto-val">Protocolo de Consulta</label>
              <div class="sk-input-btn-wrap">
                <input class="sk-input sk-tabnum" id="inp-proto-val" value="PIT-2026-894120" />
                <button class="sk-btn sk-btn-primary" id="btn-buscar-proto" style="width:auto;padding:0 18px">Buscar</button>
              </div>
            </div>
          </div>

          <div class="sk-card">
            <div class="sk-row" style="justify-content:space-between;align-items:flex-start">
              <div>
                <span class="sk-rule-badge"><span>RN-01</span> Protocolo Válido</span>
                <h3 class="sk-h3" style="margin-top:4px">PIT-2026-894120</h3>
                <span style="font-size:12px;color:var(--sk-ink-3)">Registrado em <strong class="sk-tabnum">11/11/2026 às 08:42</strong></span>
              </div>
              <span class="sk-status-pill sk-status-analise">Em Triagem</span>
            </div>

            <div class="sk-timeline" style="margin-top:16px">
              <div class="sk-tl-item" data-done="true">
                <span class="sk-tl-dot"></span>
                <div class="sk-tl-content">
                  <strong class="sk-tl-title">Solicitação Recebida</strong>
                  <span class="sk-tl-date sk-tabnum">11/11/2026 · 08:42</span>
                  <p class="sk-tl-desc">Cadastrada com 2 anexos e chave de sigilo gerada.</p>
                </div>
              </div>
              <div class="sk-tl-item" data-active="true">
                <span class="sk-tl-dot"></span>
                <div class="sk-tl-content">
                  <strong class="sk-tl-title">Triagem Preliminar</strong>
                  <span class="sk-tl-date sk-tabnum">11/11/2026 · 09:15</span>
                  <p class="sk-tl-desc">Distribuída para a Diretoria Técnica · SLA restante: <strong class="sk-tabnum">01h 45m</strong></p>
                </div>
              </div>
              <div class="sk-tl-item">
                <span class="sk-tl-dot"></span>
                <div class="sk-tl-content">
                  <strong class="sk-tl-title">Parecer e Conclusão</strong>
                  <span class="sk-tl-date">Previsão: 12/11/2026</span>
                  <p class="sk-tl-desc">Notificação será emitida ao solicitante por e-mail e SMS.</p>
                </div>
              </div>
            </div>

            <button class="sk-btn sk-btn-outline" id="btn-certidao" style="margin-top:14px">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Baixar Certidão Digital de Trâmite (PDF)
            </button>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const unB = K.on(root, "#btn-buscar-proto", () => K.toast(root, "Dados do protocolo atualizados em tempo real."));
    const unC = K.on(root, "#btn-certidao", () => K.toast(root, "Certidão digital autenticada com carimbo do tempo."));
    return () => { unB(); unC(); };
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: COPILOT / AI CHAT
     ------------------------------------------------------------------ */
  function renderCopilotArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;
    let isEditing = false;
    let currentMinuta = "Com base na documentação anexada, a manifestação atende integralmente aos requisitos da Instrução Normativa nº 14/2026. Sugere-se admissibilidade com despacho à Diretoria de Operações.";

    function renderView() {
      root.innerHTML = `
        ${bar({ title: flow.title, icons: ["sparkles", "user"] })}
        <div class="sk-scroll">
          <div class="sk-pad sk-stack" style="padding-top:16px">
            <div class="sk-ai-header">
              <div class="sk-row" style="gap:6px;align-items:center">
                <span class="sk-ai-sparkle">✦</span>
                <span class="sk-ai-badge">Pitang Copilot RAG</span>
              </div>
              <h2 class="sk-h2" style="margin-top:4px">Assistente Operacional</h2>
              <p class="sk-sub">Análise preditiva de precedentes e elaboração de respostas automáticas.</p>
            </div>

            <div class="sk-card sk-card-ai-glow">
              <div class="sk-ai-box">
                <div class="sk-row" style="justify-content:space-between">
                  <strong>Minuta Recomendada</strong>
                  <span class="sk-pill-confidence sk-tabnum">99.1% similaridade</span>
                </div>
                ${isEditing ? `
                  <textarea class="sk-textarea" id="txt-minuta" rows="4" style="margin:8px 0;font-size:13px">${esc(currentMinuta)}</textarea>
                  <div class="sk-row" style="gap:8px">
                    <button class="sk-btn sk-btn-primary" id="btn-salvar-ia" style="height:36px;font-size:12.5px">Salvar Alterações</button>
                    <button class="sk-btn sk-btn-outline" id="btn-cancelar-ia" style="height:36px;font-size:12.5px">Cancelar</button>
                  </div>
                ` : `
                  <p style="font-size:13px;color:var(--sk-ink-2);margin:8px 0;line-height:1.4">
                    "${esc(currentMinuta)}"
                  </p>
                  <div class="sk-row" style="gap:8px">
                    <button class="sk-btn sk-btn-primary" id="btn-aceitar-ia" style="height:36px;font-size:12.5px">Aceitar Minuta</button>
                    <button class="sk-btn sk-btn-outline" id="btn-editar-ia" style="height:36px;font-size:12.5px">Editar</button>
                  </div>
                `}
              </div>

              <div class="sk-field" style="margin-top:10px">
                <label class="sk-label" for="inp-prompt">Solicitar Ajuste ao Copilot</label>
                <div class="sk-row" style="gap:8px">
                  <input class="sk-input" id="inp-prompt" placeholder="Ex: Tornar o parecer mais sucinto..." />
                  <button class="sk-btn sk-btn-outline" id="btn-gerar-var" style="width:auto;padding:0 16px;white-space:nowrap">Gerar Variação</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        ${tabs(flow.id)}
      `;

      const btnAceitar = root.querySelector("#btn-aceitar-ia");
      if (btnAceitar) {
        btnAceitar.addEventListener("click", () => {
          K.toast(root, "Minuta adotada como despacho oficial!");
        });
      }

      const btnEditar = root.querySelector("#btn-editar-ia");
      if (btnEditar) {
        btnEditar.addEventListener("click", () => {
          isEditing = true;
          renderView();
        });
      }

      const btnSalvar = root.querySelector("#btn-salvar-ia");
      if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
          const txt = root.querySelector("#txt-minuta");
          if (txt) currentMinuta = txt.value;
          isEditing = false;
          K.toast(root, "Minuta atualizada.");
          renderView();
        });
      }

      const btnCancelar = root.querySelector("#btn-cancelar-ia");
      if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
          isEditing = false;
          renderView();
        });
      }

      const btnGerar = root.querySelector("#btn-gerar-var");
      if (btnGerar) {
        btnGerar.addEventListener("click", () => {
          K.toast(root, "Nova variação gerada em 180ms pelo Copilot.");
          currentMinuta = "Em atenção aos autos e ao histórico de manifestações correlatas, verifica-se o pleno atendimento das condições formais. Encaminha-se para deliberação conclusiva no prazo de 48h.";
          renderView();
        });
      }
    }

    renderView();
    return () => {};
  }

  /* ------------------------------------------------------------------
     ARCHETYPE: APPROVAL & GOVERNANCE
     ------------------------------------------------------------------ */
  function renderApprovalArchetype(root, ctx, flow, dir) {
    const K = window.Kit;
    const { esc, bar, tabs } = K;

    root.innerHTML = `
      ${bar({ title: flow.title, icons: ["shield", "check"] })}
      <div class="sk-scroll">
        <div class="sk-pad sk-stack" style="padding-top:16px">
          <div class="sk-card">
            <div class="sk-row" style="justify-content:space-between">
              <span class="sk-pill-tag">Alçada de Aprovação</span>
              <span class="sk-tabnum" style="font-size:13px;font-weight:700;color:var(--brand-pitang)">R$&nbsp;48.500,00</span>
            </div>
            <h3 class="sk-h3" style="margin-top:4px">Aquisição de Servidores e Licenças de Nuvem</h3>
            <span style="font-size:12px;color:var(--sk-ink-3)">Requisitante: Diretoria de TI · Centro de Custo: CC-2041</span>

            <div class="sk-stack" style="margin-top:10px;gap:8px">
              <div class="sk-row" style="justify-content:space-between;font-size:12.5px;padding:6px 8px;background:var(--sk-surface-2);border-radius:6px">
                <span>Saldo Orçamentário:</span>
                <strong class="sk-tabnum">R$&nbsp;120.000,00</strong>
              </div>
              <div class="sk-row" style="justify-content:space-between;font-size:12.5px;padding:6px 8px;background:var(--sk-surface-2);border-radius:6px">
                <span>Conformidade de Alçada:</span>
                <strong style="color:var(--sk-success)">✓ Gerência Sênior</strong>
              </div>
            </div>

            <div class="sk-row" style="gap:8px;margin-top:14px">
              <button class="sk-btn sk-btn-primary" id="btn-app-ok" style="flex:1">Aprovar Pedido</button>
              <button class="sk-btn sk-btn-outline" id="btn-app-rej" style="flex:1;color:var(--brand-pitang)">Rejeitar</button>
            </div>
          </div>
        </div>
      </div>
      ${tabs(flow.id)}
    `;

    const unO = K.on(root, "#btn-app-ok", () => K.toast(root, "Pedido aprovado e assinado digitalmente!"));
    const unR = K.on(root, "#btn-app-rej", () => K.toast(root, "Pedido devolvido para adequação do requisitante."));
    return () => { unO(); unR(); };
  }

  return {
    registerProjectScreens,
    buildVersionsForFlow
  };
});
