/**
 * Distance Service
 *
 * This service handles all distance-related calculations including:
 * - Distance between two points using Haversine formula
 * - Coordinate normalization
 * - Range checking
 *
 * TODO:
 * 1. Add support for different distance units
 * 2. Implement caching for frequent calculations
 * 3. Add error handling for invalid coordinates
 * 4. Add performance optimizations
 * 5. Add coordinate validation
 */

// Coordinate type definition that supports both formats
type Coordinates =
  | {
      latitude: number;
      longitude: number;
    }
  | {
      lat: number;
      long: number;
    };

class DistanceService {
  // Earth's radius in kilometers
  private static EARTH_RADIUS = 6371;

  // Normalize coordinates to a consistent format
  static normalizeCoordinates(coords: Coordinates) {
    if ("latitude" in coords) {
      return {
        lat: coords.latitude,
        long: coords.longitude,
      };
    }
    return coords;
  }

  // Calculate distance between two points using Haversine formula
  static calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
    // Normalize coordinates to ensure consistent format
    const point1 = this.normalizeCoordinates(coords1);
    const point2 = this.normalizeCoordinates(coords2);

    // Convert degrees to radians
    const lat1 = this.toRadians(point1.lat);
    const lon1 = this.toRadians(point1.long);
    const lat2 = this.toRadians(point2.lat);
    const lon2 = this.toRadians(point2.long);

    // Haversine formula
    const dlon = lon2 - lon1;
    const dlat = lat2 - lat1;

    const a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate distance in kilometers
    const distance = this.EARTH_RADIUS * c;

    // Round to 3 decimal places
    return Math.round(distance * 1000) / 1000;
  }

  // Check if two points are within a specified range
  static isWithinRange(
    coords1: Coordinates,
    coords2: Coordinates,
    rangeKm: number
  ): boolean {
    const distance = this.calculateDistance(coords1, coords2);
    return distance <= rangeKm;
  }

  // Convert degrees to radians
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default DistanceService;
