/**
 * Background Location Service
 *
 * This service handles background location tracking functionality including:
 * - Background location task definition
 * - Location update callbacks
 * - Task management
 *
 * TODO:
 * 1. Implement proper error handling
 * 2. Add battery optimization
 * 3. Add location accuracy settings
 * 4. Implement location data persistence
 * 5. Add task status monitoring
 */

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { LocationObject } from "expo-location";

// Background location task identifier
const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";

// Type definition for location update callback
type LocationUpdateCallback = (location: LocationObject) => void;
let locationUpdateCallback: LocationUpdateCallback | null = null;

// Task data interface
interface LocationTaskData {
  data: {
    locations: LocationObject[];
  };
  error: any;
}

// Set location update callback
export function setLocationUpdateCallback(callback: LocationUpdateCallback) {
  locationUpdateCallback = callback;
}

// Define background location task
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async (event: LocationTaskData) => {
    if (event.error) {
      console.error("[Background Task] Error:", event.error);
      return;
    }

    const [location] = event.data.locations;
    if (!location) return;

    try {
      console.log("[Background Task] Location update:", {
        lat: location.coords.latitude.toFixed(5),
        lng: location.coords.longitude.toFixed(5),
        time: new Date().toLocaleTimeString(),
      });

      if (locationUpdateCallback) {
        locationUpdateCallback(location);
      }
    } catch (error) {
      console.error("[Background Task] Error:", error);
    }
  }
);

// Start background location task
export async function startBackgroundLocationTask(): Promise<boolean> {
  try {
    // Stop any existing task
    if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }

    // Start new location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 3000,
      distanceInterval: 5,
      foregroundService: {
        notificationTitle: "CabRadar Active",
        notificationBody: "Scanning for opportunities...",
        notificationColor: "#007AFF",
      },
      showsBackgroundLocationIndicator: true,
      activityType: Location.ActivityType.AutomotiveNavigation,
      pausesUpdatesAutomatically: false,
    });

    console.log("[BackgroundLocation] Task started successfully");
    return true;
  } catch (error) {
    console.error("[BackgroundLocation] Start error:", error);
    return false;
  }
}

// Stop background location task
export async function stopBackgroundLocationTask() {
  try {
    locationUpdateCallback = null;
    if (await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch (error) {
    console.error("[BackgroundLocation] Stop error:", error);
  }
}
