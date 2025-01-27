#!/bin/bash

APP=$1
PATTERN='(--\w*)(-\w+)+'
SUCCESS='\033[0;32m'
WARNING='\033[0;33m'
ERROR='\033[0;31m'
NO_COLOR='\033[0m'

if [ -z "$APP" ]; then
    echo "Usage: $0 <cui|ops>"
    exit 1
fi

if [[ $APP == "cui" ]]; then
    APP="consumer-experience"
fi

if [ ! -d "apps/$APP" ]; then
    echo "Invalid app: $APP"
    echo "Usage: $0 <cui|ops>"
    exit 1
fi

APP_SRC="apps/$APP/src"
BLOOM_SRC="apps/$APP/node_modules/@zinnia/bloom"
file_1="tokens-$APP.txt"
file_2='tokens-bloom.txt'
file_1_sorted="$file_1-sorted.txt"
file_2_sorted="$file_2-sorted.txt"
file_results="tokens-diff-$APP.txt"

grep_tokens() {
    # grep for tokens
    # -r = recurse into subdirectories
    # -h = hide file names and line numbers
    #      (we will add them back in later) removing them helps with finding missing tokens
    # -o = print only matching part of line, to make it more readable
    # -E = extended regexp so we can use capture groups for tokens '()'
    # -I = ignore binary files
    # --exclude-dir = ignore directories
    grep -rhoIE "$PATTERN" \
        --exclude-dir="jest" \
        --exclude-dir="storybook-static" \
        --exclude-dir="models" \
        --exclude-dir=".next" \
        --exclude-dir=".turbo" \
        --exclude="package.json" \
        --exclude="*.test.*" \
        --exclude="*.sh" \
        --exclude="Dockerfile*" \
        $1 >$2
}

sort_files() {
    # sort organizes the tokens alphabetically
    # -u removes duplicates
    sort -u "$1" >"$2"
}

echo -e "\n${SUCCESS}Checking for missing tokens in $APP_SRC ${NO_COLOR}"

# get tokens
grep_tokens "$APP_SRC" "$file_1"

# sort results and remove duplicates
sort_files "$file_1" "$file_1_sorted"

# get bloom tokens
grep_tokens "$BLOOM_SRC" "$file_2"

# sort results and remove duplicates
sort_files "$file_2" "$file_2_sorted"

# check diff
# --nocheck-order = ignore order
# -23 = suppress common lines in files 2 and 3
# this leaves only lines unique to file 1
# which in this case is the tokens in $APP
comm --nocheck-order -23 "$file_1_sorted" "$file_2_sorted" >"$file_results"

# remove intermediary files
rm "$file_2" "$file_2_sorted" "$file_1" "$file_1_sorted"

# wc = word count
# -l = line count
total_diff=$(wc -l <"$file_results")

if [ $total_diff -eq 0 ]; then
    echo -e "${SUCCESS} $total_diff ${WARNING}tokens in $APP not present in Bloom ${NO_COLOR}\n"
    exit 0
elif [ $total_diff -gt 0 ]; then
    temp_file="$file_results.tmp.txt"

    # tell user which tokens are missing
    if [ $total_diff -eq 1 ]; then
        echo -e "\n${WARNING}Token in $APP not present in Bloom: ${ERROR}$total_diff${NO_COLOR}\n"
    else
        echo -e "\n${ERROR}$total_diff ${WARNING}Tokens in $APP not present in Bloom: ${ERROR}$total_diff${NO_COLOR}\n"
    fi

    # print results with color
    # --color = print results with color
    # -n = print line numbers
    # -o = print only matching part of line, to make it more readable
    # -r = recurse into subdirectories
    # -T = line up tabs for better readability
    # -f = take patterns from file (the one we saved tokens to)
    echo -e "\n$(grep --color='always' -norT -f "$file_results" "$APP_SRC")\n"

    # save results to temp file with no color
    # -n = print line numbers
    # -r = recurse into subdirectories
    # -T = line up tabs for better readability
    # -H = prints file names and line numbers to help finding tokens
    grep -nrTH -f "$file_results" "$APP_SRC" >"$temp_file"

    #  overwrite results file with line numbers and locations
    cat "$temp_file" >"$file_results"

    # remove temp file
    rm "$temp_file"

    echo -e "\n${SUCCESS}Full results saved to $file_results\n${NO_COLOR}"

    # exit with success since we found tokens, even if they are not in bloom
    exit 0
fi
