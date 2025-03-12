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
import { TEST_LOCATION } from "./testData";

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
    this.currentLocation = TEST_LOCATION;
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async updateCurrentLocation(location: LocationObject): Promise<void> {
    // Always use test location, completely ignore incoming location
    this.currentLocation = TEST_LOCATION;
    this.eventEmitter.emit("locationUpdated", TEST_LOCATION);
  }

  getCurrentLocation(): LocationObject {
    return TEST_LOCATION;
  }

  // Add a method to get coordinates in the format your logs use
  getLocationForLogging() {
    return {
      lat: TEST_LOCATION.coords.latitude.toFixed(5),
      lng: TEST_LOCATION.coords.longitude.toFixed(5),
    };
  }

  async startLocationTracking() {
    if (LocationService.isTracking) return;

    try {
      // Don't request real permissions
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status !== "granted") return;

      LocationService.isTracking = true;

      // Start background task with test location only
      await startBackgroundLocationTask();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async stopLocationTracking() {
    try {
      LocationService.isTracking = false;

      // No need to remove real location subscription
      // if (this.locationSubscription) {
      //   await this.locationSubscription.remove();
      //   this.locationSubscription = null;
      // }

      await stopBackgroundLocationTask();
      // Don't clear current location as it's always TEST_LOCATION
      // this.currentLocation = null;
    } catch (error) {
      console.error("[LocationService] Error:", error);
    }
  }
}

export default LocationService.getInstance();
