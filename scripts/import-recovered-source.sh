#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-INAD_Article12_v6_1_KR.html}"
EXPECTED_SHA256="53bee5c1a4fe72a78f5e42eca1f3de0e11623e5d2ded752e995116c742a3a812"
EXPECTED_SIZE="1514881"

if [[ ! -f "$SOURCE" ]]; then
  echo "error: recovered source not found: $SOURCE" >&2
  exit 1
fi

actual_size="$(wc -c < "$SOURCE" | tr -d ' ')"
if [[ "$actual_size" != "$EXPECTED_SIZE" ]]; then
  echo "error: size mismatch: expected $EXPECTED_SIZE, got $actual_size" >&2
  exit 1
fi

if command -v shasum >/dev/null 2>&1; then
  actual_sha="$(shasum -a 256 "$SOURCE" | awk '{print $1}')"
elif command -v sha256sum >/dev/null 2>&1; then
  actual_sha="$(sha256sum "$SOURCE" | awk '{print $1}')"
else
  echo "error: shasum or sha256sum is required" >&2
  exit 1
fi

if [[ "$actual_sha" != "$EXPECTED_SHA256" ]]; then
  echo "error: SHA-256 mismatch" >&2
  echo "expected: $EXPECTED_SHA256" >&2
  echo "actual:   $actual_sha" >&2
  exit 1
fi

cp "$SOURCE" index.html

echo "Recovered v6.1 source imported as index.html"
echo "SHA-256: $actual_sha"
echo "Size: $actual_size bytes"
