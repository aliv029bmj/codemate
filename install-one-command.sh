#!/bin/bash

# Code566 One-Command Installation Script
echo "🚀 Starting Code566 One-Command Installation..."

# Check for Node.js and npm
check_nodejs() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Installing Node.js and npm..."
        
        # Detect OS
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$NAME
        else
            OS=$(uname -s)
        fi
        
        # Install Node.js based on OS
        case "$OS" in
            "Ubuntu"*|"Debian"*)
                sudo apt update
                sudo apt install -y nodejs npm
                ;;
            "Fedora"*|"CentOS"*|"Red Hat"*)
                sudo dnf install -y nodejs npm
                ;;
            "Arch"*)
                sudo pacman -Sy nodejs npm
                ;;
            "Darwin")  # macOS
                echo "Please install Node.js and npm using Homebrew with: brew install node"
                echo "Then run this script again."
                exit 1
                ;;
            *)
                echo "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
                exit 1
                ;;
        esac
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install npm manually."
        exit 1
    fi
    
    echo "✅ Node.js and npm are installed."
}

# Check for VS Code
check_vscode() {
    if ! command -v code &> /dev/null; then
        echo "❌ VS Code not found. Please install VS Code first."
        echo "Visit https://code.visualstudio.com/download for installation instructions."
        exit 1
    fi
    echo "✅ VS Code is installed."
}

# Run prerequisite checks
check_nodejs
check_vscode

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