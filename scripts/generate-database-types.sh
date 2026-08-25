#!/bin/sh

set -eu

database_target=${1:---local}

case "$database_target" in
  --local | --linked) ;;
  *)
    echo "usage: $0 [--local|--linked]" >&2
    exit 2
    ;;
esac

types_file=$(mktemp src/shared/supabase/database.types.XXXXXX.ts)
formatted_types_file="$types_file.formatted.ts"
trap 'rm -f "$types_file" "$formatted_types_file"' EXIT

supabase gen types --lang typescript "$database_target" > "$types_file"
test -s "$types_file"
prettier "$types_file" > "$formatted_types_file"
test -s "$formatted_types_file"
mv "$formatted_types_file" src/shared/supabase/database.types.ts
rm -f "$types_file"

trap - EXIT
