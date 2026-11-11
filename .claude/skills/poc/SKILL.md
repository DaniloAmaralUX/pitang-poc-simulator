---
name: poc
description: Abre o Pitang Labs POC Simulator diretamente no navegador da IDE e renderiza protótipos interativos a partir de requisitos de negócio.
---

# Pitang POC Skill for Claude Code

When the user asks to open the POC simulator, run a prototype, or simulate flows:

1. Execute the CLI command:
   ```bash
   npx pitang-poc
   ```
2. The command automatically starts the local HTTP server and sends the URL `http://localhost:3000/dist/poc-simulator.html` to the IDE's built-in Simple Browser.
3. If the user provides new requirements or business rules in chat:
   - Save or update the requirements in `requirements/`
   - Run `python scripts/build.py`
   - The browser automatically reflects the new flows in real-time.
