/* ==========================================================================
   PITANG LABS · POC SIMULATOR SHELL (JS)
   Orchestrates categorized flows, requirement parsing, multi-device stage,
   version switcher, rationale & business rules panel, and HTML export.
   ========================================================================== */
(function () {
  "use strict";

  const { esc } = window.Kit;

  /* ---- State & Persistence ---- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("pitang_poc:" + k); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("pitang_poc:" + k, v); } catch {} },
  };

  const params = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
  const prefersReduced = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();

  // Current project definition (Default or dynamically loaded from requirements)
  let currentProject = window.DefaultPoc || null;
  const registry = {};

  window.Proto = {
    versions(flowId, list) { registry[flowId] = list; },
    get registry() { return registry; },
    get flows() { return currentProject ? currentProject.flows : []; },
    get categories() { return currentProject ? currentProject.categories : []; },
    get personas() { return currentProject ? currentProject.personas : {}; },
    get project() { return currentProject; }
  };

  const state = {
    flow: 0,
    v: 0,
    theme: store.get("theme", "light"),
    text: store.get("text", "default"),
    motion: prefersReduced ? "reduced" : store.get("motion", "full"),
    inspector: store.get("inspector", "off"),
    device: ["ios", "android", "web"].includes(params.get("device")) ? params.get("device") : store.get("device", "ios"),
    selectedCategory: "all",
    searchQuery: ""
  };

  const DEVICES = {
    ios: { w: 414, h: 868, label: "iPhone 15 Pro" },
    android: { w: 436, h: 939, label: "Android Pixel" },
    web: { w: 1280, h: 820, label: "Web Desktop" },
  };

  let screen, deviceWrap, device, cleanup = null;
  let requirementsTrigger = null;

  /* ---- Initialize Application ---- */
  function init() {
    // Check if user has saved custom requirements in localStorage
    let embeddedProject = null;
    try {
      const snapshot = document.getElementById("poc-project-data");
      if (snapshot) embeddedProject = window.RequirementsParser.parse(snapshot.textContent);
    } catch (error) { console.warn("Projeto exportado inválido:", error.message); }
    if (embeddedProject) currentProject = embeddedProject;
    const savedRequirements = embeddedProject ? null : store.get("custom_requirements", null);
    if (savedRequirements && window.RequirementsParser) {
      let parsed;
      try { parsed = window.RequirementsParser.parse(savedRequirements); } catch (error) { console.warn(error.message); }
      if (parsed && parsed.flows && parsed.flows.length > 0) {
        currentProject = parsed;
      }
    }

    // Register screens with PocGenerator
    if (window.PocGenerator && currentProject) {
      window.PocGenerator.registerProjectScreens(currentProject);
    }

    // Bind state flow based on URL param or fallback
    const paramFlow = params.get("flow");
    if (paramFlow) {
      const foundIdx = currentProject.flows.findIndex((f) => f.id === paramFlow);
      if (foundIdx >= 0) state.flow = foundIdx;
    }

    const paramV = parseInt(params.get("v"), 10);
    if (!isNaN(paramV) && paramV >= 1) state.v = paramV - 1;

    buildChrome();
    buildRequirementsDrawer();
    setFlow(state.flow, state.v);
  }

  /* ---- Build Chrome: Left Rail, Category Chips, Stage, Notes ---- */
  function buildChrome() {
    renderCategoryChips();
    renderFlowsList();

    screen = document.getElementById("screen");
    deviceWrap = document.querySelector(".device-wrap");
    device = document.querySelector(".device");

    setupSegmentedControls();
    setupSearchListener();
    fitStage();
    window.addEventListener("resize", () => { fitStage(); movePickerHighlight(); });

    // Open Requirements Drawer button & keyboard shortcut
    const btnOpenReq = document.querySelector(".btn-open-requirements");
    if (btnOpenReq) {
      btnOpenReq.addEventListener("click", openRequirementsDrawer);
    }

    const artifactInput = document.getElementById("artifact-file");
    document.querySelector(".btn-open-artifact")?.addEventListener("click", () => artifactInput.click());
    artifactInput?.addEventListener("change", async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 5 * 1024 * 1024) throw new Error("Escolha um HTML de até 5 MB.");
        const html = await file.text();
        if (!/<(?:!doctype\s+html|html|body)[\s>]/i.test(html)) throw new Error("O arquivo deve conter um documento HTML.");
        currentProject = {
          title: file.name, artifactHtml: html, rawText: "# " + file.name + "\n\nPOC HTML importada pelo usuário.",
          flows: [{id: "aplicacao-html", title: file.name, category: "POC importada", archetype: "html", sum: "Aplicação fornecida em arquivo HTML independente.", rules: [], fields: [], actions: []}],
          categories: ["POC importada"], personas: {}, totalRules: 0
        };
        // Persist metadata as JSON so a later reload does not revert to a keyword template.
        store.set("custom_requirements", JSON.stringify(currentProject));
        state.selectedCategory = "all";
        state.searchQuery = "";
        document.querySelector(".rail-search").value = "";
        Object.keys(registry).forEach(key => delete registry[key]);
        window.PocGenerator.registerProjectScreens(currentProject);
        renderCategoryChips(); renderFlowsList(); setFlow(0, 0);
        document.querySelector("#txt-requirements").value = currentProject.rawText;
      } catch (error) { window.Kit.toast(screen, error.message); }
      finally { event.target.value = ""; }
    });

    // Global Keyboard Navigation
    document.addEventListener("keydown", (e) => {
      if (document.querySelector(".req-drawer[data-open]")) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.target.closest("#screen")) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k" || e.key === "K") {
          e.preventDefault();
          toggleRequirementsDrawer();
        }
        return;
      }
      if (e.key === "Escape") {
        closePopover();
        closeRequirementsDrawer();
        return;
      }

      const activeVersions = getActiveVersions();
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= activeVersions.length) {
        setVersion(num - 1);
      } else if (e.key === "ArrowRight") {
        setVersion((state.v + 1) % activeVersions.length);
      } else if (e.key === "ArrowLeft") {
        setVersion((state.v - 1 + activeVersions.length) % activeVersions.length);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFlow((state.flow + 1) % currentProject.flows.length, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFlow((state.flow - 1 + currentProject.flows.length) % currentProject.flows.length, 0);
      } else if (e.key === "d" || e.key === "D") {
        const devList = ["ios", "android", "web"];
        const curIdx = devList.indexOf(state.device);
        const nextDev = devList[(curIdx + 1) % devList.length];
        setDevice(nextDev);
      } else if (e.key === "t" || e.key === "T") {
        setTheme(state.theme === "light" ? "dark" : "light");
      } else if (e.key === "r" || e.key === "R") {
        mountScreen();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".persona, .pop")) closePopover();
    });
  }

  /* ---- Category Filter Chips ---- */
  function renderCategoryChips() {
    const wrap = document.querySelector(".category-chips");
    if (!wrap) return;

    const categories = ["all", ...(currentProject.categories || [])];
    wrap.innerHTML = categories.map((cat) => {
      const isAll = cat === "all";
      const label = isAll ? "Todas" : cat.replace(/^\d+[\s.-]*/, "");
      const pressed = state.selectedCategory === cat;
      return `<button class="cat-chip" data-category="${esc(cat)}" aria-pressed="${pressed}">${esc(label)}</button>`;
    }).join("");

    wrap.onclick = (e) => {
      const b = e.target.closest(".cat-chip");
      if (b) {
        state.selectedCategory = b.dataset.category;
        renderCategoryChips();
        renderFlowsList();
      }
    };
  }

  /* ---- Search Listener ---- */
  function setupSearchListener() {
    const inp = document.querySelector(".rail-search");
    if (!inp) return;
    inp.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderFlowsList();
    });
  }

  /* ---- Render Categorized Flows List ---- */
  function renderFlowsList() {
    const container = document.querySelector(".flows-container");
    if (!container || !currentProject) return;

    const query = state.searchQuery;
    const catFilter = state.selectedCategory;

    // Filter flows based on search and category
    const filteredFlows = currentProject.flows.map((f, i) => ({ ...f, origIndex: i })).filter((f) => {
      if (catFilter !== "all" && f.category !== catFilter) return false;
      if (!query) return true;
      const combined = `${f.title} ${f.sum} ${(f.rules || []).join(" ")}`.toLowerCase();
      return combined.includes(query);
    });

    if (filteredFlows.length === 0) {
      container.innerHTML = `<div style="padding:24px 12px;text-align:center;color:var(--ink-3);font-size:12.5px">Nenhum fluxo encontrado para o filtro.</div>`;
      return;
    }

    // Group flows by category
    const groups = {};
    filteredFlows.forEach((item) => {
      const c = item.category || "Geral";
      if (!groups[c]) groups[c] = [];
      groups[c].push(item);
    });

    let html = "";
    Object.keys(groups).forEach((catName) => {
      const list = groups[catName];
      html += `
        <div class="cat-group">
          <div class="cat-group-title">
            <span>${esc(catName)}</span>
            <span class="cat-count-badge">${list.length}</span>
          </div>
          <ul class="flows">
            ${list.map((f) => {
              const isActive = f.origIndex === state.flow;
              const ruleCount = (f.rules || []).length;
              return `
                <li>
                  <button class="flow-btn" data-flow-index="${f.origIndex}" aria-current="${isActive}">
                    <span class="flow-num">${String(f.origIndex + 1).padStart(2, "0")}</span>
                    <span class="flow-title">${esc(f.title)}</span>
                    <span class="flow-rules-pill">${ruleCount}&nbsp;${ruleCount === 1 ? 'Regra' : 'Regras'}</span>
                    <span class="flow-sum">${esc(f.sum)}</span>
                  </button>
                </li>
              `;
            }).join("")}
          </ul>
        </div>
      `;
    });

    container.innerHTML = html;
    container.onclick = (e) => {
      const b = e.target.closest(".flow-btn");
      if (b) {
        const idx = parseInt(b.dataset.flowIndex, 10);
        if (!isNaN(idx)) setFlow(idx, 0);
      }
    };
  }

  /* ---- Set Active Flow & Version ---- */
  function setFlow(flowIndex, versionIndex = 0) {
    if (!currentProject || !currentProject.flows[flowIndex]) return;

    state.flow = flowIndex;
    const activeVersions = getActiveVersions();
    state.v = Math.max(0, Math.min(versionIndex, activeVersions.length - 1));

    store.set("flow", currentProject.flows[state.flow].id);
    store.set("v", String(state.v + 1));
    updateUrlParams();

    // Update active highlight in left rail
    document.querySelectorAll(".flow-btn").forEach((b) => {
      b.setAttribute("aria-current", String(parseInt(b.dataset.flowIndex, 10) === state.flow));
    });

    renderStageHeader();
    renderPicker();
    renderNotes();
    mountScreen();
  }

  function setVersion(versionIndex) {
    const activeVersions = getActiveVersions();
    state.v = Math.max(0, Math.min(versionIndex, activeVersions.length - 1));
    store.set("v", String(state.v + 1));
    updateUrlParams();

    renderStageHeader();
    updatePickerState();
    renderNotes();
    mountScreen();
  }

  function getActiveVersions() {
    if (!currentProject || !currentProject.flows[state.flow]) return [];
    const flowId = currentProject.flows[state.flow].id;
    return registry[flowId] || [];
  }

  function updateUrlParams() {
    try {
      const curFlow = currentProject.flows[state.flow];
      if (!curFlow) return;
      const u = new URL(location);
      u.searchParams.set("flow", curFlow.id);
      u.searchParams.set("v", String(state.v + 1));
      u.searchParams.set("device", state.device);
      history.replaceState(null, "", u.toString());
    } catch (e) {}
  }

  /* ---- Stage Header ---- */
  function renderStageHeader() {
    const stageFlow = document.querySelector(".stage-flow");
    const stageVer = document.querySelector(".stage-ver");
    const currentFlow = currentProject.flows[state.flow];
    const versions = getActiveVersions();
    const curVersion = versions[state.v];

    if (stageFlow && currentFlow) {
      stageFlow.innerHTML = `
        <span class="stage-category">${esc(currentFlow.category || "Fluxo de Negócio")}</span>
        <span style="opacity:0.6"> · </span>
        <span>${esc(currentFlow.title)}</span>
      `;
    }
    if (stageVer) {
      stageVer.textContent = curVersion ? curVersion.name : "Carregando...";
    }
  }

  /* ---- Emil Kowalski Style Version Picker ---- */
  function renderPicker() {
    let picker = document.querySelector(".proto-picker");
    const versions = getActiveVersions();
    if (!picker) {
      picker = document.createElement("div");
      picker.className = "proto-picker";
      picker.setAttribute("role", "tablist");
      picker.setAttribute("aria-label", "Direções de Design do Fluxo");
      document.querySelector(".stage").appendChild(picker);
    }

    picker.innerHTML = `
      <span class="proto-picker-highlight" aria-hidden="true"></span>
      ${versions.map((v, i) => `
        <button class="proto-picker-item" role="tab" data-ver="${i}" aria-selected="${i === state.v}">
          <span style="opacity:0.6;margin-right:4px;font-size:11px">${i + 1}</span> ${esc(v.name)}
        </button>
      `).join("")}
      <span class="proto-picker-divider" aria-hidden="true"></span>
      <button class="proto-picker-item proto-picker-replay" aria-label="Recarregar tela (R)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
      </button>
    `;

    picker.onclick = (e) => {
      const b = e.target.closest(".proto-picker-item");
      if (!b) return;
      if (b.classList.contains("proto-picker-replay")) {
        mountScreen();
      } else if (b.dataset.ver) {
        setVersion(parseInt(b.dataset.ver, 10));
      }
    };

    updatePickerState();
  }

  function updatePickerState() {
    const picker = document.querySelector(".proto-picker");
    if (!picker) return;
    const btns = picker.querySelectorAll(".proto-picker-item[data-ver]");
    btns.forEach((b, i) => {
      if (i === state.v) {
        b.setAttribute("data-active", "");
        b.setAttribute("aria-selected", "true");
      } else {
        b.removeAttribute("data-active");
        b.setAttribute("aria-selected", "false");
      }
    });
    movePickerHighlight();
  }

  function movePickerHighlight() {
    const picker = document.querySelector(".proto-picker");
    if (!picker) return;
    const activeBtn = picker.querySelector(".proto-picker-item[data-active]");
    const highlight = picker.querySelector(".proto-picker-highlight");
    if (!activeBtn || !highlight) return;

    highlight.style.width = activeBtn.offsetWidth + "px";
    highlight.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    requestAnimationFrame(() => picker.setAttribute("data-ready", ""));
  }

  /* ---- Mount Screen in Device Stage ---- */
  function mountScreen() {
    if (cleanup) {
      try { cleanup(); } catch (e) {}
      cleanup = null;
    }

    const currentFlow = currentProject.flows[state.flow];
    const versions = getActiveVersions();
    const curVersion = versions[state.v];
    if (!screen || !curVersion) return;

    // Fresh clone to clear all existing listeners
    const freshScreen = screen.cloneNode(false);
    freshScreen.dataset.theme = state.theme;
    freshScreen.dataset.device = state.device;
    if (state.motion === "reduced") freshScreen.setAttribute("data-reduced-motion", "");
    if (state.inspector === "on") freshScreen.setAttribute("data-jakub-inspector", "true");
    screen.parentNode.replaceChild(freshScreen, screen);
    screen = freshScreen;

    // Context passed to screen render function
    const ctx = {
      go(flowId, vIndex = 0) {
        const found = currentProject.flows.findIndex((f) => f.id === flowId);
        if (found >= 0) setFlow(found, vIndex);
      },
      toast(msg) {
        window.Kit.toast(screen, msg);
      },
      theme: state.theme,
      device: state.device,
      reduced: state.motion === "reduced"
    };

    // Render screen
    try {
      cleanup = curVersion.render(screen, ctx);
    } catch (err) {
      console.error("Screen render error:", err);
      screen.innerHTML = `<div style="padding:30px;color:#ED1C24"><h3>Erro ao renderizar tela</h3><pre>${esc(err.message)}</pre></div>`;
    }

    // Platform-specific status bar time & desktop breadcrumbs
    const statusTime = screen.querySelector(".sk-status-time");
    if (statusTime) {
      statusTime.textContent = state.device === "android" ? "10:00" : "09:41";
    }

    // Web Desktop enterprise header adaptation
    if (state.device === "web") {
      const barEl = screen.querySelector(".sk-bar");
      if (barEl) {
        const curCat = currentFlow.category || "Ouvidoria";
        barEl.innerHTML = `
          <div class="sk-row" style="gap:14px;align-items:center">
            <span class="sk-logo-wrap" aria-label="Pitang Labs">${window.Kit.pitangMiniLogo ? window.Kit.pitangMiniLogo() : ''}</span>
            <div class="sk-breadcrumbs" style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--sk-ink-3)">
              <span style="opacity:0.6">Portal</span>
              <span style="opacity:0.4">/</span>
              <span style="opacity:0.6">${esc(curCat)}</span>
              <span style="opacity:0.4">/</span>
              <strong style="color:var(--sk-ink);font-weight:650">${esc(currentFlow.title)}</strong>
            </div>
          </div>
          <span class="sk-sp"></span>
          <div class="sk-row" style="gap:10px;align-items:center">
            <div class="sk-web-search-box" style="display:flex;align-items:center;gap:6px;padding:5px 12px;background:var(--sk-surface-2);border-radius:6px;border:1px solid var(--sk-line);font-size:12px;color:var(--sk-ink-3);cursor:pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>Buscar...</span>
              <kbd style="font-size:10px;padding:1px 4px;border-radius:3px;background:var(--sk-surface);border:1px solid var(--sk-line)">⌘K</kbd>
            </div>
            <button class="sk-ic sk-press" aria-label="Notificações"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
            <div class="sk-avatar" style="background:#ED1C24;color:#fff;font-weight:700;font-size:11px" title="Pitang Colaborador">PL</div>
          </div>
        `;
      }
    }

    // Android FAB quick action trigger
    const mainFab = screen.querySelector("#sk-main-fab");
    if (mainFab) {
      mainFab.addEventListener("click", () => {
        window.Kit.toast(screen, "Nova demanda iniciada (Ação rápida Material 3)");
      });
    }

    // Attach Jakub live inspector badge if enabled
    if (state.inspector === "on") {
      const scoreBadge = document.createElement("div");
      scoreBadge.className = "jakub-score-pill";
      scoreBadge.innerHTML = `Inspeção visual: <span>conformidade não verificada</span>`;
      screen.appendChild(scoreBadge);
    }

    // Bind navigation tab clicks inside mock-up to router
    screen.querySelectorAll("[data-tab-flow]").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const targetId = tabBtn.dataset.tabFlow;
        const targetIdx = currentProject.flows.findIndex((f) => f.id === targetId);
        if (targetIdx >= 0) setFlow(targetIdx, 0);
      });
    });
  }

  /* ---- Rationale & Business Rules Panel (Right) ---- */
  function renderNotes() {
    const notesEl = document.querySelector(".notes");
    const currentFlow = currentProject.flows[state.flow];
    const versions = getActiveVersions();
    const curVersion = versions[state.v];
    if (!notesEl || !currentFlow || !curVersion) return;

    const personas = currentProject.personas || {};

    notesEl.innerHTML = `
      <!-- Regras de Negócio Mapeadas -->
      <section class="n-block">
        <h3 class="n-h">
          <span>Requisitos do briefing</span>
          <span style="color:var(--accent);font-size:11px">${(curVersion.rules || []).length}&nbsp;Mapeados</span>
        </h3>
        <div class="n-rules-list">
          ${(curVersion.rules || currentFlow.rules || []).map((r) => {
            const match = r.match(/^(RN-[\d.]+):\s*(.+)/i);
            const tag = match ? match[1] : "RN";
            const text = match ? match[2] : r;
            return `
              <div class="n-rule-item">
                <span class="n-rule-tag">${esc(tag)}</span>
                <span>${esc(text)}</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <!-- Hipótese de Design -->
      <section class="n-block">
        <h3 class="n-h">Direção &amp; Hipótese de Design</h3>
        <p class="n-axis">${esc(curVersion.axis)}</p>
      </section>

      <!-- Perfis de exemplo -->
      <section class="n-block">
        <h3 class="n-h">Perfis de exemplo</h3>
        <div class="personas">
          ${(curVersion.personas || []).map((pId) => {
            const p = personas[pId] || { name: pId, ini: pId.charAt(0).toUpperCase(), color: "#ED1C24" };
            return `
              <button class="persona" data-persona="${esc(pId)}" aria-expanded="false">
                <i style="background:${esc(p.color || '#ED1C24')}">${esc(p.ini || 'P')}</i>
                <span>${esc(p.name)}</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>

      <!-- Experimente no Protótipo -->
      <section class="n-block">
        <h3 class="n-h">Experimente no Protótipo</h3>
        <ul class="n-list n-try">
          ${(curVersion.tryThis || []).map((t) => `<li>${esc(t)}</li>`).join("")}
        </ul>
      </section>

      <!-- Engenharia Cinética & Movimento Jakub -->
      <section class="n-block">
        <h3 class="n-h">Engenharia Cinética &amp; Micro-Interações</h3>
        <p class="n-axis" style="font-size:13px;color:var(--ink-2)">${esc(curVersion.motion)}</p>
      </section>

      <!-- Trade-offs & Custos -->
      <section class="n-block">
        <h3 class="n-h">Trade-offs &amp; Custos Arquiteturais</h3>
        <p class="n-axis" style="font-size:13px;color:var(--ink-2)">${esc(curVersion.tradeoff)}</p>
      </section>

      <section class="n-block">
        <h3 class="n-h">Verificação pendente</h3>
        <p class="n-axis">Os requisitos acima foram mapeados, não testados. Valide as interações, regras, teclado e contraste antes de aprovar esta prévia.</p>
      </section>
    `;

    // Persona Popover listener
    notesEl.querySelectorAll(".persona").forEach((b) => {
      b.addEventListener("click", () => openPersonaPopover(b, b.dataset.persona));
    });
  }

  /* ---- Persona Popover ---- */
  let personaPop = null;
  function openPersonaPopover(btn, pId) {
    closePopover();
    const personas = currentProject.personas || {};
    const p = personas[pId];
    if (!p) return;

    btn.setAttribute("aria-expanded", "true");
    if (!personaPop) {
      personaPop = document.createElement("div");
      personaPop.className = "pop";
      document.body.appendChild(personaPop);
    }

    personaPop.innerHTML = `
      <b>${esc(p.name)}</b>
      <span style="font-size:11px;color:var(--ink-3)">${esc(p.tag || "")}</span>
      <q>${esc(p.quote || "")}</q>
      <p style="margin:4px 0 0;font-size:12px;color:var(--ink-2)">${esc(p.line || "")}</p>
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line);font-size:11.5px">
        <strong style="display:block;margin-bottom:2px">Necessidades:</strong>
        <span style="color:var(--ink-3)">${esc(p.needs || "")}</span>
      </div>
    `;

    const r = btn.getBoundingClientRect();
    personaPop.style.left = `${Math.min(window.innerWidth - 290, Math.max(10, r.left))}px`;
    personaPop.style.top = `${r.bottom + 8}px`;
    personaPop.setAttribute("data-open", "");
  }

  function closePopover() {
    document.querySelectorAll(".persona").forEach((b) => b.setAttribute("aria-expanded", "false"));
    if (personaPop) personaPop.removeAttribute("data-open");
  }

  /* ---- Stage Fitting & Scaling ---- */
  function fitStage() {
    if (!deviceWrap || !device) return;
    const stage = document.querySelector(".stage");
    const d = DEVICES[state.device];
    const topH = 80;
    const botH = 80;
    const avH = stage.offsetHeight - topH - botH;
    const avW = stage.offsetWidth - 32;

    const s = Math.min(1, avH / d.h, avW / d.w);
    window.__phoneScale = s;

    deviceWrap.style.width = `${Math.round(d.w * s)}px`;
    deviceWrap.style.height = `${Math.round(d.h * s)}px`;
    device.style.transform = `scale(${s})`;
    device.dataset.device = state.device;
  }

  function setDevice(dev) {
    if (!DEVICES[dev]) return;
    state.device = dev;
    store.set("device", dev);
    const seg = document.querySelector('.seg[data-key="device"]');
    if (seg) {
      const btns = seg.querySelectorAll("button");
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === dev)));
      const active = [...btns].find((b) => b.dataset.val === dev);
      const thumb = seg.querySelector(".seg-thumb");
      if (active && thumb) {
        thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
        thumb.style.width = `${active.offsetWidth}px`;
      }
    }
    device.dataset.device = state.device;
    fitStage();
    updateUrlParams();
    mountScreen();
  }

  function setTheme(t) {
    state.theme = t;
    store.set("theme", t);
    document.documentElement.dataset.theme = t;
    if (screen) screen.dataset.theme = t;
    const seg = document.querySelector('.seg[data-key="theme"]');
    if (seg) {
      const btns = seg.querySelectorAll("button");
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === t)));
      const active = [...btns].find((b) => b.dataset.val === t);
      const thumb = seg.querySelector(".seg-thumb");
      if (active && thumb) {
        thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
        thumb.style.width = `${active.offsetWidth}px`;
      }
    }
  }

  /* ---- Segmented Controls (Device, Theme, Motion) ---- */
  function setupSegmentedControls() {
    document.querySelectorAll(".seg").forEach((seg) => {
      const key = seg.dataset.key;
      const btns = [...seg.querySelectorAll("button")];
      const thumb = document.createElement("span");
      thumb.className = "seg-thumb";
      thumb.setAttribute("aria-hidden", "true");
      seg.prepend(thumb);

      const sync = () => {
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === state[key])));
        const active = btns.find((b) => b.dataset.val === state[key]) || btns[0];
        if (active) {
          thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
          thumb.style.width = `${active.offsetWidth}px`;
        }
        seg.setAttribute("data-ready", "");
      };

      seg.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        state[key] = b.dataset.val;
        store.set(key, state[key]);
        sync();

        if (key === "device") {
          device.dataset.device = state.device;
          fitStage();
          updateUrlParams();
          mountScreen();
        } else if (key === "theme") {
          document.documentElement.dataset.theme = state.theme;
          if (screen) screen.dataset.theme = state.theme;
        } else if (key === "motion") {
          if (screen) {
            if (state.motion === "reduced") screen.setAttribute("data-reduced-motion", "");
            else screen.removeAttribute("data-reduced-motion");
          }
        } else if (key === "inspector") {
          mountScreen();
        }
      });

      sync();
    });

    // Theme initialization
    document.documentElement.dataset.theme = state.theme;
  }

  /* ------------------------------------------------------------------
     REQUIREMENTS EDITOR DRAWER & REAL-TIME SIMULATION
     ------------------------------------------------------------------ */
  const PRESET_TEMPLATES = {
    ouvidoria: `# Pitang Labs · Portal de Ouvidoria & Atendimento Cidadão

## Categoria: 01. Acesso & Autenticação
### Fluxo: Acesso Seguro & Identificação
- RN-01: Autenticação obrigatória com Gov.br ou SSO corporativo
- RN-02: Garantia irrestrita de manifestação anônima com token criptográfico de 16 caracteres
- RN-03: Bloqueio de 15 minutos após 5 tentativas consecutivas incorretas

## Categoria: 02. Entrada & Registro
### Fluxo: Nova Manifestação & Evidências
- RN-04: Classificação assistida por IA (Denúncia, Reclamação, Elogio, Sugestão)
- RN-05: Upload de evidências (PDF, PNG, JPG, MP3) com limite total de 15 MB
- RN-06: Termo de consentimento e conformidade estrita com LGPD

## Categoria: 03. Triagem & Operação
### Fluxo: Mesa de Triagem & Fila Operacional
- RN-07: Priorização automática por criticidade de SLA (Crítico < 4h, Normal < 24h)
- RN-08: Sugestão de minuta prévia por IA generativa com revisão humana obrigatória
- RN-09: Registro indelével de histórico de despachos para fins de auditoria

## Categoria: 04. Acompanhamento & Protocolo
### Fluxo: Consulta Pública & Linha do Tempo
- RN-10: Consulta pública por número de protocolo único formatado PIT-2026-XXXXXX
- RN-11: Linha do tempo visual de despachos com download de certidão digital

## Categoria: 05. Gestão, Métricas & Governança
### Fluxo: Dashboard Executivo & Telemetria
- RN-12: Apresentação de indicadores de atendimento e taxa de resolutividade em números tabulares
- RN-13: Exportação de relatórios gerenciais e mapas de calor de demandas por diretoria`,

    ags: `# Portal AGS · Bafômetro & Compliance Operacional

## Categoria: 01. Acesso & Identificação
### Fluxo: Check-in de Operador & Biometria
- RN-01: Validação biométrica facial do colaborador antes de iniciar turno operacional
- RN-02: Registro de localização geográfica e verificação de jornada de trabalho

## Categoria: 02. Entrada & Aferição
### Fluxo: Teste do Bafômetro & Telemetria
- RN-03: Integração direta com dispositivo via Bluetooth LE com leitura criptografada
- RN-04: Bloqueio imediato de acesso caso nível de alcoolemia seja superior a 0,00 mg/L

## Categoria: 03. Triagem & Auditoria
### Fluxo: Mesa de Supervisão & Alertas em Tempo Real
- RN-05: Disparo de alerta push para o supervisor de segurança em caso de inconformidade
- RN-06: Contraprova obrigatória agendada em até 15 minutos com segunda testemunha

## Categoria: 04. Gestão & Governança
### Fluxo: Painel de Conformidade Operacional
- RN-07: Relatórios de assiduidade e testes realizados com números tabulares
- RN-08: Exportação de dados para o Ministério do Trabalho e auditoria externa`,

    b2b: `# Pitang Procurement · Sistema B2B de Compras & Cotações

## Categoria: 01. Acesso & Permissões
### Fluxo: Acesso por Perfil & Alçada
- RN-01: Controle de alçada financeira (Operador até R$ 5k, Gerente até R$ 50k, Diretor > R$ 50k)
- RN-02: Autenticação corporativa com perfil de fornecedor ou comprador

## Categoria: 02. Requisição & Itens
### Fluxo: Nova Requisição de Compra
- RN-03: Catálogo integrado com precificação média histórica e estoque mínimo
- RN-04: Upload obrigatório de especificações técnicas e cotações prévias

## Categoria: 03. Triagem & Cotações
### Fluxo: Mapa Comparativo de Fornecedores
- RN-05: Equalização automática de propostas comerciais considerando frete e impostos
- RN-06: Notificação automática ao vencedor do certame com assinatura digital

## Categoria: 04. Gestão Financeira
### Fluxo: Dashboard de Gastos & Economia (Saving)
- RN-07: Métricas de saving gerado por categoria de insumo com números tabulares
- RN-08: Rastreabilidade completa da requisição ao recebimento fiscal`,

    copilot: `# Central de Operações & AI Copilot Pitang

## Categoria: 01. Autenticação & Agentes
### Fluxo: Conexão Segura & Seleção de Modelo
- RN-01: Autenticação SSO com controle de tokens e cotas por equipe
- RN-02: Seleção de modelo de IA com isolamento de dados confidenciais

## Categoria: 02. Interação & RAG
### Fluxo: Chat Copilot com Base de Conhecimento
- RN-03: Busca semântica RAG em documentos corporativos com citação de fontes
- RN-04: Geração de minutas com validação de conformidade normativa

## Categoria: 03. Fila de Homologação
### Fluxo: Mesa de Validação Humana (Human-in-the-Loop)
- RN-05: Encaminhamento obrigatório de respostas sensíveis para aprovação técnica
- RN-06: Registro de feedback de assertividade para calibração de modelos

## Categoria: 04. Telemetria de IA
### Fluxo: Painel de Consumo & Performance
- RN-07: Métricas de latência e custo por requisição com números tabulares
- RN-08: Log auditável de interações em conformidade com o marco da IA`,

    fintech: `# Pitang Pay · Internet Banking Corporativo

## Categoria: 01. Acesso & Segurança
### Fluxo: Login Corporativo & 2FA
- RN-01: Autenticação com biometria e token dinâmico no dispositivo cadastrado
- RN-02: Bloqueio automático por suspeita de fraude em acessos de IPs não usuais

## Categoria: 02. Transações & Pagamentos
### Fluxo: Envio de Pix em Lote
- RN-03: Upload de arquivo CNAB 240 com validação de chaves Pix e saldo em conta
- RN-04: Alçadas de aprovação dupla para pagamentos acima de R$ 50.000,00

## Categoria: 03. Conciliação & Extrato
### Fluxo: Extrato Inteligente & Filtros
- RN-05: Categorização automática de despesas e exportação em formato OFX e PDF
- RN-06: Rastreamento em tempo real do status de liquidação bancária`,

    health: `# Pitang Health · Telemedicina & Prontuário Eletrônico

## Categoria: 01. Acesso & Conselho
### Fluxo: Acesso do Médico (CRM Digital)
- RN-01: Validação de registro profissional no CFM e certificado digital ICP-Brasil
- RN-02: Termo de sigilo médico e proteção reforçada de dados sensíveis de saúde

## Categoria: 02. Atendimento & Consulta
### Fluxo: Teleconsulta & Prescrição Eletrônica
- RN-03: Sala de vídeo criptografada com gravação opcional sob consentimento
- RN-04: Emissão de receita médica digital com QR Code e assinatura ICP-Brasil

## Categoria: 03. Histórico do Paciente
### Fluxo: Linha do Tempo Clínica (Prontuário)
- RN-05: Rastreamento cronológico de exames, diagnósticos CID e alergias
- RN-06: Compartilhamento seguro de histórico entre especialistas autorizados`
  };

  function buildRequirementsDrawer() {
    const scrim = document.createElement("div");
    scrim.className = "req-drawer-scrim";

    const drawer = document.createElement("div");
    drawer.className = "req-drawer";
    drawer.hidden = true;
    drawer.inert = true;
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Editor de Requisitos & Simulador");

    drawer.innerHTML = `
      <div class="req-drawer-h">
        <div>
          <h2>Simulador de POC · Requisitos</h2>
          <span style="font-size:12px;color:var(--ink-3)">Cole uma descrição livre ou use títulos como “### Fluxo: Nome”. Modelos são exemplos, não uma aplicação gerada por IA.</span>
        </div>
        <button class="sk-ic req-close-btn" aria-label="Fechar gaveta">&times;</button>
      </div>

      <div class="req-drawer-b">
        <div class="req-drawer-presets">
          <div class="sk-row" style="justify-content:space-between;align-items:center">
            <label class="sk-label">Modelos Pré-definidos (Presets Pitang Labs):</label>
            <button class="preset-btn" id="btn-import-file-trigger" style="color:var(--accent);font-weight:700">
              📁 Importar Arquivo (.txt, .md, .json)
            </button>
            <input type="file" id="file-req-picker" accept=".txt,.md,.json,.csv" style="display:none" />
          </div>
          <div class="req-presets-row">
            <button class="preset-btn" data-preset="ouvidoria">Ouvidoria &amp; Atendimento</button>
            <button class="preset-btn" data-preset="ags">Portal AGS / Bafômetro</button>
            <button class="preset-btn" data-preset="b2b">Compras &amp; Cotações B2B</button>
            <button class="preset-btn" data-preset="copilot">AI Copilot &amp; Operações</button>
            <button class="preset-btn" data-preset="fintech">Fintech &amp; Internet Banking</button>
            <button class="preset-btn" data-preset="health">HealthTech &amp; Telemedicina</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;flex:1;gap:6px">
          <label class="sk-label" for="txt-requirements">Especificação de Requisitos &amp; Regras de Negócio (Markdown, Stories, Gherkin ou Livre):</label>
          <textarea class="req-textarea" id="txt-requirements" placeholder="Digite ou cole aqui os requisitos do seu projeto na IDE..."></textarea>
        </div>
      </div>

      <p class="req-error" id="req-error" role="alert" hidden></p>
      <div class="req-drawer-f">
        <button class="btn-export-html" id="btn-export-md" title="Baixar especificação em Markdown">
          Baixar PRD (.md)
        </button>
        <button class="btn-export-html" id="btn-export-poc" title="Baixar arquivo HTML autônomo da POC">
          Exportar POC (.html)
        </button>
        <button class="btn-simulate-now" id="btn-run-simulation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Atualizar prévia
        </button>
      </div>
    `;

    document.body.appendChild(scrim);
    document.body.appendChild(drawer);

    const txtArea = drawer.querySelector("#txt-requirements");
    txtArea.value = currentProject.rawText || PRESET_TEMPLATES.ouvidoria;

    // Presets selection
    drawer.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.preset;
        if (PRESET_TEMPLATES[key]) {
          txtArea.value = PRESET_TEMPLATES[key];
        }
      });
    });

    // Run Simulation
    drawer.querySelector("#btn-run-simulation").addEventListener("click", () => {
      const errorEl = drawer.querySelector("#req-error");
      errorEl.hidden = true;
      try {
        const text = txtArea.value.trim();
        if (!text) throw new Error("Descreva seu projeto antes de atualizar a prévia.");
        const parsed = currentProject.artifactHtml && text === currentProject.rawText ? currentProject : window.RequirementsParser.parse(text);
        if (!parsed?.flows?.length) throw new Error("Nenhum fluxo foi encontrado. Revise o texto informado.");
        currentProject = parsed;
        state.selectedCategory = "all";
        state.searchQuery = "";
        document.querySelector(".rail-search").value = "";
        store.set("custom_requirements", text);
        Object.keys(registry).forEach(key => delete registry[key]);
        window.PocGenerator.registerProjectScreens(currentProject);
        renderCategoryChips();
        renderFlowsList();
        setFlow(0, 0);
        closeRequirementsDrawer();
        window.Kit.toast(screen, `${parsed.flows.length} fluxo(s) mapeado(s). Implementação e verificação pendentes.`);
      } catch (error) {
        errorEl.textContent = error.message || "Não foi possível ler os requisitos. Revise o texto e tente novamente.";
        errorEl.hidden = false;
        txtArea.setAttribute("aria-invalid", "true");
        txtArea.focus();
      }
    });
    txtArea.addEventListener("input", () => {
      txtArea.removeAttribute("aria-invalid");
      drawer.querySelector("#req-error").hidden = true;
    });
    drawer.addEventListener("keydown", event => {
      if (event.key === "Escape" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault(); event.stopPropagation(); closeRequirementsDrawer(); return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...drawer.querySelectorAll('button:not([disabled]), textarea, input:not([type="file"])')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    // File input trigger
    const fileTrigger = drawer.querySelector("#btn-import-file-trigger");
    const filePicker = drawer.querySelector("#file-req-picker");
    if (fileTrigger && filePicker) {
      fileTrigger.addEventListener("click", () => filePicker.click());
      filePicker.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            txtArea.value = ev.target.result;
            window.Kit.toast(screen, `Arquivo ${file.name} carregado com sucesso!`);
          };
          reader.readAsText(file, "utf-8");
        }
      });
    }

    // Export PRD Markdown button
    const btnExportMd = drawer.querySelector("#btn-export-md");
    if (btnExportMd) {
      btnExportMd.addEventListener("click", () => {
        const text = txtArea.value;
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "especificacao-requisitos-poc.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.Kit.toast(screen, "Especificação PRD (.md) baixada com sucesso!");
      });
    }

    // Export POC HTML button
    drawer.querySelector("#btn-export-poc").addEventListener("click", exportStandaloneHtml);

    // Close buttons
    drawer.querySelector(".req-close-btn").addEventListener("click", closeRequirementsDrawer);
    scrim.addEventListener("click", closeRequirementsDrawer);
  }

  function openRequirementsDrawer() {
    const scrim = document.querySelector(".req-drawer-scrim");
    const drawer = document.querySelector(".req-drawer");
    if (scrim && drawer) {
      requirementsTrigger = document.activeElement;
      drawer.hidden = false;
      drawer.inert = false;
      document.querySelector(".app").inert = true;
      scrim.setAttribute("data-open", "");
      drawer.setAttribute("data-open", "");
      const txt = drawer.querySelector("#txt-requirements");
      if (txt) txt.focus();
    }
  }

  function closeRequirementsDrawer() {
    const scrim = document.querySelector(".req-drawer-scrim");
    const drawer = document.querySelector(".req-drawer");
    if (scrim && drawer) {
      const wasOpen = drawer.hasAttribute("data-open");
      drawer.hidden = true;
      drawer.inert = true;
      document.querySelector(".app").inert = false;
      if (wasOpen && requirementsTrigger?.isConnected) requirementsTrigger.focus();
      scrim.removeAttribute("data-open");
      drawer.removeAttribute("data-open");
    }
  }

  function toggleRequirementsDrawer() {
    const drawer = document.querySelector(".req-drawer");
    if (drawer && drawer.hasAttribute("data-open")) {
      closeRequirementsDrawer();
    } else {
      openRequirementsDrawer();
    }
  }

  /* ---- Export Standalone HTML Feature ---- */
  function exportStandaloneHtml() {
    const copy = document.documentElement.cloneNode(true);
    // Export a clean shell: runtime widgets are reconstructed on load.
    // Keeping their cloned markup would duplicate IDs and lose their event handlers.
    copy.querySelectorAll("#poc-project-data, .req-drawer, .req-drawer-scrim, .proto-picker, .pop, .tour").forEach(node => node.remove());
    const snapshot = document.createElement("script");
    snapshot.id = "poc-project-data";
    snapshot.type = "application/json";
    snapshot.textContent = window.PocSnapshot.serialize(currentProject);
    copy.querySelector("head").appendChild(snapshot);
    copy.querySelector(".app")?.removeAttribute("inert");
    const drawer = copy.querySelector(".req-drawer");
    if (drawer) { drawer.hidden = true; drawer.setAttribute("inert", ""); drawer.removeAttribute("data-open"); }
    copy.querySelector(".req-drawer-scrim")?.removeAttribute("data-open");
    const docHtml = "<!doctype html>\n" + copy.outerHTML;
    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pitang-poc-simulator.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.Kit.toast(screen, "Arquivo pitang-poc-simulator.html gerado!");
  }

  // Live Hot-Reload Polling in IDE Dev Server
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    let initialVersion = null;
    setInterval(() => {
      fetch("/api/version")
        .then((r) => r.json())
        .then((data) => {
          if (initialVersion && initialVersion !== data.version) {
            // Preserve edits while the developer changes source files in the IDE.
            if (document.querySelector(".req-drawer[data-open]")) return;
            location.reload();
          }
          if (!initialVersion) initialVersion = data.version;
        })
        .catch(() => {});
    }, 1200);
  }

  // Export functions to global scope
  window.openRequirementsDrawer = openRequirementsDrawer;
  window.closeRequirementsDrawer = closeRequirementsDrawer;

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
