import { StyleSheet, Pressable, Alert, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RadarButton } from "./RadarButton";
import SignalService from "@/services/signalService";
import {
  startBackgroundLocationTask,
  stopBackgroundLocationTask,
} from "@/services/backgroundLocation";
import NotificationService from "@/services/notificationService";
import { useEffect, useState } from "react";
import LocationService from "@/services/locationService";

type RadarStateProps = {
  onToggle: () => Promise<void>;
  error: string | null;
};

export function InactiveState({ onToggle, error }: RadarStateProps) {
  // Helper to determine if error is permission related
  const isPermissionError = (error: string | null): boolean => {
    return (
      error?.toLowerCase().includes("permission") ||
      error?.toLowerCase().includes("location") ||
      false
    );
  };

  // Get appropriate message based on error type
  const getMessage = () => {
    if (!error) {
      return "Tap to start receiving notifications";
    }

    if (isPermissionError(error)) {
      return "Please enable location access in Settings to use this feature";
    }

    return error; // Show original error for non-permission issues
  };

  return (
    <ThemedView style={styles.inactiveContainer}>
      <ThemedText style={styles.inactiveTitle}>
        Start searching for opportunities
      </ThemedText>
      <RadarButton isActive={false} onPress={onToggle} />
      <ThemedText
        style={[
          styles.inactiveSubtext,
          error
            ? isPermissionError(error)
              ? styles.warningText
              : styles.errorText
            : styles.normalText,
        ]}
      >
        {getMessage()}
      </ThemedText>
    </ThemedView>
  );
}

export function ActiveState({ onToggle, error }: RadarStateProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeTracking = async () => {
      try {
        // Start location tracking
        await LocationService.startLocationTracking();

        // Start polling for signals
        const pollingStarted = await SignalService.startPolling();
        if (!pollingStarted) {
          throw new Error("Failed to start event monitoring");
        }

        if (mounted) {
          setIsTracking(true);
          setTrackingError(null);
        }
      } catch (error: any) {
        console.error("[RadarStates] Error starting tracking:", error);
        if (!mounted) return;

        if (
          error.message?.includes("permission") ||
          error.message?.includes("location")
        ) {
          onToggle(); // Switch back to inactive state
        } else {
          setTrackingError(error.message || "Failed to start tracking");
        }
      }
    };

    initializeTracking();

    return () => {
      mounted = false;
      // Cleanup tracking when component unmounts
      LocationService.stopLocationTracking();
      SignalService.stopPolling();
    };
  }, [onToggle]);

  const handleToggle = async () => {
    try {
      await onToggle();
    } catch (error) {
      console.error("Error stopping radar:", error);
    }
  };

  return (
    <ThemedView style={styles.activeContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.topSection}>
          <View style={styles.activeHeader}>
            <ThemedText style={styles.activeTitle}>Radar Active</ThemedText>
            <ThemedText style={styles.activeSubtitle}>
              Searching for opportunities
            </ThemedText>
          </View>
        </View>

        <View style={styles.middleSection}>
          <RadarButton isActive={true} onPress={handleToggle} />
          <View style={styles.infoContainer}>
            {isTracking ? (
              <>
                <ThemedText style={styles.statusText}>Connected</ThemedText>
                <ThemedText style={styles.infoText}>
                  You'll receive notifications when opportunities are nearby
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.errorText}>{trackingError}</ThemedText>
            )}
          </View>
        </View>

        <View style={styles.bottomSection}>
          {/* Additional UI elements if needed */}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  inactiveContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 30,
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  inactiveSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  activeContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
  },
  topSection: {
    paddingVertical: 20,
    alignItems: "center",
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: "center",
  },
  activeHeader: {
    alignItems: "center",
    gap: 8,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  activeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoContainer: {
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 18,
    color: "#34C759",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
  },
  warningText: {
    color: "#FF9500",
  },
  normalText: {
    color: "#8E8E93", // iOS gray color for normal info text
  },
});
