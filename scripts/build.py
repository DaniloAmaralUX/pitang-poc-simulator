#!/usr/bin/env python3
"""
PITANG LABS · PROTOTYPE VIEWER BUNDLER
Inlines HTML, CSS, and JS into dist/prototype-viewer.html and dist/poc-simulator.html.
"""

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"

def read(rel_path: str) -> str:
    path = SRC / rel_path
    if not path.exists():
        print(f"Error: Required file not found: {path}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")

def build() -> pathlib.Path:
    DIST.mkdir(parents=True, exist_ok=True)
    html = read("index.html")

    rep = {
        "/*__SHELL_CSS__*/": read("shell.css"),
        "/*__PICKER_CSS__*/": read("picker.css"),
        "/*__KIT_CSS__*/": read("kit.css"),
        "/*__SCREENS_CSS__*/": "",
        "/*__KIT_JS__*/": read("kit.js"),
        "/*__SHELL_JS__*/": read("shell.js"),
        "/*__SCREENS_JS__*/": read("screens.js"),
        "/*__TOUR_JS__*/": read("tour.js"),
    }

    for marker, content in rep.items():
        safe_content = content.replace("</script", "<\\/script")
        html = html.replace(marker, safe_content)

    out_file = DIST / "prototype-viewer.html"
    out_file.write_text(html, encoding="utf-8")

    # Also write dist/poc-simulator.html as alias
    sim_file = DIST / "poc-simulator.html"
    sim_file.write_text(html, encoding="utf-8")

    # Also write root index.html to serve directly
    root_index = ROOT / "index.html"
    root_index.write_text(html, encoding="utf-8")

    size_kb = len(html.encode("utf-8")) / 1024
    print(f"✓ Construído com sucesso: {out_file} ({size_kb:.1f} KB)")
    print(f"✓ Atualizado alias: {sim_file}")
    print(f"✓ Atualizado raiz: {root_index}")
    return out_file

if __name__ == "__main__":
    build()
