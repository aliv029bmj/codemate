#!/bin/bash

# Code566 installation script
echo "🚀 Starting Code566 Installation..."

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
  echo "❌ VS Code is not installed or not in the PATH. Please install VS Code first."
  exit 1
fi

# Navigate to a temporary directory
cd "$(dirname "$0")" || exit 1

# Check if the vsix file already exists
if ls code566-*.vsix 1> /dev/null 2>&1; then
  echo "✅ VSIX package already exists, skipping build step."
else
  # Check if npm is installed
  if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
  fi

  # Install dependencies and build package
  echo "📦 Installing dependencies..."
  npm install

  echo "🔨 Building extension..."
  npm run compile
  npm run package
fi

# Install the extension
echo "🔌 Installing extension..."
VSIX_FILE=$(ls code566-*.vsix | sort -V | tail -n1)
if [ -n "$VSIX_FILE" ]; then
  code --install-extension "$VSIX_FILE"
  echo "✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start."
else
  echo "❌ Failed to find VSIX package."
  exit 1
fi

# Installation successful, provide instructions for manual installation if needed
if [ $? -ne 0 ]; then
  echo "⚠️ Automatic installation failed. Please install manually:"
  VSIX_FILE=$(ls code566-*.vsix | sort -V | tail -n1)
  echo "1. Open VS Code"
  echo "2. Press Ctrl+Shift+X to open Extensions view"
  echo "3. Click ... (More Actions) and select 'Install from VSIX...'"
  echo "4. Browse to and select: $(pwd)/$VSIX_FILE"
fi 