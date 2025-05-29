#!/bin/bash

# Code566 Installer Script
echo "=========================================="
echo "   Code566 VS Code Extension Installer    "
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
  echo "Error: Node.js is not installed."
  echo "Please install Node.js from https://nodejs.org/ and try again."
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d "v" -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d "." -f 1)

if [ "$NODE_MAJOR" -lt 14 ]; then
  echo "Warning: Node.js version $NODE_VERSION detected."
  echo "Code566 recommends Node.js v14 or later."
  echo ""
  echo "Do you want to continue anyway? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
  fi
fi

# Check if Git is installed
if ! command_exists git; then
  echo "Error: Git is not installed."
  echo "Please install Git and try again."
  exit 1
fi

# Check if VS Code is installed
if ! command_exists code; then
  echo "Warning: VS Code command line tools not found."
  echo "Manual installation of the extension may be required."
  echo ""
  echo "Do you want to continue anyway? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 1
  fi
fi

# Main installation process
echo "Choose installation method:"
echo "1) Full build from source (requires Node.js, Git)"
echo "2) Install pre-built VSIX package (faster)"
read -r choice

case $choice in
  1)
    echo "Building extension from source..."
    echo ""

    # Ensure we're in the right directory (the repo root)
    if [ -f "package.json" ] && grep -q "code566" "package.json"; then
      # We're already in the repo directory
      echo "Repository detected."
    else
      # Check if we're in the scripts directory
      if [ -f "../package.json" ] && grep -q "code566" "../package.json"; then
        cd ..
        echo "Changed to repository root directory."
      else
        # Try to clone the repo
        echo "Repository not found. Cloning from GitHub..."
        git clone https://github.com/aliv029bmj/codemate.git
        cd codemate
      fi
    fi

    # Install dependencies
    echo "Installing dependencies..."
    npm install

    # Compile TypeScript
    echo "Compiling TypeScript..."
    npm run compile

    # Package the extension
    echo "Packaging extension..."
    npm run package
    
    # Find the generated VSIX file
    VSIX_FILE=$(find . -maxdepth 1 -name "code566-*.vsix" | sort -V | tail -n1)
    
    if [ -z "$VSIX_FILE" ]; then
      echo "Error: Could not find the generated VSIX file."
      echo "Try running 'npm run package' manually."
      exit 1
    fi
    
    # Install the extension
    if command_exists code; then
      echo "Installing extension to VS Code..."
      code --install-extension "$VSIX_FILE"
      
      if [ $? -eq 0 ]; then
        echo "Installation successful!"
        echo "Restart VS Code and use the Command Palette to select a Code566 mode."
      else
        echo "Error during installation."
        echo "Try manually installing the VSIX file from: $VSIX_FILE"
      fi
    else
      echo "VS Code command line tools not available."
      echo "Please manually install the VSIX file from: $VSIX_FILE"
    fi
    ;;
    
  2)
    echo "Installing pre-built VSIX package..."
    echo ""
    
    # Create a temporary directory
    TEMP_DIR=$(mktemp -d)
    
    # Find latest release VSIX URL
    VSIX_URL="https://github.com/aliv029bmj/codemate/releases/latest/download/code566.vsix"
    
    # Download the VSIX file
    echo "Downloading extension package..."
    if command_exists curl; then
      curl -L "$VSIX_URL" -o "$TEMP_DIR/code566.vsix"
    elif command_exists wget; then
      wget "$VSIX_URL" -O "$TEMP_DIR/code566.vsix"
    else
      echo "Error: Neither curl nor wget is installed."
      echo "Please install one of these utilities and try again."
      exit 1
    fi
    
    # Check if download was successful
    if [ ! -f "$TEMP_DIR/code566.vsix" ]; then
      echo "Error: Failed to download the extension package."
      exit 1
    fi
    
    # Install the extension
    if command_exists code; then
      echo "Installing extension to VS Code..."
      code --install-extension "$TEMP_DIR/code566.vsix"
      
      if [ $? -eq 0 ]; then
        echo "Installation successful!"
        echo "Restart VS Code and use the Command Palette to select a Code566 mode."
      else
        echo "Error during installation."
        echo "Try manually installing the VSIX file from: $TEMP_DIR/code566.vsix"
      fi
    else
      echo "VS Code command line tools not available."
      echo "Please manually install the VSIX file from: $TEMP_DIR/code566.vsix"
    fi
    
    # Clean up
    rm -rf "$TEMP_DIR"
    ;;
    
  *)
    echo "Invalid choice. Installation cancelled."
    exit 1
    ;;
esac

echo ""
echo "Thank you for installing Code566!"
echo "To start using the extension:"
echo "1. Open VS Code"
echo "2. Open the Command Palette (Ctrl+Shift+P or F1)"
echo "3. Type 'Code566: Select Mode' and press Enter"
echo "4. Choose your preferred mode from the list"
echo ""
echo "Enjoy coding with Code566!" 