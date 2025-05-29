import * as vscode from 'vscode';

/**
 * Interface for all Code566 modes
 */
export interface IMode {
  /**
   * The name of the mode
   */
  name: string;

  /**
   * The unique identifier for the mode
   */
  id: string;

  /**
   * The status bar item to display the mode information
   */
  statusBarItem: vscode.StatusBarItem;

  /**
   * Activates the mode
   * @param context The extension context
   */
  activate(context: vscode.ExtensionContext): void;

  /**
   * Deactivates the mode
   */
  deactivate(): void;

  /**
   * Updates the mode display based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  update(line: number, column: number): void;
}