/* ==========================================================================
   PITANG LABS · ONBOARDING TOUR (JS)
   Introduces the POC Simulator: Categorized Flows, Device Prototype,
   Version Switcher, Business Rules Rationale, and Requirements Editor.
   ========================================================================== */
(function () {
  "use strict";

  const KEY = "pitang_poc:toured";
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set() { try { localStorage.setItem(KEY, "1"); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fine = () => { try { return matchMedia("(pointer: fine)").matches && innerWidth > 760; } catch { return true; } };

  const steps = [
    {
      target: () => document.querySelector(".btn-open-requirements"),
      place: "right",
      title: "1. Requisitos na IDE ou no Browser",
      body: () => `Clique aqui (ou pressione <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>) para colar ou editar seus requisitos de negócio em qualquer formato (Markdown, Histórias de Usuário, Gherkin ou texto livre). O texto livre é preservado como briefing; títulos de fluxos permitem explorar modelos de interface.`,
    },
    {
      target: () => document.querySelector(".flows-container"),
      place: "right",
      title: "2. Fluxos Categorizados",
      body: () => `Os fluxos são organizados por categorias lógicas (Acesso, Registro, Operação, Acompanhamento e Governança). Filtre por categoria nos botões acima ou pesquise por regras de negócio.${fine() ? " As teclas <kbd>↑</kbd> <kbd>↓</kbd> navegam entre fluxos." : ""}`,
    },
    {
      target: () => document.querySelector(".proto-picker"),
      place: "top",
      title: "3. Três Direções de Design por Fluxo",
      body: () => `Quando disponíveis, compare as abordagens: <strong>Direta</strong>, <strong>Guiada (exemplo)</strong> e <strong>Analítica</strong>. Alterne com um clique ou pelas teclas <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>. Use também os seletores de dispositivo (iOS · Android · Web).`,
    },
    {
      target: () => document.querySelector(".notes"),
      place: "left",
      title: "4. Racional, Regras & Usabilidade Jakub",
      body: () => `Aqui você confere as requisitos mapeados para a tela, as personas atendidas, ações interativas testáveis no protótipo e o orientações para verificação com as diretrizes de design engineering de Jakub Krehel.`,
    },
  ];

  let root, hole, card, i = 0, open = false;

  function build() {
    root = document.createElement("div");
    root.className = "tour";
    root.innerHTML = `
      <div class="tour-hole" aria-hidden="true"></div>
      <section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-t" aria-describedby="tour-b">
        <p class="tour-k"></p>
        <h2 class="tour-t" id="tour-t"></h2>
        <p class="tour-b" id="tour-b"></p>
        <div class="tour-f">
          <span class="tour-dots" aria-hidden="true">${steps.map(() => "<i></i>").join("")}</span>
          <button type="button" class="tour-skip">Pular</button>
          <button type="button" class="tour-back">Voltar</button>
          <button type="button" class="tour-next">Próximo</button>
        </div>
      </section>
    `;
    document.body.appendChild(root);

    hole = root.querySelector(".tour-hole");
    card = root.querySelector(".tour-card");

    root.querySelector(".tour-skip").addEventListener("click", finish);
    root.querySelector(".tour-back").addEventListener("click", () => go(i - 1));
    root.querySelector(".tour-next").addEventListener("click", () => (i === steps.length - 1 ? finish() : go(i + 1)));

    card.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const fs = [...card.querySelectorAll("button")].filter((b) => !b.hidden);
      const a = fs[0], z = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }

  function place() {
    if (!open) return;
    const st = steps[i];
    const t = st.target();
    const W = innerWidth, H = innerHeight, pad = 8, gap = 16, m = 12;
    const narrow = W <= 760;
    let r = t && t.getBoundingClientRect();
    const visible = r && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H;

    if (visible) {
      const top = Math.max(m, r.top - pad), left = Math.max(m, r.left - pad);
      const bottom = Math.min(H - m, r.bottom + pad), right = Math.min(W - m, r.right + pad);
      hole.style.transform = `translate(${left}px, ${top}px)`;
      hole.style.width = `${right - left}px`;
      hole.style.height = `${bottom - top}px`;
      hole.removeAttribute("data-off");
    } else {
      hole.setAttribute("data-off", "");
    }

    const cw = card.offsetWidth || 320, ch = card.offsetHeight || 180;
    let x, y, side = st.place;

    if (!visible || narrow) {
      const low = visible && (r.top + r.height / 2) > H / 2;
      x = (W - cw) / 2;
      y = low ? 20 : H - ch - 20;
      side = "none";
    } else if (side === "right") {
      x = r.right + pad + gap;
      y = r.top + 8;
    } else if (side === "left") {
      x = r.left - pad - gap - cw;
      y = r.top + 8;
    } else {
      x = r.left + r.width / 2 - cw / 2;
      y = r.top - pad - gap - ch;
    }

    if (side === "right" && x + cw > W - m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    if (side === "left" && x < m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    x = Math.min(W - cw - m, Math.max(m, x));
    y = Math.min(H - ch - m, Math.max(m, y));

    card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    card.dataset.side = side;
  }

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    const st = steps[i];
    card.querySelector(".tour-k").textContent = `Passo ${i + 1} de ${steps.length}`;
    card.querySelector(".tour-t").textContent = st.title;
    card.querySelector(".tour-b").innerHTML = st.body();
    card.querySelector(".tour-back").hidden = i === 0;
    card.querySelector(".tour-next").textContent = i === steps.length - 1 ? "Começar a Usar" : "Próximo";

    card.querySelectorAll(".tour-dots i").forEach((dot, dotIdx) => {
      dot.toggleAttribute("data-on", dotIdx === i);
    });

    place();
    card.setAttribute("data-in", "");
  }

  function start() {
    if (!root) build();
    open = true;
    root.setAttribute("data-open", "");
    go(0);
    window.addEventListener("resize", place);
  }

  function finish() {
    open = false;
    if (root) root.removeAttribute("data-open");
    store.set();
    window.removeEventListener("resize", place);
  }

  // Bind "Show me around" button in rail
  function setupTourTrigger() {
    const btn = document.querySelector(".tour-again");
    if (btn) btn.addEventListener("click", start);

    const params = new URLSearchParams(location.search);
    if (params.get("tour") === "1" || (!store.get() && !navigator.webdriver)) {
      setTimeout(start, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupTourTrigger);
  } else {
    setupTourTrigger();
  }

  window.startTour = start;
})();
