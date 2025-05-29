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

// Status bar item for when no mode is selected
let noModeStatusBarItem: vscode.StatusBarItem;

/**
 * Activate the extension
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  // Store context for access in modes
  extensionContext = context;

  // Initialize mode manager
  modeManager = new ModeManager(context);

  // Create status bar item for when no mode is selected
  noModeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  noModeStatusBarItem.text = '$(info) Select Code566 Mode';
  noModeStatusBarItem.tooltip = 'Click to select a Code566 mode';
  noModeStatusBarItem.command = 'code566.selectMode';
  noModeStatusBarItem.show();
  context.subscriptions.push(noModeStatusBarItem);

  // Register all modes
  registerModes();

  // Register commands
  registerCommands(context);

  // Set up cursor position change listener
  setupCursorListener(context);

  // Check if a mode was previously active
  const lastModeId = extensionContext.globalState.get<string>('code566.activeMode');

  if (lastModeId) {
    // Activate the last used mode if there was one
    modeManager.activateMode(lastModeId);
    noModeStatusBarItem.hide();
  } else {
    // Show welcome message if this is first time
    const hasShownWelcome = context.globalState.get<boolean>('code566.hasShownWelcome', false);
    if (!hasShownWelcome) {
      vscode.window.showInformationMessage(
        'Welcome to Code566! Please select a mode to enhance your line/column display.',
        'Select Mode'
      ).then(selection => {
        if (selection === 'Select Mode') {
          vscode.commands.executeCommand('code566.selectMode');
        }
      });
      context.globalState.update('code566.hasShownWelcome', true);
    }
  }

  // Export context for use in modes
  return {
    getExtensionContext: () => extensionContext
  };
}

/**
 * Register all available modes
 */
function registerModes() {
  // Create and register all modes
  modeManager.registerMode(new PixelPetMode());
  modeManager.registerMode(new TravelMode());
  modeManager.registerMode(new StatsHUDMode());
  modeManager.registerMode(new HeatMapMode());
  modeManager.registerMode(new LineLengthWarningMode());
  modeManager.registerMode(new CodeFeatureDetectorMode());
  modeManager.registerMode(new LineColumnRecordsMode());
}

/**
 * Register extension commands
 * @param context The extension context
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Register the mode selection command
  const selectModeCommand = vscode.commands.registerCommand('code566.selectMode', async () => {
    const modes = modeManager.getAllModes();

    // Create quick pick items for each mode
    const items = modes.map(mode => ({
      label: mode.name,
      description: '',
      id: mode.id
    }));

    // Add option to disable all modes
    items.push({
      label: 'Disable All Modes',
      description: 'Turn off Code566 enhancement',
      id: 'none'
    });

    // Show quick pick to select mode
    const selectedItem = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a Code566 mode'
    });

    // Handle mode selection
    if (selectedItem) {
      if (selectedItem.id === 'none') {
        // Deactivate current mode if there is one
        const activeMode = modeManager.getActiveMode();
        if (activeMode) {
          activeMode.deactivate();
        }
        // Update global state
        extensionContext.globalState.update('code566.activeMode', undefined);
        // Show the no mode status bar item
        noModeStatusBarItem.show();
      } else {
        // Activate selected mode
        modeManager.activateMode(selectedItem.id);
        // Hide the no mode status bar item
        noModeStatusBarItem.hide();
      }
    }
  });

  // Add commands to context subscriptions
  context.subscriptions.push(selectModeCommand);
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
  noModeStatusBarItem.hide();
}