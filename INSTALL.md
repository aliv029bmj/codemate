# Code566 Installation Guide

This document provides detailed instructions for installing the Code566 VS Code extension through various methods.

## Method 1: Install from VS Code Marketplace (Recommended)

The easiest way to install Code566 is directly from the VS Code Marketplace:

1. Open VS Code
2. Click the Extensions view icon in the Sidebar or press `Ctrl+Shift+X`
3. Search for "Code566"
4. Click Install
5. Reload VS Code when prompted

## Method 2: Install from VSIX File

If you have a Code566 VSIX file (for example, downloaded from GitHub releases):

1. Open VS Code
2. Click the Extensions view icon in the Sidebar or press `Ctrl+Shift+X`
3. Click the "..." menu in the Extensions view
4. Select "Install from VSIX..."
5. Navigate to and select the Code566 VSIX file
6. Reload VS Code when prompted

## Method 3: Build and Install from Source

For developers or users who want to build the extension from source:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

### Steps

```bash
# Clone the repository
git clone https://github.com/aliv029bmj/codemate.git

# Navigate to the repository folder
cd codemate

# Install dependencies
npm install

# Compile the TypeScript code
npm run compile

# Package the extension
npm run package
# This will create a file named code566-X.X.X.vsix in the project root

# Install the extension to VS Code
code --install-extension code566-*.vsix
```

### Troubleshooting Build Issues

If you encounter any issues during the build process:

1. Make sure Node.js is correctly installed:
   ```bash
   node --version
   # Should output v14.0.0 or higher
   ```

2. Try cleaning the project:
   ```bash
   # Remove node_modules and compiled output
   rm -rf node_modules out dist
   
   # Reinstall dependencies
   npm install
   
   # Recompile
   npm run compile
   ```

3. If you see TypeScript errors, try running:
   ```bash
   npx tsc --noEmit
   ```
   This will show all TypeScript errors without generating output files.

## Method 4: Quick Install Script

For Linux and macOS users, we provide a quick installation script:

```bash
# Make the script executable
chmod +x ./scripts/install.sh

# Run the installation script
./scripts/install.sh
```

For Windows users:

```powershell
# Run the PowerShell installation script
.\scripts\install.ps1
```

## Verifying Installation

To verify that Code566 has been installed correctly:

1. Open VS Code
2. Open the Command Palette (`Ctrl+Shift+P` or `F1`)
3. Type "Code566: Select Mode" and press Enter
4. If you see the mode selection menu, the extension is installed correctly

## Updating the Extension

### From VS Code Marketplace

VS Code will automatically notify you when updates are available. To manually check:

1. Open VS Code
2. Go to the Extensions view
3. If updates are available, you'll see an update button

### From Source

To update a version you built from source:

1. Navigate to the repository folder
2. Pull the latest changes:
   ```bash
   git pull
   ```
3. Install dependencies, compile, and package as described above
4. Install the new VSIX file

## Uninstalling Code566

1. Open VS Code
2. Go to the Extensions view
3. Find Code566 in your installed extensions
4. Click the gear icon and select "Uninstall"
5. Reload VS Code when prompted

## Support

If you encounter any issues during installation, please:

1. Check the [GitHub Issues](https://github.com/aliv029bmj/codemate/issues) to see if your problem has been reported
2. Open a new issue if needed, including:
   - Your OS and VS Code version
   - Detailed steps to reproduce the issue
   - Any error messages 