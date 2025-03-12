declare global {
  var lastLocationLogTime: number | undefined;
}

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";

type LocationSubscriber = (location: Location.LocationObject) => void;
const subscribers = new Set<LocationSubscriber>();

type PermissionResult = {
  granted: boolean;
  shouldOpenSettings: boolean;
  status: "none" | "foreground" | "background" | "denied";
  message?: string;
};

// Register background task with test location
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  if (!data) return null;

  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];

  // Use the setter to update current location
  LocationService.currentLocation = location;

  // Use the public getter to access locationResolver
  const resolver = LocationService.locationResolver;
  if (resolver) {
    resolver(location);
    LocationService.locationResolver = null;
  }

  // Notify subscribers with real location
  subscribers.forEach((subscriber) => subscriber(location));

  // Log location updates
  const now = new Date().getTime();
  const lastLogTime = globalThis.lastLocationLogTime || 0;
  if (now - lastLogTime >= 60000) {
    const timeStr = new Date().toLocaleTimeString();
    console.log(`[${timeStr}] Location update:`, {
      lat: location.coords.latitude.toFixed(5),
      lng: location.coords.longitude.toFixed(5),
    });
    globalThis.lastLocationLogTime = now;
  }

  return null;
});

class LocationService {
  private static watchSubscription: Location.LocationSubscription | null = null;
  private static _currentLocation: Location.LocationObject | null = null;
  private static locationPromise: Promise<Location.LocationObject> | null =
    null;
  private static _locationResolver:
    | ((location: Location.LocationObject) => void)
    | null = null;

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

  // Make currentLocation accessible via static method
  static get currentLocation(): Location.LocationObject | null {
    return LocationService._currentLocation;
  }

  static set currentLocation(location: Location.LocationObject | null) {
    LocationService._currentLocation = location;
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

  static async waitForFirstLocation(): Promise<Location.LocationObject> {
    if (this._currentLocation) {
      return this._currentLocation;
    }

    return new Promise((resolve) => {
      this.locationResolver = resolve;
    });
  }

  static async startLocationTracking(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        const result = await this.requestPermissions();
        if (!result.granted) {
          return {
            success: false,
            error:
              result.message ||
              "Location permission is required to use the radar.",
          };
        }
      }

      // Reset location promise
      this.locationPromise = new Promise((resolve) => {
        this.locationResolver = resolve;
      });

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: "CabRadar Active",
          notificationBody: "Scanning for opportunities...",
          notificationColor: "#007AFF",
        },
        showsBackgroundLocationIndicator: true,
        activityType: Location.ActivityType.AutomotiveNavigation,
        pausesUpdatesAutomatically: false,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to start location tracking. Please try again.",
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
    subscribers.add(callback);
    // Send initial location if available
    if (this._currentLocation) {
      callback(this._currentLocation);
    }
    return () => {
      subscribers.delete(callback);
    };
  }
}

export default LocationService;
