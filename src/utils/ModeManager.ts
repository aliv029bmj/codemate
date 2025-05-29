import * as vscode from 'vscode';
import { IMode } from '../types/IMode';

/**
 * Manager class for handling all modes
 */
export class ModeManager {
  private modes: Map<string, IMode>;
  private activeMode: IMode | undefined;
  private context: vscode.ExtensionContext;

  /**
   * Creates a new ModeManager
   * @param context The extension context
   */
  constructor(context: vscode.ExtensionContext) {
    this.modes = new Map<string, IMode>();
    this.context = context;
  }

  /**
   * Registers a mode with the manager
   * @param mode The mode to register
   */
  public registerMode(mode: IMode): void {
    this.modes.set(mode.id, mode);
  }

  /**
   * Activates a mode by ID
   * @param modeId The ID of the mode to activate
   * @returns true if activation was successful, false otherwise
   */
  public activateMode(modeId: string): boolean {
    // Deactivate current mode if there is one
    if (this.activeMode) {
      this.activeMode.deactivate();
    }

    const mode = this.modes.get(modeId);
    if (!mode) {
      return false;
    }

    mode.activate(this.context);
    this.activeMode = mode;

    // Save the active mode to global state
    this.context.globalState.update('code566.activeMode', modeId);

    return true;
  }

  /**
   * Gets the active mode
   * @returns The currently active mode or undefined if no mode is active
   */
  public getActiveMode(): IMode | undefined {
    return this.activeMode;
  }

  /**
   * Gets all registered modes
   * @returns An array of all registered modes
   */
  public getAllModes(): IMode[] {
    return Array.from(this.modes.values());
  }

  /**
   * Updates the active mode with the current cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public updatePosition(line: number, column: number): void {
    if (this.activeMode) {
      this.activeMode.update(line, column);
    }
  }
}