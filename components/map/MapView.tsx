import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { ThemedView } from "@/components/ThemedView";

type MapViewProps = {
  lat: number;
  lng: number;
};

export function MapView({ lat, lng }: MapViewProps) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <ThemedView style={styles.container}>
      <WebView source={{ uri: mapUrl }} style={styles.map} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
