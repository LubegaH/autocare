#!/bin/sh

set -eu

types_file=$(mktemp /tmp/autocare-db-types.XXXXXX)
trap 'rm -f "$types_file"' EXIT

supabase gen types --lang typescript --local > "$types_file"
test -s "$types_file"
mv "$types_file" src/shared/supabase/database.types.ts

trap - EXIT
