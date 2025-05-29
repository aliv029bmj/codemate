import * as vscode from 'vscode';
import { IMode } from './IMode';

/**
 * Base class for all modes
 */
export abstract class BaseMode implements IMode {
  public readonly name: string;
  public readonly id: string;
  public statusBarItem!: vscode.StatusBarItem;

  /**
   * Constructor for BaseMode
   * @param name Display name for the mode
   * @param id Unique identifier for the mode
   * @param priority Status bar priority (higher value = further right)
   */
  constructor(name: string, id: string, priority: number) {
    this.name = name;
    this.id = id;
    this.createStatusBarItem(priority);
  }

  /**
   * Activates the mode
   * @param context Extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    // Show the status bar item
    this.statusBarItem.show();
  }

  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    // Hide the status bar item
    this.statusBarItem.hide();
  }

  /**
   * Updates the mode based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public abstract update(line: number, column: number): void;

  /**
   * Creates the status bar item for this mode
   * @param priority Priority position (higher = more right)
   */
  protected createStatusBarItem(priority: number): void {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, priority);
    this.statusBarItem.text = this.name;
    this.statusBarItem.tooltip = `${this.name} - Click to change mode`;
    this.statusBarItem.command = 'code566.selectMode';
    this.statusBarItem.show();
  }
}