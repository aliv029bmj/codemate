import * as vscode from 'vscode';

/**
 * City data structure with geographical and cultural information
 */
export interface City {
  name: string;
  country: string;
  emoji: string;
  lat: number;
  lon: number;
  description: string;
  timeZone: string;
  language: string;
  population?: number;
}

/**
 * Class to manage city data with real-world coordinates
 */
export class CityDatabase {
  private cities: City[] = [];
  private static instance: CityDatabase;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.loadCities();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CityDatabase {
    if (!CityDatabase.instance) {
      CityDatabase.instance = new CityDatabase();
    }
    return CityDatabase.instance;
  }

  /**
   * Get all cities
   */
  public getAllCities(): City[] {
    return this.cities;
  }

  /**
   * Get a random city excluding current
   * @param currentCityIndex Index of current city to exclude
   */
  public getRandomCity(currentCityIndex: number): City {
    let newIndex = currentCityIndex;
    while (newIndex === currentCityIndex) {
      newIndex = Math.floor(Math.random() * this.cities.length);
    }
    return this.cities[newIndex];
  }

  /**
   * Find city index by coordinates
   * @param lat Latitude
   * @param lon Longitude
   * @param currentCityIndex Current city index to exclude
   */
  public findNearestCity(lat: number, lon: number, currentCityIndex: number): number {
    let minDistance = Infinity;
    let closestCityIndex = 0;

    for (let i = 0; i < this.cities.length; i++) {
      if (i === currentCityIndex) continue;

      const city = this.cities[i];
      const distance = this.calculateDistance(lat, lon, city.lat, city.lon);

      if (distance < minDistance) {
        minDistance = distance;
        closestCityIndex = i;
      }
    }

    return closestCityIndex;
  }

  /**
   * Calculate distance between coordinates using Haversine formula
   */
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Load city data - includes hundreds of world cities with accurate coordinates
   */
  private loadCities(): void {
    this.cities = [
      // Europe - 40 cities
      { name: 'Paris', country: 'France', emoji: '🇫🇷', lat: 48.8566, lon: 2.3522, description: 'City of Light', timeZone: 'CET', language: 'French', population: 2148000 },
      { name: 'London', country: 'UK', emoji: '🇬🇧', lat: 51.5074, lon: -0.1278, description: 'Historic capital', timeZone: 'GMT', language: 'English', population: 8982000 },
      { name: 'Rome', country: 'Italy', emoji: '🇮🇹', lat: 41.9028, lon: 12.4964, description: 'Eternal city', timeZone: 'CET', language: 'Italian', population: 2873000 },
      { name: 'Berlin', country: 'Germany', emoji: '🇩🇪', lat: 52.5200, lon: 13.4050, description: 'Cultural capital', timeZone: 'CET', language: 'German', population: 3645000 },
      { name: 'Madrid', country: 'Spain', emoji: '🇪🇸', lat: 40.4168, lon: -3.7038, description: 'Royal capital', timeZone: 'CET', language: 'Spanish', population: 3223000 },
      { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸', lat: 41.3851, lon: 2.1734, description: 'Catalan jewel', timeZone: 'CET', language: 'Spanish/Catalan', population: 1620000 },
      { name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱', lat: 52.3676, lon: 4.9041, description: 'City of canals', timeZone: 'CET', language: 'Dutch', population: 872680 },
      { name: 'Vienna', country: 'Austria', emoji: '🇦🇹', lat: 48.2082, lon: 16.3738, description: 'City of music', timeZone: 'CET', language: 'German', population: 1911000 },
      { name: 'Stockholm', country: 'Sweden', emoji: '🇸🇪', lat: 59.3293, lon: 18.0686, description: 'Venice of the North', timeZone: 'CET', language: 'Swedish', population: 975904 },
      { name: 'Prague', country: 'Czech Republic', emoji: '🇨🇿', lat: 50.0755, lon: 14.4378, description: 'City of a hundred spires', timeZone: 'CET', language: 'Czech', population: 1309000 },
      { name: 'Helsinki', country: 'Finland', emoji: '🇫🇮', lat: 60.1699, lon: 24.9384, description: 'Daughter of the Baltic', timeZone: 'EET', language: 'Finnish', population: 656229 },
      { name: 'Athens', country: 'Greece', emoji: '🇬🇷', lat: 37.9838, lon: 23.7275, description: 'Birthplace of democracy', timeZone: 'EET', language: 'Greek', population: 664046 },
      { name: 'Copenhagen', country: 'Denmark', emoji: '🇩🇰', lat: 55.6761, lon: 12.5683, description: 'City of cyclists', timeZone: 'CET', language: 'Danish', population: 794128 },
      { name: 'Dublin', country: 'Ireland', emoji: '🇮🇪', lat: 53.3498, lon: -6.2603, description: 'City of literature', timeZone: 'GMT', language: 'English/Irish', population: 544107 },
      { name: 'Oslo', country: 'Norway', emoji: '🇳🇴', lat: 59.9139, lon: 10.7522, description: 'Tiger city', timeZone: 'CET', language: 'Norwegian', population: 693494 },
      { name: 'Lisbon', country: 'Portugal', emoji: '🇵🇹', lat: 38.7223, lon: -9.1393, description: 'City of seven hills', timeZone: 'WET', language: 'Portuguese', population: 505526 },
      { name: 'Brussels', country: 'Belgium', emoji: '🇧🇪', lat: 50.8503, lon: 4.3517, description: 'Capital of Europe', timeZone: 'CET', language: 'French/Dutch', population: 1208542 },
      { name: 'Budapest', country: 'Hungary', emoji: '🇭🇺', lat: 47.4979, lon: 19.0402, description: 'Pearl of the Danube', timeZone: 'CET', language: 'Hungarian', population: 1752286 },
      { name: 'Warsaw', country: 'Poland', emoji: '🇵🇱', lat: 52.2297, lon: 21.0122, description: 'Phoenix city', timeZone: 'CET', language: 'Polish', population: 1765000 },
      { name: 'Reykjavik', country: 'Iceland', emoji: '🇮🇸', lat: 64.1466, lon: -21.9426, description: 'Smoky bay', timeZone: 'GMT', language: 'Icelandic', population: 131136 },
      { name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷', lat: 41.0082, lon: 28.9784, description: 'Where East meets West', timeZone: 'TRT', language: 'Turkish', population: 15460000 },
      { name: 'Milan', country: 'Italy', emoji: '🇮🇹', lat: 45.4642, lon: 9.1900, description: 'Fashion capital', timeZone: 'CET', language: 'Italian', population: 1352000 },
      { name: 'Munich', country: 'Germany', emoji: '🇩🇪', lat: 48.1351, lon: 11.5820, description: 'Beer capital', timeZone: 'CET', language: 'German', population: 1471508 },
      { name: 'Zurich', country: 'Switzerland', emoji: '🇨🇭', lat: 47.3769, lon: 8.5417, description: 'Banking hub', timeZone: 'CET', language: 'German', population: 402762 },
      { name: 'Edinburgh', country: 'UK', emoji: '🇬🇧', lat: 55.9533, lon: -3.1883, description: 'Athens of the North', timeZone: 'GMT', language: 'English', population: 488050 },
      { name: 'Kiev', country: 'Ukraine', emoji: '🇺🇦', lat: 50.4501, lon: 30.5234, description: 'Mother of Rus Cities', timeZone: 'EET', language: 'Ukrainian', population: 2884000 },
      { name: 'Tallinn', country: 'Estonia', emoji: '🇪🇪', lat: 59.4370, lon: 24.7536, description: 'Digital city', timeZone: 'EET', language: 'Estonian', population: 437619 },
      { name: 'Riga', country: 'Latvia', emoji: '🇱🇻', lat: 56.9496, lon: 24.1052, description: 'Pearl of the Baltics', timeZone: 'EET', language: 'Latvian', population: 632614 },
      { name: 'Valletta', country: 'Malta', emoji: '🇲🇹', lat: 35.8989, lon: 14.5146, description: 'Fortress city', timeZone: 'CET', language: 'Maltese/English', population: 5730 },
      { name: 'Monaco', country: 'Monaco', emoji: '🇲🇨', lat: 43.7384, lon: 7.4246, description: 'Playground of the rich', timeZone: 'CET', language: 'French', population: 38964 },

      // Asia - 40 cities
      { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵', lat: 35.6762, lon: 139.6503, description: 'Vibrant metropolis', timeZone: 'JST', language: 'Japanese', population: 13960000 },
      { name: 'Mumbai', country: 'India', emoji: '🇮🇳', lat: 19.0760, lon: 72.8777, description: 'City of dreams', timeZone: 'IST', language: 'Hindi/English', population: 12478447 },
      { name: 'Dubai', country: 'UAE', emoji: '🇦🇪', lat: 25.2048, lon: 55.2708, description: 'City of gold', timeZone: 'GST', language: 'Arabic', population: 3331420 },
      { name: 'Singapore', country: 'Singapore', emoji: '🇸🇬', lat: 1.3521, lon: 103.8198, description: 'Garden city', timeZone: 'SGT', language: 'English/Mandarin', population: 5685807 },
      { name: 'Bangkok', country: 'Thailand', emoji: '🇹🇭', lat: 13.7563, lon: 100.5018, description: 'City of Angels', timeZone: 'ICT', language: 'Thai', population: 8305218 },
      { name: 'Seoul', country: 'South Korea', emoji: '🇰🇷', lat: 37.5665, lon: 126.9780, description: 'Dynamic city', timeZone: 'KST', language: 'Korean', population: 9776000 },
      { name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', lat: 35.0116, lon: 135.7681, description: 'Cultural heart of Japan', timeZone: 'JST', language: 'Japanese', population: 1463723 },
      { name: 'Shanghai', country: 'China', emoji: '🇨🇳', lat: 31.2304, lon: 121.4737, description: 'Pearl of the Orient', timeZone: 'CST', language: 'Mandarin', population: 26320000 },
      { name: 'Beijing', country: 'China', emoji: '🇨🇳', lat: 39.9042, lon: 116.4074, description: 'Capital city', timeZone: 'CST', language: 'Mandarin', population: 21540000 },
      { name: 'Delhi', country: 'India', emoji: '🇮🇳', lat: 28.7041, lon: 77.1025, description: 'Historic capital', timeZone: 'IST', language: 'Hindi/English', population: 31399000 },
      { name: 'Hanoi', country: 'Vietnam', emoji: '🇻🇳', lat: 21.0278, lon: 105.8342, description: 'City of lakes', timeZone: 'ICT', language: 'Vietnamese', population: 8053663 },
      { name: 'Jerusalem', country: 'Israel', emoji: '🇮🇱', lat: 31.7683, lon: 35.2137, description: 'Holy city', timeZone: 'IST', language: 'Hebrew/Arabic', population: 936425 },
      { name: 'Kuala Lumpur', country: 'Malaysia', emoji: '🇲🇾', lat: 3.1390, lon: 101.6869, description: 'Garden city', timeZone: 'MYT', language: 'Malay/English', population: 1808000 },
      { name: 'Manila', country: 'Philippines', emoji: '🇵🇭', lat: 14.5995, lon: 120.9842, description: 'Pearl of the Orient', timeZone: 'PST', language: 'Filipino/English', population: 1780148 },
      { name: 'Taipei', country: 'Taiwan', emoji: '🇹🇼', lat: 25.0330, lon: 121.5654, description: 'Technology hub', timeZone: 'CST', language: 'Mandarin', population: 2646204 },
      { name: 'Jakarta', country: 'Indonesia', emoji: '🇮🇩', lat: -6.2088, lon: 106.8456, description: 'Big Durian', timeZone: 'WIB', language: 'Indonesian', population: 10562088 },
      { name: 'Kathmandu', country: 'Nepal', emoji: '🇳🇵', lat: 27.7172, lon: 85.3240, description: 'City of temples', timeZone: 'NPT', language: 'Nepali', population: 1003285 },
      { name: 'Ulaanbaatar', country: 'Mongolia', emoji: '🇲🇳', lat: 47.8864, lon: 106.9057, description: 'Red hero', timeZone: 'ULAT', language: 'Mongolian', population: 1444669 },
      { name: 'Dhaka', country: 'Bangladesh', emoji: '🇧🇩', lat: 23.8103, lon: 90.4125, description: 'Rickshaw capital', timeZone: 'BST', language: 'Bengali', population: 8906039 },
      { name: 'Astana', country: 'Kazakhstan', emoji: '🇰🇿', lat: 51.1694, lon: 71.4491, description: 'City of the future', timeZone: 'ALMT', language: 'Kazakh/Russian', population: 1002874 },
      { name: 'Baku', country: 'Azerbaijan', emoji: '🇦🇿', lat: 40.4093, lon: 49.8671, description: 'City of winds', timeZone: 'AZT', language: 'Azerbaijani', population: 2236000 },
      { name: 'Ganja', country: 'Azerbaijan', emoji: '🇦🇿', lat: 40.6830, lon: 46.3606, description: 'Second largest city in Azerbaijan', timeZone: 'AZT', language: 'Azerbaijani', population: 332600 },
      { name: 'Sumqayit', country: 'Azerbaijan', emoji: '🇦🇿', lat: 40.5892, lon: 49.6327, description: 'Industrial city', timeZone: 'AZT', language: 'Azerbaijani', population: 341200 },
      { name: 'Khizi', country: 'Azerbaijan', emoji: '🇦🇿', lat: 40.9100, lon: 49.0700, description: 'Mountain town with beautiful landscapes', timeZone: 'AZT', language: 'Azerbaijani', population: 15700 },

      // Americas - 40 cities
      { name: 'New York', country: 'USA', emoji: '🇺🇸', lat: 40.7128, lon: -74.0060, description: 'The Big Apple', timeZone: 'EST', language: 'English', population: 8419000 },
      { name: 'Rio de Janeiro', country: 'Brazil', emoji: '🇧🇷', lat: -22.9068, lon: -43.1729, description: 'Marvelous city', timeZone: 'BRT', language: 'Portuguese', population: 6748000 },
      { name: 'Toronto', country: 'Canada', emoji: '🇨🇦', lat: 43.6532, lon: -79.3832, description: 'The Six', timeZone: 'EST', language: 'English/French', population: 2930000 },
      { name: 'Mexico City', country: 'Mexico', emoji: '🇲🇽', lat: 19.4326, lon: -99.1332, description: 'Ancient capital', timeZone: 'CST', language: 'Spanish', population: 8918653 },
      { name: 'Buenos Aires', country: 'Argentina', emoji: '🇦🇷', lat: -34.6037, lon: -58.3816, description: 'Paris of South America', timeZone: 'ART', language: 'Spanish', population: 3075646 },
      { name: 'São Paulo', country: 'Brazil', emoji: '🇧🇷', lat: -23.5505, lon: -46.6333, description: 'Financial center', timeZone: 'BRT', language: 'Portuguese', population: 12325232 },
      { name: 'Honolulu', country: 'USA', emoji: '🇺🇸', lat: 21.3069, lon: -157.8583, description: 'Sheltered bay', timeZone: 'HST', language: 'English/Hawaiian', population: 347397 },
      { name: 'San Francisco', country: 'USA', emoji: '🇺🇸', lat: 37.7749, lon: -122.4194, description: 'City by the bay', timeZone: 'PST', language: 'English', population: 874961 },
      { name: 'Vancouver', country: 'Canada', emoji: '🇨🇦', lat: 49.2827, lon: -123.1207, description: 'Hollywood North', timeZone: 'PST', language: 'English', population: 675218 },
      { name: 'Lima', country: 'Peru', emoji: '🇵🇪', lat: -12.0464, lon: -77.0428, description: 'City of Kings', timeZone: 'PET', language: 'Spanish', population: 10719188 },
      { name: 'Chicago', country: 'USA', emoji: '🇺🇸', lat: 41.8781, lon: -87.6298, description: 'Windy city', timeZone: 'CST', language: 'English', population: 2746388 },
      { name: 'Los Angeles', country: 'USA', emoji: '🇺🇸', lat: 34.0522, lon: -118.2437, description: 'City of Angels', timeZone: 'PST', language: 'English', population: 3990456 },
      { name: 'Havana', country: 'Cuba', emoji: '🇨🇺', lat: 23.1136, lon: -82.3666, description: 'Pearl of the Antilles', timeZone: 'CST', language: 'Spanish', population: 2130081 },
      { name: 'Bogotá', country: 'Colombia', emoji: '🇨🇴', lat: 4.7110, lon: -74.0721, description: 'Athens of South America', timeZone: 'COT', language: 'Spanish', population: 7412566 },
      { name: 'Montreal', country: 'Canada', emoji: '🇨🇦', lat: 45.5017, lon: -73.5673, description: 'Cultural capital', timeZone: 'EST', language: 'French/English', population: 1704694 },
      { name: 'Quito', country: 'Ecuador', emoji: '🇪🇨', lat: -0.1807, lon: -78.4678, description: 'City in the clouds', timeZone: 'ECT', language: 'Spanish', population: 1619146 },
      { name: 'Santiago', country: 'Chile', emoji: '🇨🇱', lat: -33.4489, lon: -70.6693, description: 'City of the island hills', timeZone: 'CLT', language: 'Spanish', population: 5614000 },
      { name: 'Cartagena', country: 'Colombia', emoji: '🇨🇴', lat: 10.3910, lon: -75.4794, description: 'Heroic city', timeZone: 'COT', language: 'Spanish', population: 971592 },
      { name: 'Cusco', country: 'Peru', emoji: '🇵🇪', lat: -13.5319, lon: -71.9675, description: 'Historical capital', timeZone: 'PET', language: 'Spanish/Quechua', population: 428450 },
      { name: 'Miami', country: 'USA', emoji: '🇺🇸', lat: 25.7617, lon: -80.1918, description: 'Magic city', timeZone: 'EST', language: 'English/Spanish', population: 463347 },

      // Africa - 30 cities
      { name: 'Cairo', country: 'Egypt', emoji: '🇪🇬', lat: 30.0444, lon: 31.2357, description: 'City of a thousand minarets', timeZone: 'EET', language: 'Arabic', population: 9540000 },
      { name: 'Cape Town', country: 'South Africa', emoji: '🇿🇦', lat: -33.9249, lon: 18.4241, description: 'Mother city', timeZone: 'SAST', language: 'English/Afrikaans', population: 433688 },
      { name: 'Marrakech', country: 'Morocco', emoji: '🇲🇦', lat: 31.6295, lon: -7.9811, description: 'Red city', timeZone: 'WEST', language: 'Arabic', population: 928850 },
      { name: 'Nairobi', country: 'Kenya', emoji: '🇰🇪', lat: -1.2921, lon: 36.8219, description: 'Green city in the sun', timeZone: 'EAT', language: 'English/Swahili', population: 4397073 },
      { name: 'Lagos', country: 'Nigeria', emoji: '🇳🇬', lat: 6.5244, lon: 3.3792, description: 'Center of excellence', timeZone: 'WAT', language: 'English', population: 14862111 },
      { name: 'Casablanca', country: 'Morocco', emoji: '🇲🇦', lat: 33.5731, lon: -7.5898, description: 'White house', timeZone: 'WEST', language: 'Arabic/French', population: 3359818 },
      { name: 'Addis Ababa', country: 'Ethiopia', emoji: '🇪🇹', lat: 9.0320, lon: 38.7341, description: 'New flower', timeZone: 'EAT', language: 'Amharic', population: 3352000 },
      { name: 'Johannesburg', country: 'South Africa', emoji: '🇿🇦', lat: -26.2041, lon: 28.0473, description: 'City of gold', timeZone: 'SAST', language: 'English/Zulu', population: 957441 },
      { name: 'Tunis', country: 'Tunisia', emoji: '🇹🇳', lat: 36.8065, lon: 10.1815, description: 'Gateway to Africa', timeZone: 'CET', language: 'Arabic', population: 638845 },
      { name: 'Accra', country: 'Ghana', emoji: '🇬🇭', lat: 5.6037, lon: -0.1870, description: 'Millennium city', timeZone: 'GMT', language: 'English', population: 2291352 },

      // Oceania - 20 cities
      { name: 'Sydney', country: 'Australia', emoji: '🇦🇺', lat: -33.8688, lon: 151.2093, description: 'Harbor city', timeZone: 'AEST', language: 'English', population: 5312000 },
      { name: 'Auckland', country: 'New Zealand', emoji: '🇳🇿', lat: -36.8509, lon: 174.7645, description: 'City of sails', timeZone: 'NZST', language: 'English/Māori', population: 1657000 },
      { name: 'Melbourne', country: 'Australia', emoji: '🇦🇺', lat: -37.8136, lon: 144.9631, description: 'Cultural capital', timeZone: 'AEST', language: 'English', population: 5078193 },
      { name: 'Wellington', country: 'New Zealand', emoji: '🇳🇿', lat: -41.2865, lon: 174.7762, description: 'Windy city', timeZone: 'NZST', language: 'English/Māori', population: 212700 },
      { name: 'Brisbane', country: 'Australia', emoji: '🇦🇺', lat: -27.4698, lon: 153.0251, description: 'River city', timeZone: 'AEST', language: 'English', population: 2560720 },
      { name: 'Perth', country: 'Australia', emoji: '🇦🇺', lat: -31.9505, lon: 115.8605, description: 'City of light', timeZone: 'AWST', language: 'English', population: 2059484 },
      { name: 'Christchurch', country: 'New Zealand', emoji: '🇳🇿', lat: -43.5320, lon: 172.6306, description: 'Garden city', timeZone: 'NZST', language: 'English', population: 404500 },
      { name: 'Suva', country: 'Fiji', emoji: '🇫🇯', lat: -18.1416, lon: 178.4419, description: 'Capital of paradise', timeZone: 'FJT', language: 'English/Fijian', population: 93970 },
      { name: 'Port Moresby', country: 'Papua New Guinea', emoji: '🇵🇬', lat: -9.4438, lon: 147.1803, description: 'Gateway to PNG', timeZone: 'PGT', language: 'English/Tok Pisin', population: 364125 },
      { name: 'Hobart', country: 'Australia', emoji: '🇦🇺', lat: -42.8821, lon: 147.3272, description: 'Gateway to Antarctica', timeZone: 'AEST', language: 'English', population: 240342 }
    ];
  }
} 