import * as vscode from 'vscode';
import { ModeManager } from './utils/ModeManager';
import { PixelPetMode } from './modes/PixelPetMode';
import { TravelMode } from './modes/TravelMode';
import { StatsHUDMode } from './modes/StatsHUDMode';
import { HeatMapMode } from './modes/HeatMapMode';
import { LineLengthWarningMode } from './modes/LineLengthWarningMode';
import { CodeFeatureDetectorMode } from './modes/CodeFeatureDetectorMode';
import { LineColumnRecordsMode } from './modes/LineColumnRecordsMode';

// Extension context to be accessible for modes
let extensionContext: vscode.ExtensionContext;

// Mode manager instance
let modeManager: ModeManager;

// Status bar item for mode selector
let modeStatusBarItem: vscode.StatusBarItem;

// Komut kayıtlarını kontrol etmek için
const registeredCommandIds: Set<string> = new Set<string>();

/**
 * Activate the extension
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  // Store context for access in modes
  extensionContext = context;

  // Initialize mode manager
  modeManager = new ModeManager(context);

  // Create status bar item for mode selection
  modeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  modeStatusBarItem.text = '$(gear) Code566';
  modeStatusBarItem.tooltip = 'Click to select a Code566 mode';
  modeStatusBarItem.command = 'code566.selectMode';
  modeStatusBarItem.show();
  context.subscriptions.push(modeStatusBarItem);

  // Register all modes
  registerModes();

  // Register commands
  registerCommands(context);

  // Set up cursor position change listener
  setupCursorListener(context);

  // Export context for use in modes
  return {
    getExtensionContext: () => extensionContext,
    // Mod sınıflarının komut kaydetmek için kullanabilecekleri fonksiyon
    registerCommand: (id: string, callback: (...args: any[]) => any): vscode.Disposable | undefined => {
      return registerCommandSafely(id, callback, context);
    }
  };
}

/**
 * Bir komutu güvenli bir şekilde kaydeder (çakışmaları önlemek için)
 * @param id Komut ID'si 
 * @param callback Komut callback fonksiyonu
 * @param context Extension context
 * @returns Komut disposable nesnesi
 */
function registerCommandSafely(id: string, callback: (...args: any[]) => any, context: vscode.ExtensionContext): vscode.Disposable | undefined {
  // Komut zaten kaydedilmiş mi kontrol et
  if (registeredCommandIds.has(id)) {
    console.log(`Command already registered: ${id}`);
    return undefined;
  }

  // Komutu kaydet
  const command = vscode.commands.registerCommand(id, callback);
  registeredCommandIds.add(id);
  context.subscriptions.push(command);
  return command;
}

/**
 * Register all available modes
 */
function registerModes() {
  // Create and register all modes - modların status bar öğeleri varsayılan olarak gizli olacak
  const modes = [
    new PixelPetMode(),
    new TravelMode(),
    new StatsHUDMode(),
    new HeatMapMode(),
    new LineLengthWarningMode(),
    new CodeFeatureDetectorMode(),
    new LineColumnRecordsMode()
  ];

  // Tüm modları kaydet ve status bar öğelerini gizle
  modes.forEach(mode => {
    // Kaydet
    modeManager.registerMode(mode);

    // Modun status bar öğesini gizle
    if (mode.statusBarItem) {
      mode.statusBarItem.hide();
    }
  });
}

/**
 * Register extension commands
 * @param context The extension context
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Register the mode selection command
  registerCommandSafely('code566.selectMode', async () => {
    const activeMode = modeManager.getActiveMode();
    const modes = modeManager.getAllModes();

    // Create quick pick items for each mode
    const items = modes.map(mode => {
      // Aktif mod işaretlenir
      const isActive = activeMode && activeMode.id === mode.id;
      return {
        label: `${isActive ? '$(check) ' : ''}${mode.name}`,
        description: mode.description || '',
        id: mode.id,
        isActive: isActive
      };
    });

    // Add option to disable all modes
    items.push({
      label: 'Disable All Modes',
      description: 'Turn off Code566 enhancement',
      id: 'none',
      isActive: activeMode === undefined
    });

    // Show quick pick to select mode
    const selectedItem = await vscode.window.showQuickPick(items, {
      placeHolder: activeMode
        ? `Current mode: ${activeMode.name} - Select to change`
        : 'Select a Code566 mode'
    });

    // Handle mode selection
    if (selectedItem) {
      // Eğer zaten aktif olan mod seçilirse, kullanıcıyı bilgilendir
      if (selectedItem.isActive) {
        vscode.window.showInformationMessage(`${selectedItem.id === 'none' ? 'No mode' : selectedItem.label.replace('$(check) ', '')} is already active.`);
        return;
      }

      if (selectedItem.id === 'none') {
        // Disable all modes
        disableAllModes();
      } else {
        // Eğer başka bir mod zaten aktifse, kullanıcıya bilgi ver
        if (activeMode) {
          vscode.window.showInformationMessage(`Changing mode from ${activeMode.name} to ${selectedItem.label.replace('$(check) ', '')}.`);
        } else {
          vscode.window.showInformationMessage(`Activating ${selectedItem.label.replace('$(check) ', '')}.`);
        }

        // Activate selected mode
        modeManager.activateMode(selectedItem.id);

        // Hide the main status bar item since the mode will show its own
        modeStatusBarItem.hide();
      }
    }
  }, context);

  // Register a dedicated command to disable all modes
  registerCommandSafely('code566.disableAllModes', () => {
    disableAllModes();
  }, context);
}

/**
 * Disable all modes and reset the UI
 */
function disableAllModes() {
  // Use the ModeManager's dispose method to properly clean up
  modeManager.dispose();

  // Komut kayıtlarını temizle
  registeredCommandIds.clear();

  // Temel komutları yeniden kaydet
  registerCommandSafely('code566.selectMode', async () => {
    // Komut içeriği
  }, extensionContext);

  registerCommandSafely('code566.disableAllModes', () => {
    disableAllModes();
  }, extensionContext);

  // Update global state to indicate no active mode
  extensionContext.globalState.update('code566.activeMode', null);

  // Show the main status bar item again
  modeStatusBarItem.show();

  // Show confirmation message
  vscode.window.showInformationMessage('All Code566 modes have been disabled.');
}

/**
 * Set up cursor position change listener
 * @param context The extension context
 */
function setupCursorListener(context: vscode.ExtensionContext) {
  // Listen for cursor position changes
  const cursorSubscription = vscode.window.onDidChangeTextEditorSelection((event) => {
    const editor = event.textEditor;
    if (editor) {
      const position = editor.selection.active;
      modeManager.updatePosition(position.line, position.character);
    }
  });

  // Add subscription to context
  context.subscriptions.push(cursorSubscription);
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  // Dispose of mode manager resources
  modeManager.dispose();

  // Hide status bar items
  modeStatusBarItem.hide();
}