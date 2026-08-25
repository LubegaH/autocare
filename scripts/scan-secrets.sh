#!/bin/sh

set -eu

gitleaks_bin=${GITLEAKS_BIN:-gitleaks}

"$gitleaks_bin" git --redact --verbose
