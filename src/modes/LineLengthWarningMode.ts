import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * LineLengthWarningMode provides visual warnings when lines exceed recommended length
 */
export class LineLengthWarningMode extends BaseMode {
  private maxLineLength: number;
  private warningThreshold: number;
  private lineDecorations: vscode.TextEditorDecorationType[];
  private detailStatusBar: vscode.StatusBarItem;
  private languageSettings: Map<string, number>;
  private activeDecorations: vscode.TextEditorDecorationType | undefined;

  /**
   * Creates a new LineLengthWarningMode
   */
  constructor() {
    super('Line Length', 'linelength', 93);

    // Default maximum line length
    this.maxLineLength = 80;
    this.warningThreshold = 100;

    // Language-specific settings
    this.languageSettings = new Map<string, number>([
      ['javascript', 80],
      ['typescript', 120],
      ['python', 79],
      ['java', 100],
      ['c', 80],
      ['cpp', 80],
      ['csharp', 120],
      ['go', 100],
      ['rust', 100],
      ['html', 120],
      ['css', 80],
      ['markdown', 100]
    ]);

    // Create decorations for different levels of warning
    this.lineDecorations = [
      // Warning level 1 (approaching max length)
      vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(255, 255, 0, 0.5)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
      }),
      // Warning level 2 (exceeding max length)
      vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(255, 165, 0, 0.5)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
      }),
      // Warning level 3 (exceeding threshold)
      vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        isWholeLine: true,
        overviewRulerColor: 'rgba(255, 0, 0, 0.5)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
      })
    ];

    // Create additional status bar item for detailed information
    this.detailStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 92);

    // Set initial status bar display
    this.updateStatusBar(0, 0);
  }

  /**
   * Activates the Line Length Warning mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Show additional status bar item
    this.detailStatusBar.show();

    // Register editor change event
    const changeEditorSubscription = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.updateLineDecorations(editor);

        // Get current position
        const position = editor.selection.active;
        this.update(position.line, position.character);
      }
    });

    // Register document change event
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        this.updateLineDecorations(editor);
      }
    });

    // Register selection change event
    const changeSelectionSubscription = vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === vscode.window.activeTextEditor) {
        const position = event.textEditor.selection.active;
        this.update(position.line, position.character);
      }
    });

    // Register command to configure line length settings
    const configureCommand = vscode.commands.registerCommand('code566.configureLineLength', async () => {
      await this.configureSettings();
    });

    // Override status bar command
    this.statusBarItem.command = 'code566.configureLineLength';
    this.statusBarItem.tooltip = 'Configure line length settings';
    this.detailStatusBar.command = 'code566.configureLineLength';
    this.detailStatusBar.tooltip = 'Configure line length settings';

    // Add subscriptions to context
    context.subscriptions.push(
      changeEditorSubscription,
      changeDocumentSubscription,
      changeSelectionSubscription,
      configureCommand,
      this.detailStatusBar
    );

    // Initialize decorations for current editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.updateLineDecorations(editor);
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
  }

  /**
   * Updates the status bar with line length information
   * @param line Current line number
   * @param column Current column number
   */
  private updateStatusBar(line: number, column: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.statusBarItem.text = '$(alert) Line Length: No editor';
      this.detailStatusBar.text = '';
      return;
    }

    // Get current line and its length
    const currentLine = editor.document.lineAt(line);
    const lineLength = currentLine.text.length;

    // Get language-specific max length
    const languageId = editor.document.languageId;
    this.maxLineLength = this.languageSettings.get(languageId) || 80;

    // Calculate percentage of max length
    const percentage = Math.round((lineLength / this.maxLineLength) * 100);

    // Set status bar text with basic info
    this.statusBarItem.text = `$(ruler) Ln ${line + 1}, Col ${column + 1}`;

    // Set detail status bar with line length info
    this.detailStatusBar.text = `Length: ${lineLength}/${this.maxLineLength} (${percentage}%)`;

    // Set color based on how close to max length
    if (lineLength > this.warningThreshold) {
      this.detailStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (lineLength > this.maxLineLength) {
      this.detailStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else if (lineLength > this.maxLineLength * 0.8) {
      this.detailStatusBar.backgroundColor = undefined;
    } else {
      this.detailStatusBar.backgroundColor = undefined;
    }
  }

  /**
   * Updates line decorations for the given editor
   * @param editor The text editor to update decorations for
   */
  private updateLineDecorations(editor: vscode.TextEditor): void {
    // Clear all existing decorations
    for (const decoration of this.lineDecorations) {
      editor.setDecorations(decoration, []);
    }

    // Get language-specific max length
    const languageId = editor.document.languageId;
    this.maxLineLength = this.languageSettings.get(languageId) || 80;

    // Arrays for different warning levels
    const warningLevel1: vscode.Range[] = []; // 80-100% of max length
    const warningLevel2: vscode.Range[] = []; // 100-125% of max length
    const warningLevel3: vscode.Range[] = []; // >125% of max length

    // Check each line in the document
    for (let i = 0; i < editor.document.lineCount; i++) {
      const line = editor.document.lineAt(i);
      const lineLength = line.text.length;

      if (lineLength > this.warningThreshold) {
        // Severe warning - exceeding threshold
        warningLevel3.push(line.range);
      } else if (lineLength > this.maxLineLength) {
        // Warning - exceeding max length
        warningLevel2.push(line.range);
      } else if (lineLength > this.maxLineLength * 0.8) {
        // Notice - approaching max length
        warningLevel1.push(line.range);
      }
    }

    // Apply decorations
    editor.setDecorations(this.lineDecorations[0], warningLevel1);
    editor.setDecorations(this.lineDecorations[1], warningLevel2);
    editor.setDecorations(this.lineDecorations[2], warningLevel3);
  }

  /**
   * Configures line length settings
   */
  private async configureSettings(): Promise<void> {
    // Get active editor language
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const languageId = editor.document.languageId;
    const currentMax = this.languageSettings.get(languageId) || 80;

    // Show input box to update max line length
    const result = await vscode.window.showInputBox({
      prompt: `Set maximum line length for ${languageId}`,
      value: currentMax.toString(),
      validateInput: (input) => {
        const num = parseInt(input, 10);
        if (isNaN(num) || num <= 0) {
          return 'Please enter a positive number';
        }
        return null;
      }
    });

    if (result) {
      const newMax = parseInt(result, 10);

      // Update language setting
      this.languageSettings.set(languageId, newMax);

      // Update warning threshold (125% of max length)
      this.warningThreshold = Math.floor(newMax * 1.25);

      // Update decorations
      this.updateLineDecorations(editor);

      // Update status bar
      const position = editor.selection.active;
      this.update(position.line, position.character);

      vscode.window.showInformationMessage(
        `Maximum line length for ${languageId} set to ${newMax} (warning at ${this.warningThreshold})`
      );
    }
  }

  /**
   * Deactivates the line length warning mode
   */
  public deactivate(): void {
    super.deactivate();

    // Hide status bar item
    this.detailStatusBar.hide();

    // Clear decorations
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      for (const decoration of this.lineDecorations) {
        editor.setDecorations(decoration, []);
      }
    }
  }
} 