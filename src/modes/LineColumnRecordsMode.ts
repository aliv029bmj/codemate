import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * Record type for line/column tracking
 */
interface CodeRecord {
  value: number;
  timestamp: number;
  file: string;
}

/**
 * LineColumnRecordsMode tracks and displays coding records for line and column positions
 */
export class LineColumnRecordsMode extends BaseMode {
  private records: {
    maxLine: CodeRecord;
    maxColumn: CodeRecord;
    maxLineLength: CodeRecord;
    minLineLength: CodeRecord;
    maxIndent: CodeRecord;
    totalLines: CodeRecord;
    maxFileSize: CodeRecord;
  };

  private sessionStats: {
    linesVisited: Set<number>;
    charactersTyped: number;
    fileCount: Set<string>;
    startTime: number;
  };

  private detailPanel: vscode.WebviewPanel | undefined;
  private isPanelVisible: boolean;
  private statusBarDetail: vscode.StatusBarItem;

  /**
   * Creates a new LineColumnRecordsMode
   */
  constructor() {
    super('Records', 'records', 97);

    // Create additional status bar item for detailed info
    this.statusBarDetail = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 96);
    this.statusBarDetail.text = '$(trophy) Records';
    this.statusBarDetail.tooltip = 'View coding records';
    this.statusBarDetail.show();

    this.isPanelVisible = false;

    // Initialize records with default values
    const defaultRecord: CodeRecord = {
      value: 0,
      timestamp: Date.now(),
      file: ''
    };

    this.records = {
      maxLine: { ...defaultRecord },
      maxColumn: { ...defaultRecord },
      maxLineLength: { ...defaultRecord },
      minLineLength: { value: Number.MAX_SAFE_INTEGER, timestamp: Date.now(), file: '' },
      maxIndent: { ...defaultRecord },
      totalLines: { ...defaultRecord },
      maxFileSize: { ...defaultRecord }
    };

    // Initialize session statistics
    this.sessionStats = {
      linesVisited: new Set<number>(),
      charactersTyped: 0,
      fileCount: new Set<string>(),
      startTime: Date.now()
    };

    // Set initial status bar display
    this.updateStatusBar(0, 0);
  }

  /**
   * Activates the Line/Column Records mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Show detail status bar
    this.statusBarDetail.show();

    // Load saved records from global state
    this.loadRecords(context);

    // Register document change event
    const documentChangeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      this.handleDocumentChange(event);
    });

    // Register editor change event
    const editorChangeSubscription = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.checkDocumentRecords(editor.document);

        // Update position
        const position = editor.selection.active;
        this.update(position.line, position.character);
      }
    });

    // Register selection change event
    const selectionChangeSubscription = vscode.window.onDidChangeTextEditorSelection((event) => {
      const editor = event.textEditor;
      if (editor) {
        const position = editor.selection.active;
        this.update(position.line, position.character);

        // Track visited lines
        this.sessionStats.linesVisited.add(position.line);
      }
    });

    // Register command to show records panel
    const showRecordsCommand = vscode.commands.registerCommand('code566.showRecords', () => {
      this.toggleRecordsPanel(context);
    });

    // Register command to reset records
    const resetRecordsCommand = vscode.commands.registerCommand('code566.resetRecords', () => {
      this.resetRecords(context);
    });

    // Set status bar commands
    this.statusBarItem.command = 'code566.showRecords';
    this.statusBarDetail.command = 'code566.showRecords';

    // Add subscriptions to context
    context.subscriptions.push(
      documentChangeSubscription,
      editorChangeSubscription,
      selectionChangeSubscription,
      showRecordsCommand,
      resetRecordsCommand,
      this.statusBarDetail
    );

    // Check current document for records
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.checkDocumentRecords(editor.document);
    }
  }

  /**
   * Updates the mode display based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Update status bar
    this.updateStatusBar(line, column);

    // Update records
    this.updateRecords(line, column);

    // Update panel if visible
    if (this.isPanelVisible && this.detailPanel) {
      this.updateRecordsPanel();
    }
  }

  /**
   * Updates the status bar with line/column record information
   * @param line Current line number
   * @param column Current column number
   */
  private updateStatusBar(line: number, column: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      // Editor yoksa status bar öğelerini gizle
      this.statusBarItem.hide();
      this.statusBarDetail.hide();
      return;
    }

    // Editor varsa göster
    this.statusBarItem.show();
    this.statusBarDetail.show();

    // Show current position in status bar
    this.statusBarItem.text = `$(trophy) Ln ${line + 1}, Col ${column + 1}`;

    // Show highest records in detail status bar
    this.statusBarDetail.text = `Max: L${this.records.maxLine.value}, C${this.records.maxColumn.value}`;
  }

  /**
   * Updates records based on the current position
   * @param line Current line number
   * @param column Current column number
   */
  private updateRecords(line: number, column: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const filePath = document.fileName;
    const lineNumber = line + 1; // 1-based line number
    const columnNumber = column + 1; // 1-based column number

    // Check max line
    if (lineNumber > this.records.maxLine.value) {
      this.records.maxLine = {
        value: lineNumber,
        timestamp: Date.now(),
        file: filePath
      };
    }

    // Check max column
    if (columnNumber > this.records.maxColumn.value) {
      this.records.maxColumn = {
        value: columnNumber,
        timestamp: Date.now(),
        file: filePath
      };
    }

    // Check line length
    if (line < document.lineCount) {
      const lineText = document.lineAt(line).text;
      const lineLength = lineText.length;

      // Check max line length
      if (lineLength > this.records.maxLineLength.value) {
        this.records.maxLineLength = {
          value: lineLength,
          timestamp: Date.now(),
          file: filePath
        };
      }

      // Check min line length (for non-empty lines)
      if (lineLength > 0 && lineLength < this.records.minLineLength.value) {
        this.records.minLineLength = {
          value: lineLength,
          timestamp: Date.now(),
          file: filePath
        };
      }

      // Check indentation
      const match = lineText.match(/^(\s*)/);
      const indentLength = match ? match[1].length : 0;

      if (indentLength > this.records.maxIndent.value) {
        this.records.maxIndent = {
          value: indentLength,
          timestamp: Date.now(),
          file: filePath
        };
      }
    }

    // Add file to session stats
    this.sessionStats.fileCount.add(filePath);
  }

  /**
   * Checks document for potential records
   * @param document The text document to check
   */
  private checkDocumentRecords(document: vscode.TextDocument): void {
    const filePath = document.fileName;

    // Check total lines
    const lineCount = document.lineCount;
    if (lineCount > this.records.totalLines.value) {
      this.records.totalLines = {
        value: lineCount,
        timestamp: Date.now(),
        file: filePath
      };
    }

    // Check file size
    const text = document.getText();
    const fileSize = text.length;
    if (fileSize > this.records.maxFileSize.value) {
      this.records.maxFileSize = {
        value: fileSize,
        timestamp: Date.now(),
        file: filePath
      };
    }

    // Check each line for length and indentation
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const lineText = line.text;
      const lineLength = lineText.length;

      // Check max line length
      if (lineLength > this.records.maxLineLength.value) {
        this.records.maxLineLength = {
          value: lineLength,
          timestamp: Date.now(),
          file: filePath
        };
      }

      // Check min line length (for non-empty lines)
      if (lineLength > 0 && lineLength < this.records.minLineLength.value) {
        this.records.minLineLength = {
          value: lineLength,
          timestamp: Date.now(),
          file: filePath
        };
      }

      // Check indentation
      const match = lineText.match(/^(\s*)/);
      const indentLength = match ? match[1].length : 0;

      if (indentLength > this.records.maxIndent.value) {
        this.records.maxIndent = {
          value: indentLength,
          timestamp: Date.now(),
          file: filePath
        };
      }
    }
  }

  /**
   * Handles document changes for tracking character typing
   * @param event The document change event
   */
  private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
    // Count typed characters
    for (const change of event.contentChanges) {
      if (change.text) {
        this.sessionStats.charactersTyped += change.text.length;
      }
    }
  }

  /**
   * Toggles the records panel
   * @param context Extension context for saving records
   */
  private toggleRecordsPanel(context: vscode.ExtensionContext): void {
    if (this.isPanelVisible && this.detailPanel) {
      this.detailPanel.dispose();
      this.isPanelVisible = false;
    } else {
      this.showRecordsPanel();
      this.isPanelVisible = true;

      // Save records when panel is opened
      this.saveRecords(context);
    }
  }

  /**
   * Shows the records panel
   */
  private showRecordsPanel(): void {
    // Create webview panel
    this.detailPanel = vscode.window.createWebviewPanel(
      'lineColumnRecords',
      'Code566 Records',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Register reset command in webview
    this.detailPanel.webview.onDidReceiveMessage(
      message => {
        if (message.command === 'resetRecords') {
          const context = vscode.extensions.getExtension('aliv029bmj.code566')?.exports.getExtensionContext();
          if (context) {
            this.resetRecords(context);
          }
        }
      }
    );

    // Update content
    this.updateRecordsPanel();

    // Handle panel close
    this.detailPanel.onDidDispose(() => {
      this.isPanelVisible = false;
      this.detailPanel = undefined;
    });
  }

  /**
   * Updates the records panel content
   */
  private updateRecordsPanel(): void {
    if (!this.detailPanel) {
      return;
    }

    // Generate HTML content
    this.detailPanel.webview.html = this.getRecordsPanelHtml();
  }

  /**
   * Generates HTML for the records panel
   * @returns HTML content
   */
  private getRecordsPanelHtml(): string {
    // Calculate session duration
    const sessionDuration = Date.now() - this.sessionStats.startTime;
    const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((sessionDuration % (1000 * 60)) / 1000);

    // Format time with leading zeros
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Format file paths for display
    const formatFileName = (path: string): string => {
      if (!path) {
        return 'N/A';
      }

      const parts = path.split(/[\\/]/);
      return parts.length > 0 ? parts[parts.length - 1] : path;
    };

    // Format timestamp
    const formatTimestamp = (timestamp: number): string => {
      if (!timestamp) {
        return 'N/A';
      }

      return new Date(timestamp).toLocaleString();
    };

    // Generate records table
    const recordsTableHtml = `
      <table class="records-table">
        <thead>
          <tr>
            <th>Record</th>
            <th>Value</th>
            <th>File</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Highest Line Number</td>
            <td>${this.records.maxLine.value}</td>
            <td title="${this.records.maxLine.file}">${formatFileName(this.records.maxLine.file)}</td>
            <td>${formatTimestamp(this.records.maxLine.timestamp)}</td>
          </tr>
          <tr>
            <td>Rightmost Column</td>
            <td>${this.records.maxColumn.value}</td>
            <td title="${this.records.maxColumn.file}">${formatFileName(this.records.maxColumn.file)}</td>
            <td>${formatTimestamp(this.records.maxColumn.timestamp)}</td>
          </tr>
          <tr>
            <td>Longest Line</td>
            <td>${this.records.maxLineLength.value} chars</td>
            <td title="${this.records.maxLineLength.file}">${formatFileName(this.records.maxLineLength.file)}</td>
            <td>${formatTimestamp(this.records.maxLineLength.timestamp)}</td>
          </tr>
          <tr>
            <td>Shortest Line (non-empty)</td>
            <td>${this.records.minLineLength.value === Number.MAX_SAFE_INTEGER ? 'N/A' : this.records.minLineLength.value + ' chars'}</td>
            <td title="${this.records.minLineLength.file}">${formatFileName(this.records.minLineLength.file)}</td>
            <td>${formatTimestamp(this.records.minLineLength.timestamp)}</td>
          </tr>
          <tr>
            <td>Maximum Indentation</td>
            <td>${this.records.maxIndent.value} spaces</td>
            <td title="${this.records.maxIndent.file}">${formatFileName(this.records.maxIndent.file)}</td>
            <td>${formatTimestamp(this.records.maxIndent.timestamp)}</td>
          </tr>
          <tr>
            <td>Most Lines in File</td>
            <td>${this.records.totalLines.value} lines</td>
            <td title="${this.records.totalLines.file}">${formatFileName(this.records.totalLines.file)}</td>
            <td>${formatTimestamp(this.records.totalLines.timestamp)}</td>
          </tr>
          <tr>
            <td>Largest File Size</td>
            <td>${this.formatBytes(this.records.maxFileSize.value)}</td>
            <td title="${this.records.maxFileSize.file}">${formatFileName(this.records.maxFileSize.file)}</td>
            <td>${formatTimestamp(this.records.maxFileSize.timestamp)}</td>
          </tr>
        </tbody>
      </table>
    `;

    // Generate session stats
    const sessionStatsHtml = `
      <table class="records-table">
        <thead>
          <tr>
            <th>Statistic</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Session Duration</td>
            <td>${formattedTime}</td>
          </tr>
          <tr>
            <td>Unique Lines Visited</td>
            <td>${this.sessionStats.linesVisited.size}</td>
          </tr>
          <tr>
            <td>Characters Typed</td>
            <td>${this.sessionStats.charactersTyped}</td>
          </tr>
          <tr>
            <td>Files Visited</td>
            <td>${this.sessionStats.fileCount.size}</td>
          </tr>
          <tr>
            <td>Typing Speed (avg)</td>
            <td>${Math.round(this.sessionStats.charactersTyped / (sessionDuration / 1000 / 60))} chars/min</td>
          </tr>
        </tbody>
      </table>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code566 Records</title>
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
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h2 {
            margin: 0;
            font-size: 1.2em;
          }
          .content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            align-items: center;
          }
          .section-title h3 {
            margin: 0;
          }
          .records-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .records-table th, .records-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          .records-table th {
            background-color: var(--vscode-editor-lineHighlightBackground);
          }
          .records-table tr:hover {
            background-color: var(--vscode-list-hoverBackground);
          }
          .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 2px;
            cursor: pointer;
          }
          .button:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🏆 Code566 Records</h2>
            <button class="button" id="resetButton">Reset Records</button>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">
                <h3>🌟 All-Time Records</h3>
              </div>
              ${recordsTableHtml}
            </div>
            <div class="section">
              <div class="section-title">
                <h3>📊 Current Session Stats</h3>
              </div>
              ${sessionStatsHtml}
            </div>
          </div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('resetButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all records? This cannot be undone.')) {
              vscode.postMessage({
                command: 'resetRecords'
              });
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Formats bytes to a human-readable format
   * @param bytes Number of bytes
   * @returns Formatted string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Loads records from global state
   * @param context Extension context
   */
  private loadRecords(context: vscode.ExtensionContext): void {
    const savedRecords = context.globalState.get<any>('code566.records');

    if (savedRecords) {
      this.records = savedRecords;

      // Fix min line length if needed
      if (!this.records.minLineLength) {
        this.records.minLineLength = {
          value: Number.MAX_SAFE_INTEGER,
          timestamp: Date.now(),
          file: ''
        };
      }
    }
  }

  /**
   * Saves records to global state
   * @param context Extension context
   */
  private saveRecords(context: vscode.ExtensionContext): void {
    context.globalState.update('code566.records', this.records);
  }

  /**
   * Resets all records
   * @param context Extension context
   */
  private resetRecords(context: vscode.ExtensionContext): void {
    // Reset records
    const defaultRecord: CodeRecord = {
      value: 0,
      timestamp: Date.now(),
      file: ''
    };

    this.records = {
      maxLine: { ...defaultRecord },
      maxColumn: { ...defaultRecord },
      maxLineLength: { ...defaultRecord },
      minLineLength: { value: Number.MAX_SAFE_INTEGER, timestamp: Date.now(), file: '' },
      maxIndent: { ...defaultRecord },
      totalLines: { ...defaultRecord },
      maxFileSize: { ...defaultRecord }
    };

    // Save reset records
    this.saveRecords(context);

    // Update panel if visible
    if (this.isPanelVisible && this.detailPanel) {
      this.updateRecordsPanel();
    }

    // Show confirmation message
    vscode.window.showInformationMessage('Code566 Records have been reset.');
  }

  /**
   * Deactivates the line/column records mode
   */
  public deactivate(): void {
    super.deactivate();

    // Hide detail status bar
    this.statusBarDetail.hide();

    // Dispose of the webview panel if it exists
    if (this.detailPanel) {
      this.detailPanel.dispose();
      this.detailPanel = undefined;
      this.isPanelVisible = false;
    }

    // Save records on deactivation
    const context = vscode.extensions.getExtension('aliv029bmj.code566')?.exports.getExtensionContext();
    if (context) {
      this.saveRecords(context);
    }
  }
} 