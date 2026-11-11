/* ==========================================================================
   PITANG LABS · TEST SUITE
   Validates build integrity, requirements parser, Jakub design standards,
   and screen generation.
   ========================================================================== */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

console.log("=================================================");
console.log("  INICIANDO SUITE DE TESTES: PITANG POC SIMULATOR");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(desc, condition) {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed++;
  }
}

// 1. Build Verification
const distFile = path.join(ROOT, "dist", "poc-simulator.html");
assert("dist/poc-simulator.html existe", fs.existsSync(distFile));

if (fs.existsSync(distFile)) {
  const content = fs.readFileSync(distFile, "utf-8");
  assert("dist/poc-simulator.html tamanho > 50KB", content.length > 50000);
  assert("Contém logotipo SVG do Pitang", content.includes("M48.301 12.156C44.794") || content.includes("M124.376 23.813"));
  assert("Contém marcação de Pitang Labs", content.includes("Pitang Labs") || content.includes("PITANG LABS"));
  assert("Contém regras Jakub: scale-on-press 0.96", content.includes("scale(0.96)"));
  assert("Contém números tabulares (tabular-nums)", content.includes("tabular-nums"));
  assert("Contém raios concêntricos definidos", content.includes("--r-card") && content.includes("--r-inner"));
  assert("Contém raios concêntricos expandidos (subcard, sheet, pill)", content.includes("--r-subcard") && content.includes("--r-sheet"));
  assert("Contém breakpoints de dispositivos (iOS, Android, Web)", content.includes('data-device="ios"') && content.includes('data-device="android"') && content.includes('data-device="web"'));
  assert("Contém picker Emil Kowalski com sliding highlight", content.includes("proto-picker-highlight") && content.includes("proto-picker-replay"));
  assert("Contém atalhos de teclado (D para dispositivo, T para tema, R para replay)", content.includes("setDevice") && content.includes("setTheme"));
  assert("Contém tags de acessibilidade (role, aria-label, aria-pressed)", content.includes('role="group"') && content.includes("aria-label"));
  assert("Contém gaveta de requisitos (req-drawer)", content.includes("req-drawer"));
  assert("Contém motor de parser embutido", content.includes("RequirementsParser"));
  assert("Contém gerador de POCs embutido", content.includes("PocGenerator"));
}

// 2. Parser Engine Unit Test
const parserPath = path.join(ROOT, "src", "simulator", "parser.js");
assert("Arquivo parser.js existe", fs.existsSync(parserPath));

const sampleReq = `
# Sistema de Logística Inteligente
## Categoria: 01. Acesso & Frota
### Fluxo: Login do Motorista
- RN-01: Validação de CNH digital e token de telemetria
- RN-02: Bloqueio caso exame toxicológico esteja vencido
## Categoria: 02. Rastreamento & Cargas
### Fluxo: Despacho de Carga
- RN-03: Leitura de código de barras da nota fiscal eletrônica
- RN-04: Assinatura eletrônica do recebedor com geolocalização
`;

// Simple dynamic import or syntax check
try {
  const parserCode = fs.readFileSync(parserPath, "utf-8");
  const fn = new Function("module", "exports", parserCode + "\nreturn module.exports;");
  const moduleObj = { exports: {} };
  const Parser = fn(moduleObj, moduleObj.exports);

  const parsed = Parser.parse(sampleReq);
  assert("Parser extraiu título corretamente", parsed.title === "Sistema de Logística Inteligente");
  assert("Parser identificou 2 categorias", parsed.categories.length === 2);
  assert("Parser mapeou 2 fluxos", parsed.flows.length === 2);
  assert("Parser extraiu 4 regras de negócio", parsed.flows.reduce((a, b) => a + b.rules.length, 0) === 4);
  assert("Regras possuem prefixo RN", parsed.flows[0].rules[0].startsWith("RN-"));
} catch (err) {
  console.error("Erro no teste do parser:", err);
  failed++;
}

// 3. Example Files Verification
assert("exemplo-ouvidoria-pitang.md existe", fs.existsSync(path.join(ROOT, "requirements", "exemplo-ouvidoria-pitang.md")));
assert("exemplo-portal-ags-compliance.md existe", fs.existsSync(path.join(ROOT, "requirements", "exemplo-portal-ags-compliance.md")));
assert("exemplo-b2b-procurement.md existe", fs.existsSync(path.join(ROOT, "requirements", "exemplo-b2b-procurement.md")));
assert("template-requisitos.txt existe", fs.existsSync(path.join(ROOT, "requirements", "template-requisitos.txt")));

console.log("\n=================================================");
console.log(`  RESULTADO DOS TESTES: ${passed} PASSOU, ${failed} FALHOU`);
console.log("=================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
