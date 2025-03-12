import { StyleSheet } from "react-native";
import { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActiveState, InactiveState } from "@/components/radar/RadarStates";
import { useLocation } from "@/hooks/useLocation";

export default function TabIndexScreen() {
  const insets = useSafeAreaInsets();
  const [isRadarActive, setIsRadarActive] = useState(false);
  const { startTracking, stopTracking, error } = useLocation();

  const toggleRadar = async () => {
    if (!isRadarActive) {
      const success = await startTracking();
      if (success) {
        setIsRadarActive(true);
      }
    } else {
      await stopTracking();
      setIsRadarActive(false);
    }
  };

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
      {isRadarActive ? (
        <ActiveState onToggle={toggleRadar} error={error} />
      ) : (
        <InactiveState onToggle={toggleRadar} error={error} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
