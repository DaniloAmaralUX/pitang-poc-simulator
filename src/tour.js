/* ==========================================================================
   FIRST-VISIT TOUR: Pitang Labs Design Engineering
   ========================================================================== */
(function () {
  const KEY = "protokit:toured";
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set() { try { localStorage.setItem(KEY, "1"); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const names = (id) => ((window.Proto && window.Proto.registry[id]) || []).map((v) => v.name);
  const fine = () => { try { return matchMedia("(pointer: fine)").matches && innerWidth > 760; } catch { return true; } };
  const list = (arr) => arr.length < 2 ? (arr[0] || "") : arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1];

  const steps = [
    {
      target: () => document.querySelector(".flows"), place: "right",
      title: "Navegue entre os fluxos",
      body: () => `${(window.Proto && window.Proto.flows.length) || 6} seções mapeadas da experiência, da página inicial à comunidade. Selecione um fluxo para visualizá-lo no dispositivo.${fine() ? " As teclas <kbd>↑</kbd> e <kbd>↓</kbd> também funcionam." : ""}`,
    },
    {
      target: () => document.querySelector(".proto-picker"), place: "top",
      title: "Cada fluxo possui direções de design",
      body: () => `Clique na barra inferior para alternar entre as direções exploradas. Na Home: ${esc(list(names("home")))}.${fine() ? " Ou use as teclas numéricas <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>." : ""}`,
    },
    {
      target: () => document.querySelector(".notes"), place: "left",
      title: "Racional técnico e decisões de produto",
      body: () => `Para cada direção: a tese de exploração, personas atendidas, problemas resolvidos, o que testar na tela, princípios de movimento e tradeoffs. Clique em uma persona para inspecionar seus objetivos.`,
    },
  ];

  let root, hole, card, i = 0, open = false, lastFocus = null;

  function build() {
    root = document.createElement("div");
    root.className = "tour";
    root.innerHTML = `<div class="tour-hole" aria-hidden="true"></div>
      <section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-t" aria-describedby="tour-b">
        <p class="tour-k"></p><h2 class="tour-t" id="tour-t"></h2><p class="tour-b" id="tour-b"></p>
        <div class="tour-f"><span class="tour-dots" aria-hidden="true">${steps.map(() => "<i></i>").join("")}</span>
          <button type="button" class="tour-skip">Pular</button>
          <button type="button" class="tour-back">Voltar</button>
          <button type="button" class="tour-next">Próximo</button></div>
      </section>`;
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
    const st = steps[i], t = st.target();
    const W = innerWidth, H = innerHeight, pad = 8, gap = 18, m = 12;
    const narrow = W <= 760;
    let r = t && t.getBoundingClientRect();
    const visible = r && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H;
    if (visible) {
      const top = Math.max(m, r.top - pad), left = Math.max(m, r.left - pad);
      const bottom = Math.min(H - m, r.bottom + pad), right = Math.min(W - m, r.right + pad);
      hole.style.transform = `translate(${left}px, ${top}px)`;
      hole.style.width = right - left + "px"; hole.style.height = bottom - top + "px";
      hole.removeAttribute("data-off");
    } else hole.setAttribute("data-off", "");
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x, y, side = st.place;
    if (!visible || narrow) {
      const low = visible && (r.top + r.height / 2) > H / 2;
      x = (W - cw) / 2; y = low ? 20 : H - ch - 20; side = "none";
    }
    else if (side === "right") { x = r.right + pad + gap; y = r.top + 8; }
    else if (side === "left") { x = r.left - pad - gap - cw; y = r.top + 8; }
    else { x = r.left + r.width / 2 - cw / 2; y = r.top - pad - gap - ch; }
    if (side === "right" && x + cw > W - m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    if (side === "left" && x < m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    x = Math.min(W - cw - m, Math.max(m, x)); y = Math.min(H - ch - m, Math.max(m, y));
    card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    card.dataset.side = side;
  }

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    const st = steps[i];
    card.querySelector(".tour-k").textContent = `${i + 1} de ${steps.length}`;
    card.querySelector(".tour-t").textContent = st.title;
    card.querySelector(".tour-b").innerHTML = st.body();
    card.querySelector(".tour-back").hidden = i === 0;
    card.querySelector(".tour-next").textContent = i === steps.length - 1 ? "Entendido" : "Próximo";
    card.querySelectorAll(".tour-dots i").forEach((d, j) => d.toggleAttribute("data-on", j === i));
    card.removeAttribute("data-in");
    place();
    requestAnimationFrame(() => card.setAttribute("data-in", ""));
    card.querySelector(".tour-next").focus({ preventScroll: true });
  }

  function start() {
    if (!root) build();
    lastFocus = document.activeElement;
    open = true;
    root.setAttribute("data-open", "");
    window.addEventListener("resize", place);
    go(0);
  }

  function finish() {
    if (!open) return;
    open = false;
    root.removeAttribute("data-open");
    window.removeEventListener("resize", place);
    store.set();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".tour-again") || document.getElementById("btn-tour");
    if (btn) btn.addEventListener("click", () => { start(); });
    const p = new URLSearchParams(location.search);
    if (p.get("tour") === "1" || (!store.get() && !navigator.webdriver && p.get("notour") !== "1")) {
      setTimeout(start, 500);
    }
  });
})();
