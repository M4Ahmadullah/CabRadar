declare global {
  var lastLocationLogTime: number | undefined;
}

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
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
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("[LocationService] Error opening settings:", error);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      console.log("[LocationService] Checking current permissions...");
      const { status: foregroundStatus } =
        await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();

      console.log("[LocationService] Current permissions:", {
        foreground: foregroundStatus,
        background: backgroundStatus,
      });

      // If we already have "Always Allow", return true
      if (foregroundStatus === "granted" && backgroundStatus === "granted") {
        return true;
      }

      // If we don't have foreground permission, request it first
      if (foregroundStatus !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          this.showSettingsAlert(
            "Location Permission Required",
            "Please enable location access in Settings to use this feature."
          );
          return false;
        }
      }

      // Now request background permission with explanation
      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background Location Required",
          "This app needs 'Always' location access to notify you about nearby events even when the app is closed.",
          [
            {
              text: "Enable in Settings",
              onPress: async () => {
                await this.openSettings();
              },
            },
            {
              text: "Not Now",
              style: "cancel",
            },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("[LocationService] Error requesting permissions:", error);
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      if (foreground.status !== "granted") {
        return false;
      }

      const background = await Location.getBackgroundPermissionsAsync();
      return background.status === "granted";
    } catch (error) {
      console.error("[LocationService] Error checking permissions:", error);
      return false;
    }
  }

  static async waitForFirstLocation(
    timeout = 10000
  ): Promise<Location.LocationObject> {
    if (this.currentLocation) {
      return this.currentLocation;
    }

    // Try to get current location first
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      this.currentLocation = location;
      return location;
    } catch (error) {
      console.error("[LocationService] Error getting initial location:", error);
    }

    // If that fails, wait for location update
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Location timeout"));
      }, timeout);

      const locationCallback = (location: Location.LocationObject) => {
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

  static async startLocationTracking() {
    try {
      // 1. Check and request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error("Location permissions not granted");
      }

      // 2. Double check background permission specifically
      const { status: backgroundStatus } =
        await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background Location Required",
          "This app requires 'Always' location access to notify you about nearby events even when the app is closed.",
          [
            {
              text: "Open Settings",
              onPress: async () => {
                await this.openSettings();
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        throw new Error("Background location permission not granted");
      }

      // 3. Stop any existing tracking
      if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

      // Get initial location before starting updates
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      // Set initial location
      this.currentLocation = initialLocation;

      // Start background updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 15000, // 15 seconds
        distanceInterval: 100, // 100 meters
        showsBackgroundLocationIndicator: true,
        activityType: Location.ActivityType.AutomotiveNavigation,
        foregroundService: {
          notificationTitle: "Location Tracking Active",
          notificationBody: "Monitoring for nearby events",
          notificationColor: "#007AFF",
        },
      });

      console.log("[LocationService] Location tracking started successfully");
      return true;
    } catch (error) {
      console.error(
        "[LocationService] Error starting location tracking:",
        error
      );
      throw error;
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

  private static showSettingsAlert(title: string, message: string) {
    Alert.alert(title, message, [
      {
        text: "Open Settings",
        onPress: () => this.openSettings(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }
}

export default LocationService;
