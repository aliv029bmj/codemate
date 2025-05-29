#!/bin/bash

# Code566 Simple Installation Script
echo "🚀 Starting Code566 Simple Installation..."

# Check for VS Code
if ! command -v code &> /dev/null; then
    echo "❌ VS Code not found. Please install VS Code first."
    echo "Visit https://code.visualstudio.com/download for installation instructions."
    exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR" || exit 1

# Get latest release URL
echo "📥 Downloading the latest release..."
REPO_URL="https://github.com/aliv029bmj/codemate"
LATEST_VSIX_URL="${REPO_URL}/raw/main/code566-0.2.0.vsix"

# Download VSIX
if command -v curl &> /dev/null; then
    curl -L -o code566.vsix "$LATEST_VSIX_URL"
elif command -v wget &> /dev/null; then
    wget -O code566.vsix "$LATEST_VSIX_URL"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Check if download was successful
if [ ! -f code566.vsix ]; then
    echo "❌ Failed to download the extension package."
    exit 1
fi

# Install extension
echo "🔌 Installing extension to VS Code..."
code --install-extension code566.vsix

if [ $? -eq 0 ]; then
    echo "✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start."
else
    echo "❌ Failed to install the extension."
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
cd ~ || exit 1
rm -rf "$TEMP_DIR"

echo "🎉 Code566 successfully installed!" 