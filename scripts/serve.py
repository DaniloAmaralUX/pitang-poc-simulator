#!/usr/bin/env python3
"""
PITANG LABS · LOCAL DEV SERVER (WITH AUTO HOT-RELOAD)
Serves dist/poc-simulator.html on http://localhost:<port> and monitors
requirements/ and src/ for changes. When an IDE user saves a file, it
automatically recompiles and signals the browser to reload!
"""

import http.server
import socketserver
import pathlib
import sys
import json
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
REQ_DIR = ROOT / "requirements"
SRC_DIR = ROOT / "src"

sys.path.insert(0, str(ROOT / "scripts"))
import build as bundler
import simulate as simulator

last_rebuild_time = 0
last_seen_mtime = 0

def get_latest_mtime():
    mtimes = []
    for d in (REQ_DIR, SRC_DIR):
        if d.exists():
            for p in d.rglob("*"):
                if p.is_file():
                    try:
                        mtimes.append(p.stat().st_mtime)
                    except OSError:
                        pass
    return max(mtimes) if mtimes else 0

class DevServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def do_GET(self):
        global last_rebuild_time, last_seen_mtime

        # Live reload endpoint
        if self.path.startswith("/api/version"):
            current_mtime = get_latest_mtime()
            rebuilt = False
            if last_seen_mtime and current_mtime > last_seen_mtime:
                # Rebuild triggered by file change in IDE
                print(f"[Hot-Reload] Alteração detectada na IDE! Recompilando POC...")
                try:
                    default_req = REQ_DIR / "exemplo-ouvidoria-pitang.md"
                    if default_req.exists():
                        project = simulator.parse_requirements_file(default_req)
                        bundler.build(json.dumps(project, ensure_ascii=False))
                    else:
                        bundler.build()
                    last_rebuild_time = time.time()
                    rebuilt = True
                    print(f"[Hot-Reload] POC atualizada com sucesso.")
                except Exception as e:
                    print(f"[Hot-Reload] Erro ao recompilar: {e}", file=sys.stderr)

            last_seen_mtime = current_mtime

            data = {
                "version": f"{current_mtime:.2f}_{last_rebuild_time:.2f}",
                "rebuilt": rebuilt
            }
            body = json.dumps(data).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path in ("/", "/index.html", "/viewer"):
            self.path = "/poc-simulator.html"

        return super().do_GET()

def serve(port=3000):
    global last_seen_mtime
    last_seen_mtime = get_latest_mtime()

    # Allow socket reuse so restarts don't hit address already in use
    socketserver.TCPServer.allow_reuse_address = True
    handler = DevServerHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        url = f"http://localhost:{port}/poc-simulator.html"
        print(f"\n=======================================================")
        print(f"  PITANG LABS · POC SIMULATOR COM HOT-RELOAD ATIVO")
        print(f"  Acesse no browser da IDE ou navegador externo:")
        print(f"  → {url}")
        print(f"  (Qualquer alteração em requirements/ ou src/ atualiza o browser)")
        print(f"  Pressione Ctrl+C para encerrar o servidor.")
        print(f"=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor finalizado.")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    serve(port)
