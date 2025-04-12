// Will contain location-related calculations
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  // We'll implement haversine calculation here later
};

export const isWithinRadius = (
  userLocation: { latitude: number; longitude: number },
  eventLocation: { latitude: number; longitude: number },
  radiusInKm: number = 1
) => {
  // We'll implement radius check here later
};

import * as Location from "expo-location";
import { LocationObject, LocationSubscription } from "expo-location";
import {
  startBackgroundLocationTask,
  stopBackgroundLocationTask,
} from "@/services/backgroundLocation";
import { EventEmitter } from "events";

class LocationService {
  private static instance: LocationService;
  private eventEmitter: EventEmitter;
  private currentLocation: LocationObject | null = null;
  private locationSubscription: LocationSubscription | null = null;
  private static LOG_INTERVAL = 60 * 1000; // 1 minute
  private static lastLogTime: number = 0;
  private static isTracking: boolean = false;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  static getCurrentLocation(): LocationObject | null {
    return LocationService.instance?.currentLocation || null;
  }

  async updateCurrentLocation(location: LocationObject): Promise<void> {
    this.currentLocation = location;
    this.eventEmitter.emit("locationUpdated", location);
  }

  getLocationForLogging() {
    if (!this.currentLocation) return null;
    return {
      lat: this.currentLocation.coords.latitude.toFixed(5),
      long: this.currentLocation.coords.longitude.toFixed(5),
    };
  }

  async startLocationTracking() {
    if (LocationService.isTracking) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      LocationService.isTracking = true;
      await startBackgroundLocationTask();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async stopLocationTracking() {
    try {
      LocationService.isTracking = false;
      if (this.locationSubscription) {
        await this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      await stopBackgroundLocationTask();
      this.currentLocation = null;
    } catch (error) {
      console.error("[LocationService] Error:", error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      this.currentLocation = location;
      return location;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  getLastKnownLocation(): LocationObject | null {
    return this.currentLocation;
  }
}

export default LocationService.getInstance();
