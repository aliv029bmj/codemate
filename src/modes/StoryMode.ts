import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * StoryMode displays a tiny part of a story on every line/column move
 */
export class StoryMode extends BaseMode {
  // Array of story fragments to display
  private storyFragments: string[];
  private currentFragmentIndex: number;
  
  /**
   * Creates a new StoryMode
   */
  constructor() {
    super('Story Mode', 'story', 100);
    
    // Initialize with placeholder story fragments
    // In a real implementation, these would be loaded from a file or API
    this.storyFragments = [
      "Once upon a time in a land of code...",
      "...a brave developer embarked on a journey...",
      "...to create the most elegant solution...",
      "...line by line, character by character...",
      "...fighting bugs and implementing features...",
      "...and learning new things along the way."
    ];
    
    this.currentFragmentIndex = 0;
    this.statusBarItem.text = `$(book) ${this.storyFragments[0]}`;
  }
  
  /**
   * Activates the StoryMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);
    
    // Reset to first fragment when activated
    this.currentFragmentIndex = 0;
    this.statusBarItem.text = `$(book) ${this.storyFragments[0]}`;
  }
  
  /**
   * Updates the story based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Change the story fragment based on line number
    const newIndex = (line % this.storyFragments.length);
    
    if (newIndex !== this.currentFragmentIndex) {
      this.currentFragmentIndex = newIndex;
      this.statusBarItem.text = `$(book) ${this.storyFragments[this.currentFragmentIndex]}`;
    }
  }
}