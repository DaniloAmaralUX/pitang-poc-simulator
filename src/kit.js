/* ==========================================================================
   PITANG LABS · DESIGN ENGINEERING KIT (JS)
   Implements Jakub Krehel's tactile UI helpers, accessible components,
   concentric radii standards, and platform adaptations.
   ========================================================================== */
(function () {
  "use strict";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

  // Crisp SVG Icons (stroke="currentColor", stroke-width="1.8", optical compensation)
  const ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chart: '<path d="M5 19V9M10 19V5M15 19v-7M20 19v-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    file: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
    download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    sparkles: '<path d="M12 3l1.9 4.1L18 9l-4.1 1.9L12 15l-1.9-4.1L6 9l4.1-1.9L12 3z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  };

  function icon(name) {
    return `<svg class="sk-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.file}</svg>`;
  }

  const status = () => `
    <div class="sk-status" aria-hidden="true">
      <span class="sk-tabnum sk-status-time">09:41</span>
      <div class="sk-status-icons">
        <span class="sk-signal"></span>
        <span class="sk-wifi"></span>
        <span class="sk-battery"><i></i></span>
      </div>
    </div>
  `;

  // Top Bar with Pitang logo + Title + Action icons (Desktop breadcrumbs when on Web)
  function bar(o = {}) {
    const left = o.back
      ? `<button class="sk-ic sk-press" data-back aria-label="Voltar">${icon("back")}</button>`
      : `<span class="sk-logo-wrap" aria-label="Pitang Labs">${pitangMiniLogo()}</span>`;
    const mid = o.title ? `<span class="sk-title-bar">${esc(o.title)}</span>` : "";
    const right = (o.icons || ["search", "user"])
      .map((n) => `<button class="sk-ic sk-press" aria-label="${esc(n)}">${icon(n)}</button>`)
      .join("");
    return `${status()}<header class="sk-bar"${o.clear ? ' data-clear=""' : ""}>${left}${mid}<span class="sk-sp"></span>${right}</header>`;
  }

  // Mini vector logo for top bar
  function pitangMiniLogo() {
    return `<svg class="sk-logo-svg" width="80" height="22" viewBox="0 0 137 39" fill="none" aria-label="Pitang Labs"><g fill="#ED1C24"><path d="M48.301 12.156C44.794 4.773 38.774 0 32.961 0c-1.767 0-3.417.45-4.91 1.33-.157.01-.247.063-.315.09a5.59 5.59 0 0 1-2.262.454c-1.11 0-1.991-.278-2.171-.372A10.864 10.864 0 0 0 18.236.267C12.186.267 6.237 4.852 2.73 12.23c-4.685 9.885-3.192 21.2 3.345 25.233 1.56.973 3.327 1.468 5.206 1.468 2.445 0 5.022-.863 7.468-2.505.926-.627 3.416-2.091 6.424-2.091a9.02 9.02 0 0 1 3.849.86C31.963 37.629 36.693 39 39.84 39a9.6 9.6 0 0 0 5.112-1.446c3.236-1.994 5.34-5.768 5.93-10.635.588-4.75-.338-9.997-2.581-14.763ZM17.639 34.794c-2.104 1.42-4.298 2.174-6.357 2.174a7.817 7.817 0 0 1-4.186-1.179c-5.7-3.523-6.856-13.71-2.58-22.716C7.64 6.493 13.026 2.23 18.228 2.23c1.47 0 2.873.341 4.163 1.014.27.139.792.326 1.493.447v.07c-.247.129-7.921.992-10.138 10.392-1.834 7.676 3.35 14.552 8.938 18.484-2.374.507-4.208 1.611-5.045 2.156Zm22.178-8.412c-1.178 4.42-5.16 7.849-7.783 7.849-.453 0-.858-.102-1.2-.3.904-1.984 1.947-6.993-5.656-13.332-7.014-5.885-1.538-16.318-1.29-16.817l.045.44c.521 4.825 1.947 6.864 10.952 12.039 4.253 2.441 6.02 6.035 4.932 10.12Z"/></g><text x="56" y="27" fill="#ED1C24" font-family="Inter,sans-serif" font-weight="700" font-size="20" letter-spacing="-0.02em">PITANG</text></svg>`;
  }

  // Adaptive platform navigation
  function tabs(activeFlowId) {
    const flows = (window.Proto && window.Proto.flows) || [];
    const items = flows.slice(0, 5).map((f) => [f.id, f.title.split(" ")[0] || "Etapa"]);
    return `
      <nav class="sk-tabs" aria-label="Navegação Principal do Sistema">
        ${items.map(([id, label]) => `
          <button class="sk-tab sk-press" data-tab-flow="${id}" ${id === activeFlowId ? 'aria-current="page"' : ""}>
            <i class="sk-tab-ic" aria-hidden="true">${icon("bolt")}</i>
            <span class="sk-tab-label">${esc(label)}</span>
          </button>
        `).join("")}
      </nav>
      <span class="sk-home" aria-hidden="true"></span>
      <button class="sk-fab sk-press" id="sk-main-fab" aria-label="Ação rápida / Nova demanda">${icon("plus")}</button>
    `;
  }

  // Safe event binding with delegation & cleanup
  function on(root, sel, type, fn) {
    const handler = (e) => {
      const t = e.target.closest(sel);
      if (t && root.contains(t)) fn(e, t);
    };
    root.addEventListener(type, handler);
    return () => root.removeEventListener(type, handler);
  }

  // Combine multiple cleanup functions
  const many = (...fns) => () => fns.forEach((f) => f && f());

  // Click handler to route cards with [data-go]
  const goCards = (root, ctx) => on(root, "[data-go]", "click", (e, el) => {
    const [f, v] = el.dataset.go.split(":");
    ctx.go(f, +v || 0);
  });

  // Jakub Krehel Card: Concentric radius, layered shadow
  function card(inner, o = {}) {
    return `<div class="sk-card${o.press ? ' sk-press' : ''}"${o.go ? ` role="button" tabindex="0" data-go="${o.go}"` : ''}>${inner}</div>`;
  }

  // Accessible Toast with role="status" and automatic dismissal
  function toast(root, msg) {
    let t = root.querySelector(".sk-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "sk-toast";
      t.setAttribute("role", "status");
      root.appendChild(t);
    }
    t.innerHTML = `<span class="sk-toast-icon">✓</span> <span>${esc(msg)}</span>`;
    t.removeAttribute("data-on");
    requestAnimationFrame(() => t.setAttribute("data-on", ""));
    clearTimeout(t._h);
    t._h = setTimeout(() => t.removeAttribute("data-on"), 2600);
  }

  // Accessible Modal Sheet / Dialog with overscroll containment
  function sheet(root, html, o = {}) {
    const scrim = document.createElement("div");
    scrim.className = "sk-scrim";
    const el = document.createElement("section");
    el.className = "sk-sheet";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", o.label || "Detalhes da Ação");
    el.innerHTML = `
      <span class="sk-grab" aria-hidden="true"></span>
      <button class="sk-sheet-close" data-close aria-label="Fechar janela">&times;</button>
      ${html}
    `;
    root.append(scrim, el);

    const close = () => {
      el.removeAttribute("data-open");
      scrim.removeAttribute("data-open");
      setTimeout(() => {
        el.remove();
        scrim.remove();
      }, 420);
    };

    scrim.addEventListener("click", close);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    });
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) close();
    });

    requestAnimationFrame(() => {
      scrim.setAttribute("data-open", "");
      el.setAttribute("data-open", "");
      const firstBtn = el.querySelector("button:not([data-close])");
      if (firstBtn) firstBtn.focus({ preventScroll: true });
    });

    return { close, el };
  }

  window.Kit = {
    esc,
    icon,
    status,
    bar,
    tabs,
    card,
    toast,
    sheet,
    on,
    many,
    goCards
  };
})();
