import * as Location from "expo-location";
import { LocationObject, LocationSubscription } from "expo-location";
import { EventEmitter } from "events";

class LocationManager {
  private static instance: LocationManager | null = null;
  private eventEmitter: EventEmitter;
  private currentLocation: LocationObject | null = null;
  private locationSubscription: LocationSubscription | null = null;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  static getInstance(): LocationManager {
    if (!LocationManager.instance) {
      LocationManager.instance = new LocationManager();
    }
    return LocationManager.instance;
  }

  static getCurrentLocation(): LocationObject | null {
    return LocationManager.getInstance().currentLocation;
  }

  async updateCurrentLocation(location: LocationObject): Promise<void> {
    if (!location?.coords) return;

    const instance = LocationManager.getInstance();
    instance.currentLocation = location;
    instance.eventEmitter.emit("locationUpdated", location);
  }

  getLocationForLogging() {
    if (!this.currentLocation) return null;
    return {
      lat: this.currentLocation.coords.latitude.toFixed(5),
      long: this.currentLocation.coords.longitude.toFixed(5),
    };
  }

  subscribeToLocationUpdates(
    callback: (location: LocationObject) => void
  ): () => void {
    const instance = LocationManager.getInstance();
    instance.eventEmitter.on("locationUpdated", callback);

    // Send initial location if available
    if (instance.currentLocation) {
      callback(instance.currentLocation);
    }

    return () => {
      instance.eventEmitter.off("locationUpdated", callback);
    };
  }

  // Add method to clear location
  static clearLocation() {
    const instance = LocationManager.getInstance();
    instance.currentLocation = null;
  }

  // Returns a promise that resolves when we get our first location
  async waitForFirstLocation(): Promise<LocationObject> {
    return new Promise((resolve, reject) => {
      if (this.currentLocation) {
        resolve(this.currentLocation);
        return;
      }

      const handleLocation = (location: LocationObject) => {
        this.eventEmitter.off("locationUpdated", handleLocation);
        resolve(location);
      };

      this.eventEmitter.once("locationUpdated", handleLocation);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.eventEmitter.off("locationUpdated", handleLocation);
        reject(new Error("Location timeout"));
      }, 5000);
    });
  }

  async startForegroundTracking(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return false;

      // Start watching for updates
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => this.updateCurrentLocation(location)
      );

      // Wait for first location
      await this.waitForFirstLocation();
      return true;
    } catch (error) {
      console.error("[LocationManager] Error:", error);
      return false;
    }
  }

  async stopForegroundTracking(): Promise<void> {
    if (this.locationSubscription) {
      await this.locationSubscription.remove();
      this.locationSubscription = null;
      this.currentLocation = null;
    }
  }
}

export default LocationManager;
