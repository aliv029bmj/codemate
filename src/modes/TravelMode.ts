import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';
import { CityDatabase, City } from '../utils/CityDatabase';

/**
 * TravelMode simulates travel to different cities based on cursor position
 */
export class TravelMode extends BaseMode {
  private cityDB: CityDatabase;
  private cities: City[];
  private currentCityIndex: number;
  private lastLine: number;
  private lastColumn: number;
  private distanceTraveled: number;
  private virtualWorldSize: { width: number, height: number };
  private totalCitiesVisited: number;
  private visitedCityIndices: Set<number>;

  /**
   * Creates a new TravelMode
   */
  constructor() {
    super('Global Travel Mode', 'travel', 100);

    // Initialize the city database and get all cities
    this.cityDB = CityDatabase.getInstance();
    this.cities = this.cityDB.getAllCities();

    this.currentCityIndex = 0;
    this.lastLine = 0;
    this.lastColumn = 0;
    this.distanceTraveled = 0;
    this.totalCitiesVisited = 1; // Starting city counts as visited
    this.visitedCityIndices = new Set<number>([0]);

    // Virtual world size for mapping cursor position to coordinates
    this.virtualWorldSize = { width: 360, height: 180 }; // longitude: -180 to 180, latitude: -90 to 90

    // Set initial status bar display
    this.updateStatusBar();
  }

  /**
   * Activates the TravelMode
   * @param context The extension context
   */
  public activate(context: vscode.ExtensionContext): void {
    super.activate(context);

    // Load previous travel state from global state
    this.currentCityIndex = context.globalState.get('code566.travel.lastCity', 0);
    this.distanceTraveled = context.globalState.get('code566.travel.distance', 0);
    this.totalCitiesVisited = context.globalState.get('code566.travel.citiesVisited', 1);

    // Load visited cities
    const visitedCitiesArray = context.globalState.get<number[]>('code566.travel.visitedCities', [0]);
    this.visitedCityIndices = new Set(visitedCitiesArray);

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

    // Travel to a new city if moved more than 5 lines or 15 columns
    if (lineDiff > 5 || colDiff > 15) {
      this.travelToNewCity(line, column);
      this.lastLine = line;
      this.lastColumn = column;
    }
  }

  /**
   * Travel to a new city based on current position
   */
  private travelToNewCity(line: number, column: number): void {
    // Create virtual map coordinates from line and column
    const virtualLatitude = this.mapToLatitude(line);
    const virtualLongitude = this.mapToLongitude(column);

    // Find closest city to these virtual coordinates
    const newCityIndex = this.cityDB.findNearestCity(virtualLatitude, virtualLongitude, this.currentCityIndex);

    // Calculate distance between current city and new city
    const prevCity = this.cities[this.currentCityIndex];
    const newCity = this.cities[newCityIndex];
    const travelDistance = this.cityDB.calculateDistance(prevCity.lat, prevCity.lon, newCity.lat, newCity.lon);

    // Update total distance traveled
    this.distanceTraveled += travelDistance;

    // Mark this city as visited if it's new
    if (!this.visitedCityIndices.has(newCityIndex)) {
      this.visitedCityIndices.add(newCityIndex);
      this.totalCitiesVisited++;
    }

    // Format travel details nicely
    const formattedDistance = this.formatDistance(this.distanceTraveled);
    const localTime = this.getLocalTime(newCity.timeZone);

    // Show notification about the journey
    vscode.window.showInformationMessage(
      `Code566 Travel: You've journeyed from ${prevCity.name}, ${prevCity.country} ${prevCity.emoji} to ${newCity.name}, ${newCity.country} ${newCity.emoji}!
      • Distance: ${travelDistance.toFixed(1)}km
      • Total Distance: ${this.distanceTraveled.toFixed(1)}km
      • Cities Visited: ${this.totalCitiesVisited}/${this.cities.length}`
    );

    // Update current city index
    this.currentCityIndex = newCityIndex;

    // Save current state to extension context
    if (vscode.extensions.getExtension('code566')) {
      const extension = vscode.extensions.getExtension('code566');
      if (extension && extension.isActive) {
        const context = extension.exports.getExtensionContext();
        context.globalState.update('code566.travel.lastCity', this.currentCityIndex);
        context.globalState.update('code566.travel.distance', this.distanceTraveled);
        context.globalState.update('code566.travel.citiesVisited', this.totalCitiesVisited);
        context.globalState.update('code566.travel.visitedCities', Array.from(this.visitedCityIndices));
      }
    }

    // Update the status bar
    this.updateStatusBar();
  }

  /**
   * Map line number to latitude value (-90 to 90)
   */
  private mapToLatitude(line: number): number {
    // Use modulo to stay within range, then map to latitude range
    return ((line % this.virtualWorldSize.height) - (this.virtualWorldSize.height / 2));
  }

  /**
   * Map column number to longitude value (-180 to 180)
   */
  private mapToLongitude(column: number): number {
    // Use modulo to stay within range, then map to longitude range
    return ((column % this.virtualWorldSize.width) - (this.virtualWorldSize.width / 2));
  }

  /**
   * Format large distance numbers for better readability
   */
  private formatDistance(kilometers: number): string {
    if (kilometers >= 1000) {
      return `${(kilometers / 1000).toFixed(1)} thousand km`;
    }
    return `${kilometers} km`;
  }

  /**
   * Get localized time based on timezone
   */
  private getLocalTime(timezone: string): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };

    try {
      // Try to use the timezone, but fallback to local time if timezone not supported
      return new Date().toLocaleTimeString('en-US', { ...options, timeZone: timezone });
    } catch (e) {
      return new Date().toLocaleTimeString('en-US', options) + ` (${timezone})`;
    }
  }

  /**
   * Updates the status bar with current city info
   */
  private updateStatusBar(): void {
    const city = this.cities[this.currentCityIndex];
    const formattedDistance = this.formatDistance(this.distanceTraveled);
    const progressPercentage = Math.round((this.totalCitiesVisited / this.cities.length) * 100);

    this.statusBarItem.text = `$(globe) ${city.emoji} ${city.name}, ${city.country} | ${formattedDistance} | ${progressPercentage}% explored`;
    this.statusBarItem.tooltip = `You are in ${city.name}, ${city.country} (${city.lat.toFixed(2)}, ${city.lon.toFixed(2)})
Local language: ${city.language}
Time zone: ${city.timeZone}
${city.description}
Total journey: ${formattedDistance}
Cities visited: ${this.totalCitiesVisited}/${this.cities.length}`;
  }

  /**
   * Deactivates the mode and saves the state
   */
  public deactivate(): void {
    super.deactivate();

    // Save state when deactivated
    if (vscode.extensions.getExtension('code566')) {
      const extension = vscode.extensions.getExtension('code566');
      if (extension && extension.isActive) {
        const context = extension.exports.getExtensionContext();
        context.globalState.update('code566.travel.lastCity', this.currentCityIndex);
        context.globalState.update('code566.travel.distance', this.distanceTraveled);
        context.globalState.update('code566.travel.citiesVisited', this.totalCitiesVisited);
        context.globalState.update('code566.travel.visitedCities', Array.from(this.visitedCityIndices));
      }
    }
  }
}