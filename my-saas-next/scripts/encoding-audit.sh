#!/bin/bash
# Encoding audit script - Finds non-UTF-8 files

echo "🔍 Scanning for non-UTF-8 files..."
echo ""

non_utf8_count=0

# Scan TypeScript and TypeScript React files
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) | while read file; do
  if ! file "$file" | grep -q "UTF-8"; then
    echo "⚠️  Non-UTF-8 file detected: $file"
    echo "   Encoding: $(file -b --mime-encoding "$file")"
    echo ""
    ((non_utf8_count++))
  fi
done

if [ $non_utf8_count -eq 0 ]; then
  echo "✅ All files are UTF-8 encoded!"
else
  echo "❌ Found $non_utf8_count non-UTF-8 files"
  echo "   Run 'iconv -f WINDOWS-1252 -t UTF-8 <file> > <file>.utf8' to convert"
fi

echo ""
echo "✅ Encoding audit complete"
