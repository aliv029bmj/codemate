import * as vscode from 'vscode';
import { IMode } from './IMode';

/**
 * Base class for all modes that implements the IMode interface
 */
export abstract class BaseMode implements IMode {
  public name: string;
  public id: string;
  public statusBarItem: vscode.StatusBarItem;
  
  /**
   * Creates a new BaseMode
   * @param name The display name of the mode
   * @param id The unique identifier for the mode
   * @param priority The priority of the mode in the status bar (higher = more to the left)
   */
  constructor(name: string, id: string, priority: number = 100) {
    this.name = name;
    this.id = id;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      priority
    );
    this.statusBarItem.command = 'codemate.selectMode';
  }
  
  /**
   * Activates the mode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    this.statusBarItem.show();
  }
  
  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    this.statusBarItem.hide();
  }
  
  /**
   * Updates the mode display based on cursor position
   * Must be implemented by derived classes
   * @param line Current line number
   * @param column Current column number
   */
  public abstract update(line: number, column: number): void;
}