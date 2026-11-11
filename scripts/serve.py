#!/usr/bin/env python3
"""
PITANG LABS · LOCAL DEV SERVER
Serves dist/poc-simulator.html on http://localhost:<port> for viewing
inside IDE webviews (Antigravity Simple Browser, VS Code Browser) or any browser.
"""

import http.server
import socketserver
import pathlib
import sys
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

class SingleFileHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def do_GET(self):
        if self.path in ("/", "/index.html", "/viewer"):
            self.path = "/poc-simulator.html"
        return super().do_GET()

def serve(port=3000):
    handler = SingleFileHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        url = f"http://localhost:{port}/poc-simulator.html"
        print(f"\n=======================================================")
        print(f"  PITANG LABS · POC SIMULATOR SERVER ATIVO")
        print(f"  Acesse no browser da IDE ou navegador externo:")
        print(f"  → {url}")
        print(f"  Pressione Ctrl+C para encerrar o servidor.")
        print(f"=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor finalizado.")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    serve(port)
