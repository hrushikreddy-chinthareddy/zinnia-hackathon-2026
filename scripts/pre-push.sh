#!/bin/bash

changed=$(git diff --name-only HEAD~1..HEAD -- apps/*)

if [ -n "$changed" ]; then
  for app in $changed; do
    package_name=$(basename $(dirname $app))
    turbo run pre-push --filter=$package_name
  done
fi
