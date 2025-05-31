#!/bin/bash

# Test script for working Linux builds
set -e

cd "$(dirname "$0")/.."

echo "🧪 Testing working Linux package formats..."
echo "==========================================="

# Test each working format individually
FORMATS=("deb" "AppImage" "snap" "tar.gz")

for format in "${FORMATS[@]}"; do
    echo
    echo "🔨 Building $format package..."
    
    case $format in
        "deb")
            npm run dist:linux:deb
            ;;
        "AppImage")
            npm run dist:linux:appimage
            ;;
        "snap")
            npm run dist:linux:snap
            ;;
        "tar.gz")
            npm run dist:linux:tar
            ;;
    esac
    
    echo "✅ $format build completed"
done

echo
echo "📦 Final package summary:"
echo "========================"

if [ -d "dist" ]; then
    find dist -name "*.deb" -o -name "*.AppImage" -o -name "*.snap" -o -name "*.tar.gz" | while read -r file; do
        if [ -f "$file" ]; then
            size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            size_mb=$((size / 1024 / 1024))
            echo "✅ $(basename "$file") - ${size_mb}MB"
        fi
    done
else
    echo "❌ No dist directory found"
fi

echo
echo "🎉 All working Linux builds completed successfully!"
