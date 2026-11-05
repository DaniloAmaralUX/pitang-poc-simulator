#!/usr/bin/env python3
"""Inline the template into dist/prototype-viewer.html (one self-contained file)."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
read = lambda p: (SRC / p).read_text(encoding="utf-8")
html = read("index.html")
rep = {
    "/*__SHELL_CSS__*/": read("shell.css"),
    "/*__PICKER_CSS__*/": read("picker.css"),
    "/*__KIT_CSS__*/": read("kit.css"),
    "/*__SCREENS_CSS__*/": "",
    "/*__KIT_JS__*/": read("kit.js"),
    "/*__SHELL_JS__*/": read("shell.js") + "\n" + read("tour.js"),
    "/*__SCREENS_JS__*/": read("screens/screens.js"),
}
for k, v in rep.items():
    html = html.replace(k, v.replace("</script", "<\\/script"))
out = ROOT.parent / "dist" / "prototype-viewer.html"
out.write_text(html, encoding="utf-8")
print("built", out, len(html) // 1024, "KB")
