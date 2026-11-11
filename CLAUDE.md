# Pitang Labs POC Simulator - Claude Code Guide

This project is an interactive HTML POC Simulator that turns user requirements and business rules into high-fidelity interactive prototypes mapped across flow categories.

## Commands for Claude Code

### Open Simulator in IDE Browser
```bash
npx pitang-poc
```
This starts the local server on `http://localhost:3000` and automatically opens the IDE's internal Simple Browser (VS Code / Cursor / Codex).

### Update Requirements
To generate or update flows based on user prompt, save markdown requirements in `requirements/` and rebuild:
```bash
python scripts/build.py
```
Or send via the local API:
```bash
curl -X POST http://localhost:3000/api/requirements --data-binary @"./requirements/custom.md"
```

## Design Engineering Standards
- **Emil Kowalski**: Glass floating pill picker, cubic-bezier(0.23, 1, 0.32, 1) timing, active scale 0.97, keyboard shortcuts (`1-N`, `←`/`→`, `R`).
- **Jakub Krehel**: Concentric border-radii ($R_{outer} = R_{inner} + P$), scale-on-press 0.96, tabular numbers, minimum 44px touch targets.
- **Breakpoints**: iOS 390px (Dynamic Island), Android 412px (M3 + FAB), Web Desktop 1280px (Kanban + KPI header).
