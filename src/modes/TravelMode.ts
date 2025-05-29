import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * TravelMode simulates travel to different cities based on cursor position
 */
export class TravelMode extends BaseMode {
  // Array of cities with some basic info
  private cities: Array<{ name: string, country: string, emoji: string }>;
  private currentCityIndex: number;
  private lastLine: number;
  private lastColumn: number;
  
  /**
   * Creates a new TravelMode
   */
  constructor() {
    super('Travel Mode', 'travel', 100);
    
    // Initialize with some cities
    // In a real implementation, these would be loaded from a file or API
    this.cities = [
      { name: 'Paris', country: 'France', emoji: '🇫🇷' },
      { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
      { name: 'New York', country: 'USA', emoji: '🇺🇸' },
      { name: 'London', country: 'UK', emoji: '🇬🇧' },
      { name: 'Sydney', country: 'Australia', emoji: '🇦🇺' },
      { name: 'Rio de Janeiro', country: 'Brazil', emoji: '🇧🇷' },
      { name: 'Cairo', country: 'Egypt', emoji: '🇪🇬' },
      { name: 'Rome', country: 'Italy', emoji: '🇮🇹' },
      { name: 'Berlin', country: 'Germany', emoji: '🇩🇪' },
      { name: 'Mumbai', country: 'India', emoji: '🇮🇳' }
    ];
    
    this.currentCityIndex = 0;
    this.lastLine = 0;
    this.lastColumn = 0;
    
    // Set initial status bar display
    this.updateStatusBar();
  }
  
  /**
   * Activates the TravelMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);
    
    // Load last visited city if available
    this.currentCityIndex = context.globalState.get('codemate.travel.lastCity', 0);
    
    // Update the status bar
    this.updateStatusBar();
  }
  
  /**
   * Updates the travel location based on cursor position
   * @param line Current line number
   * @param column Current column number
   */
  public update(line: number, column: number): void {
    // Only update if position changed significantly
    const lineDiff = Math.abs(line - this.lastLine);
    const colDiff = Math.abs(column - this.lastColumn);
    
    // Travel to a new city if moved more than 10 lines or 20 columns
    if (lineDiff > 10 || colDiff > 20) {
      this.travelToNewCity(line, column);
      this.lastLine = line;
      this.lastColumn = column;
    }
  }
  
  /**
   * Travel to a new city based on current position
   */
  private travelToNewCity(line: number, column: number): void {
    // Use line and column numbers to determine next city
    // This creates a deterministic but seemingly random pattern
    const combinedValue = (line * 100 + column) % this.cities.length;
    
    if (combinedValue !== this.currentCityIndex) {
      // Save previous city for "journey" message
      const prevCity = this.cities[this.currentCityIndex];
      this.currentCityIndex = combinedValue;
      const newCity = this.cities[this.currentCityIndex];
      
      // Show notification about the journey
      vscode.window.showInformationMessage(
        `CodeMate Travel: You've journeyed from ${prevCity.name}, ${prevCity.country} ${prevCity.emoji} to ${newCity.name}, ${newCity.country} ${newCity.emoji}!`
      );
      
      // Save current city to extension context
      if (vscode.extensions.getExtension('codemate')) {
        const extension = vscode.extensions.getExtension('codemate');
        if (extension && extension.isActive) {
          extension.exports.getExtensionContext().globalState.update('codemate.travel.lastCity', this.currentCityIndex);
        }
      }
      
      // Update the status bar
      this.updateStatusBar();
    }
  }
  
  /**
   * Updates the status bar with current city info
   */
  private updateStatusBar(): void {
    const city = this.cities[this.currentCityIndex];
    this.statusBarItem.text = `$(globe) ${city.emoji} ${city.name}, ${city.country}`;
  }
  
  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    super.deactivate();
  }
}