import { StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RadarButton } from "./RadarButton";
import SignalService from "@/services/signalService";
import LocationService from "@/services/locationService";
import NotificationService from "@/services/notificationService";
import { useEffect } from "react";

type RadarStateProps = {
  onToggle: () => Promise<void>;
  error: string | null;
};

export function InactiveState({ onToggle, error }: RadarStateProps) {
  return (
    <ThemedView style={styles.inactiveContainer}>
      <ThemedText style={styles.inactiveTitle}>
        Start searching for opportunities
      </ThemedText>
      <RadarButton isActive={false} onPress={onToggle} />
      {error ? (
        <ThemedText style={[styles.inactiveSubtext, styles.errorText]}>
          {error}
        </ThemedText>
      ) : (
        <ThemedText style={styles.inactiveSubtext}>
          Tap to start receiving notifications
        </ThemedText>
      )}
    </ThemedView>
  );
}

export function ActiveState({ onToggle, error }: RadarStateProps) {
  useEffect(() => {
    LocationService.startLocationTracking();
    return () => {
      LocationService.stopLocationTracking();
      NotificationService.stopAllNotifications();
    };
  }, []);

  const handleToggle = async () => {
    try {
      await LocationService.stopLocationTracking();
      await onToggle();
    } catch (error) {
      console.error("Error stopping radar:", error);
    }
  };

  return (
    <ThemedView style={styles.activeContainer}>
      <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.topSection}>
          <ThemedView style={styles.activeHeader}>
            <ThemedText style={styles.activeTitle}>CabRadar</ThemedText>
            <ThemedText style={styles.activeSubtitle}>
              Scanning for nearby opportunities...
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.middleSection}>
          <RadarButton isActive={true} onPress={handleToggle} />
        </ThemedView>

        <ThemedView style={styles.bottomSection}>
          <ThemedView style={styles.infoContainer}>
            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : (
              <>
                <ThemedText style={styles.statusText}>Radar Active</ThemedText>
                <ThemedText style={styles.infoText}>
                  You'll be notified when events are nearby
                </ThemedText>
              </>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
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
    opacity: 0.6,
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
});
