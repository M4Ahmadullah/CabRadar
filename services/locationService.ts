declare global {
  var lastLocationLogTime: number | undefined;
}

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { LocationObject } from "expo-location";
import {
  startBackgroundLocationTask,
  setLocationUpdateCallback,
} from "./backgroundLocation";

const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";

type LocationSubscriber = (location: LocationObject) => void;

type PermissionResult = {
  granted: boolean;
  shouldOpenSettings: boolean;
  status: "none" | "foreground" | "background" | "denied";
  message?: string;
};

class LocationService {
  private static watchSubscription: Location.LocationSubscription | null = null;
  private static _currentLocation: LocationObject | null = null;
  private static locationPromise: Promise<Location.LocationObject> | null =
    null;
  private static _locationResolver:
    | ((location: Location.LocationObject) => void)
    | null = null;
  private static subscribers = new Set<LocationSubscriber>();

  // Add public getter/setter for locationResolver
  static get locationResolver():
    | ((location: Location.LocationObject) => void)
    | null {
    return this._locationResolver;
  }

  static set locationResolver(
    resolver: ((location: Location.LocationObject) => void) | null
  ) {
    this._locationResolver = resolver;
  }

  // Getter/Setter for currentLocation
  static get currentLocation(): LocationObject | null {
    return this._currentLocation;
  }

  static set currentLocation(location: LocationObject | null) {
    this._currentLocation = location;
    if (location) {
      this.notifySubscribers(location);
    }
  }

  // Add method to get subscribers
  static getSubscribers(): Set<LocationSubscriber> {
    return this.subscribers;
  }

  static async openSettings(): Promise<void> {
    if (Platform.OS === "ios") {
      await Linking.openSettings();
    } else {
      await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
    }
  }

  static async requestPermissions(): Promise<PermissionResult> {
    try {
      // First check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        return {
          granted: false,
          shouldOpenSettings: true,
          status: "none",
          message:
            "Location services are disabled. Please enable them in your device settings.",
        };
      }

      // Request foreground permission first
      const { status: foreStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foreStatus !== "granted") {
        return {
          granted: false,
          shouldOpenSettings: true,
          status: "denied",
          message:
            "CabRadar needs location access to find opportunities near you.",
        };
      }

      // Then request background permission with proper iOS message
      const { status: backStatus } =
        await Location.requestBackgroundPermissionsAsync();

      // Handle different permission states
      if (backStatus === "granted") {
        return {
          granted: true,
          shouldOpenSettings: false,
          status: "background",
        };
      } else {
        return {
          granted: false,
          shouldOpenSettings: true,
          status: "foreground",
          message:
            "CabRadar needs 'Always' location access to notify you about opportunities, even when the app is in background.",
        };
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return {
        granted: false,
        shouldOpenSettings: true,
        status: "none",
        message: "An error occurred while requesting location permissions.",
      };
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();

      // Check if both foreground and background permissions are granted
      return foreground.status === "granted" && background.status === "granted";
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }

  static async waitForFirstLocation(timeout = 5000): Promise<LocationObject> {
    if (this._currentLocation) {
      return this._currentLocation;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Location timeout"));
      }, timeout);

      const locationCallback = (location: LocationObject) => {
        cleanup();
        resolve(location);
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.subscribers.delete(locationCallback);
      };

      this.subscribeToLocationUpdates(locationCallback);
    });
  }

  static async startLocationTracking(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log("[LocationService] Starting location tracking...");

      // Set the callback before starting the task
      setLocationUpdateCallback((location) => {
        console.log("[LocationService] Received location update");
        this.currentLocation = location;
      });

      // Start background location updates
      const success = await startBackgroundLocationTask();
      if (!success) {
        return {
          success: false,
          error: "Failed to start location tracking",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[LocationService] Start error:", error);
      return {
        success: false,
        error: "Failed to start location tracking",
      };
    }
  }

  static async stopLocationTracking() {
    try {
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }

      // Stop the background location task
      if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      // Clear current location
      this._currentLocation = null;

      console.log("[LocationService] Location tracking stopped");
    } catch (error) {
      console.error(
        "[LocationService] Error stopping location tracking:",
        error
      );
    }
  }

  static subscribeToLocationUpdates(callback: LocationSubscriber): () => void {
    this.subscribers.add(callback);
    // Send initial location if available
    if (this._currentLocation) {
      callback(this._currentLocation);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private static notifySubscribers(location: LocationObject) {
    this.subscribers.forEach((subscriber) => subscriber(location));
  }
}

export default LocationService;
