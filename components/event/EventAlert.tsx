import { useRouter } from "expo-router";
import { StyleSheet, Linking, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";

type EventAlertProps = {
  type: string;
  location: string;
  message: string;
  lat: number;
  lng: number;
};

export function EventAlert({
  type,
  location,
  message,
  lat,
  lng,
}: EventAlertProps) {
  const router = useRouter();

  const openMaps = async () => {
    const scheme = Platform.select({
      ios: `maps:${lat},${lng}`,
      android: `geo:${lat},${lng}`,
    });
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    try {
      const canOpenUrl = await Linking.canOpenURL(scheme as string);
      if (canOpenUrl) {
        await Linking.openURL(scheme as string);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("Error opening maps:", error);
      await Linking.openURL(webUrl);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText style={styles.title}>
          {type === "Event" ? "🎫 Event Alert" : "🚉 Station Alert"}
        </ThemedText>
        <ThemedText style={styles.location}>{location}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>

        <ThemedView style={styles.buttonContainer}>
          <Button onPress={openMaps} style={styles.mapsButton}>
            Open in Maps
          </Button>
          <Button onPress={() => router.back()} variant="secondary">
            Back to Home
          </Button>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  location: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  mapsButton: {
    backgroundColor: "#4CAF50",
  },
});
