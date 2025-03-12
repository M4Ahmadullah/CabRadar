import { StyleSheet, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { dummyEvents } from "@/data/dummyEvents";
import { Event } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function EventCard({ event }: { event: Event }) {
  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.iconContainer}>
        <IconSymbol
          size={24}
          name={
            event.type === "station_closure"
              ? "train.side.front.car"
              : "music.note"
          }
          color="#007AFF"
        />
      </ThemedView>
      <ThemedView style={styles.cardContent}>
        <ThemedText style={styles.eventName}>{event.name}</ThemedText>
        <ThemedText style={styles.eventTime}>
          Ends at: {new Date(event.endTime).toLocaleTimeString()}
        </ThemedText>
        <ThemedText style={styles.eventType}>
          {event.type === "station_closure" ? "Station Closure" : "Event"}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedText type="title" style={styles.header}>
        Nearby Events
      </ThemedText>
      <FlatList
        data={dummyEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    fontSize: 28,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff15",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 44,
    backgroundColor: "#007AFF15",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 0,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventType: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#00000008",
    marginVertical: 8,
  },
});
