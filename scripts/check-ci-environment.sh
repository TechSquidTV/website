#!/usr/bin/env bash
set -euo pipefail

missing=0
for name in "$@"; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::Missing $name. Configure it in the production GitHub environment or repository settings before running this workflow."
    missing=1
  fi
done

exit "$missing"
