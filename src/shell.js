/* ==========================================================================
   VIEWER: flows (left), phone (centre), notes (right), version picker.
   Pitang Labs · Design Engineering
   ========================================================================== */
(function () {
  const { esc } = window.Kit;

  /* ---- Personas de Validação ---- */
  const PERSONAS = {
    racer: { name: "Racer", tag: "Foco em Performance", color: "#2f5d9e", ini: "R", line: "Competidor e entusiasta que analisa tabelas geométricas detalhadas.", quote: "Mostre-me os dados e especificações.", needs: "Detalhes de especificação, peso, rigidez e checkout veloz." },
    weekend: { name: "Ciclista de Fim de Semana", tag: "Passeios & Grupos", color: "#ED1C24", ini: "W", line: "Pedala com amigos, prioriza conforto, durabilidade e ergonomia.", quote: "Quero uma experiência especial, sem complicação.", needs: "Ajuste ideal (bike fit), comunidade e manutenção simplificada." },
    first: { name: "Primeiro Investimento", tag: "Entusiasta em Evolução", color: "#9a5a12", ini: "F", line: "Buscando sua primeira bicicleta de alta performance.", quote: "Como garanto o tamanho perfeito para meu corpo?", needs: "Confiança, verificação de medidas e transparência total de custos." },
    explorer: { name: "Explorador Gravel", tag: "Aventura & Terra", color: "#7a3f8f", ini: "G", line: "Mapeia trilhas e rotas mistas, viajando com a bike.", quote: "Até onde este equipamento pode me levar?", needs: "Inspiração de rotas, robustez e acessórios integrados." },
  };

  /* ---- Flows: meta lives here so chrome stays consistent ---- */
  const FLOWS = [
    { id: "home", title: "Home", sum: "Página inicial: primeiro contato com a linha de produtos.", today: ["Layout atual da home: topo e rolagem"] },
    { id: "bike", title: "Página da Bike", sum: "Onde o ciclista analisa detalhes e toma a decisão.", today: ["Página de produto atual"] },
    { id: "build", title: "Configurador", sum: "Escolha personalizada de componentes sem fricção.", today: ["Configurador atual"] },
    { id: "checkout", title: "Checkout", sum: "Pagamento transparente e sem surpresas.", today: ["Checkout atual: etapas 1 e 2"] },
    { id: "garage", title: "Minha Garagem", sum: "Acompanhamento pós-entrega e revisões.", today: ["Área da conta do cliente"] },
    { id: "rides", title: "Pedais & Rotas", sum: "Comunidade, eventos e incentivo ao pedal.", today: ["Página de eventos atual"] },
  ];

  const registry = {};
  window.Proto = {
    versions(flowId, list) { registry[flowId] = list; },
    personas: PERSONAS,
    get registry() { return registry; },
    get flows() { return FLOWS; },
  };

  /* ---- State ---- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("protokit:" + k); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("protokit:" + k, v); } catch {} },
  };
  const params = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
  const prefersReduced = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
  const state = {
    flow: Math.max(0, FLOWS.findIndex((f) => f.id === (params.get("flow") || store.get("flow", "home")))),
    v: (parseInt(params.get("v") || store.get("v", "1"), 10) || 1) - 1,
    theme: store.get("theme", "light"),
    text: store.get("text", "default"),
    motion: prefersReduced ? "reduced" : store.get("motion", "full"),
    annot: store.get("annot", "on"),
    device: ["ios", "android", "web"].includes(params.get("device")) ? params.get("device") : store.get("device", "ios"),
  };

  /* Frame sizes: outer device box and the screen inside it (CSS px) */
  const DEVICES = {
    ios: { w: 414, h: 868, label: "iPhone" },
    android: { w: 436, h: 939, label: "Android" },
    web: { w: 1280, h: 820, label: "Web" },
  };

  let screen, deviceWrap, device, cleanup = null;

  /* ---- Build chrome ---- */
  function build() {
    const flowsEl = document.querySelector(".flows");
    flowsEl.innerHTML = FLOWS.map((f, i) => `<li><button class="flow-btn" data-flow="${i}"><span class="flow-num">${String(i + 1).padStart(2, "0")}</span><span class="flow-title">${esc(f.title)}</span><span class="flow-sum">${esc(f.sum)}</span></button></li>`).join("");
    flowsEl.addEventListener("click", (e) => { const b = e.target.closest(".flow-btn"); if (b) setFlow(+b.dataset.flow, 0); });

    screen = document.getElementById("screen");
    deviceWrap = document.querySelector(".device-wrap");
    device = document.querySelector(".device");

    segs();
    fit();
    window.addEventListener("resize", () => { fit(); moveHighlight(); });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "Escape" && e.target.closest && e.target.closest("#screen") && e.target !== screen) return;
      if (e.key === "Escape") { closePop(); return; }
      const n = versions().length;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= n) setVersion(num - 1);
      else if (e.key === "ArrowRight") setVersion((state.v + 1) % n);
      else if (e.key === "ArrowLeft") setVersion((state.v - 1 + n) % n);
      else if (e.key === "ArrowDown") { e.preventDefault(); setFlow((state.flow + 1) % FLOWS.length, 0); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setFlow((state.flow - 1 + FLOWS.length) % FLOWS.length, 0); }
      else if (e.key === "r" || e.key === "R") mount();
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".persona, .pop")) closePop(); });
  }

  /* ---- Segmented controls (theme / text / motion) ---- */
  function segs() {
    document.querySelectorAll(".seg").forEach((seg) => {
      const key = seg.dataset.key;
      const btns = [...seg.querySelectorAll("button")];
      const thumb = document.createElement("span"); thumb.className = "seg-thumb"; thumb.setAttribute("aria-hidden", "true"); seg.prepend(thumb);
      const sync = () => {
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === state[key])));
        const a = btns.find((b) => b.dataset.val === state[key]) || btns[0];
        thumb.style.width = a.offsetWidth + "px"; thumb.style.transform = `translateX(${a.offsetLeft - 2}px)`;
      };
      btns.forEach((b) => b.addEventListener("click", () => { state[key] = b.dataset.val; store.set(key, state[key]); sync(); applyPrefs(); if (key === "device") { persist(); mount(); } }));
      seg._sync = sync; sync();
      requestAnimationFrame(() => requestAnimationFrame(() => seg.setAttribute("data-ready", "")));
    });
  }

  function applyPrefs() {
    screen.dataset.theme = state.theme;
    screen.style.setProperty("--fs", state.text === "large" ? "1.18" : "1");
    screen.toggleAttribute("data-reduced-motion", state.motion === "reduced");
    screen.dataset.annot = state.annot;
    screen.dataset.device = state.device;
    if (device && device.dataset.device !== state.device) { device.dataset.device = state.device; fit(); }
  }

  /* ---- Fit phone to available height ---- */
  function fit() {
    const stage = document.querySelector(".stage");
    const head = document.querySelector(".stage-h");
    const narrow = window.innerWidth <= 760;
    const availH = (narrow ? window.innerHeight * 0.86 : stage.clientHeight - head.offsetHeight - 10 - 96);
    const availW = stage.clientWidth - 32;
    const D = DEVICES[state.device] || DEVICES.ios;
    const s = Math.max(state.device === "web" ? 0.2 : 0.42, Math.min(1, availH / D.h, availW / D.w));
    device.dataset.device = state.device;
    device.style.transform = `scale(${s})`;
    deviceWrap.style.width = D.w * s + "px";
    deviceWrap.style.height = D.h * s + "px";
    window.__phoneScale = s;
  }

  /* ---- Picker (Emil PICKER.md) ---- */
  let picker, highlight, items = [];
  function buildPicker() {
    const vs = versions();
    if (!picker) { picker = document.createElement("nav"); picker.className = "proto-picker"; picker.setAttribute("aria-label", "Variações do protótipo"); (document.querySelector(".stage") || document.body).appendChild(picker); }
    picker.removeAttribute("data-ready");
    picker.innerHTML = `<span class="proto-picker-highlight" aria-hidden="true"></span>` +
      vs.map((v) => `<button class="proto-picker-item">${esc(v.name)}</button>`).join("") +
      `<span class="proto-picker-divider" aria-hidden="true"></span><button class="proto-picker-item proto-picker-replay" aria-label="Replay animação (R)">↻</button>`;
    highlight = picker.querySelector(".proto-picker-highlight");
    items = [...picker.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")];
    items.forEach((el, i) => el.addEventListener("click", () => setVersion(i)));
    picker.querySelector(".proto-picker-replay").addEventListener("click", () => mount());
    markPicker();
    requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute("data-ready", "")));
  }

  function markPicker() {
    items.forEach((el, j) => { el.toggleAttribute("data-active", j === state.v); if (j === state.v) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); });
    moveHighlight();
  }

  function moveHighlight() {
    const el = items[state.v]; if (!el || !highlight) return;
    highlight.style.width = el.offsetWidth + "px";
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  const versions = () => registry[FLOWS[state.flow].id] || [];

  function setFlow(i, v = 0) {
    state.flow = i; state.v = v;
    document.querySelectorAll(".flow-btn").forEach((b, j) => b.setAttribute("aria-current", String(j === i)));
    buildPicker();
    renderVersion();
  }

  function setVersion(i) {
    const n = versions().length; if (i < 0 || i >= n) return;
    state.v = i; markPicker(); renderVersion();
  }

  function persist() {
    store.set("flow", FLOWS[state.flow].id); store.set("v", String(state.v + 1));
    try { const u = new URL(location.href); u.searchParams.set("flow", FLOWS[state.flow].id); u.searchParams.set("v", state.v + 1); u.searchParams.set("device", state.device); history.replaceState(null, "", u); } catch {}
  }

  function renderVersion() {
    const f = FLOWS[state.flow], ver = versions()[state.v];
    if (!ver) { state.v = 0; }
    persist();
    document.querySelector(".stage-flow").textContent = `${String(state.flow + 1).padStart(2, "0")} · ${f.title}`;
    document.querySelector(".stage-ver").textContent = versions()[state.v]?.name || "-";
    document.title = `${versions()[state.v]?.name || f.title} · Pitang Labs`;
    notes();
    mount();
  }

  /* ---- Mount ---- */
  function mount() {
    const ver = versions()[state.v];
    if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
    const fresh = screen.cloneNode(false);
    fresh.removeAttribute("style");
    screen.replaceWith(fresh);
    screen = fresh;
    applyPrefs();
    if (!ver) { screen.innerHTML = `<div style="display:grid;place-items:center;height:100%;color:var(--ink-3)">Carregando…</div>`; return; }
    requestAnimationFrame(() => {
      try { cleanup = ver.render(screen, ctx) || null; }
      catch (err) { console.error(err); screen.innerHTML = `<pre style="padding:60px 16px;white-space:pre-wrap;color:#c81300;font:12px/1.4 monospace">${esc(err.stack || err)}</pre>`; }
    });
  }

  const ctx = {
    go(flowId, v = 0) { const i = FLOWS.findIndex((f) => f.id === flowId); if (i >= 0) setFlow(i, v); },
    toast(msg, o) { window.Kit.toast(screen, msg, o); },
    get theme() { return state.theme; },
    get large() { return state.text === "large"; },
    get reduced() { return state.motion === "reduced"; },
    personas: PERSONAS,
  };

  /* Global tab routing */
  const TAB_ROUTES = { home: ["home", 0], bikes: ["bike", 0], build: ["build", 0], garage: ["garage", 0], rides: ["rides", 0] };
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".ph .sk-tab");
    if (!t || e.defaultPrevented) return;
    const r = TAB_ROUTES[t.dataset.tab]; if (!r) return;
    const cur = FLOWS[state.flow];
    if (cur.id === r[0] && state.v === r[1]) { const sc = screen.querySelector(".sk-scroll"); if (sc) sc.scrollTo({ top: 0, behavior: state.motion === "reduced" ? "auto" : "smooth" }); return; }
    ctx.go(r[0], r[1]);
  });

  /* ---- Notes panel ---- */
  function notes() {
    const f = FLOWS[state.flow], v = versions()[state.v] || {};
    const el = document.querySelector(".notes");
    const ps = (v.personas || []).map((id) => { const p = PERSONAS[id]; return p ? `<button class="persona" data-p="${id}" aria-expanded="false"><i style="background:${p.color}">${esc(p.ini)}</i>${esc(p.name)}</button>` : ""; }).join("");
    const li = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join("");
    el.innerHTML = `
      <section class="n-block"><h2 class="n-h">Direção de Design</h2><p class="n-axis">${esc(v.axis || "")}</p></section>
      ${ps ? `<section class="n-block"><h2 class="n-h">Construído para</h2><div class="personas">${ps}</div></section>` : ""}
      ${v.fixes ? `<section class="n-block"><h2 class="n-h">Problema que resolve</h2><ul class="n-list">${li(v.fixes)}</ul></section>` : ""}
      ${v.tryThis ? `<section class="n-block"><h2 class="n-h">Experimente na tela</h2><ul class="n-list n-try">${li(v.tryThis)}</ul></section>` : ""}
      ${v.motion ? `<section class="n-block"><h2 class="n-h">Movimento & Transição</h2><p class="n-motion">${esc(v.motion)}</p></section>` : ""}
      ${v.tradeoff ? `<section class="n-block"><h2 class="n-h">Tradeoff</h2><p class="n-motion">${esc(v.tradeoff)}</p></section>` : ""}
      <section class="n-block"><h2 class="n-h">Referência de Base</h2><div class="today">${f.today.map((cap) => `<div class="today-ph"><span>${esc(cap)}</span></div>`).join("")}</div><p class="today-note">Evidências de design e hipóteses comparadas lado a lado com a experiência interativa.</p></section>`;
    el.querySelectorAll(".persona").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); togglePop(b); }));
  }

  /* ---- Persona popover ---- */
  let pop, popFor = null;
  function togglePop(btn) {
    if (popFor === btn) return closePop();
    closePop();
    const p = PERSONAS[btn.dataset.p];
    if (!pop) { pop = document.createElement("div"); pop.className = "pop"; pop.setAttribute("role", "dialog"); document.body.appendChild(pop); }
    pop.innerHTML = `<b>${esc(p.name)} · ${esc(p.tag)}</b>${esc(p.line)}<q>${esc(p.quote)}</q><div><strong>Necessidades:</strong> ${esc(p.needs)}</div><div class="src">Persona de validação · Pitang Labs</div>`;
    const r = btn.getBoundingClientRect();
    let left = Math.min(r.left, window.innerWidth - 276), top = r.bottom + 8;
    const below = top + 220 < window.innerHeight;
    if (!below) top = r.top - 8 - 200;
    pop.style.left = left + "px"; pop.style.top = top + "px";
    pop.style.setProperty("--origin", `${r.left - left + 16}px ${below ? "0" : "100%"}`);
    btn.setAttribute("aria-expanded", "true"); popFor = btn;
    requestAnimationFrame(() => pop.setAttribute("data-open", ""));
  }
  function closePop() { if (pop) pop.removeAttribute("data-open"); if (popFor) popFor.setAttribute("aria-expanded", "false"); popFor = null; }

  /* ---- Boot ---- */
  window.addEventListener("DOMContentLoaded", () => {
    build();
    const vMax = (registry[FLOWS[state.flow].id] || []).length;
    setFlow(state.flow, Math.min(Math.max(0, state.v), Math.max(0, vMax - 1)));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { moveHighlight(); document.querySelectorAll(".seg").forEach((s) => s._sync && s._sync()); });
  });
})();
