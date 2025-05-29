import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * CodeFeatureDetectorMode detects and displays information about code structures at cursor position
 */
export class CodeFeatureDetectorMode extends BaseMode {
  private detailPanel: vscode.WebviewPanel | undefined;
  private isPanelVisible: boolean;
  private currentSymbol: any;
  private symbols: vscode.DocumentSymbol[] | undefined;
  private lastSymbolUpdate: number;
  private updateInterval: number;

  /**
   * Creates a new CodeFeatureDetectorMode
   */
  constructor() {
    super('Code Feature', 'codefeature', 94);

    this.isPanelVisible = false;
    this.currentSymbol = undefined;
    this.symbols = undefined;
    this.lastSymbolUpdate = Date.now();
    this.updateInterval = 1000; // Update symbols every second

    // Set initial status bar display
    this.updateStatusBar(0, 0);
  }

  /**
   * Activates the Code Feature Detector mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Register editor change event
    const editorChangeSubscription = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.updateSymbols(editor.document);
      }
    });

    // Register document change event
    const documentChangeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        // Check if enough time has passed since the last update
        const now = Date.now();
        if (now - this.lastSymbolUpdate > this.updateInterval) {
          this.updateSymbols(event.document);
          this.lastSymbolUpdate = now;
        }
      }
    });

    // Register selection change event
    const selectionChangeSubscription = vscode.window.onDidChangeTextEditorSelection((event) => {
      const editor = event.textEditor;
      if (editor) {
        const position = editor.selection.active;
        this.update(position.line, position.character);
      }
    });

    // Register command to toggle detail panel
    const toggleCommand = vscode.commands.registerCommand('code566.toggleCodeFeature', () => {
      this.toggleDetailPanel();
    });

    // Override status bar command
    this.statusBarItem.command = 'code566.toggleCodeFeature';
    this.statusBarItem.tooltip = 'Toggle Code Feature Detector panel';

    // Add subscriptions to context
    context.subscriptions.push(
      editorChangeSubscription,
      documentChangeSubscription,
      selectionChangeSubscription,
      toggleCommand
    );

    // Update symbols for current document
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.updateSymbols(editor.document);
    }
  }

  /**
   * Updates the mode display based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Get current editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Find symbol at current position
    const position = new vscode.Position(line, column);
    this.currentSymbol = this.findSymbolAtPosition(position);

    // Update status bar
    this.updateStatusBar(line, column);

    // Update detail panel if visible
    if (this.isPanelVisible && this.detailPanel) {
      this.updateDetailPanel();
    }
  }

  /**
   * Updates the document symbols
   * @param document The current document
   */
  private async updateSymbols(document: vscode.TextDocument): Promise<void> {
    // Skip if not a supported language
    if (!this.isSupportedLanguage(document.languageId)) {
      this.symbols = undefined;
      return;
    }

    try {
      // Get document symbols
      this.symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri
      );
    } catch (error) {
      this.symbols = undefined;
      console.error('Error getting document symbols:', error);
    }
  }

  /**
   * Checks if the language is supported for symbol detection
   * @param languageId The language ID
   * @returns True if supported
   */
  private isSupportedLanguage(languageId: string): boolean {
    // List of languages with good symbol support
    const supportedLanguages = [
      'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'dart'
    ];

    return supportedLanguages.includes(languageId);
  }

  /**
   * Finds the symbol at the given position
   * @param position The current position
   * @returns The symbol at the position or undefined
   */
  private findSymbolAtPosition(position: vscode.Position): vscode.DocumentSymbol | undefined {
    if (!this.symbols) {
      return undefined;
    }

    // Recursive function to search for symbols
    const findInSymbols = (symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol | undefined => {
      for (const symbol of symbols) {
        // Check if position is within this symbol's range
        if (symbol.range.contains(position)) {
          // Check children first (more specific)
          if (symbol.children.length > 0) {
            const childMatch = findInSymbols(symbol.children);
            if (childMatch) {
              return childMatch;
            }
          }
          // Return this symbol if no matching children
          return symbol;
        }
      }
      return undefined;
    };

    return findInSymbols(this.symbols);
  }

  /**
   * Updates the status bar with code feature information
   * @param line Current line number
   * @param column Current column number
   */
  private updateStatusBar(line: number, column: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.statusBarItem.text = '$(symbol-class) Code Feature: No editor';
      return;
    }

    // Show basic position info
    let statusText = `$(symbol-class) Ln ${line + 1}, Col ${column + 1}`;

    // Add symbol info if available
    if (this.currentSymbol) {
      const symbol = this.currentSymbol as vscode.DocumentSymbol;
      const kindName = this.getSymbolKindName(symbol.kind);
      statusText += ` | ${kindName}: ${symbol.name}`;
    } else {
      // Show language if no symbol
      statusText += ` | ${editor.document.languageId}`;
    }

    this.statusBarItem.text = statusText;
  }

  /**
   * Converts symbol kind to readable name
   * @param kind The symbol kind
   * @returns Human-readable name
   */
  private getSymbolKindName(kind: vscode.SymbolKind): string {
    switch (kind) {
      case vscode.SymbolKind.File: return 'File';
      case vscode.SymbolKind.Module: return 'Module';
      case vscode.SymbolKind.Namespace: return 'Namespace';
      case vscode.SymbolKind.Package: return 'Package';
      case vscode.SymbolKind.Class: return 'Class';
      case vscode.SymbolKind.Method: return 'Method';
      case vscode.SymbolKind.Property: return 'Property';
      case vscode.SymbolKind.Field: return 'Field';
      case vscode.SymbolKind.Constructor: return 'Constructor';
      case vscode.SymbolKind.Enum: return 'Enum';
      case vscode.SymbolKind.Interface: return 'Interface';
      case vscode.SymbolKind.Function: return 'Function';
      case vscode.SymbolKind.Variable: return 'Variable';
      case vscode.SymbolKind.Constant: return 'Constant';
      case vscode.SymbolKind.String: return 'String';
      case vscode.SymbolKind.Number: return 'Number';
      case vscode.SymbolKind.Boolean: return 'Boolean';
      case vscode.SymbolKind.Array: return 'Array';
      case vscode.SymbolKind.Object: return 'Object';
      case vscode.SymbolKind.Key: return 'Key';
      case vscode.SymbolKind.Null: return 'Null';
      case vscode.SymbolKind.EnumMember: return 'EnumMember';
      case vscode.SymbolKind.Struct: return 'Struct';
      case vscode.SymbolKind.Event: return 'Event';
      case vscode.SymbolKind.Operator: return 'Operator';
      case vscode.SymbolKind.TypeParameter: return 'TypeParameter';
      default: return 'Symbol';
    }
  }

  /**
   * Toggles the detail panel
   */
  private toggleDetailPanel(): void {
    if (this.isPanelVisible && this.detailPanel) {
      this.detailPanel.dispose();
      this.isPanelVisible = false;
    } else {
      this.showDetailPanel();
      this.isPanelVisible = true;
    }
  }

  /**
   * Shows the detail panel
   */
  private showDetailPanel(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Cannot show code features: No active editor');
      return;
    }

    // Create webview panel
    this.detailPanel = vscode.window.createWebviewPanel(
      'codeFeatureDetector',
      'Code566 Feature Detector',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Update content
    this.updateDetailPanel();

    // Handle panel close
    this.detailPanel.onDidDispose(() => {
      this.isPanelVisible = false;
      this.detailPanel = undefined;
    });
  }

  /**
   * Updates the detail panel content
   */
  private updateDetailPanel(): void {
    if (!this.detailPanel) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Generate HTML content
    this.detailPanel.webview.html = this.getDetailPanelHtml(editor);
  }

  /**
   * Generates HTML for the detail panel
   * @param editor The active text editor
   * @returns HTML content
   */
  private getDetailPanelHtml(editor: vscode.TextEditor): string {
    const document = editor.document;
    const position = editor.selection.active;

    // Generate symbol information
    let symbolHtml = '<div class="no-symbol">No code feature detected at cursor position</div>';

    if (this.currentSymbol) {
      const symbol = this.currentSymbol as vscode.DocumentSymbol;
      const kindName = this.getSymbolKindName(symbol.kind);
      const kindIcon = this.getSymbolKindIcon(symbol.kind);

      // Get symbol details
      const startLine = symbol.range.start.line + 1;
      const endLine = symbol.range.end.line + 1;
      const lineCount = endLine - startLine + 1;

      // Get symbol code (with syntax highlighting if possible)
      let codeContent = '';
      for (let i = symbol.range.start.line; i <= symbol.range.end.line && i < document.lineCount; i++) {
        codeContent += document.lineAt(i).text + '\n';
      }

      // Escape HTML characters
      const escapedCode = codeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Create symbol info HTML
      symbolHtml = `
        <div class="symbol-info">
          <div class="symbol-header">
            <span class="symbol-icon">${kindIcon}</span>
            <span class="symbol-kind">${kindName}</span>
            <span class="symbol-name">${symbol.name}</span>
          </div>
          <div class="symbol-details">
            <div class="detail-item">
              <span class="detail-label">Location:</span>
              <span class="detail-value">Lines ${startLine}-${endLine} (${lineCount} lines)</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Detail:</span>
              <span class="detail-value">${symbol.detail || 'No details available'}</span>
            </div>
          </div>
          <div class="symbol-code">
            <div class="code-header">Source Code:</div>
            <pre class="code-content language-${document.languageId}"><code>${escapedCode}</code></pre>
          </div>
        </div>
      `;
    }

    // Show document structure
    let structureHtml = '<div class="no-structure">No structure information available</div>';

    if (this.symbols && this.symbols.length > 0) {
      structureHtml = '<div class="structure-tree">';
      structureHtml += this.generateStructureTree(this.symbols, 0);
      structureHtml += '</div>';
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Feature Detector</title>
        <style>
          body {
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            padding: 0;
            margin: 0;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
          }
          .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
          }
          .header {
            padding: 10px;
            background-color: var(--vscode-activityBar-background);
            color: var(--vscode-activityBar-foreground);
            font-weight: bold;
          }
          .content {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          .left-panel {
            width: 30%;
            overflow-y: auto;
            border-right: 1px solid var(--vscode-panel-border);
            padding: 10px;
          }
          .right-panel {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
          }
          .symbol-info {
            margin-bottom: 20px;
          }
          .symbol-header {
            display: flex;
            align-items: center;
            font-size: 1.2em;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .symbol-icon {
            margin-right: 8px;
            font-size: 1.2em;
          }
          .symbol-kind {
            font-weight: bold;
            margin-right: 8px;
            color: var(--vscode-symbolIcon-methodForeground);
          }
          .symbol-name {
            font-weight: bold;
            color: var(--vscode-symbolIcon-classForeground);
          }
          .symbol-details {
            margin-bottom: 15px;
          }
          .detail-item {
            margin-bottom: 5px;
          }
          .detail-label {
            font-weight: bold;
            margin-right: 5px;
            color: var(--vscode-descriptionForeground);
          }
          .symbol-code {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 3px;
            overflow: hidden;
          }
          .code-header {
            background-color: var(--vscode-activityBar-background);
            color: var(--vscode-activityBar-foreground);
            padding: 5px 10px;
            font-weight: bold;
          }
          .code-content {
            margin: 0;
            padding: 10px;
            overflow-x: auto;
            font-family: monospace;
            white-space: pre;
          }
          .structure-tree {
            font-family: monospace;
          }
          .tree-item {
            padding: 2px 0;
          }
          .tree-item-current {
            background-color: var(--vscode-list-highlightForeground);
            border-radius: 3px;
          }
          .tree-indent {
            margin-left: 20px;
          }
          .no-symbol, .no-structure {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Code Feature Detector - ${document.fileName.split('/').pop()}
          </div>
          <div class="content">
            <div class="left-panel">
              <h3>Document Structure</h3>
              ${structureHtml}
            </div>
            <div class="right-panel">
              <h3>Current Feature</h3>
              ${symbolHtml}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates HTML for the document structure tree
   * @param symbols The symbols to display
   * @param level The indentation level
   * @returns HTML content
   */
  private generateStructureTree(symbols: vscode.DocumentSymbol[], level: number): string {
    let html = '';
    for (const symbol of symbols) {
      const kindIcon = this.getSymbolKindIcon(symbol.kind);
      const isCurrent = this.currentSymbol &&
        this.currentSymbol.name === symbol.name &&
        this.currentSymbol.range.isEqual(symbol.range);

      // Create tree item
      html += `
        <div class="tree-item ${isCurrent ? 'tree-item-current' : ''}">
          ${'&nbsp;'.repeat(level * 4)}
          <span class="symbol-icon">${kindIcon}</span>
          <span>${symbol.name}</span>
        </div>
      `;

      // Add children
      if (symbol.children.length > 0) {
        html += this.generateStructureTree(symbol.children, level + 1);
      }
    }

    return html;
  }

  /**
   * Gets an icon for the symbol kind
   * @param kind The symbol kind
   * @returns Icon character
   */
  private getSymbolKindIcon(kind: vscode.SymbolKind): string {
    switch (kind) {
      case vscode.SymbolKind.File: return '📄';
      case vscode.SymbolKind.Module: return '📦';
      case vscode.SymbolKind.Namespace: return '🔠';
      case vscode.SymbolKind.Package: return '📦';
      case vscode.SymbolKind.Class: return '🔶';
      case vscode.SymbolKind.Method: return '🔧';
      case vscode.SymbolKind.Property: return '🔑';
      case vscode.SymbolKind.Field: return '🔤';
      case vscode.SymbolKind.Constructor: return '🏗️';
      case vscode.SymbolKind.Enum: return '🔢';
      case vscode.SymbolKind.Interface: return '🔌';
      case vscode.SymbolKind.Function: return '⚙️';
      case vscode.SymbolKind.Variable: return '📝';
      case vscode.SymbolKind.Constant: return '🔒';
      case vscode.SymbolKind.String: return '🔤';
      case vscode.SymbolKind.Number: return '🔢';
      case vscode.SymbolKind.Boolean: return '✓';
      case vscode.SymbolKind.Array: return '📚';
      case vscode.SymbolKind.Object: return '🔮';
      case vscode.SymbolKind.Key: return '🔑';
      case vscode.SymbolKind.Null: return '❌';
      case vscode.SymbolKind.EnumMember: return '🔹';
      case vscode.SymbolKind.Struct: return '🏢';
      case vscode.SymbolKind.Event: return '⚡';
      case vscode.SymbolKind.Operator: return '➗';
      case vscode.SymbolKind.TypeParameter: return '🔍';
      default: return '📋';
    }
  }

  /**
   * Deactivates the code feature detector mode
   */
  public deactivate(): void {
    super.deactivate();

    // Dispose of the webview panel if it exists
    if (this.detailPanel) {
      this.detailPanel.dispose();
      this.detailPanel = undefined;
      this.isPanelVisible = false;
    }
  }
} 