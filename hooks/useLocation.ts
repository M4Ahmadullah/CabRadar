/**
 * Location Hook
 *
 * This hook provides location-related functionality including:
 * - Permission management
 * - Location tracking
 * - Error handling
 * - Signal polling
 *
 * TODO:
 * 1. Add location accuracy settings
 * 2. Implement location data persistence
 * 3. Add battery optimization
 * 4. Add error recovery
 * 5. Implement location analytics
 */

import { useState, useEffect } from "react";
import LocationService from "@/services/locationService";
import { Alert } from "react-native";
import SignalService from "@/services/signalService";

export function useLocation() {
  // State for location permissions and tracking
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Check current permissions
  const checkPermissions = async () => {
    const permitted = await LocationService.checkPermissions();
    setHasPermissions(permitted);
  };

  // Request location permissions
  const requestPermissions = async () => {
    try {
      const result = await LocationService.requestPermissions();

      if (result.shouldOpenSettings) {
        Alert.alert(
          "Location Permission Required",
          result.message ||
            "Please enable location access in your device settings.",
          [
            {
              text: "Open Settings",
              onPress: () => LocationService.openSettings(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }

      return result.granted;
    } catch (err) {
      console.error("Error requesting permissions:", err);
      return false;
    }
  };

  // Start location tracking and signal polling
  const startTracking = async () => {
    try {
      await LocationService.startLocationTracking();
      setIsTracking(true);
      setError(null);

      // Start polling for signals
      const pollingStarted = await SignalService.startPolling();
      if (!pollingStarted) {
        setError("Failed to start event monitoring");
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to start location tracking");
      return false;
    }
  };

  // Stop location tracking and signal polling
  const stopTracking = async () => {
    try {
      await LocationService.stopLocationTracking();
      setIsTracking(false);
      setError(null);

      // Stop polling for signals
      SignalService.stopPolling();
    } catch (err) {
      setError("Failed to stop location tracking");
    }
  };

  // Return location-related functions and state
  return {
    hasPermissions,
    isTracking,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
  };
}
