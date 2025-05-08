# Run this script in the root of your project directory
find . -not -path "./node_modules/*" -not -path "./.next/*"  -type f -name "*helper.*"| while read -r file; do
    new_file=$(echo "$file" | sed 's/\helper\./\helpers\./')
    mv "$file" "$new_file"
done

# Run this script in the root of your project directory
find . -not -path "./node_modules/*" -not -path "./.next/*"  -type f -name "*util.*"| while read -r file; do
    new_file=$(echo "$file" | sed 's/\util\./\utils\./')
    mv "$file" "$new_file"
done
