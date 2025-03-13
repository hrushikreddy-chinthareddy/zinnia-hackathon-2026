#!/bin/bash

changed=$(git diff --name-only HEAD~1..HEAD -- apps/*)

if [ -n "$changed" ]; then
  processed_apps=()
  for app in $changed; do
    package_name=$(basename $(dirname $app))
    if [[ ! " ${processed_apps[@]} " =~ " ${package_name} " ]]; then
      turbo run pre-push --filter=$package_name
      processed_apps+=($package_name)
    fi
  done
fi
