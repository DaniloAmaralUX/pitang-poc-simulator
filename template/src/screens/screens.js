/* ==========================================================================
   SCREENS: six flows × three directions, all skeleton. Register each flow with
   Proto.versions("<flowId>", [ { name, axis, personas, fixes, tryThis, motion, tradeoff, render } ])
   ========================================================================== */
(function () {
  const K = window.Kit;
  const { media, lines, tag, icon, esc } = K;

  // assemble a phone screen: header bar, scrolling body, optional dock, tab bar
  function frame(root, o) {
    root.innerHTML = `${o.bar || K.bar()}<div class="sk-scroll"${o.full ? " data-full" : ""}>${o.body}</div>${o.dock || ""}${o.tabs === false ? `<span class="sk-home" aria-hidden="true"></span>` : K.tabs(o.tabs || "home")}`;
    root.querySelectorAll(".sk-scroll > *").forEach((el, i) => { el.classList.add("sk-in"); el.style.setProperty("--i", Math.min(i, 6)); });
  }
  const back = (root, ctx, to = ["home", 0]) => K.on(root, "[data-back]", "click", () => ctx.go(to[0], to[1]));
  const many = (...fns) => () => fns.forEach((f) => f && f());
  // single-select groups: [data-group] containers whose [data-opt] children toggle aria-pressed
  const select = (root) => K.on(root, "[data-opt]", "click", (e, b) => {
    b.closest("[data-group]").querySelectorAll("[data-opt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  const card = (inner, o = {}) => `<div class="sk-card${o.press ? " sk-press" : ""}"${o.go ? ` role="button" tabindex="0" data-go="${o.go}"` : ""}>${inner}</div>`;
  const goCards = (root, ctx) => K.on(root, "[data-go]", "click", (e, el) => { const [f, v] = el.dataset.go.split(":"); ctx.go(f, +v || 0); });
  const sec = (label, link) => `<div class="sk-sec">${tag(label)}${link ? `<span class="sk-l" style="width:64px"></span>` : ""}</div>`;

  /* ------------------------------------------------------------------ 01 HOME */
  Proto.versions("home", [
    {
      name: "Showroom",
      axis: "Lead with the product: one full-bleed hero film, then the range as a swipeable rail. The bike does the talking before any copy does.",
      personas: ["racer", "weekend"],
      fixes: ["Today the home page opens on a promo banner, not a bike", "The range is buried three taps deep"],
      tryThis: ["Swipe the range rail", "Tap a bike card to open its page"],
      motion: "Rail settles with scroll-snap. Content rises 6px and fades in over 260ms, once per visit.",
      tradeoff: "Heavy hero media costs load time on a phone signal.",
      render(root, ctx) {
        frame(root, {
          bar: K.bar({ clear: true }),
          full: true,
          body: `${media({ ratio: "4/5", bleed: true, tag: "Hero film · 4:5", glyph: "play" })}
            <div class="sk-pad" style="margin-top:-56px;position:relative;z-index:2">${card(`${lines([70, 90, 40], { title: true, xl: true })}<button class="sk-btn">Primary action</button>`)}</div>
            ${sec("Range rail", true)}
            <div class="sk-rail">${[0, 1, 2, 3].map(() => `<div style="width:220px">${card(`${media({ ratio: "4/3", glyph: "image" })}${lines([80, 50], { title: true })}`, { press: true, go: "bike:0" })}</div>`).join("")}</div>
            ${sec("Why choose us")}
            <div class="sk-pad sk-stack">${[0, 1, 2].map(() => `<div class="sk-row"><span class="sk-av"></span>${lines([60, 85])}</div>`).join("")}</div>`,
        });
        return many(goCards(root, ctx));
      },
    },
    {
      name: "Ride feed",
      axis: "Lead with riding, not shopping: a feed of rides, routes and events, with products woven in only where they belong.",
      personas: ["weekend", "explorer"],
      fixes: ["Nothing today gives a reason to open the app between purchases", "Community lives on other platforms"],
      tryThis: ["Switch the filter chips", "Tap the product card in the feed"],
      motion: "Chips swap state in 150ms. No motion on scroll: a feed is read, not watched.",
      tradeoff: "Needs a steady supply of rides and stories, or it feels empty.",
      render(root, ctx) {
        frame(root, {
          body: `<div style="padding-top:14px" data-group><div class="sk-chips">${["All", "Rides", "Routes", "Events", "Kit"].map((c, i) => `<button class="sk-chip" data-opt aria-pressed="${i === 0}">${c}</button>`).join("")}</div></div>
            <div class="sk-pad sk-stack" style="margin-top:14px">
              ${card(`<div class="sk-row"><span class="sk-av"></span>${lines([45, 30])}</div>${media({ ratio: "4/3", tag: "Ride photo", glyph: "image" })}${lines([90, 70])}`)}
              ${card(`${tag("Product card")}<div class="sk-row">${media({ h: 84, w: 110, glyph: "image" })}${lines([80, 50, 35], { title: true })}</div>`, { press: true, go: "bike:0" })}
              ${card(`${tag("Event")}${media({ ratio: "16/9", glyph: "map" })}${lines([75, 50], { title: true })}<button class="sk-btn" data-ghost>Secondary action</button>`)}
            </div>`,
        });
        return many(select(root), goCards(root, ctx));
      },
    },
    {
      name: "Bike finder",
      axis: "Lead with a question: three taps narrow the range to the two bikes that suit how you ride.",
      personas: ["first", "weekend"],
      fixes: ["First-time buyers don't know where to start", "Range names mean nothing to newcomers"],
      tryThis: ["Pick an answer, then tap Next", "See the two matches"],
      motion: "Questions cross-fade in 200ms; the progress dot stretches to show where you are.",
      tradeoff: "One more step before seeing bikes, which some experts will skip.",
      render(root, ctx) {
        let step = 0;
        const draw = () => {
          const body = step < 3
            ? `<div class="sk-pad sk-stack" style="padding-top:24px"><div class="sk-dots">${[0, 1, 2].map((i) => `<i ${i === step ? "data-on" : ""}></i>`).join("")}</div>
                ${tag(`Question ${step + 1} of 3`)}${lines([85, 60], { title: true, xl: true })}
                <div class="sk-stack" data-group>${[0, 1, 2].map((i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}"><span class="sk-radio"></span>${lines([60 + i * 8, 40])}</button>`).join("")}</div></div>`
            : `<div class="sk-pad sk-stack" style="padding-top:24px">${tag("Your two matches")}${lines([70], { title: true, xl: true })}
                ${[0, 1].map(() => card(`${media({ ratio: "16/10", glyph: "image" })}${lines([60, 40], { title: true })}`, { press: true, go: "bike:0" })).join("")}
                <button class="sk-btn" data-ghost data-restart>Start again</button></div>`;
          frame(root, { body, dock: step < 3 ? `<div class="sk-dock" style="bottom:96px;background:transparent;box-shadow:none;padding-bottom:0"><button class="sk-btn" data-next>${step < 2 ? "Next" : "Show my matches"}</button></div>` : "" });
        };
        draw();
        return many(select(root), goCards(root, ctx),
          K.on(root, "[data-next]", "click", () => { step++; draw(); }),
          K.on(root, "[data-restart]", "click", () => { step = 0; draw(); }));
      },
    },
  ]);

  /* ------------------------------------------------------------------ 02 BIKE PAGE */
  const priceDock = (label = "Primary action") => `<div class="sk-dock"><div style="flex:1">${lines([60, 40], { title: true })}</div><button class="sk-btn" style="width:auto;padding:0 22px" data-cta>${label}</button></div>`;
  Proto.versions("bike", [
    {
      name: "Gallery first",
      axis: "The bike page as a gallery: swipe big images first, then colour, then one clear action docked at the bottom.",
      personas: ["weekend", "racer"],
      fixes: ["Images are small and the price sits below the fold", "Colour choice is hidden in a dropdown"],
      tryThis: ["Swipe the gallery", "Pick a colour swatch", "Tap the docked action"],
      motion: "Gallery dots stretch to follow the image. Swatches ring in 160ms.",
      tradeoff: "Spec detail moves further down the page.",
      render(root, ctx) {
        frame(root, {
          bar: K.bar({ back: true, icons: ["heart", "share"] }), tabs: false,
          body: `<div class="sk-rail" data-gal style="padding:16px 16px 0">${[0, 1, 2, 3].map((i) => `<div style="width:358px">${media({ ratio: "1/1", tag: `Gallery ${i + 1}/4`, glyph: "image" })}</div>`).join("")}</div>
            <div class="sk-dots" style="margin-top:12px" data-galdots>${[0, 1, 2, 3].map((i) => `<i ${i === 0 ? "data-on" : ""}></i>`).join("")}</div>
            <div class="sk-pad sk-stack" style="margin-top:18px">${lines([75, 45], { title: true, xl: true })}${tag("Colour")}
              <div class="sk-row" data-group>${[0, 1, 2, 3].map((i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}" style="width:56px;height:56px;min-height:0;padding:0;justify-content:center;border-radius:50%" aria-label="Colour ${i + 1}"><span class="sk-av" style="width:36px;height:36px;opacity:${1 - i * 0.2}"></span></button>`).join("")}</div>
              ${lines([95, 90, 70])}</div>`,
          dock: priceDock(),
        });
        const rail = root.querySelector("[data-gal]"), dots = [...root.querySelectorAll("[data-galdots] i")];
        const onScroll = () => { const i = Math.round(rail.scrollLeft / 370); dots.forEach((d, j) => d.toggleAttribute("data-on", j === i)); };
        rail.addEventListener("scroll", onScroll, { passive: true });
        return many(back(root, ctx), select(root), K.on(root, "[data-cta]", "click", () => ctx.go("build", 0)));
      },
    },
    {
      name: "Spec sheet",
      axis: "The bike page for people who compare: tabs for overview, geometry and spec, with a compare toggle that keeps your shortlist.",
      personas: ["racer"],
      fixes: ["Geometry lives in a PDF", "No way to compare two frames side by side"],
      tryThis: ["Switch between the tabs", "Toggle Compare"],
      motion: "Tab content swaps without movement; only the segmented thumb slides (180ms).",
      tradeoff: "Dense, and less inviting for a first-time buyer.",
      render(root, ctx) {
        const rows = (n) => `<div class="sk-card" style="gap:0;padding:4px 12px">${Array.from({ length: n }, (_, i) => `<div class="sk-row" style="justify-content:space-between;padding:12px 0;${i ? "border-top:1px solid var(--sk-line)" : ""}"><span class="sk-l" style="width:38%"></span><span class="sk-l" style="width:22%"></span></div>`).join("")}</div>`;
        const panes = [rows(5), `${media({ ratio: "16/9", tag: "Geometry diagram", glyph: "chart" })}${rows(4)}`, rows(7)];
        frame(root, {
          bar: K.bar({ back: true, title: "", icons: ["share"] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:16px"><div class="sk-row">${media({ h: 90, w: 120, glyph: "image" })}${lines([80, 50, 30], { title: true })}</div>
            <div class="sk-seg" data-group>${["Overview", "Geometry", "Spec"].map((t, i) => `<button data-opt data-pane="${i}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
            <div data-pane-body>${panes[0]}</div>
            <button class="sk-opt" data-compare aria-pressed="false"><span class="sk-radio"></span><span style="font-weight:600">Compare</span></button></div>`,
          dock: priceDock(),
        });
        return many(back(root, ctx), select(root),
          K.on(root, "[data-pane]", "click", (e, b) => { root.querySelector("[data-pane-body]").innerHTML = panes[+b.dataset.pane]; }),
          K.on(root, "[data-compare]", "click", (e, b) => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); ctx.toast(on ? "Added to compare" : "Removed from compare"); }),
          K.on(root, "[data-cta]", "click", () => ctx.go("build", 0)));
      },
    },
    {
      name: "Ride story",
      axis: "The bike page as a story: scroll through where it rides, why it's built that way, and who it's for, before the price.",
      personas: ["explorer", "first"],
      fixes: ["Product pages say what a bike is, never what it's for", "No sense of the ride before you buy"],
      tryThis: ["Scroll the full story", "Notice the action only docks after the first chapter"],
      motion: "The dock slides up once you pass chapter one (220ms) and stays put.",
      tradeoff: "Longer page; people who already know what they want scroll past it.",
      render(root, ctx) {
        const chapter = (n) => `${media({ ratio: "4/5", bleed: true, tag: `Chapter ${n}`, glyph: n === 1 ? "play" : "image" })}<div class="sk-pad sk-stack" style="padding:20px 16px 28px">${lines([60, 95, 90, 55], { title: true })}</div>`;
        frame(root, {
          bar: K.bar({ back: true, clear: true, icons: ["heart"] }), full: true, tabs: false,
          body: `${chapter(1)}<div data-ch2></div>${chapter(2)}<div class="sk-pad">${card(`${tag("Built for")}${[0, 1, 2].map(() => `<div class="sk-row"><span class="sk-av"></span>${lines([70])}</div>`).join("")}`)}</div>${chapter(3)}`,
          dock: `<div data-dockwrap style="transform:translateY(110%);transition:transform 220ms var(--ease-out);position:absolute;inset:auto 0 0 0;z-index:24">${priceDock()}</div>`,
        });
        const sc = root.querySelector(".sk-scroll"), dw = root.querySelector("[data-dockwrap]");
        const onS = () => { if (sc.scrollTop > 380) dw.style.transform = "none"; };
        sc.addEventListener("scroll", onS, { passive: true });
        return many(back(root, ctx), K.on(root, "[data-cta]", "click", () => ctx.go("build", 0)));
      },
    },
  ]);

  /* ------------------------------------------------------------------ 03 BUILD */
  Proto.versions("build", [
    {
      name: "Step by step",
      axis: "Configure in four short steps, one decision per screen, with a running total that never hides.",
      personas: ["first", "weekend"],
      fixes: ["Today every option sits on one long page", "The total only appears at checkout"],
      tryThis: ["Pick an option and tap Next", "Watch the step dots and the total bar"],
      motion: "Steps swap with a 200ms cross-fade; the selected option's dot pops in 180ms.",
      tradeoff: "Four screens where an expert might want one.",
      render(root, ctx) {
        let step = 0; const names = ["Frame", "Wheels", "Groupset", "Fit"];
        const draw = () => {
          frame(root, {
            bar: K.bar({ back: true, title: `Step ${step + 1} of 4`, icons: ["close"] }), tabs: false,
            body: `<div class="sk-pad sk-stack" style="padding-top:18px"><div class="sk-dots">${names.map((_, i) => `<i ${i === step ? "data-on" : ""}></i>`).join("")}</div>
              ${tag(names[step])}${lines([70, 45], { title: true, xl: true })}
              <div class="sk-stack" data-group>${[0, 1, 2].map((i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}"><span class="sk-radio"></span><div style="flex:1">${lines([60 - i * 6, 40])}</div><span class="sk-l" style="width:44px"></span></button>`).join("")}</div></div>`,
            dock: `<div class="sk-dock"><div style="flex:1">${tag("Running total")}<div style="margin-top:6px">${lines([50])}</div></div><button class="sk-btn" style="width:auto;padding:0 22px" data-next>${step < 3 ? "Next" : "Review"}</button></div>`,
          });
        };
        draw();
        return many(back(root, ctx, ["bike", 0]), select(root), K.on(root, "[data-next]", "click", () => { if (step < 3) { step++; draw(); } else ctx.go("checkout", 0); }));
      },
    },
    {
      name: "Live view",
      axis: "Configure on the bike itself: a big live view, with options in a sheet you can pull up or put away.",
      personas: ["racer", "weekend"],
      fixes: ["Options change but the picture doesn't", "No way to see a colour on the actual frame"],
      tryThis: ["Tap Options to open the sheet", "Pick a group, then close the sheet"],
      motion: "The options sheet rises on a drawer curve (420ms) over a dimmed view.",
      tradeoff: "A live 3D view is expensive to build and heavy to load.",
      render(root, ctx) {
        frame(root, {
          bar: K.bar({ back: true, title: "", icons: ["share"] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:16px">${media({ ratio: "1/1", tag: "Live 360° view", glyph: "cube" })}<p style="margin:0;text-align:center;font-size:12px;color:var(--sk-ink-3)">Drag to rotate</p>
            <div class="sk-chips" style="padding:0">${["Frame", "Colour", "Wheels", "Bars"].map((c, i) => `<span class="sk-chip">${c}</span>`).join("")}</div></div>`,
          dock: `<div class="sk-dock"><button class="sk-btn" data-ghost data-sheet>Options</button><button class="sk-btn" data-cta>Primary action</button></div>`,
        });
        return many(back(root, ctx, ["bike", 0]),
          K.on(root, "[data-sheet]", "click", () => {
            const s = K.sheet(root, `${tag("Options")}<div class="sk-seg" data-group>${["Frame", "Colour", "Wheels"].map((t, i) => `<button data-opt aria-pressed="${i === 0}">${t}</button>`).join("")}</div><div class="sk-stack" data-group>${[0, 1, 2].map((i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}"><span class="sk-radio"></span>${lines([55, 35])}</button>`).join("")}</div><button class="sk-btn" data-close>Done</button>`, { label: "Options" });
            K.on(s.el, "[data-opt]", "click", (e, b) => b.closest("[data-group]").querySelectorAll("[data-opt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))));
          }),
          K.on(root, "[data-cta]", "click", () => ctx.go("checkout", 0)));
      },
    },
    {
      name: "Presets",
      axis: "Start from three good builds and tweak, instead of starting from a blank frame.",
      personas: ["first", "explorer"],
      fixes: ["Too many choices up front", "No guidance on which parts go together"],
      tryThis: ["Choose a preset", "Tap Customise to tweak it"],
      motion: "The chosen preset rings in 160ms; nothing else moves.",
      tradeoff: "Presets steer people, so they need careful merchandising.",
      render(root, ctx) {
        frame(root, {
          bar: K.bar({ back: true, title: "", icons: ["close"] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${tag("Pick a starting build")}${lines([75], { title: true, xl: true })}
            <div class="sk-stack" data-group>${["Preset A", "Preset B", "Preset C"].map((t, i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}" style="align-items:flex-start"><span class="sk-radio" style="margin-top:4px"></span><div style="flex:1" class="sk-stack">${media({ ratio: "16/7", tag: t, glyph: "image" })}${lines([60, 85])}</div></button>`).join("")}</div>
            <button class="sk-btn" data-ghost data-custom>Customise</button></div>`,
          dock: priceDock("Choose this build"),
        });
        return many(back(root, ctx, ["bike", 0]), select(root),
          K.on(root, "[data-custom]", "click", () => ctx.go("build", 0)),
          K.on(root, "[data-cta]", "click", () => ctx.go("checkout", 0)));
      },
    },
  ]);

  /* ------------------------------------------------------------------ 04 CHECKOUT */
  Proto.versions("checkout", [
    {
      name: "One page",
      axis: "Bag, delivery and payment on one calm page, with the full total stated once, at full weight, above the button.",
      personas: ["racer", "weekend"],
      fixes: ["Checkout spreads over five pages", "Delivery cost appears at the last step"],
      tryThis: ["Pick a delivery option", "Place the order"],
      motion: "Selections ring in 160ms. The confirmation is the only celebration.",
      tradeoff: "A long page on small screens.",
      render(root, ctx) {
        const block = (t, body) => card(`${tag(t)}${body}`);
        frame(root, {
          bar: K.bar({ back: true, title: "Checkout", icons: [] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:16px">
            ${block("Bag", `<div class="sk-row">${media({ h: 64, w: 84, glyph: "image" })}${lines([70, 40])}</div>`)}
            ${block("Delivery", `<div class="sk-stack" data-group>${[0, 1].map((i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}"><span class="sk-radio"></span>${lines([55, 35])}</button>`).join("")}</div>`)}
            ${block("Payment", `<div class="sk-row"><span class="sk-av" style="border-radius:6px;width:44px;height:30px"></span>${lines([50])}</div>`)}
            ${block("Total", lines([90, 90, 60], { title: false }))}</div>`,
          dock: `<div class="sk-dock"><button class="sk-btn" data-place>Place order</button></div>`,
        });
        return many(back(root, ctx, ["build", 0]), select(root), K.on(root, "[data-place]", "click", () => ctx.toast("Order placed. This is a prototype, so nothing was charged.")));
      },
    },
    {
      name: "Fit check first",
      axis: "Before paying, check the size: two quick measurements give a size recommendation you can trust.",
      personas: ["first"],
      fixes: ["Wrong-size returns are expensive for everyone", "Size charts assume people know their inseam"],
      tryThis: ["Move both sliders", "Read the recommendation, then continue"],
      motion: "The recommendation fades in (200ms) once both answers are set.",
      tradeoff: "An extra step at the most sensitive moment of the funnel.",
      render(root, ctx) {
        const slider = (t) => `<div class="sk-stack" style="gap:8px">${tag(t)}<input type="range" min="0" max="100" value="50" aria-label="${t}" style="width:100%;accent-color:var(--sk-accent);height:32px"></div>`;
        frame(root, {
          bar: K.bar({ back: true, title: "Fit check", icons: [] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${lines([80, 55], { title: true, xl: true })}${card(`${slider("Measurement 1")}${slider("Measurement 2")}`)}
            <div data-rec style="opacity:.35;transition:opacity 200ms var(--ease-out)">${card(`${tag("Recommended size")}<div class="sk-row"><span class="sk-num">-</span>${lines([70, 45])}</div>`)}</div></div>`,
          dock: `<div class="sk-dock"><button class="sk-btn" data-next>Continue to payment</button></div>`,
        });
        const moved = new Set();
        const off = K.on(root, "input[type=range]", "input", (e, el) => { moved.add(el.getAttribute("aria-label")); if (moved.size === 2) root.querySelector("[data-rec]").style.opacity = 1; });
        return many(back(root, ctx, ["build", 0]), off, K.on(root, "[data-next]", "click", () => ctx.go("checkout", 0)));
      },
    },
    {
      name: "Pay in parts",
      axis: "Show every way to pay side by side, each with its real total, so spreading the cost never hides what it costs.",
      personas: ["first", "weekend"],
      fixes: ["Finance options appear as a small link", "Monthly price shown without the total"],
      tryThis: ["Pick a plan", "Open the full terms"],
      motion: "Plan cards ring in 160ms; the terms sheet rises on the drawer curve.",
      tradeoff: "Showing totals makes finance look less tempting. That's the point.",
      render(root, ctx) {
        frame(root, {
          bar: K.bar({ back: true, title: "How to pay", icons: [] }), tabs: false,
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${lines([70], { title: true, xl: true })}
            <div class="sk-stack" data-group>${["Pay now", "Plan A", "Plan B"].map((t, i) => `<button class="sk-opt" data-opt aria-pressed="${i === 0}" style="align-items:flex-start"><span class="sk-radio" style="margin-top:2px"></span><div style="flex:1" class="sk-stack">${tag(t)}${lines([50, 80])}</div><span class="sk-num" style="font-size:18px">-</span></button>`).join("")}</div>
            <button class="sk-btn" data-ghost data-terms>See the full terms</button></div>`,
          dock: `<div class="sk-dock"><button class="sk-btn" data-next>Continue</button></div>`,
        });
        return many(back(root, ctx, ["build", 0]), select(root),
          K.on(root, "[data-terms]", "click", () => K.sheet(root, `${tag("Full terms")}${lines([90, 95, 80, 92, 60])}<button class="sk-btn" data-close>Close</button>`, { label: "Full terms" })),
          K.on(root, "[data-next]", "click", () => ctx.toast("Next: payment details (not built in this template)")));
      },
    },
  ]);

  /* ------------------------------------------------------------------ 05 GARAGE */
  Proto.versions("garage", [
    {
      name: "Bike passport",
      axis: "After purchase, your bike gets a home: serial, warranty and the three things owners actually need, one tap away.",
      personas: ["weekend", "racer"],
      fixes: ["Warranty lives in an email nobody can find", "Nothing brings owners back after delivery"],
      tryThis: ["Tap an action tile"],
      motion: "Tiles press to 0.97. Nothing animates on a page you check in a hurry.",
      tradeoff: "Needs serials and warranty data connected to accounts.",
      render(root, ctx) {
        frame(root, {
          tabs: "garage",
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${card(`${media({ ratio: "16/9", tag: "Your bike", glyph: "image" })}${lines([60, 40], { title: true })}<div class="sk-row">${tag("Warranty")}${tag("Serial")}</div>`)}
            ${tag("Quick actions")}<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">${["Service", "Insure", "Transfer"].map((t) => `<button class="sk-card sk-press" data-act="${t}" style="align-items:center;padding:16px 8px"><span class="sk-av"></span><span style="font-weight:600;font-size:calc(var(--fs)*12.5px)">${t}</span></button>`).join("")}</div>
            ${card(`${tag("Documents")}${lines([80, 65, 70])}`)}</div>`,
        });
        return K.on(root, "[data-act]", "click", (e, b) => b.dataset.act === "Service" ? ctx.go("garage", 1) : ctx.toast(`${b.dataset.act}: not built in this template`));
      },
    },
    {
      name: "Service log",
      axis: "A timeline of everything done to the bike, with the next service suggested at the top.",
      personas: ["weekend", "explorer"],
      fixes: ["Owners forget when they last serviced", "Resale buyers can't see a bike's history"],
      tryThis: ["Book the suggested service"],
      motion: "None beyond the press. A log should feel steady.",
      tradeoff: "Only as good as the data workshops enter.",
      render(root, ctx) {
        frame(root, {
          tabs: "garage",
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${card(`${tag("Next service")}${lines([70, 50], { title: true })}<button class="sk-btn" data-book>Book it</button>`)}
            ${tag("History")}<div class="sk-tl">${[0, 1, 2, 3].map((i) => `<div ${i === 0 ? "data-on" : ""}>${card(lines([55, 80]))}</div>`).join("")}</div></div>`,
        });
        return K.on(root, "[data-book]", "click", () => ctx.toast("Service request sent (prototype)"));
      },
    },
    {
      name: "Ride stats",
      axis: "Turn ownership into progress: distance, time and milestones, without pretending to be a training app.",
      personas: ["racer", "explorer"],
      fixes: ["Owners track rides elsewhere and never return", "No reason to open the app between rides"],
      tryThis: ["Switch the period"],
      motion: "Bars grow from the baseline over 300ms when the period changes.",
      tradeoff: "Competes with dedicated ride trackers, so it should stay light.",
      render(root, ctx) {
        const bars = () => `<div style="display:flex;align-items:flex-end;gap:8px;height:140px" data-bars>${Array.from({ length: 7 }, () => `<span style="flex:1;border-radius:6px 6px 0 0;background:var(--sk-block-2);height:${20 + Math.round(Math.random() * 80)}%;transform-origin:bottom;transition:height 300ms var(--ease-out)"></span>`).join("")}</div>`;
        frame(root, {
          tabs: "garage",
          body: `<div class="sk-pad sk-stack" style="padding-top:18px"><div class="sk-seg" data-group>${["Week", "Month", "Year"].map((t, i) => `<button data-opt data-period aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${["Distance", "Time", "Climb", "Rides"].map((t) => card(`${tag(t)}<span class="sk-num">-</span>`)).join("")}</div>
            ${card(`${tag("Chart")}${bars()}`)}</div>`,
        });
        return many(select(root), K.on(root, "[data-period]", "click", () => root.querySelectorAll("[data-bars] span").forEach((s) => { s.style.height = 20 + Math.round(Math.random() * 80) + "%"; })));
      },
    },
  ]);

  /* ------------------------------------------------------------------ 06 RIDES */
  Proto.versions("rides", [
    {
      name: "Group rides",
      axis: "Find a ride near you this week and join it in one tap; the brand hosts the community instead of renting it from social.",
      personas: ["weekend", "first"],
      fixes: ["Events are listed as news posts", "No way to say you're coming"],
      tryThis: ["Join a ride, then leave it"],
      motion: "The Join button swaps label and fill in 150ms; a toast confirms.",
      tradeoff: "Needs local hosts, or the map is empty outside big cities.",
      render(root, ctx) {
        frame(root, {
          tabs: "rides",
          body: `<div class="sk-pad sk-stack" style="padding-top:16px">${media({ ratio: "16/10", tag: "Map", glyph: "map" })}
            ${[0, 1, 2].map(() => card(`<div class="sk-row"><div style="flex:1">${lines([65, 45], { title: true })}</div><button class="sk-chip" data-join aria-pressed="false">Join</button></div>`)).join("")}</div>`,
        });
        return K.on(root, "[data-join]", "click", (e, b) => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.textContent = on ? "Going" : "Join"; ctx.toast(on ? "You're on the list" : "You've left this ride"); });
      },
    },
    {
      name: "Challenges",
      axis: "Monthly challenges with a clear finish line, so riders have a reason to come back that isn't a sale.",
      personas: ["racer", "explorer"],
      fixes: ["Loyalty is a discount code", "Nothing celebrates riding itself"],
      tryThis: ["Accept a challenge"],
      motion: "The progress ring fills once on first view (600ms), then stays still.",
      tradeoff: "Easy to tip into gamification for its own sake.",
      render(root, ctx) {
        frame(root, {
          tabs: "rides",
          body: `<div class="sk-pad sk-stack" style="padding-top:18px">${card(`<div class="sk-row"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--sk-block)" stroke-width="10"/><circle cx="42" cy="42" r="34" fill="none" stroke="var(--sk-accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="213.6" transform="rotate(-90 42 42)" data-ring style="transition:stroke-dashoffset 600ms var(--ease-out)"/></svg>${lines([70, 50], { title: true })}</div>`)}
            ${tag("This month")}${[0, 1].map(() => card(`${media({ ratio: "16/7", glyph: "image" })}${lines([60, 80], { title: true })}<button class="sk-btn" data-ghost data-accept>Accept challenge</button>`)).join("")}</div>`,
        });
        requestAnimationFrame(() => requestAnimationFrame(() => { const r = root.querySelector("[data-ring]"); if (r) r.style.strokeDashoffset = ctx.reduced ? "75" : "75"; }));
        return K.on(root, "[data-accept]", "click", (e, b) => { b.textContent = "Accepted"; b.removeAttribute("data-ghost"); ctx.toast("Challenge accepted"); });
      },
    },
    {
      name: "Stories",
      axis: "Short vertical stories from riders and the workshop, tapped through like a deck, then a clear end.",
      personas: ["explorer", "weekend"],
      fixes: ["Brand video sits on another platform", "No sense of the people behind the bikes"],
      tryThis: ["Tap the right side to move on", "Reach the end card"],
      motion: "Progress segments fill as you tap; the end card fades in (200ms).",
      tradeoff: "Video takes a team to keep fresh.",
      render(root, ctx) {
        let i = 0; const N = 4;
        const draw = () => {
          root.innerHTML = `${K.status()}<div style="position:absolute;inset:0;background:#111">
            ${i < N ? `<div class="sk-media" data-bleed style="position:absolute;inset:0;border-radius:0" role="img" aria-label="Story ${i + 1}"><span class="sk-tag" style="top:84px">Story ${i + 1} of ${N}</span><span class="sk-glyph">${icon("play")}</span></div>` :
            `<div style="position:absolute;inset:0;display:grid;place-items:center;padding:24px"><div class="sk-card" style="width:100%">${tag("End card")}${lines([70, 50], { title: true, xl: true })}<button class="sk-btn" data-again>Watch again</button></div></div>`}
            <div class="sk-progress" style="position:absolute;top:56px;left:12px;right:12px;z-index:3">${Array.from({ length: N }, (_, k) => `<i ${k < i || (k === i && i < N) ? "data-done" : ""}></i>`).join("")}</div>
            ${i < N ? `<button aria-label="Previous" data-prev style="position:absolute;left:0;top:0;bottom:0;width:33%;z-index:2"></button><button aria-label="Next" data-nx style="position:absolute;right:0;top:0;bottom:0;width:67%;z-index:2"></button>
            <div style="position:absolute;left:16px;right:16px;bottom:120px;z-index:1" class="sk-stack">${lines([70, 50], { title: true })}</div>` : ""}
          </div>${K.tabs("rides")}`;
          root.querySelector(".sk-status").style.color = "#fff";
        };
        draw();
        return many(K.on(root, "[data-nx]", "click", () => { i = Math.min(N, i + 1); draw(); }), K.on(root, "[data-prev]", "click", () => { i = Math.max(0, i - 1); draw(); }), K.on(root, "[data-again]", "click", () => { i = 0; draw(); }));
      },
    },
  ]);
})();
