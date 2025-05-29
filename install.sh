#!/bin/bash

# CodeMate installation script
echo "🚀 Starting CodeMate Installation..."

# Check if required commands exist
command -v npm >/dev/null 2>&1 || { echo "❌ npm not found. Please install Node.js."; exit 1; }
command -v code >/dev/null 2>&1 || { echo "⚠️ VS Code CLI not found. Automatic package installation will not be available."; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile
echo "🔨 Compiling code..."
npm run compile

# Check if vsce is installed
if ! command -v vsce >/dev/null 2>&1; then
  echo "📥 vsce not installed, installing now..."
  npm install -g @vscode/vsce
fi

# Create VSIX package
echo "📦 Creating VSIX package..."
vsce package

# Install package if VS Code CLI is available
if command -v code >/dev/null 2>&1; then
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "🔌 Installing extension to VS Code: $VSIX_FILE"
    code --install-extension "$VSIX_FILE"
    echo "✅ Installation complete! Restart VS Code and type 'CodeMate: Select Mode' in the command palette to start."
  else
    echo "❌ VSIX file not found."
  fi
else
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  echo "⚠️ VS Code CLI not found. Please install this VSIX package manually: $VSIX_FILE"
  echo "📝 To install, use the 'Install from VSIX...' option in the Extensions panel (...) menu in VS Code."
fi 