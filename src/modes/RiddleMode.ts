import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * RiddleMode displays a new riddle at each line change
 */
export class RiddleMode extends BaseMode {
  // Array of riddles
  private riddles: Array<{ question: string, answer: string }>;
  private currentRiddleIndex: number;
  private lastLine: number;
  private showingAnswer: boolean;
  
  /**
   * Creates a new RiddleMode
   */
  constructor() {
    super('Riddle Mode', 'riddle', 100);
    
    // Initialize with some simple riddles
    // In a real implementation, these would be loaded from a file or API
    this.riddles = [
      { 
        question: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", 
        answer: "An echo" 
      },
      { 
        question: "The more you take, the more you leave behind. What are they?", 
        answer: "Footsteps" 
      },
      { 
        question: "What has keys but no locks, space but no room, and you can enter but not go in?", 
        answer: "A keyboard" 
      },
      { 
        question: "What gets wet while drying?", 
        answer: "A towel" 
      },
      { 
        question: "What can travel around the world while staying in a corner?", 
        answer: "A stamp" 
      },
      { 
        question: "I'm light as a feather, yet the strongest person can't hold me for more than a few minutes. What am I?", 
        answer: "Breath" 
      },
      { 
        question: "What has a head and a tail, but no body?", 
        answer: "A coin" 
      },
      { 
        question: "What is full of holes but still holds water?", 
        answer: "A sponge" 
      }
    ];
    
    this.currentRiddleIndex = 0;
    this.lastLine = 0;
    this.showingAnswer = false;
    
    // Set initial status bar display
    this.updateStatusBar();
  }
  
  /**
   * Activates the RiddleMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);
    
    // Register click command to toggle answer
    this.statusBarItem.command = {
      title: 'Toggle Riddle Answer',
      command: 'codemate.toggleRiddleAnswer',
      arguments: [this]
    };
    
    // Register the toggle command
    const toggleCommand = vscode.commands.registerCommand('codemate.toggleRiddleAnswer', (riddleMode: RiddleMode) => {
      riddleMode.toggleAnswer();
    });
    
    // Add subscription to context
    context.subscriptions.push(toggleCommand);
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Updates the riddle based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Change the riddle if line changed significantly (every 5 lines)
    const lineDiff = Math.abs(line - this.lastLine);
    
    if (lineDiff >= 5) {
      this.showingAnswer = false;
      this.currentRiddleIndex = (this.currentRiddleIndex + 1) % this.riddles.length;
      this.lastLine = line;
      this.updateStatusBar();
    }
  }
  
  /**
   * Toggles between showing the riddle question and answer
   */
  public toggleAnswer(): void {
    this.showingAnswer = !this.showingAnswer;
    this.updateStatusBar();
  }
  
  /**
   * Updates the status bar with current riddle
   */
  private updateStatusBar(): void {
    const riddle = this.riddles[this.currentRiddleIndex];
    
    if (this.showingAnswer) {
      // Show the answer
      this.statusBarItem.text = `$(lightbulb) Answer: ${riddle.answer}`;
    } else {
      // Show the question
      // Truncate if too long to fit in status bar
      let question = riddle.question;
      if (question.length > 50) {
        question = question.substring(0, 47) + '...';
      }
      this.statusBarItem.text = `$(question) ${question}`;
    }
  }
  
  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    super.deactivate();
  }
}