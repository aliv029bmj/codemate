# CodeMate Installation Instructions

There are several ways to install CodeMate in VS Code. You can choose the method that works best for you.

## Automatic Installation (Recommended)

### For Windows:
1. Double-click on the `install.bat` file to run it
2. Restart VS Code when the installation is complete
3. Open the command palette (F1 or Ctrl+Shift+P) and type "CodeMate: Select Mode"

### For Linux/macOS:
1. Open a terminal and run the following command:
   ```
   ./install.sh
   ```
2. Restart VS Code when the installation is complete
3. Open the command palette (F1 or Cmd+Shift+P) and type "CodeMate: Select Mode"

## Manual Installation

### Installation with VSIX Package
1. Find the `.vsix` file in the project folder (or create one: `vsce package`)
2. Open VS Code
3. Open the Extensions panel (Ctrl+Shift+X or Cmd+Shift+X)
4. Click on "..." (More Actions) menu
5. Select "Install from VSIX..."
6. Choose the CodeMate VSIX file
7. Restart VS Code

### Building and Running from Source
1. Run the following commands in the project folder:
   ```
   npm install
   npm run compile
   ```
2. Press F5 or run "Start Extension" from the Debug panel
3. In the new VS Code window that opens, open the Command Palette and type "CodeMate: Select Mode"

## Installation with VS Code Task Runner
1. Open the Task Runner in VS Code (Ctrl+Shift+B or Cmd+Shift+B)
2. Select the "Complete Installation and Packaging" task
3. Manually install the generated VSIX file to VS Code

## After Installation
Once the extension is installed:

1. Restart VS Code
2. Open the Command Palette (F1 or Ctrl+Shift+P / Cmd+Shift+P)
3. Type "CodeMate: Select Mode" and press Enter
4. Select the mode you want to use
5. You will see the CodeMate indicator in the status bar
6. When editing any file, your selected mode will be active based on your cursor position

## Troubleshooting

If you experience issues with the installation:

1. Open the VS Code developer console (Help > Toggle Developer Tools)
2. Right-click on CodeMate in the Extensions panel and select "Extension Settings"
3. Check the "CodeMate" channel in the Output panel for activation errors

For help or more information, refer to the GitHub repository: https://github.com/aliv029bmj/codemate 