#!/usr/bin/env bash
set -e
echo "==================================================="
echo "  PITANG LABS · SIMULADOR DE POC EM HTML"
echo "==================================================="
python3 scripts/simulate.py "$@"
echo ""
echo "Abrindo servidor com Hot-Reload..."
python3 scripts/serve.py
