#!/usr/bin/env node
/**
 * Pitang Labs POC Simulator - CLI Runner
 *
 * Works in Claude Code, Codex, Cursor, VS Code, and terminal.
 * Launches the interactive POC Simulator and automatically opens
 * the IDE Simple Browser or system webview.
 *
 * Usage:
 *   npx pitang-poc
 *   npx pitang-poc --port 3000
 *   npx pitang-poc --file ./meus-requisitos.md
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const args = process.argv.slice(2);
let port = 3000;
let autoOpen = true;
let customFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--no-open') {
    autoOpen = false;
  } else if (args[i] === '--file' && args[i + 1]) {
    customFile = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
  🚀 Pitang Labs POC Simulator CLI
  
  Uso:
    npx pitang-poc                 Inicia o simulador e abre na IDE
    npx pitang-poc --port <porta>  Especifica porta customizada (padrão: 3000)
    npx pitang-poc --file <path>   Injeta arquivo markdown de requisitos
    npx pitang-poc --no-open       Apenas sobe o servidor sem abrir navegador
    
  Ambientes suportados:
    ✓ Claude Code (Terminal & Skills)
    ✓ OpenAI Codex (CLI & IDE extension)
    ✓ Cursor / VS Code (Simple Browser & Webview)
    ✓ Navegadores Desktop & Mobile
    `);
    process.exit(0);
  }
}

// Find base directory
const baseDir = path.resolve(__dirname, '..');
const distHtml = path.join(baseDir, 'dist', 'poc-simulator.html');
const indexHtml = path.join(baseDir, 'index.html');

// Fallback HTML if dist not found
function getHtmlFile() {
  if (fs.existsSync(distHtml)) return distHtml;
  if (fs.existsSync(indexHtml)) return indexHtml;
  return null;
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

// Start Server
function startServer(initialPort) {
  let currentPort = initialPort;

  const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://localhost:${currentPort}`);
    let reqPath = parsedUrl.pathname;

    if (reqPath === '/' || reqPath === '') {
      reqPath = '/dist/poc-simulator.html';
    } else if (reqPath === '/poc' || reqPath === '/simulator' || reqPath === '/poc-simulator.html') {
      reqPath = '/dist/poc-simulator.html';
    }

    // API endpoint to ingest requirements dynamically from Claude Code or Codex
    if (reqPath === '/api/requirements' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const reqDir = path.join(baseDir, 'requirements');
          if (!fs.existsSync(reqDir)) fs.mkdirSync(reqDir, { recursive: true });
          const targetFile = path.join(reqDir, 'custom-requirements.md');
          fs.writeFileSync(targetFile, body, 'utf-8');

          // Trigger build
          const buildScript = path.join(baseDir, 'scripts', 'build.py');
          exec(`python "${buildScript}"`, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              message: 'Requisitos atualizados e POC reconstruída com sucesso!',
              output: stdout
            }));
          });
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    let filePath = path.join(baseDir, reqPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      // Try resolving in dist
      filePath = path.join(baseDir, 'dist', path.basename(reqPath));
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback to simulator html
      const fallback = getHtmlFile();
      if (fallback) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(fallback).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Pitang POC Simulator: File not found');
      }
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${currentPort} em uso, tentando porta ${currentPort + 1}...`);
      currentPort++;
      server.listen(currentPort);
    } else {
      console.error('Erro no servidor:', err);
    }
  });

  server.listen(currentPort, () => {
    const url = `http://localhost:${currentPort}/dist/poc-simulator.html`;
    
    // Print banner
    console.log('\n' + '='.repeat(68));
    console.log('  🚀 PITANG LABS POC SIMULATOR - ATIVO NA SUA IDE');
    console.log('='.repeat(68));
    console.log(`  🌐 URL Local:      \x1b[36m${url}\x1b[0m`);
    console.log(`  📱 Breakpoints:    iOS (Dynamic Island) • Android (M3) • Web (1280px)`);
    console.log(`  ✨ Padrões:        Jakub Krehel (Design) + Emil Kowalski (Motion)`);
    console.log(`  🎯 IDEs:           Claude Code • Codex • Cursor • VS Code`);
    console.log('='.repeat(68));
    console.log('  [Instrução para Claude Code & Codex]');
    console.log('  A ferramenta está aberta no navegador da IDE.');
    console.log('  Para enviar novos requisitos, digite no chat ou envie via POST');
    console.log(`  para ${url.replace(/\/dist\/.*$/, '')}/api/requirements`);
    console.log('='.repeat(68) + '\n');

    if (autoOpen) {
      openInIdeBrowser(url, currentPort);
    }
  });
}

// Open in IDE browser or system browser
function openInIdeBrowser(url, activePort) {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';

  const isVsCode = Boolean(process.env.VSCODE_PID || process.env.TERM_PROGRAM === 'vscode');
  const isCursor = Boolean(process.env.CURSOR_AGENT || process.env.TERM_PROGRAM === 'cursor');
  const encodedUrl = encodeURIComponent(url);

  console.log('🔍 Detectando ambiente de IDE...');

  // Try IDE Simple Browser protocol first
  if (isCursor) {
    console.log('⚡ Cursor detectado! Abrindo na aba interna do Cursor...');
    const cursorUri = `cursor://vscode.simple-browser/open?url=${encodedUrl}`;
    if (isWindows) exec(`start "" "${cursorUri}"`);
    else if (isMac) exec(`open "${cursorUri}"`);
    else exec(`xdg-open "${cursorUri}"`);
    return;
  }

  if (isVsCode) {
    console.log('⚡ VS Code / Codex detectado! Abrindo Simple Browser...');
    const vscodeUri = `vscode://vscode.simple-browser/open?url=${encodedUrl}`;
    if (isWindows) exec(`start "" "${vscodeUri}"`);
    else if (isMac) exec(`open "${vscodeUri}"`);
    else exec(`xdg-open "${vscodeUri}"`);
    return;
  }

  // Check if "code" or "cursor" CLI commands are in PATH
  exec('cursor --version', (errCursor) => {
    if (!errCursor) {
      console.log('⚡ Abrindo via Cursor CLI...');
      exec(`cursor --open-url "${url}"`, (e) => {
        if (e) openDefault(url);
      });
      return;
    }

    exec('code --version', (errCode) => {
      if (!errCode) {
        console.log('⚡ Abrindo via VS Code CLI...');
        exec(`code --open-url "${url}"`, (e) => {
          if (e) openDefault(url);
        });
        return;
      }

      openDefault(url);
    });
  });

  function openDefault(targetUrl) {
    console.log('🌐 Abrindo no navegador padrão...');
    if (isWindows) {
      exec(`start "" "${targetUrl}"`);
    } else if (isMac) {
      exec(`open "${targetUrl}"`);
    } else {
      exec(`xdg-open "${targetUrl}"`);
    }
  }
}

// Execute
startServer(port);
