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
  // Radius of the Earth in kilometers
  private static EARTH_RADIUS = 6371;

  static normalizeCoordinates(coords: Coordinates) {
    if ("latitude" in coords) {
      return {
        lat: coords.latitude,
        long: coords.longitude,
      };
    }
    return coords;
  }

  static calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
    const point1 = this.normalizeCoordinates(coords1);
    const point2 = this.normalizeCoordinates(coords2);

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

    // Distance in KM
    const distance = this.EARTH_RADIUS * c;

    // Round to 3 decimal places
    return Math.round(distance * 1000) / 1000;
  }

  static isWithinRange(
    coords1: Coordinates,
    coords2: Coordinates,
    rangeKm: number
  ): boolean {
    const distance = this.calculateDistance(coords1, coords2);
    return distance <= rangeKm;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default DistanceService;
