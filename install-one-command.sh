#!/bin/bash

# Code566 One-Command Installation Script
echo "🚀 Starting Code566 One-Command Installation..."

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

# Clone the repository
echo "📥 Cloning repository..."
git clone https://github.com/aliv029bmj/codemate.git
cd codemate || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build and package
echo "🔨 Building extension..."
npm run compile
npm run package

# Install extension
echo "🔌 Installing extension to VS Code..."
VSIX_FILE=$(ls code566-*.vsix 2>/dev/null)
if [ -n "$VSIX_FILE" ]; then
    code --install-extension "$VSIX_FILE"
    echo "✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start."
else
    echo "❌ Failed to build extension package."
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
cd ~ || exit 1
rm -rf "$TEMP_DIR"

echo "🎉 Code566 successfully installed!" 