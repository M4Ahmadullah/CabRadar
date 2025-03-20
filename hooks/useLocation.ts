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
