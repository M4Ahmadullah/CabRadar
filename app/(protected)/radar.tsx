import { StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveState, InactiveState } from "@/components/radar/RadarStates";
import LocationService from "@/services/locationService";

export default function TabIndexScreen() {
  const insets = useSafeAreaInsets();
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(async () => {
    try {
      if (!isActive) {
        // Check permissions before switching to active state
        const hasPermissions = await LocationService.checkPermissions();
        if (!hasPermissions) {
          setError(
            "Please enable location access in Settings to use this feature"
          );
          return;
        }
        setError(null); // Clear any previous errors
      }

      setIsActive(!isActive);
    } catch (error) {
      console.error("Error toggling radar:", error);
      setError("Failed to toggle radar state");
    }
  }, [isActive]);

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 60,
        },
      ]}
    >
      {isActive ? (
        <ActiveState onToggle={handleToggle} error={error} />
      ) : (
        <InactiveState onToggle={handleToggle} error={error} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
