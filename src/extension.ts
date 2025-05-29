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

/**
 * Activate the extension
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  // Store context for access in modes
  extensionContext = context;

  // Initialize mode manager
  modeManager = new ModeManager(context);

  // Register all modes
  registerModes();

  // Register commands
  registerCommands(context);

  // Set up cursor position change listener
  setupCursorListener(context);

  // Activate the last selected mode or default to pixel pet mode
  activateLastOrDefaultMode();

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

    // Show quick pick to select mode
    const selectedItem = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a Code566 mode'
    });

    // Activate selected mode
    if (selectedItem) {
      modeManager.activateMode(selectedItem.id);
    }
  });

  // Register commands for specific modes
  const toggleHeatMapCommand = vscode.commands.registerCommand('code566.toggleHeatMap', () => {
    // This command is handled by the HeatMapMode class
  });

  const configureLineLengthCommand = vscode.commands.registerCommand('code566.configureLineLength', () => {
    // This command is handled by the LineLengthWarningMode class
  });

  const toggleCodeFeatureCommand = vscode.commands.registerCommand('code566.toggleCodeFeature', () => {
    // This command is handled by the CodeFeatureDetectorMode class
  });

  const showRecordsCommand = vscode.commands.registerCommand('code566.showRecords', () => {
    // This command is handled by the LineColumnRecordsMode class
  });

  const resetRecordsCommand = vscode.commands.registerCommand('code566.resetRecords', () => {
    // This command is handled by the LineColumnRecordsMode class
  });

  // Add commands to context subscriptions
  context.subscriptions.push(
    selectModeCommand,
    toggleHeatMapCommand,
    configureLineLengthCommand,
    toggleCodeFeatureCommand,
    showRecordsCommand,
    resetRecordsCommand
  );
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
 * Activate the last selected mode or default to pixel pet mode
 */
function activateLastOrDefaultMode() {
  // Get last active mode from global state or use default
  const lastModeId = extensionContext.globalState.get<string>('code566.activeMode', 'pixelpet');

  // Activate the mode
  if (!modeManager.activateMode(lastModeId)) {
    // If activation failed, use pixel pet mode as fallback
    modeManager.activateMode('pixelpet');
  }
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  // Nothing specific to clean up
}