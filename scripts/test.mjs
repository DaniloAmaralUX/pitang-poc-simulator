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

// Regression coverage: preserve input, reject broken structured data and export safely.
{
  const load = relative => {
    const code = fs.readFileSync(path.join(ROOT, relative), "utf-8");
    const module = { exports: {} };
    new Function("module", "exports", code)(module, module.exports);
    return module.exports;
  };
  const Parser = load("src/simulator/parser.js");
  const Snapshot = load("src/simulator/snapshot.js");
  const brief = "Quero reservar salas, com data e horário. Não precisa de login. Impedir reservas sobrepostas.";
  const project = Parser.parse(brief);
  assert("Texto livre preserva o briefing completo", project.flows.length === 1 && project.flows[0].sum === brief);
  assert("Texto livre não inventa autenticação ou regras", project.flows[0].archetype === "brief" && project.totalRules === 0);
  const longBrief = Array.from({length: 8}, (_, i) => `Parágrafo ${i}: requisitos e restrições específicos do projeto.`).join("\n\n");
  assert("Briefing extenso não perde parágrafos", Parser.parse(longBrief).flows[0].sum === longBrief);
  const missingRules = Parser.parse("# Projeto\n### Fluxo: Reserva\nDescrição do fluxo");
  assert("Fluxo sem regras não recebe regras inventadas", missingRules.flows[0].rules.length === 0);
  const invalid = ["{broken", "[]", '{"flows":[]}', '{"flows":[null]}', '{"flows":[{"title":"Teste","rules":"inválido"}]}', '{"flows":[{"id":"x","title":"A"},{"id":"x","title":"B"}]}'];
  assert("Entradas estruturadas inválidas geram erro recuperável", invalid.every(text => { try { Parser.parse(text); return false; } catch { return true; } }));
  const hostile = Parser.parse("Texto com </script><script>alert(1)</script> e & caracteres.");
  const serialized = Snapshot.serialize(hostile);
  assert("Projeto exportado não encerra o script de metadados", !serialized.includes("<") && !serialized.includes(">"));
  assert("Exportação preserva texto e regras sem depender do storage", JSON.parse(serialized).rawText === hostile.rawText && Parser.parse(serialized).flows[0].sum === hostile.flows[0].sum);
  const imported = { title: "Uma aplicação", artifactHtml: "<!doctype html><html><script>const n = 1;</script><body>Aplicação</body></html>", flows: [{ id: "html", title: "Aplicação", archetype: "html", rules: [] }] };
  const restored = Parser.parse(Snapshot.serialize(imported));
  assert("HTML incorporado sobrevive à serialização e à leitura do projeto", restored.artifactHtml === imported.artifactHtml && restored.flows[0].archetype === "html");
  const Generator = load("src/simulator/generator.js");
  const registrations = {};
  globalThis.window = {Proto: {versions(id, versions) { registrations[id] = versions; }}};
  try {
    Generator.registerProjectScreens(project);
    Generator.registerProjectScreens(Parser.parse('{"flows":[{"id":"login","title":"Login","archetype":"auth"}]}'));
    assert("Briefing tem uma única direção e não finge implementar a aplicação", registrations.briefing.length === 1);
    assert("Acesso sem alternativas distintas não repete três telas", registrations.login.length === 1);
    Generator.registerProjectScreens(restored);
    const nodes = [];
    globalThis.document = {createElement(tag) { return {tag, setAttribute(k, v) {this[k] = v;}, remove() {this.removed = true;}}; }};
    try {
      const cleanup = registrations.html[0].render({replaceChildren(node) {nodes.push(node);}});
      assert("Prévia HTML mantém scripts isolados da origem do viewer", nodes[0].tag === "iframe" && nodes[0].sandbox.includes("allow-scripts") && !nodes[0].sandbox.includes("allow-same-origin"));
      assert("Prévia recebe o HTML integral e limpa seu frame ao desmontar", nodes[0].srcdoc === imported.artifactHtml && (cleanup(), nodes[0].removed));
    } finally { delete globalThis.document; }
  } finally { delete globalThis.window; }
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
