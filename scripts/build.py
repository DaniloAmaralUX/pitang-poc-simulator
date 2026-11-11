#!/usr/bin/env python3
"""
PITANG LABS · POC SIMULATOR BUNDLER
Inlines all HTML, CSS, and JS components into a single self-contained
dist/poc-simulator.html file ready to open in any IDE browser or web browser.
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

def build(custom_project_json_str: str = None) -> pathlib.Path:
    DIST.mkdir(parents=True, exist_ok=True)
    html = read("index.html")

    rep = {
        "/*__SHELL_CSS__*/": read("shell.css"),
        "/*__PICKER_CSS__*/": read("picker.css"),
        "/*__KIT_CSS__*/": read("kit.css"),
        "/*__KIT_JS__*/": read("kit.js"),
        "/*__PARSER_JS__*/": read("simulator/parser.js"),
        "/*__DEFAULT_POC_JS__*/": read("simulator/default-poc.js"),
        "/*__GENERATOR_JS__*/": read("simulator/generator.js"),
        "/*__SHELL_JS__*/": read("shell.js"),
        "/*__TOUR_JS__*/": read("tour.js"),
    }

    if custom_project_json_str:
        # If custom requirements were injected via CLI, override DefaultPoc definition
        custom_snippet = f"\nwindow.DefaultPoc = {custom_project_json_str};\n"
        rep["/*__DEFAULT_POC_JS__*/"] = read("simulator/default-poc.js") + custom_snippet

    for marker, content in rep.items():
        safe_content = content.replace("</script", "<\\/script")
        html = html.replace(marker, safe_content)

    out_file = DIST / "poc-simulator.html"
    out_file.write_text(html, encoding="utf-8")

    # Also write dist/prototype-viewer.html as an alias
    alias_file = DIST / "prototype-viewer.html"
    alias_file.write_text(html, encoding="utf-8")

    size_kb = len(html.encode("utf-8")) / 1024
    print(f"✓ Construído com sucesso: {out_file} ({size_kb:.1f} KB)")
    print(f"✓ Alias compatível: {alias_file}")
    return out_file

if __name__ == "__main__":
    build()
