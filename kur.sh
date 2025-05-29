#!/bin/bash

echo "🚀 Code566 VS Code Extension Automatic Installation"
echo "=================================================="
echo ""

# Check if curl or wget is installed
if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
    echo "❌ Error: Neither curl nor wget is installed. Please install one of these commands first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install git first."
    exit 1
fi

# GitHub repository info
REPO_URL="https://github.com/aliv029bmj/code566.git"
REPO_NAME="code566"

# Installation directory
INSTALL_DIR="$HOME/.code566-install"

# Create and navigate to the installation directory
echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || { echo "❌ Failed to create installation directory"; exit 1; }

# Clone the repository
echo "📥 Cloning repository from GitHub..."
if [ -d "$REPO_NAME" ]; then
    echo "📦 Repository already exists, updating..."
    cd "$REPO_NAME" || { echo "❌ Failed to navigate to repository"; exit 1; }
    git pull
else
    git clone "$REPO_URL" "$REPO_NAME"
    cd "$REPO_NAME" || { echo "❌ Failed to navigate to repository"; exit 1; }
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript code
echo "🔨 Compiling TypeScript code..."
npm run compile

# Package the extension
echo "📦 Creating VSIX package..."
npm run package

# Install the extension in VS Code
echo "🔌 Installing extension in VS Code..."
VSIX_FILE=$(ls code566-*.vsix | sort -V | tail -n1)
if [ -n "$VSIX_FILE" ]; then
    code --install-extension "$VSIX_FILE" || { 
        echo "❌ Failed to install extension. Trying manual installation..."; 
        echo "💡 Please install the extension manually from: $INSTALL_DIR/$REPO_NAME/$VSIX_FILE"
    }
    echo "✅ Installation complete! Restart VS Code and type 'Code566: Select Mode' in the command palette to start."
else
    echo "❌ No VSIX file found. Please try installing manually."
    # Find any VSIX file in the directory
    VSIX_FILE=$(ls code566-*.vsix 2>/dev/null)
    if [ -n "$VSIX_FILE" ]; then
        echo "💡 Please install the extension manually from: $INSTALL_DIR/$REPO_NAME/$VSIX_FILE"
    else
        echo "❌ No VSIX file found. Please try installing manually by building the extension first."
    fi
fi

# Print installation summary
echo "
✨ Code566 installation information:
----------------------------------
🔹 Installation directory: $INSTALL_DIR/$REPO_NAME
🔹 VSIX package: $VSIX_FILE
🔹 Command Palette: 'Code566: Select Mode'
"

# Check for errors
if [ -z "$VSIX_FILE" ]; then
    echo "❌ Warning: Installation might not be complete. Try running the installation manually."
    exit 1
fi

echo "🎉 Done! Enjoy Code566 in VS Code!"
exit 0 