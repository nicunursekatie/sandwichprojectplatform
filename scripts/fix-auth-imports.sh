#!/bin/bash

# Fix all useAuth imports to use the new AuthContext
echo "Fixing useAuth imports..."

# Find all files that import useAuth from hooks/useAuth and update them
find client/src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "import.*useAuth.*from.*[\"']@/hooks/useAuth[\"']" "$file"; then
    echo "Updating $file"
    # Replace the import statement
    sed -i '' "s|import { useAuth } from [\"']@/hooks/useAuth[\"'];|import { useAuth } from '@/contexts/AuthContext';|g" "$file"
  fi
done

echo "Done! Fixed all useAuth imports."