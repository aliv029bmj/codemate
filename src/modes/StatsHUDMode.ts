import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * StatsHUDMode shows a stats dashboard with useful real-time info
 */
export class StatsHUDMode extends BaseMode {
  private totalLines: number;
  private totalCharacters: number;
  private typingSpeed: number; // Characters per minute
  private lastTypingTime: number;
  private typedCharactersBuffer: number;
  private isHUDVisible: boolean;
  private statsPanel: vscode.WebviewPanel | undefined;
  private subscriptions: vscode.Disposable[] = [];

  /**
   * Creates a new StatsHUDMode
   */
  constructor() {
    super('Stats HUD', 'stats', 100);

    this.totalLines = 0;
    this.totalCharacters = 0;
    this.typingSpeed = 0;
    this.lastTypingTime = Date.now();
    this.typedCharactersBuffer = 0;
    this.isHUDVisible = false;

    // Set initial status bar display
    this.updateStatusBar();
  }

  /**
   * Activates the StatsHUD mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Register change event to track typing
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      this.handleDocumentChange(event);
    });
    this.subscriptions.push(changeSubscription);

    // Update the stats for the current active document
    this.updateDocumentStats();

    // Override the default status bar command
    this.statusBarItem.command = 'code566.toggleStats';

    // Update the status bar
    this.updateStatusBar();

    // Extension API kullanarak komut kaydı
    const extension = vscode.extensions.getExtension('code566');
    if (extension && extension.exports && extension.exports.registerCommand) {
      const toggleCommand = extension.exports.registerCommand('code566.toggleStats', () => {
        this.toggleStatsHUD(context);
      });
      if (toggleCommand) {
        this.subscriptions.push(toggleCommand);
      }
    } else {
      // Fallback olarak doğrudan context'e ekleyerek kayıt
      // NOT: Bu yol, komut çakışmalarına yol açabilir
      console.warn('Extension API bulunamadı, doğrudan context.subscriptions kullanılıyor');
      try {
        const toggleCommand = vscode.commands.registerCommand('code566.toggleStats', () => {
          this.toggleStatsHUD(context);
        });
        context.subscriptions.push(toggleCommand);
        this.subscriptions.push(toggleCommand);
      } catch (error) {
        console.error('Komut kaydı sırasında hata oluştu:', error);
      }
    }
  }

  /**
   * Updates the stats based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Update the status bar with cursor position info
    this.updateStatusBar();

    // Update the HUD if it's visible
    if (this.isHUDVisible && this.statsPanel) {
      this.updateStatsHUD();
    }
  }

  /**
   * Handles document changes to track typing statistics
   * @param event The text document change event
   */
  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Calculate characters added/removed
    let charsDelta = 0;

    for (const change of event.contentChanges) {
      charsDelta += change.text.length - change.rangeLength;
    }

    // Update total characters
    this.totalCharacters += charsDelta;

    // Update typing speed
    if (charsDelta > 0) {
      const now = Date.now();
      const timeDiff = (now - this.lastTypingTime) / 1000; // in seconds

      if (timeDiff < 5) { // Only count if typing continuously
        this.typedCharactersBuffer += charsDelta;
      } else {
        this.typedCharactersBuffer = charsDelta;
      }

      // Update speed every second
      if (timeDiff >= 1) {
        this.typingSpeed = Math.round((this.typedCharactersBuffer / timeDiff) * 60); // chars per minute
        this.lastTypingTime = now;
        this.typedCharactersBuffer = 0;
      }
    }

    // Update document stats
    this.updateDocumentStats();

    // Update the status bar
    this.updateStatusBar();

    // Update the HUD if it's visible
    if (this.isHUDVisible && this.statsPanel) {
      this.updateStatsHUD();
    }
  }

  /**
   * Updates statistics for the current document
   */
  private updateDocumentStats(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Count lines in document
    this.totalLines = editor.document.lineCount;

    // If characters haven't been counted yet, count them
    if (this.totalCharacters === 0) {
      this.totalCharacters = editor.document.getText().length;
    }
  }

  /**
   * Updates the status bar with current stats
   */
  private updateStatusBar(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      // Editor yoksa status bar öğesini gizle
      this.statusBarItem.hide();
      return;
    }

    // Editor varsa göster
    this.statusBarItem.show();

    // Get current position
    const position = editor.selection.active;

    // Update the status bar
    this.statusBarItem.text = `$(graph) Ln ${position.line + 1}, Col ${position.character + 1} | ${this.typingSpeed} CPM`;
  }

  /**
   * Toggles the stats HUD webview panel
   */
  private toggleStatsHUD(context: vscode.ExtensionContext): void {
    if (this.isHUDVisible && this.statsPanel) {
      this.statsPanel.dispose();
      this.isHUDVisible = false;
    } else {
      // Create and show the webview
      this.statsPanel = vscode.window.createWebviewPanel(
        'statsHUD',
        'Code566 Stats',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      // Set initial content
      this.updateStatsHUD();

      // Handle panel close
      this.statsPanel.onDidDispose(() => {
        this.isHUDVisible = false;
        this.statsPanel = undefined;
      });

      this.isHUDVisible = true;
    }
  }

  /**
   * Updates the stats HUD webview panel content
   */
  private updateStatsHUD(): void {
    if (!this.statsPanel) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Get current position
    const position = editor.selection.active;

    // Count functions (simple approximation)
    const docText = editor.document.getText();
    const functionMatches = docText.match(/function\s+\w+\s*\(/g);
    const functionCount = functionMatches ? functionMatches.length : 0;

    // Generate HTML content
    this.statsPanel.webview.html = this.getHtmlContent();
  }

  private getHtmlContent(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return `<!DOCTYPE html><html><body><h1>No active editor</h1></body></html>`;
    }

    // Get current position
    const position = editor.selection.active;

    // Count functions (simple approximation)
    const docText = editor.document.getText();
    const functionMatches = docText.match(/function\s+\w+\s*\(/g);
    const functionCount = functionMatches ? functionMatches.length : 0;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code566 Stats</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          color: var(--vscode-foreground);
          background-color: var(--vscode-editor-background);
        }
        .stat-card {
          margin-bottom: 15px;
          padding: 15px;
          border-radius: 5px;
          background-color: var(--vscode-editor-inactiveSelectionBackground);
        }
        .stat-title {
          font-size: 14px;
          margin-bottom: 5px;
          opacity: 0.8;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        h1 {
          margin-bottom: 20px;
          font-size: 18px;
          border-bottom: 1px solid var(--vscode-panel-border);
          padding-bottom: 10px;
        }
        .position-display {
          font-size: 16px;
          margin-bottom: 20px;
          padding: 10px;
          background-color: var(--vscode-editor-lineHighlightBackground);
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Code566 Stats Dashboard</h1>
        
        <div class="position-display">
          <strong>Current Position:</strong> Line ${position.line + 1}, Column ${position.character + 1}
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">Total Lines</div>
            <div class="stat-value">${this.totalLines}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Total Characters</div>
            <div class="stat-value">${this.totalCharacters}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Typing Speed</div>
            <div class="stat-value">${this.typingSpeed} CPM</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-title">Functions (approx.)</div>
            <div class="stat-value">${functionCount}</div>
          </div>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    super.deactivate();

    // Dispose all subscriptions
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions = [];

    // Close stats panel if open
    if (this.statsPanel) {
      this.statsPanel.dispose();
      this.statsPanel = undefined;
      this.isHUDVisible = false;
    }
  }
}