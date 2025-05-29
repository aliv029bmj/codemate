import * as vscode from 'vscode';
import { BaseMode } from '../types/BaseMode';

/**
 * TravelMode simulates travel to different cities based on cursor position
 */
export class TravelMode extends BaseMode {
  // Array of cities with detailed info including coordinates
  private cities: Array<{
    name: string,
    country: string,
    emoji: string,
    lat: number,
    lon: number,
    description: string,
    timeZone: string,
    language: string
  }>;
  private currentCityIndex: number;
  private lastLine: number;
  private lastColumn: number;
  private distanceTraveled: number;

  /**
   * Creates a new TravelMode
   */
  constructor() {
    super('Global Travel Mode', 'travel', 100);

    // Initialize with many cities from around the world
    // In a real implementation, these would be loaded from a database or API
    this.cities = [
      { name: 'Paris', country: 'France', emoji: '🇫🇷', lat: 48.8566, lon: 2.3522, description: 'City of Light', timeZone: 'CET', language: 'French' },
      { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵', lat: 35.6762, lon: 139.6503, description: 'Vibrant metropolis', timeZone: 'JST', language: 'Japanese' },
      { name: 'New York', country: 'USA', emoji: '🇺🇸', lat: 40.7128, lon: -74.0060, description: 'The Big Apple', timeZone: 'EST', language: 'English' },
      { name: 'London', country: 'UK', emoji: '🇬🇧', lat: 51.5074, lon: -0.1278, description: 'Historic capital', timeZone: 'GMT', language: 'English' },
      { name: 'Sydney', country: 'Australia', emoji: '🇦🇺', lat: -33.8688, lon: 151.2093, description: 'Harbor city', timeZone: 'AEST', language: 'English' },
      { name: 'Rio de Janeiro', country: 'Brazil', emoji: '🇧🇷', lat: -22.9068, lon: -43.1729, description: 'Marvelous city', timeZone: 'BRT', language: 'Portuguese' },
      { name: 'Cairo', country: 'Egypt', emoji: '🇪🇬', lat: 30.0444, lon: 31.2357, description: 'City of a thousand minarets', timeZone: 'EET', language: 'Arabic' },
      { name: 'Rome', country: 'Italy', emoji: '🇮🇹', lat: 41.9028, lon: 12.4964, description: 'Eternal city', timeZone: 'CET', language: 'Italian' },
      { name: 'Berlin', country: 'Germany', emoji: '🇩🇪', lat: 52.5200, lon: 13.4050, description: 'Cultural capital', timeZone: 'CET', language: 'German' },
      { name: 'Mumbai', country: 'India', emoji: '🇮🇳', lat: 19.0760, lon: 72.8777, description: 'City of dreams', timeZone: 'IST', language: 'Hindi/English' },
      { name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷', lat: 41.0082, lon: 28.9784, description: 'Where East meets West', timeZone: 'TRT', language: 'Turkish' },
      { name: 'Dubai', country: 'UAE', emoji: '🇦🇪', lat: 25.2048, lon: 55.2708, description: 'City of gold', timeZone: 'GST', language: 'Arabic' },
      { name: 'Singapore', country: 'Singapore', emoji: '🇸🇬', lat: 1.3521, lon: 103.8198, description: 'Garden city', timeZone: 'SGT', language: 'English/Mandarin' },
      { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸', lat: 41.3851, lon: 2.1734, description: 'Catalan jewel', timeZone: 'CET', language: 'Spanish/Catalan' },
      { name: 'Bangkok', country: 'Thailand', emoji: '🇹🇭', lat: 13.7563, lon: 100.5018, description: 'City of Angels', timeZone: 'ICT', language: 'Thai' },
      { name: 'Cape Town', country: 'South Africa', emoji: '🇿🇦', lat: -33.9249, lon: 18.4241, description: 'Mother city', timeZone: 'SAST', language: 'English/Afrikaans' },
      { name: 'Moscow', country: 'Russia', emoji: '🇷🇺', lat: 55.7558, lon: 37.6173, description: 'Historic metropolis', timeZone: 'MSK', language: 'Russian' },
      { name: 'Toronto', country: 'Canada', emoji: '🇨🇦', lat: 43.6532, lon: -79.3832, description: 'The Six', timeZone: 'EST', language: 'English/French' },
      { name: 'Mexico City', country: 'Mexico', emoji: '🇲🇽', lat: 19.4326, lon: -99.1332, description: 'Ancient capital', timeZone: 'CST', language: 'Spanish' },
      { name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱', lat: 52.3676, lon: 4.9041, description: 'City of canals', timeZone: 'CET', language: 'Dutch' },
      { name: 'Buenos Aires', country: 'Argentina', emoji: '🇦🇷', lat: -34.6037, lon: -58.3816, description: 'Paris of South America', timeZone: 'ART', language: 'Spanish' },
      { name: 'Vienna', country: 'Austria', emoji: '🇦🇹', lat: 48.2082, lon: 16.3738, description: 'City of music', timeZone: 'CET', language: 'German' },
      { name: 'Seoul', country: 'South Korea', emoji: '🇰🇷', lat: 37.5665, lon: 126.9780, description: 'Dynamic city', timeZone: 'KST', language: 'Korean' },
      { name: 'Stockholm', country: 'Sweden', emoji: '🇸🇪', lat: 59.3293, lon: 18.0686, description: 'Venice of the North', timeZone: 'CET', language: 'Swedish' },
      { name: 'Prague', country: 'Czech Republic', emoji: '🇨🇿', lat: 50.0755, lon: 14.4378, description: 'City of a hundred spires', timeZone: 'CET', language: 'Czech' },
      { name: 'Helsinki', country: 'Finland', emoji: '🇫🇮', lat: 60.1699, lon: 24.9384, description: 'Daughter of the Baltic', timeZone: 'EET', language: 'Finnish' },
      { name: 'Marrakech', country: 'Morocco', emoji: '🇲🇦', lat: 31.6295, lon: -7.9811, description: 'Red city', timeZone: 'WEST', language: 'Arabic' },
      { name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', lat: 35.0116, lon: 135.7681, description: 'Cultural heart of Japan', timeZone: 'JST', language: 'Japanese' },
      { name: 'Athens', country: 'Greece', emoji: '🇬🇷', lat: 37.9838, lon: 23.7275, description: 'Birthplace of democracy', timeZone: 'EET', language: 'Greek' },
      { name: 'Auckland', country: 'New Zealand', emoji: '🇳🇿', lat: -36.8509, lon: 174.7645, description: 'City of sails', timeZone: 'NZST', language: 'English/Māori' },
      { name: 'Copenhagen', country: 'Denmark', emoji: '🇩🇰', lat: 55.6761, lon: 12.5683, description: 'City of cyclists', timeZone: 'CET', language: 'Danish' },
      { name: 'São Paulo', country: 'Brazil', emoji: '🇧🇷', lat: -23.5505, lon: -46.6333, description: 'Financial center', timeZone: 'BRT', language: 'Portuguese' },
      { name: 'Jerusalem', country: 'Israel', emoji: '🇮🇱', lat: 31.7683, lon: 35.2137, description: 'Holy city', timeZone: 'IST', language: 'Hebrew/Arabic' },
      { name: 'Edinburgh', country: 'UK', emoji: '🇬🇧', lat: 55.9533, lon: -3.1883, description: 'Athens of the North', timeZone: 'GMT', language: 'English' },
      { name: 'Dublin', country: 'Ireland', emoji: '🇮🇪', lat: 53.3498, lon: -6.2603, description: 'City of literature', timeZone: 'GMT', language: 'English/Irish' },
      { name: 'Oslo', country: 'Norway', emoji: '🇳🇴', lat: 59.9139, lon: 10.7522, description: 'Tiger city', timeZone: 'CET', language: 'Norwegian' },
      { name: 'Honolulu', country: 'USA', emoji: '🇺🇸', lat: 21.3069, lon: -157.8583, description: 'Sheltered bay', timeZone: 'HST', language: 'English/Hawaiian' },
      { name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷', lat: 41.0082, lon: 28.9784, description: 'Where East meets West', timeZone: 'TRT', language: 'Turkish' },
      { name: 'Shanghai', country: 'China', emoji: '🇨🇳', lat: 31.2304, lon: 121.4737, description: 'Pearl of the Orient', timeZone: 'CST', language: 'Mandarin' },
      { name: 'Beijing', country: 'China', emoji: '🇨🇳', lat: 39.9042, lon: 116.4074, description: 'Capital city', timeZone: 'CST', language: 'Mandarin' },
      { name: 'Ankara', country: 'Turkey', emoji: '🇹🇷', lat: 39.9334, lon: 32.8597, description: 'Heart of Turkey', timeZone: 'TRT', language: 'Turkish' }
    ];

    this.currentCityIndex = 0;
    this.lastLine = 0;
    this.lastColumn = 0;
    this.distanceTraveled = 0;

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
    this.distanceTraveled = context.globalState.get('codemate.travel.distance', 0);

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
   * Calculate distance between two geographical coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance);
  }

  /**
   * Travel to a new city based on current position
   */
  private travelToNewCity(line: number, column: number): void {
    // Create virtual map coordinates from line and column
    const virtualLatitude = ((line % 180) - 90); // Range from -90 to 90
    const virtualLongitude = ((column % 360) - 180); // Range from -180 to 180

    // Find closest city to these virtual coordinates
    let minDistance = Infinity;
    let closestCityIndex = 0;

    for (let i = 0; i < this.cities.length; i++) {
      if (i === this.currentCityIndex) continue; // Skip current city

      const city = this.cities[i];
      const distance = this.calculateDistance(virtualLatitude, virtualLongitude, city.lat, city.lon);

      if (distance < minDistance) {
        minDistance = distance;
        closestCityIndex = i;
      }
    }

    // Make sure we don't get the same city twice in a row
    if (closestCityIndex === this.currentCityIndex) {
      closestCityIndex = (closestCityIndex + 1) % this.cities.length;
    }

    // Calculate distance between current city and new city
    const prevCity = this.cities[this.currentCityIndex];
    const newCity = this.cities[closestCityIndex];
    const travelDistance = this.calculateDistance(prevCity.lat, prevCity.lon, newCity.lat, newCity.lon);

    // Update total distance traveled
    this.distanceTraveled += travelDistance;

    // Show notification about the journey
    vscode.window.showInformationMessage(
      `CodeMate Travel: You've journeyed from ${prevCity.name}, ${prevCity.country} ${prevCity.emoji} to ${newCity.name}, ${newCity.country} ${newCity.emoji}!
       Distance: ${travelDistance} km | Total distance: ${this.distanceTraveled} km
       Local language: ${newCity.language} | Local time zone: ${newCity.timeZone}
       About: ${newCity.description}`
    );

    // Update current city index
    this.currentCityIndex = closestCityIndex;

    // Save current city and distance to extension context
    if (vscode.extensions.getExtension('codemate')) {
      const extension = vscode.extensions.getExtension('codemate');
      if (extension && extension.isActive) {
        const context = extension.exports.getExtensionContext();
        context.globalState.update('codemate.travel.lastCity', this.currentCityIndex);
        context.globalState.update('codemate.travel.distance', this.distanceTraveled);
      }
    }

    // Update the status bar
    this.updateStatusBar();
  }

  /**
   * Updates the status bar with current city info
   */
  private updateStatusBar(): void {
    const city = this.cities[this.currentCityIndex];
    this.statusBarItem.text = `$(globe) ${city.emoji} ${city.name}, ${city.country} | ${this.distanceTraveled} km`;
    this.statusBarItem.tooltip = `You are in ${city.name} (${city.lat}, ${city.lon})
Local language: ${city.language}
Time zone: ${city.timeZone}
${city.description}
Total journey: ${this.distanceTraveled} km`;
  }

  /**
   * Deactivates the mode
   */
  public deactivate(): void {
    super.deactivate();
  }
}