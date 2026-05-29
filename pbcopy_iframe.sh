#!/usr/bin/env bash
# pbcopy_iframe.sh <render_url> — substitutes the live URL into SQUARESPACE_EMBED.html
# and copies to the Mac clipboard, ready for a Squarespace 7.1 Code Block.
set -euo pipefail
[[ $# -ge 1 ]] || { echo "Usage: $0 <render-url>" >&2; exit 1; }
URL="${1%/}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
T="${HERE}/SQUARESPACE_EMBED.html"
[[ -f "$T" ]] || { echo "Template missing: $T" >&2; exit 1; }
command -v pbcopy >/dev/null || { echo "pbcopy is macOS-only" >&2; exit 1; }
if command -v curl >/dev/null; then
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$URL/" || echo 000)"
  printf "  %s/ -> HTTP %s\n" "$URL" "$CODE"
fi
sed "s|__RENDER_URL__|${URL}|g" "$T" | pbcopy
echo "  ✓ iframe on clipboard for ${URL}"
