#!/bin/bash

# Code566 Simple Installation Script
echo "🚀 Starting Code566 Simple Installation..."

# Check for VS Code
if ! command -v code &> /dev/null; then
    echo "❌ VS Code not found. Please install VS Code first."
    echo "Visit https://code.visualstudio.com/download for installation instructions."
    exit 1
fi

# Check for required tools
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

echo "📥 Cloning repository..."
git clone https://github.com/aliv029bmj/codemate.git
cd codemate || exit 1

# Option 1: If prebuilt VSIX is available in the repository
if [ -f code566-*.vsix ]; then
    echo "✅ Found prebuilt VSIX package."
    VSIX_FILE=$(ls code566-*.vsix | head -1)
else
    # Option 2: Check if npm is available for building
    if command -v npm &> /dev/null; then
        echo "📦 Installing dependencies and building package..."
        npm install
        npm run compile
        npm run package
        
        if [ -f code566-*.vsix ]; then
            VSIX_FILE=$(ls code566-*.vsix | head -1)
        else
            echo "❌ Failed to build VSIX package."
            exit 1
        fi
    else
        echo "❌ Neither prebuilt VSIX found nor npm available to build it."
        exit 1
    fi
fi

# Install extension
echo "🔌 Installing extension to VS Code..."
echo "Using VSIX file: $VSIX_FILE"

code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start."
else
    echo "❌ Failed to install the extension."
    echo "Try installing manually: code --install-extension $TEMP_DIR/codemate/$VSIX_FILE"
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
cd ~ || exit 1
rm -rf "$TEMP_DIR"

echo "🎉 Code566 successfully installed!" 