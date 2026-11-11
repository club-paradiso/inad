#!/usr/bin/env bash
# Local NPC model server for development: Kakao Kanana 1.5 2.1B Instruct (the default model, api/_npc/config.js
# DEFAULT_MODEL) as a 4-bit GGUF behind an OpenAI-compatible API on 127.0.0.1. Nothing here runs in production.
#
#   npm run npc:local                      # terminal 1 — downloads ~1.5 GB once, then serves on :8081
#   INAD_NPC_PROVIDER=llamacpp INAD_LLM_BASE_URL=http://127.0.0.1:8081/v1 npm run dev     # terminal 2
#
# Needs: python3 with llama-cpp-python[server] (pip install "llama-cpp-python[server]"), network access to
# huggingface.co and its CDN for the first download. The GGUF is a community conversion (DevQuasar); Kakao
# publishes no official GGUF. Licence of the weights: Apache-2.0 (kakaocorp/kanana-1.5-2.1b-instruct-2505).
set -euo pipefail
DIR="${INAD_MODEL_DIR:-$HOME/.cache/inad-models}"
PORT="${PORT:-8081}"
REPO="DevQuasar/kakaocorp.kanana-1.5-2.1b-instruct-2505-GGUF"
FILE="kakaocorp.kanana-1.5-2.1b-instruct-2505.Q4_K_M.gguf"
SIZE=1522796768   # bytes, as listed on huggingface.co (2026-11-11)
MODEL_ID="kakaocorp/kanana-1.5-2.1b-instruct-2505"
PY="${PYTHON:-python3}"

"$PY" -c 'import llama_cpp.server' 2>/dev/null || { echo "llama-cpp-python[server] is not installed for $PY:"; echo "  pip install \"llama-cpp-python[server]\""; exit 1; }
mkdir -p "$DIR"
if [ "$(stat -c %s "$DIR/$FILE" 2>/dev/null || echo 0)" != "$SIZE" ]; then
  echo "downloading $FILE → $DIR"
  curl -fL --retry 5 -C - -o "$DIR/$FILE" "https://huggingface.co/$REPO/resolve/main/$FILE"
fi
[ "$(stat -c %s "$DIR/$FILE")" = "$SIZE" ] || { echo "unexpected file size for $DIR/$FILE"; exit 1; }
echo "serving $MODEL_ID on http://127.0.0.1:$PORT/v1"
exec "$PY" -m llama_cpp.server --model "$DIR/$FILE" --model_alias "$MODEL_ID" --host 127.0.0.1 --port "$PORT" --n_ctx 4096
