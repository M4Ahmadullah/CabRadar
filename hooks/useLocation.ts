import { useState, useEffect } from "react";
import LocationService from "@/services/locationService";
import { Alert } from "react-native";
import SignalService from "@/services/signalService";

export function useLocation() {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const permitted = await LocationService.checkPermissions();
    setHasPermissions(permitted);
  };

  const requestPermissions = async () => {
    try {
      const result = await LocationService.requestPermissions();

      if (result.shouldOpenSettings) {
        Alert.alert(
          "Location Permission Required",
          result.message ||
            "Please enable location access in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => LocationService.openSettings(),
            },
          ]
        );
        return false;
      }

      setHasPermissions(result.granted);
      return result.granted;
    } catch (err) {
      setError("Failed to request location permissions");
      return false;
    }
  };

  const startTracking = async () => {
    try {
      setError(null);

      const result = await LocationService.startLocationTracking();
      if (!result.success) {
        setError(result.error ?? "Failed to start location tracking");
        return false;
      }

      setIsTracking(true);

      // Wait for first location before starting polling
      await LocationService.waitForFirstLocation();
      await SignalService.startPolling();

      return true;
    } catch (err) {
      setError("Failed to start location tracking");
      return false;
    }
  };

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

  return {
    hasPermissions,
    isTracking,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
  };
}
