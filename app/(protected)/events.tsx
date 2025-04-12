import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Event } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { NotificationModal } from "@/components/NotificationModal";
import { Linking } from "react-native";
import { API_ENDPOINTS } from "@/config";

function EventCard({
  event,
  distance,
  onPress,
}: {
  event: Event;
  distance: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
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
          <ThemedText style={styles.eventDistance}>
            {distance.toFixed(1)}km away
          </ThemedText>
          <ThemedText style={styles.eventTime}>
            Ends at: {new Date(event.endTime).toLocaleTimeString()}
          </ThemedText>
          <ThemedText style={styles.eventType}>
            {event.type === "station_closure" ? "Station Closure" : "Event"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.EVENTS.LIST);
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleOpenMaps = () => {
    if (selectedEvent?.coordinates) {
      const { lat, long } = selectedEvent.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <ThemedText>Loading events...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedText type="title" style={styles.header}>
        Events
      </ThemedText>
      {events.length === 0 ? (
        <ThemedText style={styles.noEvents}>No events found</ThemedText>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              distance={item.distance || 0}
              onPress={() => handleEventPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <NotificationModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onOpenMaps={handleOpenMaps}
        data={
          selectedEvent
            ? {
                type: selectedEvent.type,
                name: selectedEvent.name,
                message: selectedEvent.message,
                distance: selectedEvent.distance
                  ? `${selectedEvent.distance.toFixed(1)}km away`
                  : "Distance unknown",
                coordinates: selectedEvent.coordinates,
              }
            : null
        }
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
  eventDistance: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  noEvents: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
});
