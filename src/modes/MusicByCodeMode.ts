import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

// Mock AudioContext interface for TypeScript compiler
interface AudioContext {
  // Mock interface to make TypeScript happy
  destination: any;
  createOscillator(): any;
  createGain(): any;
  currentTime: number;
}

/**
 * MusicByCodeMode plays dynamic music based on line and column activity
 */
export class MusicByCodeMode extends BaseMode {
  private audioContext: AudioContext | undefined;
  private isMuted: boolean;
  private lastNote: number;
  private volume: number;
  private isPlaying: boolean;
  private scale: number[];
  
  /**
   * Creates a new MusicByCodeMode
   */
  constructor() {
    super('Music By Code', 'music', 100);
    
    this.isMuted = false;
    this.lastNote = 0;
    this.volume = 0.5;
    this.isPlaying = false;
    
    // Pentatonic scale frequencies (sounds good regardless of combination)
    this.scale = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25  // C5
    ];
    
    // Set initial status bar display
    this.updateStatusBar();
  }
  
  /**
   * Activates the MusicByCodeMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);
    
    // Initialize AudioContext - this can only be created on user gesture
    // In a real implementation, we would need to wait for a user action
    try {
      // AudioContext is not available in the VS Code extension host
      // This is a mock implementation that would be replaced in a real extension
      // with a Web Audio API implementation or a Node.js based audio solution
      this.mockInitializeAudio();
      
      // Register click handler to toggle mute
      this.statusBarItem.command = {
        title: 'Toggle Music',
        command: 'codemate.toggleMusic',
        arguments: [this]
      };
      
      // Register the toggle command
      const toggleCommand = vscode.commands.registerCommand('codemate.toggleMusic', (musicMode: MusicByCodeMode) => {
        musicMode.toggleMute();
      });
      
      // Add subscription to context
      context.subscriptions.push(toggleCommand);
      
      // Update the status bar
      this.updateStatusBar();
    } catch (error) {
      vscode.window.showErrorMessage('CodeMate: Could not initialize audio context.');
      console.error('CodeMate Audio Error:', error);
    }
  }
  
  /**
   * Updates the music based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    if (this.isMuted) {
      return;
    }
    
    // Map line number to a note in the scale
    const noteIndex = line % this.scale.length;
    const frequency = this.scale[noteIndex];
    
    // Map column to volume (0-100%)
    const normalizedVolume = Math.min(column / 80, 1.0) * this.volume;
    
    // Only play if the note changed and is not muted
    if (noteIndex !== this.lastNote) {
      this.lastNote = noteIndex;
      this.playNote(frequency, normalizedVolume);
    }
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Mock method to initialize audio
   * In a real implementation, this would be replaced with actual Web Audio API code
   * or a Node.js based audio solution like 'node-speaker'
   */
  private mockInitializeAudio(): void {
    // Mock audio context initialization
    // In a real implementation, this would create an actual AudioContext
    this.isPlaying = false;
    
    // Show a message to the user explaining the mock behavior
    vscode.window.showInformationMessage(
      'CodeMate Music Mode: Audio playback is simulated in this version.'
    );
  }
  
  /**
   * Mock method to play a note
   * In a real implementation, this would use the Web Audio API to generate sound
   * @param frequency The frequency of the note to play
   * @param volume The volume of the note (0-1)
   */
  private playNote(frequency: number, volume: number): void {
    if (this.isMuted) {
      return;
    }
    
    // In a real implementation, this would create an oscillator node
    // and connect it to the audio context destination
    this.isPlaying = true;
    
    // Mock playing a note for 200ms
    setTimeout(() => {
      this.isPlaying = false;
      this.updateStatusBar();
    }, 200);
    
    // Update the status bar to show we're playing
    this.updateStatusBar();
  }
  
  /**
   * Toggles the mute state
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    // Show message to user
    if (this.isMuted) {
      vscode.window.showInformationMessage('CodeMate Music: Muted');
    } else {
      vscode.window.showInformationMessage('CodeMate Music: Unmuted');
    }
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Updates the status bar with current music state
   */
  private updateStatusBar(): void {
    let icon = this.isMuted ? '$(mute)' : '$(unmute)';
    
    // Show playing indicator if actively playing a note
    if (this.isPlaying && !this.isMuted) {
      this.statusBarItem.text = `${icon} $(pulse) Note: ${this.getNoteName(this.lastNote)}`;
    } else {
      this.statusBarItem.text = `${icon} Music By Code`;
    }
  }
  
  /**
   * Gets the name of a note from its index in the scale
   * @param index The index in the scale array
   * @returns The name of the note
   */
  private getNoteName(index: number): string {
    const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    return noteNames[index];
  }
  
  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    super.deactivate();
    
    // Clean up audio context if it exists
    // In a real implementation, this would stop all audio
    this.isPlaying = false;
  }
}