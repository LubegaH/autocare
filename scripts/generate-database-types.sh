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
normalized_types_file="$types_file.normalized.ts"
formatted_types_file="$types_file.formatted.ts"
trap 'rm -f "$types_file" "$normalized_types_file" "$formatted_types_file"' EXIT

supabase gen types --lang typescript "$database_target" > "$types_file"
test -s "$types_file"
sed \
  -e '/^  \/\/ Allows to automatically instantiate createClient with right options$/d' \
  -e '/^  \/\/ instead of createClient<Database, { PostgrestVersion:/d' \
  -e '/^  __InternalSupabase: {$/,/^  }$/d' \
  "$types_file" > "$normalized_types_file"
prettier "$normalized_types_file" > "$formatted_types_file"
test -s "$formatted_types_file"
mv "$formatted_types_file" src/shared/supabase/database.types.ts
rm -f "$types_file" "$normalized_types_file"

trap - EXIT
