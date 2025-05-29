import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * HeatMapMode shows a visual heat map of the current file based on editing frequency
 */
export class HeatMapMode extends BaseMode {
  private editMap: Map<number, number>; // Maps line numbers to edit counts
  private webviewPanel: vscode.WebviewPanel | undefined;
  private isHeatMapVisible: boolean;
  private maxEditCount: number;
  private lastUpdate: number;
  private updateInterval: number;
  private subscriptions: vscode.Disposable[] = [];

  /**
   * Creates a new HeatMapMode
   */
  constructor() {
    super('Heat Map', 'heatmap', 95);

    this.editMap = new Map<number, number>();
    this.isHeatMapVisible = false;
    this.maxEditCount = 1;
    this.lastUpdate = Date.now();
    this.updateInterval = 2000; // Update every 2 seconds to avoid performance issues

    // Set initial status bar display
    this.updateStatusBar(0, 0);
  }

  /**
   * Activates the Heat Map mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Register document change event to track edits
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      this.trackDocumentChanges(event);
    });
    this.subscriptions.push(changeSubscription);

    // Register selection change event to track cursor movement
    const selectionSubscription = vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === vscode.window.activeTextEditor) {
        const position = event.textEditor.selection.active;
        this.update(position.line, position.character);
      }
    });
    this.subscriptions.push(selectionSubscription);

    // Override status bar command
    this.statusBarItem.command = 'code566.toggleHeatMap';

    // Extension API kullanarak komut kaydı
    const extension = vscode.extensions.getExtension('code566');
    if (extension && extension.exports && extension.exports.registerCommand) {
      const toggleCommand = extension.exports.registerCommand('code566.toggleHeatMap', () => {
        this.toggleHeatMap();
      });
      if (toggleCommand) {
        this.subscriptions.push(toggleCommand);
      }
    } else {
      // Fallback olarak doğrudan context'e ekleyerek kayıt
      // NOT: Bu yol, komut çakışmalarına yol açabilir
      console.warn('Extension API bulunamadı, doğrudan context.subscriptions kullanılıyor');
      try {
        const toggleCommand = vscode.commands.registerCommand('code566.toggleHeatMap', () => {
          this.toggleHeatMap();
        });
        context.subscriptions.push(toggleCommand);
        this.subscriptions.push(toggleCommand);
      } catch (error) {
        console.error('Komut kaydı sırasında hata oluştu:', error);
      }
    }

    // Initialize heat map for current document
    this.initializeHeatMap();
  }

  /**
   * Updates the heat map display based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Update status bar
    this.updateStatusBar(line, column);

    // Update heat map if visible and enough time has passed
    const now = Date.now();
    if (this.isHeatMapVisible && this.webviewPanel && (now - this.lastUpdate > this.updateInterval)) {
      this.updateHeatMapView();
      this.lastUpdate = now;
    }
  }

  /**
   * Tracks document changes to build the heat map
   * @param event The document change event
   */
  private trackDocumentChanges(event: vscode.TextDocumentChangeEvent): void {
    // Only track changes in the active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || event.document !== activeEditor.document) {
      return;
    }

    // Track edits by line
    for (const change of event.contentChanges) {
      const startLine = change.range.start.line;
      const endLine = change.range.end.line;

      // Add each edited line to the map
      for (let line = startLine; line <= endLine; line++) {
        const currentCount = this.editMap.get(line) || 0;
        const newCount = currentCount + 1;
        this.editMap.set(line, newCount);

        // Update max count for color scaling
        if (newCount > this.maxEditCount) {
          this.maxEditCount = newCount;
        }
      }
    }

    // Update heat map if visible
    if (this.isHeatMapVisible && this.webviewPanel) {
      this.updateHeatMapView();
    }
  }

  /**
   * Initializes the heat map for the current document
   */
  private initializeHeatMap(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Reset the edit map
    this.editMap.clear();
    this.maxEditCount = 1;
  }

  /**
   * Updates the status bar with heat map information
   * @param line Current line number
   * @param column Current column number
   */
  private updateStatusBar(line: number, column: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      // Editor yoksa status bar öğesini gizle
      this.statusBarItem.hide();
      return;
    }

    // Editor varsa göster
    this.statusBarItem.show();

    // Get edit count for current line
    const editCount = this.editMap.get(line) || 0;

    // Show line, column and heat info in the status bar
    this.statusBarItem.text = `$(flame) Ln ${line + 1}, Col ${column + 1} | Heat: ${editCount}`;
  }

  /**
   * Toggles the heat map visualization
   */
  private toggleHeatMap(): void {
    if (this.isHeatMapVisible && this.webviewPanel) {
      this.webviewPanel.dispose();
      this.isHeatMapVisible = false;
    } else {
      this.showHeatMap();
      this.isHeatMapVisible = true;
    }
  }

  /**
   * Shows the heat map visualization
   */
  private showHeatMap(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Cannot show heat map: No active editor');
      return;
    }

    // Create webview panel
    this.webviewPanel = vscode.window.createWebviewPanel(
      'codeHeatMap',
      'Code566 Heat Map',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Update content
    this.updateHeatMapView();

    // Handle panel close
    this.webviewPanel.onDidDispose(() => {
      this.isHeatMapVisible = false;
      this.webviewPanel = undefined;
    });
  }

  /**
   * Updates the heat map visualization
   */
  private updateHeatMapView(): void {
    if (!this.webviewPanel) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Generate HTML content
    this.webviewPanel.webview.html = this.getHeatMapHtml(editor);
  }

  /**
   * Generates HTML for the heat map visualization
   * @param editor The active text editor
   * @returns HTML content
   */
  private getHeatMapHtml(editor: vscode.TextEditor): string {
    const document = editor.document;
    const lineCount = document.lineCount;

    // Generate heat map visualization
    let heatMapHtml = '';

    for (let i = 0; i < lineCount; i++) {
      const line = document.lineAt(i);
      const editCount = this.editMap.get(i) || 0;
      const intensity = this.maxEditCount > 0 ? editCount / this.maxEditCount : 0;

      // Generate color based on intensity (green to red)
      const r = Math.floor(255 * intensity);
      const g = Math.floor(255 * (1 - intensity));
      const b = 0;

      // Generate line representation
      const lineContent = line.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const lineHtml = `
        <div class="line" data-line="${i + 1}" style="background: rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.5})">
          <span class="line-number">${i + 1}</span>
          <span class="line-content">${lineContent || '&nbsp;'}</span>
          <span class="heat-indicator" title="Edit count: ${editCount}">
            ${editCount > 0 ? '🔥'.repeat(Math.min(5, Math.ceil(intensity * 5))) : ''}
          </span>
        </div>
      `;

      heatMapHtml += lineHtml;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Heat Map</title>
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
          .heat-map {
            flex: 1;
            overflow-y: auto;
            padding: 0;
          }
          .line {
            display: flex;
            padding: 2px 0;
            border-bottom: 1px solid rgba(128, 128, 128, 0.1);
            white-space: pre;
            font-family: monospace;
          }
          .line-number {
            width: 40px;
            text-align: right;
            padding-right: 10px;
            color: var(--vscode-editorLineNumber-foreground);
            user-select: none;
          }
          .line-content {
            flex: 1;
            overflow-x: auto;
          }
          .heat-indicator {
            margin-left: 10px;
            min-width: 50px;
          }
          .legend {
            display: flex;
            padding: 10px;
            justify-content: space-between;
            background-color: var(--vscode-activityBar-background);
            color: var(--vscode-activityBar-foreground);
          }
          .legend-item {
            display: flex;
            align-items: center;
          }
          .legend-color {
            width: 20px;
            height: 20px;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Code Heat Map - ${editor.document.fileName.split('/').pop()} (Max Edits: ${this.maxEditCount})
          </div>
          <div class="heat-map">
            ${heatMapHtml}
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(0, 255, 0, 0.3)"></div>
              <span>Low Activity</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 255, 0, 0.3)"></div>
              <span>Medium Activity</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 0, 0, 0.3)"></div>
              <span>High Activity</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Deactivates the heat map mode
   */
  public deactivate(): void {
    super.deactivate();

    // Dispose all subscriptions
    this.subscriptions.forEach(subscription => subscription.dispose());
    this.subscriptions = [];

    // Close heat map panel if open
    if (this.webviewPanel) {
      this.webviewPanel.dispose();
      this.webviewPanel = undefined;
      this.isHeatMapVisible = false;
    }
  }
} 