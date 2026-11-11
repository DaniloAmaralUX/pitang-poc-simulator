# Diretrizes de Design Engineering & Usabilidade (Jakub Krehel x Pitang Labs)

Este simulador de POC aplica estritamente os padrões de Design Engineering de Jakub Krehel e as diretrizes de interface do Pitang Labs:

## 1. Superfícies & Raios Concêntricos (Concentric Border Radii)
- **Fórmula:** Raio Externo = Raio Interno + Padding + Largura da Borda ($R_{ext} = R_{int} + P + B$).
- Mapeamento:
  - Card externo `border-radius: 16px; padding: 12px` $\implies$ Botão interno `border-radius: 8px` ou `10px`.
  - Evita cantos comprimidos (*pinched corners*) ou desproporcionais.

## 2. Engenharia Cinética & Micro-Interações
- **Feedback Tátil ao Pressionar:**
  - `active:scale-[0.96]` (duração 150ms, `cubic-bezier(0.2, 0, 0, 1)` ou `ease-out`).
  - Nunca inferior a 0.95 (evita deformação visual).
  - Bloqueado em elementos desabilitados (`:disabled { transform: none; }`).
- **Transições Interrompíveis:**
  - Nunca utilizar `transition: all`.
  - Definir propriedades explícitas: `transition: transform 150ms ease-out, opacity 150ms ease-out, background-color 150ms ease-out`.
- **Entradas Escalonadas (100ms Stagger):**
  - Entradas de lista e seções com atraso semântico de 40ms a 100ms.
- **Respeito a Movimento Reduzido:**
  - `@media (prefers-reduced-motion: reduce)` anula transformações e escalas, garantindo acessibilidade motora.

## 3. Tipografia & Precisão Numérica
- **Números Tabulares (`tabular-nums`):**
  - Aplicado obrigatoriamente a contadores, SLAs, prazos, moedas, protocolos e tabelas de dados (`font-variant-numeric: tabular-nums`).
  - Elimina trepidação horizontal (*layout jitter*) em dados atualizados em tempo real.
- **Tipografia Editorial Polida:**
  - Uso de reticências reais `…` (`&hellip;`), nunca três pontos `...`.
  - Espaços inquebráveis (`&nbsp;`) entre grandezas e unidades (`24&nbsp;h`, `R$&nbsp;1.500,00`, `3&nbsp;dias`).
  - Títulos com `text-wrap: balance` e corpo de texto com `text-wrap: pretty`.
  - Antialiasing ativado: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`.

## 4. Alinhamento Óptico & Ícones
- Compensação óptica em botões com ícones: redução de 2px no padding do lado do ícone para balancear a massa visual.
- Traço do ícone compatibilizado com o peso do texto adjacente (1.8px a 2px).
- Ícones escaláveis em SVG utilizando `stroke="currentColor"` ou `fill="currentColor"`.

## 5. Áreas de Toque Mínimas (Hit Areas)
- Dispositivos Móveis (iOS & Android): mínimo de **44×44px**.
- Aplicações Desktop / Web corporativas: mínimo de **40×40px**.
- Elementos visuais compactos utilizam expansão com pseudo-elementos (`::after` cobrindo 44px).

## 6. Acessibilidade & Contraste (WCAG AA)
- Relação de contraste $\ge 4.5:1$ para textos normais e $\ge 3:1$ para componentes de interface e ícones.
- `focus-visible` explícito e de alto contraste com anel de foco `2px solid #ED1C24` e `outline-offset: 2px`.
- Controles interativos sempre possuem nomes acessíveis (`aria-label`, `<label htmlFor>` ou texto descritivo).
- Modais, gavetas e caixas de rolagem isolados com `overscroll-behavior: contain`.
- Anti-Slop: zero gradientes neon roxos genéricos; design corporativo limpo, focado em alta densidade de informação e clareza de dados.
