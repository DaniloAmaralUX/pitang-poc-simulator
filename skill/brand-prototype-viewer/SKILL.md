---
name: brand-prototype-viewer
description: Build a shareable HTML prototype viewer for iOS, Android or web (flows rail, device mock-up, version switcher, rationale panel, onboarding tour) styled from a client's brand or Figma file.
---

# Brand prototype viewer

A single, self-contained HTML page that presents design directions for one client:

- **Left:** the flows (sections of the product).
- **Centre:** a device mock-up (iPhone, Android phone or browser window) running a clickable prototype of the selected direction.
- **Under the device:** a switcher between the three directions of that flow.
- **Right:** the rationale for the direction on screen.

A three-step tour introduces the layout on first visit. The output is a link anyone can open, with no install, no login and no Figma seat needed.

The viewer chrome stays neutral. **Everything inside the mock-up is the client's brand.** It is never a generic house style.

---

## 0. Before you start (mandatory)

### 0.1 Brand reference

Do not design or build anything until you have a brand reference. Ask for **one** of these:

1. **A Figma link** to the client's design system, product screens or brand file. This is preferred.
2. **Brand assets:** logo (SVG or PNG), colour values, typefaces (font files or names), and 2–5 screenshots of the client's current product.
3. **A live URL** for the client's product plus the logo, if neither of the above exists.

If the designer gives none of these, stop and ask for the Figma link or the assets in one short message. Do not invent a palette, pick "a nice font" or fall back to grey wireframes.

The one exception is when the designer explicitly asks for a skeleton or teaching version. In that case, use neutral wireframe blocks and a dashed "LOGO" placeholder, and say in the page that it is a skeleton.

### 0.2 Platform

Ask which platform the prototypes are for. Offer exactly these options:

| Option | Frame | Screen size (CSS px) | Use when |
|---|---|---|---|
| **iOS** | iPhone with Dynamic Island, 66px outer radius | 390 × 844 | Native iPhone app, or mobile web viewed on iPhone |
| **Android** | Pixel-style phone with punch-hole camera, 44px outer radius | 412 × 915 | Native Android app |
| **Web** | Browser window with traffic lights and address bar | 1280 × 780 (desktop) | Websites, web apps, dashboards |
| **All three** | The viewer gets a Device switch (iOS · Android · Web) | per platform | Cross-platform products, or comparing one idea across platforms |

The default is **iOS** if the designer has no preference. Build the platform conventions in from the start (section 3); don't just reskin one frame.

### 0.3 Content

Also ask for, or confirm:

- **The flows:** the 4–7 parts of the product to cover, for example home, product page, checkout and account.
- **Research:** personas or segments to tag directions with. If there are none, propose 3–4 example personas and label them clearly as examples.
- **Today screenshots:** the current experience for each flow, if the designer wants before and after.

## 1. Extract the brand into tokens

**From Figma:**

1. Run `create_session`.
2. Run `get_variable_defs` and `get_metadata` on the brand or design-system page.
3. Run `get_screenshot` on 2–3 key screens. Use `enableBase64Response` if asset URLs are blocked.

**From assets:** read the files and screenshots directly.

Produce a token block on `.ph` (the screen inside the device) and nothing else:

```css
.ph {
  --brand: #……;        /* primary brand colour */
  --brand-ink: #……;    /* text on brand colour, contrast ≥ 4.5:1 */
  --ink: #……; --ink-2: #……; --ink-3: #……;   /* text levels */
  --s0: #……; --s1: #……; --s2: #……;          /* surfaces, low to high */
  --line: rgba(…);
  --accent-1 … --accent-n;                  /* section colours, only if the brand has them */
  --f-display: "Client Display", fallback;  /* brand display face */
  --f-ui: "Client UI", fallback;           /* brand text face */
  --r-sm / --r-md / --r-lg;                /* the brand's corner radii */
  --fs: 1;                                 /* text-size multiplier for the Large switch */
}
.ph[data-theme="dark"] { /* same tokens, dark values: lift surfaces by level, don't just invert */ }
```

**Rules:**

- **Measure, don't guess.** Take colours, radii, type sizes and spacing from the Figma variables or from pixel samples.
- **Check contrast** for every text colour on every surface it sits on: at least 4.5:1 for body text, 3:1 for 24px bold and larger. If the brand colour fails on white at small sizes, add a darker `--brand-text`.
- **Font files:** if you have them, convert to WOFF2 with fontTools and inline them as base64 `@font-face` in the build. Map weights with ranges so the browser never fakes bold.
- **Font names only:** load the font from Google Fonts when it exists there. Otherwise pick the closest open-licence match and tell the designer which one you used.
- **Logo:** inline the SVG with `currentColor` where possible, so it works in dark mode.
- **No photos of real people** unless the designer supplied them for this purpose. Use brand-coloured placeholders (duotone, halftone or blocks).

## 2. Architecture

A small source folder, built by one script into one `dist/viewer.html`:

```
src/
  index.html     shell markup with placeholders /*__SHELL_CSS__*/ /*__KIT_CSS__*/ /*__KIT_JS__*/ /*__SHELL_JS__*/ /*__SCREENS_JS__*/ /*__FONTS_CSS__*/
  shell.css      viewer chrome (neutral) and the device frames
  shell.js       flows, state, device switch, picker, notes panel, persona popover, tab routing
  tour.js        first-visit onboarding
  kit.css/js     the client's components inside the device, with platform adaptations
  screens/*.js   one file per flow, three versions each
build.py         inlines everything, base64s fonts and screenshots, writes dist/viewer.html
```

### Viewer chrome

- **Layout:** a `300px | 1fr | 300px` grid. The left rail holds the brand title, the flows list and the controls. The centre is the stage, the right is the notes.
- **Narrow screens:** below 1100px the notes move under the stage. Below 760px everything stacks, the flows become a horizontal chip row and the picker turns sticky.
- **Device frames:** a `.device` box with a `.ph` screen inside, switched by `data-device="ios|android|web"`:
  - **iOS:** outer 414 × 868, radius 66, screen radius 54, Dynamic Island 122 × 35.
  - **Android:** outer 436 × 939, radius 44, screen radius 32, 14px punch-hole camera.
  - **Web:** outer 1280 × 820, radius 12, a 40px browser bar with traffic lights and an address bar, screen 1280 × 780.
  - **All frames:** clip the screen with `clip-path: inset(0 round R)` so animated layers never leak. Scale to fit the stage with `transform: scale(s)`, allowing a lower minimum scale for web. Expose `window.__phoneScale` so drag gestures can divide by it.
- **Controls (segmented):**
  - **Device:** iOS · Android · Web. Only shown when more than one platform is in scope.
  - **Theme:** Light · Dark.
  - **Text size:** Default · Large, setting `--fs` to 1 or 1.18.
  - **Motion:** Full · Reduced.
  - Optionally **Labels:** On · Off, for annotated wireframes.
- **Persistence:** keep the controls in `localStorage`, wrapped in try/catch, and in URL params (`?flow=&v=&device=`) so links open on the right view.
- **Changing device** re-fits the frame and re-mounts the screen.
- **Chrome style:** keep it restrained (neutral greys, one accent taken from the brand) so it never competes with the mock-up. Support light and dark for the page itself.

### Registry contract

```js
const FLOWS = [{ id: "home", title: "Home", sum: "One-line purpose", today: [{ src: "today-home.webp", cap: "Caption" }] }, …];

Proto.versions("home", [{
  name: "Direction name",            // never "Option A"
  axis: "One sentence: what this direction explores and why.",
  personas: ["id", "id"],
  fixes: ["Problem it solves", …],   // 2–5, plain words
  tryThis: ["Real interaction", …],  // 2–4 things that actually work in the mock-up
  motion: "What moves, curve and duration.",
  tradeoff: "One honest line on what it costs.",
  render(root, ctx) { root.innerHTML = `…`; return () => { /* cleanup */ }; }
}, …]);
```

- **ctx** provides `go(flowId, versionIndex)`, `toast(msg)`, `theme`, `large` and `reduced`.
- **Mounting:** each mount replaces `#screen` with a fresh clone, so listeners never pile up.
- **Navigation:** one global `TAB_ROUTES` map in the shell drives the bottom tab bar (iOS), the navigation bar (Android) or the top nav (web).
- **Shared markup:** write each screen once with kit helpers (`bar()`, `tabs()`, `media()`, `sheet()`, `toast()`). Platform differences live in CSS under `.ph[data-device=…]`, not in three copies of every screen. Only branch in JS when the interaction itself differs, for example hover previews on web or a FAB on Android.

### Version picker

- A pill bar under the stage with the three version names, a sliding highlight and a replay button.
- **Keys:** `1 2 3` or `← →` switch versions, `↑ ↓` switch flows, `R` replays.
- Ignore the keys while focus is inside the mock-up.
- Place the picker inside the stage so it centres on the device, not the viewport.

### Rationale panel

Sections, in order:

1. **Direction** (the axis).
2. **Built for:** persona chips. Tapping one opens a popover with who they are, a quote and their needs.
3. **Problem it solves.**
4. **Try this.**
5. **Motion.**
6. **Its cost.**
7. **Today:** current-experience screenshots in a lightbox, or dashed placeholders.

This panel is the point of the viewer: every direction has to argue for itself.

### Onboarding tour

Three steps. Each one spotlights a real element through a cut-out (a `box-shadow: 0 0 0 200vmax` scrim around a moving hole) and shows a small card with Back, Next, Skip and progress dots:

1. **Flows list:** "Move between sections here."
2. **Picker:** "Each section has three directions." Name two flows' versions, read live from the registry.
3. **Notes panel:** "Here's the why."

Behaviour:

- It shows once per browser (`localStorage`). A "Show me around" button replays it, and `?tour=1` forces it.
- Skip it when `navigator.webdriver` is set, so automated screenshots stay clean.
- While it is open it owns the keyboard: arrows move between steps, Escape closes it, and focus is trapped in the card.
- On phones, place the card in the half of the screen away from its target and hide the keyboard hints.

## 3. Platform conventions

Design each direction for the platform it runs on. When all three are in scope, adapt the shared screens in CSS and check each one.

### iOS (Human Interface Guidelines)

- **Chrome:**
  - Status bar 47px; navigation bar 56px below it.
  - Large titles are fine on root screens.
  - The back chevron sits top left.
- **Navigation:** a bottom tab bar of 3–5 tabs, which can float with rounded corners, plus a 134 × 5 home indicator.
- **Interaction:**
  - Sheets rise from the bottom with a grabber and dismiss with a velocity-aware drag.
  - Swipe from the left edge to go back.
- **Targets and type:** targets are at least 44 × 44pt. The system font fallback is `-apple-system`.
- **Motion:** spring-like ease-out curves; press state `scale(.97)`.

### Android (Material 3)

- **Chrome:**
  - Status bar 36px with the time on the left.
  - Top app bar 64px (small) or larger for root screens.
  - The back arrow sits top left. System back is a gesture, so never rely on an on-screen back button alone.
- **Navigation:** a full-width navigation bar of 80dp with 3–5 destinations and a pill-shaped active indicator behind the icon. A 108 × 4 gesture handle sits below it.
- **Components:**
  - Buttons are full pills, 40–48dp tall.
  - Cards have a 12dp radius.
  - Bottom sheets have a 28dp top radius.
  - The FAB sits bottom right for the primary create action when the product has one.
  - Snackbars replace toasts.
- **Targets and type:**
  - Targets are at least 48 × 48dp.
  - The system font fallback is Roboto. Keep the brand face when it is supplied.
- **Motion:** Material emphasised easing; container transforms for card-to-detail.

### Web (responsive desktop)

- **Chrome:**
  - There is no status bar or home indicator.
  - A 64px site header holds the logo on the left, navigation in the centre or to the left, and search and account on the right.
- **Navigation:**
  - The bottom tab bar becomes **top navigation links** with an underline for the current section.
  - Sub-navigation becomes tabs or a sidebar, never a hamburger on desktop.
- **Layout:**
  - Use a centred content column (720–1200px depending on the content) with breathing room.
  - Hero media goes wide (for example 21:8) instead of tall.
  - Docked actions become a sticky bar or a side summary.
  - Sheets become centred dialogs or side panels.
- **Interaction:**
  - Hover states are allowed, but only inside `@media (hover:hover) and (pointer:fine)`.
  - Keyboard focus must be visible everywhere.
  - Links are real `<a>` elements.
  - Primary actions don't depend on swipes; offer arrows or buttons.
- **Breakpoints:** when the designer wants responsive proof, add a "Web" sub-switch for Desktop 1280 · Tablet 834 · Mobile 390.

## 4. Designing the screens

- **Scope:** cover 4–7 flows, each with **three genuinely different directions**. Make them differ by axis (hierarchy, interaction model, personalisation, format or funnel shape), not just by colour.
- **Content:** use the client's real content (real products, prices and copy) where you have it. Put a small "Demo data" chip on invented figures, and never invent quotes from real people.
- **Brand:** build every component from the brand tokens. Each screen gets one loud element; everything else stays calm.
- **Craft:**
  - Use ease-out curves.
  - UI motion stays under 300ms; sheets run about 420ms on a drawer curve.
  - Never use `transition: all`, `ease-in` or `scale(0)`.
  - Respect reduced motion.
  - Real buttons, with aria-labels on icon buttons.
  - Visible focus.
  - Check contrast in light, dark and Large.
  - Every "Try this" item must actually work.
- **Bigger jobs:** split the flows across 2–3 builder agents, each owning only `screens/<flow>.js/.css`. Give them one shared brief (brand tokens, kit, registry contract, platform conventions, craft rules). Then run an independent review agent before polishing.

## 5. Build, check, publish

1. Run `python3 build.py` to produce `dist/viewer.html`, one file with everything inlined.
2. Screenshot every version **on every platform in scope**, in light, dark and Large, using Playwright.
   - Route Google Fonts to local files if the sandbox blocks them.
   - Check that nothing clips, overlaps or overflows.
   - The console must show zero errors.
3. Check the tour at desktop and phone widths, and check that the picker centres under the device for each frame.
4. Publish it as an artifact (strip the doctype, html, head and body wrappers first). Also send the single HTML file so the designer can host it anywhere.
5. Optionally, rebuild the screens as editable Figma layers in the client's file, to the right of the existing frames and never touching them.

## 6. Handover message

Keep it short:

- what the viewer shows (flows × directions × platforms);
- the brand source used (Figma link or assets);
- any font substitutions;
- what is real and what is demo data;
- that the page is private until shared.
