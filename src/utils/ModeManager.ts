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
   * Aktivasyon kilidi - mod aktivasyon sürecinin tek seferde yalnızca bir kez gerçekleşmesini sağlar
   * @returns Kilit alınabildi mi
   */
  private acquireActivationLock(): boolean {
    if (this.modeActivationLock) {
      return false;
    }
    this.modeActivationLock = true;
    return true;
  }

  /**
   * Aktivasyon kilidini serbest bırakır
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
    // Eğer aktivasyon kilidi alınamazsa (başka bir aktivasyon süreci devam ediyorsa) işlemi durdur
    if (!this.acquireActivationLock()) {
      console.log('Mod aktivasyonu zaten devam ediyor, bu talep göz ardı edildi.');
      return false;
    }

    try {
      // Eğer istenen mod zaten aktifse işlem yapmaya gerek yok
      if (this.activeMode && this.activeMode.id === modeId) {
        console.log(`${modeId} zaten aktif.`);
        return true;
      }

      // Deactivate current mode if there is one
      if (this.activeMode) {
        console.log(`Deactivating current mode: ${this.activeMode.id}`);
        this.deactivateCurrentMode();
      }

      const mode = this.modes.get(modeId);
      if (!mode) {
        console.log(`Mod bulunamadı: ${modeId}`);
        return false;
      }

      // Tüm diğer modların gizli olduğundan emin ol
      this.modes.forEach(m => {
        if (m !== mode && m.statusBarItem) {
          m.statusBarItem.hide();
        }
      });

      // Register mode-specific commands based on the mode ID
      this.registerModeCommands(modeId);

      // Activate the mode
      console.log(`Activating mode: ${modeId}`);
      mode.activate(this.context);
      this.activeMode = mode;

      // Save the active mode to global state
      this.context.globalState.update('code566.activeMode', modeId);

      return true;
    } catch (error) {
      console.error(`Mod aktivasyonu sırasında hata: ${error}`);
      return false;
    } finally {
      // İşlem başarılı veya başarısız olsa da kilidi serbest bırak
      this.releaseActivationLock();
    }
  }

  /**
   * Deactivates the current active mode
   */
  private deactivateCurrentMode(): void {
    if (this.activeMode) {
      try {
        // Dispose of mode-specific commands
        this.disposeModeCommands(this.activeMode.id);

        // Deactivate the mode
        this.activeMode.deactivate();

        // Aktif mod referansını temizle
        const oldModeId = this.activeMode.id;
        this.activeMode = undefined;

        console.log(`Mode deactivated: ${oldModeId}`);
      } catch (error) {
        console.error(`Mod deaktivasyonu sırasında hata: ${error}`);
      }
    }
  }

  /**
   * Registers commands specific to a mode
   * @param modeId The ID of the mode
   */
  private registerModeCommands(modeId: string): void {
    const commands: vscode.Disposable[] = [];

    // Register commands based on the mode ID
    switch (modeId) {
      case 'heatmap':
        commands.push(
          vscode.commands.registerCommand('code566.toggleHeatMap', () => {
            // This will be handled by the HeatMapMode class
          })
        );
        break;
      case 'linelength':
        commands.push(
          vscode.commands.registerCommand('code566.configureLineLength', () => {
            // This will be handled by the LineLengthWarningMode class
          })
        );
        break;
      case 'codefeature':
        commands.push(
          vscode.commands.registerCommand('code566.toggleCodeFeature', () => {
            // This will be handled by the CodeFeatureDetectorMode class
          })
        );
        break;
      case 'records':
        commands.push(
          vscode.commands.registerCommand('code566.showRecords', () => {
            // This will be handled by the LineColumnRecordsMode class
          }),
          vscode.commands.registerCommand('code566.resetRecords', () => {
            // This will be handled by the LineColumnRecordsMode class
          })
        );
        break;
      case 'stats':
        commands.push(
          vscode.commands.registerCommand('code566.toggleStats', () => {
            // This will be handled by the StatsHUDMode class
          })
        );
        break;
    }

    // Store commands for later disposal
    if (commands.length > 0) {
      this.modeCommands.set(modeId, commands);

      // Add commands to context subscriptions
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
    // Ensure activation lock is acquired to prevent race conditions
    if (!this.acquireActivationLock()) {
      console.log('Mod deaktivasyonu zaten devam ediyor, bekleyin...');
      // Wait a bit and try again
      setTimeout(() => this.dispose(), 100);
      return;
    }

    try {
      console.log('Cleaning up all modes and resources...');

      // Deactivate current mode if there is one
      if (this.activeMode) {
        console.log(`Deactivating active mode: ${this.activeMode.id}`);
        this.deactivateCurrentMode();
      }

      // Dispose all remaining commands
      this.modeCommands.forEach((commands, modeId) => {
        console.log(`Disposing commands for mode: ${modeId}`);
        commands.forEach(command => {
          command.dispose();
        });
      });
      this.modeCommands.clear();

      // Clear active mode reference
      this.activeMode = undefined;

      // Tüm modların status bar öğelerini gizle
      this.modes.forEach(mode => {
        if (mode.statusBarItem) {
          console.log(`Hiding status bar for mode: ${mode.id}`);
          mode.statusBarItem.hide();
        }
      });

      console.log('All modes and resources cleaned up successfully.');
    } catch (error) {
      console.error(`Mod temizliği sırasında hata: ${error}`);
    } finally {
      this.releaseActivationLock();
    }
  }
}