# Pitang Labs · Prototype Viewer

> **Visualizador de Protótipos de Alta Fidelidade e Engenharia de Design da Pitang Labs.**

O **Pitang Labs · Prototype Viewer** é uma plataforma modular de validação e exploração de interfaces digitais. Projetado para apresentar experiências de produto interativas em molduras responsivas (iOS, Android e Desktop Web), explorando múltiplas hipóteses e direções de design em tempo real.

---

## ✦ Funcionalidades Principais

1. **Jornada de Produto (6 Fluxos Essenciais):**
   - **01. Home:** Primeiro contato com a marca, narrativa e destaques.
   - **02. Página da Bike:** Análise técnica minuciosa de geometria, componentes e especificações.
   - **03. Configurador:** Seleção personalizada de quadro, grupo, rodas e acabamento.
   - **04. Checkout:** Fluxo de compra transparente, cálculo de prazos e checkout veloz.
   - **05. Minha Garagem:** Hub pós-venda para acompanhamento do pedido, telemetria e revisões.
   - **06. Pedais & Rotas:** Comunicação com a comunidade, eventos e rotas recomendadas.

2. **3 Direções de Design por Fluxo (Teclas 1, 2, 3):**
   - Cada tela contém 3 propostas conceituais distintas com prós, contras e tradeoffs documentados no painel lateral de rationale.

3. **Multi-Dispositivo & Breakpoints:**
   - Alternância instantânea entre molduras **iOS (iPhone 15 Pro)**, **Android (Pixel 8)** e **Web Responsivo**.
   - Controles de tema (Claro / Escuro), tamanho tipográfico (Padrão / Ampliada) e preferência de movimento reduzido.

4. **Personas de Validação:**
   - Critérios de usabilidade validados com base em perfis de ciclistas: *Racer*, *Ciclista de Fim de Semana*, *Primeiro Investimento* e *Explorador Gravel*.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Python 3.10+ (ou qualquer servidor estático de sua preferência)

### Iniciar o Servidor
`ash
python scripts/serve.py 3000
`
Abra em seu navegador ou no browser integrado da sua IDE (Cursor / VS Code):
- **http://localhost:3000/** ou **http://localhost:3000/dist/prototype-viewer.html**

### Compilar o Bundler Único
Para gerar a versão standalone (single-file HTML) sem dependências externas:
`ash
python scripts/build.py
`
O arquivo unificado será gerado em dist/prototype-viewer.html e index.html.

---

## 🎨 Identidade Visual
Desenvolvido sob o Design System da **Pitang Labs** com paleta oficial:
- **Pitang Red:** #ED1C24
- **Dark Mode Accent:** #FF4A40
- **Tipografia:** Inter / SF Pro / Roboto
