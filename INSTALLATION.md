# Code566 Installation Instructions

There are several ways to install Code566 in VS Code. You can choose the method that works best for you.

## Automatic Installation Script

### Windows
1. Double click on `install.bat` in the repository
2. Wait for the installation to complete
3. Open the command palette (F1 or Ctrl+Shift+P) and type "Code566: Select Mode"

Note: If you encounter any issues, try running the script as an administrator.

### macOS & Linux
1. Open a terminal in the repository directory
2. Run: `./install.sh`
3. Open the command palette (F1 or Cmd+Shift+P) and type "Code566: Select Mode"

Note: You might need to make the script executable with `chmod +x install.sh` before running it.

## Manual Installation via VSIX

1. Make sure you have Node.js and npm installed
2. Clone or download this repository
3. Open a terminal in the repository directory
4. Run: `npm install && npm run compile && npm run package`
5. In VS Code, go to the Extensions view (Ctrl+Shift+X)
6. Choose the Code566 VSIX file

## One-Line Installation Command

If you prefer a single command that handles everything:

```
curl -sSL https://raw.githubusercontent.com/aliv029bmj/code566/main/install-one-command.sh | bash
```

## Installation from VS Code Marketplace

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Type "Code566: Select Mode" and press Enter
4. Click "Install"
5. You will see the Code566 indicator in the status bar

## Troubleshooting

If you encounter any issues during installation:

1. Make sure you have the latest version of VS Code installed
2. Right-click on Code566 in the Extensions panel and select "Extension Settings"
3. Check the "Code566" channel in the Output panel for activation errors

For help or more information, refer to the GitHub repository: https://github.com/aliv029bmj/code566 