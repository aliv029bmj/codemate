import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * PixelPetMode displays a virtual pet that reacts to coding behavior
 */
export class PixelPetMode extends BaseMode {
  // Pet state
  private mood: 'happy' | 'neutral' | 'sad';
  private energy: number;
  private experience: number;
  private level: number;
  private lastUpdateTime: number;
  private typingActivityCount: number;
  
  /**
   * Creates a new PixelPetMode
   */
  constructor() {
    super('Pixel Pet', 'pixelpet', 100);
    
    // Initialize pet state
    this.mood = 'neutral';
    this.energy = 100;
    this.experience = 0;
    this.level = 1;
    this.lastUpdateTime = Date.now();
    this.typingActivityCount = 0;
    
    // Set initial status bar display
    this.updateStatusBar();
  }
  
  /**
   * Activates the PixelPetMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);
    
    // Load pet state from storage if available
    this.loadState(context);
    
    // Register document change listener to track typing activity
    const changeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      this.handleTypingActivity(event);
    });
    
    // Add the subscription to context for proper disposal
    context.subscriptions.push(changeSubscription);
    
    // Start energy decay timer
    setInterval(() => this.updateEnergy(), 60000); // Every minute
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Updates the pet based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Pet reacts to cursor position - just a simple update for now
    this.updateStatusBar();
  }
  
  /**
   * Handles typing activity to update pet state
   * @param event The text document change event
   */
  private handleTypingActivity(event: vscode.TextDocumentChangeEvent): void {
    // Count typing activity
    this.typingActivityCount++;
    
    // Every 10 typing actions, give the pet some experience
    if (this.typingActivityCount >= 10) {
      this.experience += 5;
      this.typingActivityCount = 0;
      
      // Check for level up
      this.checkLevelUp();
      
      // Update mood based on activity
      this.mood = 'happy';
      
      // Update the status bar
      this.updateStatusBar();
    }
  }
  
  /**
   * Updates the pet's energy level
   */
  private updateEnergy(): void {
    // Decrease energy over time
    this.energy = Math.max(0, this.energy - 5);
    
    // Update mood based on energy
    if (this.energy < 30) {
      this.mood = 'sad';
    } else if (this.energy < 70) {
      this.mood = 'neutral';
    }
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Checks if the pet has leveled up
   */
  private checkLevelUp(): void {
    const experienceNeeded = this.level * 100;
    
    if (this.experience >= experienceNeeded) {
      this.level++;
      this.experience -= experienceNeeded;
      this.mood = 'happy';
      this.energy = 100;
      
      // Notify the user
      vscode.window.showInformationMessage(`Your CodeMate pet reached level ${this.level}!`);
    }
  }
  
  /**
   * Updates the status bar with the pet's current state
   */
  private updateStatusBar(): void {
    let petEmoji;
    
    // Choose emoji based on mood
    switch (this.mood) {
      case 'happy':
        petEmoji = '$(hubot) 😊';
        break;
      case 'neutral':
        petEmoji = '$(hubot) 😐';
        break;
      case 'sad':
        petEmoji = '$(hubot) 😢';
        break;
    }
    
    // Update the status bar text
    this.statusBarItem.text = `${petEmoji} Lvl ${this.level} E:${this.energy}%`;
  }
  
  /**
   * Loads the pet state from storage
   * @param context The extension context
   */
  private loadState(context: vscode.ExtensionContext): void {
    this.mood = context.globalState.get('codemate.pixelpet.mood', 'neutral') as 'happy' | 'neutral' | 'sad';
    this.energy = context.globalState.get('codemate.pixelpet.energy', 100);
    this.experience = context.globalState.get('codemate.pixelpet.experience', 0);
    this.level = context.globalState.get('codemate.pixelpet.level', 1);
    this.lastUpdateTime = context.globalState.get('codemate.pixelpet.lastUpdateTime', Date.now());
    
    // Calculate energy loss for time away
    const currentTime = Date.now();
    const minutesAway = Math.floor((currentTime - this.lastUpdateTime) / 60000);
    
    if (minutesAway > 0) {
      this.energy = Math.max(0, this.energy - (minutesAway * 2));
      this.lastUpdateTime = currentTime;
    }
  }
  
  /**
   * Saves the pet state to storage
   * @param context The extension context
   */
  private saveState(context: vscode.ExtensionContext): void {
    context.globalState.update('codemate.pixelpet.mood', this.mood);
    context.globalState.update('codemate.pixelpet.energy', this.energy);
    context.globalState.update('codemate.pixelpet.experience', this.experience);
    context.globalState.update('codemate.pixelpet.level', this.level);
    context.globalState.update('codemate.pixelpet.lastUpdateTime', Date.now());
  }
  
  /**
   * Deactivates the mode and saves the pet state
   */
  public deactivate(): void {
    super.deactivate();
    
    // Save state when deactivated
    if (vscode.extensions.getExtension('codemate')) {
      const extension = vscode.extensions.getExtension('codemate');
      if (extension && extension.isActive) {
        this.saveState(extension.exports.getExtensionContext());
      }
    }
  }
}