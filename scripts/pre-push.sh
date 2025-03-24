#!/bin/bash

# Navigate to the root directory of the repository
cd "$(git rev-parse --show-toplevel)"

# Get list of changed files between the previous commit and the current commit
changed=$(git diff --name-only HEAD^1 -- apps/*)
if [ -n "$changed" ]; then
  processed_apps=()
  for app in $changed; do
  package_name=$(echo $app | cut -d'/' -f2)

    if [[ ! " ${processed_apps[@]} " =~ " ${package_name} " ]]; then
      turbo run pre-push --filter=$package_name
      processed_apps+=($package_name)
    fi
  done
fi