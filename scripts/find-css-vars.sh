#!/bin/bash

# Define the regex pattern
pattern='\--[a-z0-9]+(-[a-z0-9]+)*'
file_1='results.txt'
file_1_sorted='results-sorted.txt'
file_2='bloom-tokens.txt'
file_2_sorted='bloom-tokens-sorted.txt'
file_results='token-diff.txt'

grep -rhoE "$pattern" \
    --exclude-dir="node_modules" \
    --exclude-dir="jest" \
    --exclude-dir="storybook-static" \
    --exclude-dir="models" \
    --exclude-dir=".next" \
    --exclude-dir=".turbo" \
    --exclude="package.json" \
    --exclude="*.test.*" \
    --exclude="*.sh" \
    --exclude="Dockerfile*" \
    apps/ > "$file_1"

# sort results
sort "$file_1" | uniq > "$file_1_sorted"


# get bloom tokens
grep -rhoE "$pattern"  \
    --exclude-dir="jest" \
    --exclude-dir="storybook-static" \
    --exclude-dir="models" \
    --exclude-dir=".next" \
    --exclude-dir=".turbo" \
    --exclude="package.json" \
    --exclude="*.test.*" \
    --exclude="*.sh" \
    --exclude="Dockerfile*" \
    apps/ops/node_modules/@zinnia/bloom > "$file_2"

grep -rhoE "$pattern"  \
    --exclude-dir="jest" \
    --exclude-dir="storybook-static" \
    --exclude-dir="models" \
    --exclude-dir=".next" \
    --exclude-dir=".turbo" \
    --exclude="package.json" \
    --exclude="*.test.*" \
    --exclude="*.sh" \
    --exclude="Dockerfile*" \
    apps/consumer-experience/node_modules/@zinnia/bloom >> "$file_2"


# sort results
sort "$file_2" | uniq > "$file_2_sorted"


# check diff
comm --nocheck-order -23 "$file_1_sorted" "$file_2_sorted" > "$file_results"

# remove intermediary files
rm "$file_2" "$file_2_sorted" "$file_1" "$file_1_sorted"