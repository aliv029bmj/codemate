import * as vscode from 'vscode';
import { IMode } from '../types/IMode';

/**
 * Manager class for handling all modes
 */
export class ModeManager {
  private modes: Map<string, IMode>;
  private activeMode: IMode | undefined;
  private context: vscode.ExtensionContext;
  private modeCommands: Map<string, vscode.Disposable[]>;
  private registeredCommandIds: Set<string>;
  private modeActivationLock: boolean = false;

  /**
   * Creates a new ModeManager
   * @param context The extension context
   */
  constructor(context: vscode.ExtensionContext) {
    this.modes = new Map<string, IMode>();
    this.context = context;
    this.modeCommands = new Map<string, vscode.Disposable[]>();
    this.registeredCommandIds = new Set<string>();
  }

  /**
   * Registers a mode with the manager
   * @param mode The mode to register
   */
  public registerMode(mode: IMode): void {
    this.modes.set(mode.id, mode);
  }

  /**
   * Activation lock - prevents the mode activation process from happening more than once at a time
   * @returns Whether the lock was acquired
   */
  private acquireActivationLock(): boolean {
    if (this.modeActivationLock) {
      return false;
    }
    this.modeActivationLock = true;
    return true;
  }

  /**
   * Releases the activation lock
   */
  private releaseActivationLock(): void {
    this.modeActivationLock = false;
  }

  /**
   * Activates a mode by ID
   * @param modeId The ID of the mode to activate
   * @returns true if activation was successful, false otherwise
   */
  public activateMode(modeId: string): boolean {
    if (!this.acquireActivationLock()) {
      console.log('Mode activation already in progress, request ignored.');
      return false;
    }

    try {
      if (this.activeMode && this.activeMode.id === modeId) {
        console.log(`${modeId} is already active.`);
        return true;
      }

      if (this.activeMode) {
        console.log(`Deactivating current mode: ${this.activeMode.id}`);
        this.deactivateCurrentMode();
      }

      const mode = this.modes.get(modeId);
      if (!mode) {
        console.log(`Mode not found: ${modeId}`);
        return false;
      }

      this.modes.forEach(m => {
        if (m !== mode && m.statusBarItem) {
          m.statusBarItem.hide();
        }
      });

      this.registerModeCommands(modeId);

      console.log(`Activating mode: ${modeId}`);
      mode.activate(this.context);
      this.activeMode = mode;

      this.context.globalState.update('code566.activeMode', modeId);

      return true;
    } catch (error) {
      console.error(`Error during mode activation: ${error}`);
      return false;
    } finally {
      this.releaseActivationLock();
    }
  }

  /**
   * Deactivates the current active mode
   */
  private deactivateCurrentMode(): void {
    if (this.activeMode) {
      try {
        this.disposeModeCommands(this.activeMode.id);
        this.activeMode.deactivate();
        const oldModeId = this.activeMode.id;
        this.activeMode = undefined;
        console.log(`Mode deactivated: ${oldModeId}`);
      } catch (error) {
        console.error(`Error during mode deactivation: ${error}`);
      }
    }
  }

  /**
   * Registers commands specific to a mode
   * @param modeId The ID of the mode
   */
  private registerModeCommands(modeId: string): void {
    const commands: vscode.Disposable[] = [];

    switch (modeId) {
      case 'heatmap':
        commands.push(
          vscode.commands.registerCommand('code566.toggleHeatMap', () => {
          })
        );
        break;
      case 'linelength':
        commands.push(
          vscode.commands.registerCommand('code566.configureLineLength', () => {
          })
        );
        break;
      case 'codefeature':
        commands.push(
          vscode.commands.registerCommand('code566.toggleCodeFeature', () => {
          })
        );
        break;
      case 'records':
        commands.push(
          vscode.commands.registerCommand('code566.showRecords', () => {
          }),
          vscode.commands.registerCommand('code566.resetRecords', () => {
          })
        );
        break;
      case 'stats':
        commands.push(
          vscode.commands.registerCommand('code566.toggleStats', () => {
          })
        );
        break;
    }

    if (commands.length > 0) {
      this.modeCommands.set(modeId, commands);

      commands.forEach(command => {
        this.context.subscriptions.push(command);
      });
    }
  }

  /**
   * Disposes of commands specific to a mode
   * @param modeId The ID of the mode
   */
  private disposeModeCommands(modeId: string): void {
    const commands = this.modeCommands.get(modeId);
    if (commands) {
      commands.forEach(command => {
        command.dispose();
      });
      this.modeCommands.delete(modeId);
    }
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

  /**
   * Disposes all mode resources and commands
   * For cleanup when the extension is deactivated or all modes are disabled
   */
  public dispose(): void {
    if (!this.acquireActivationLock()) {
      console.log('Mode deactivation already in progress, waiting...');
      setTimeout(() => this.dispose(), 100);
      return;
    }

    try {
      console.log('Cleaning up all modes and resources...');
      
      if (this.activeMode) {
        this.deactivateCurrentMode();
      }

      this.modes.clear();
      this.modeCommands.clear();
      this.registeredCommandIds.clear();
    } catch (error) {
      console.error(`Error during ModeManager disposal: ${error}`);
    } finally {
      this.releaseActivationLock();
    }
  }
}