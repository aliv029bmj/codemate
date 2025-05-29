#!/bin/bash

echo "🚀 CodeMate VS Code Extension Automatic Installation"
echo "==================================================="

# Check required commands
check_command() {
  command -v $1 >/dev/null 2>&1 || { echo "❌ $1 not found. Please install $1."; exit 1; }
}

check_command git
check_command npm
check_command node

# GitHub repo information
REPO_URL="https://github.com/aliv029bmj/codemate.git"
REPO_NAME="codemate"

# Create installation folder in user's home directory
INSTALL_DIR="$HOME/.codemate-install"
mkdir -p $INSTALL_DIR

echo "📥 Downloading latest code from GitHub..."
if [ -d "$INSTALL_DIR/$REPO_NAME" ]; then
  echo "ℹ️ Updating existing repository..."
  cd "$INSTALL_DIR/$REPO_NAME"
  git pull
else
  echo "ℹ️ Cloning repository..."
  git clone $REPO_URL "$INSTALL_DIR/$REPO_NAME"
  cd "$INSTALL_DIR/$REPO_NAME"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Compiling code..."
npm run compile

# Check and install vsce if needed
if ! command -v vsce >/dev/null 2>&1; then
  echo "📥 vsce not installed, installing now..."
  npm install -g @vscode/vsce
fi

echo "📦 Creating VSIX package..."
vsce package

# Check if VS Code is available
if command -v code >/dev/null 2>&1; then
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "🔌 Installing extension to VS Code: $VSIX_FILE"
    code --install-extension "$VSIX_FILE"
    echo "✅ Installation complete! Restart VS Code and type 'CodeMate: Select Mode' in the command palette to start."
    
    # Cleanup
    echo "🧹 Cleaning up temporary files..."
    VSIX_PATH="$INSTALL_DIR/$REPO_NAME/$VSIX_FILE"
    cp "$VSIX_FILE" "$HOME/$VSIX_FILE"
    echo "📋 VSIX file copied to your home directory: $HOME/$VSIX_FILE"
  else
    echo "❌ Failed to create VSIX file."
  fi
else
  VSIX_FILE=$(ls codemate-*.vsix | sort -V | tail -n1)
  if [ -n "$VSIX_FILE" ]; then
    echo "⚠️ VS Code CLI not found. You'll need to install the VSIX package manually."
    cp "$VSIX_FILE" "$HOME/$VSIX_FILE"
    echo "📋 VSIX file copied to your home directory: $HOME/$VSIX_FILE"
    echo "📝 To install, use the 'Install from VSIX...' option in the Extensions panel (...) menu in VS Code."
  else
    echo "❌ Failed to create VSIX file."
  fi
fi

echo "
✨ CodeMate installation information:
---------------------------------
🔹 Repository: $REPO_URL
🔹 Installation folder: $INSTALL_DIR/$REPO_NAME
🔹 VSIX file: $HOME/$VSIX_FILE
🔹 Command Palette: 'CodeMate: Select Mode'
" 