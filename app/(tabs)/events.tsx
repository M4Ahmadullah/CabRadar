import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { dummyEvents } from "@/data/dummyEvents";
import { Event } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LocationService from "@/services/locationService";
import DistanceService from "@/services/distanceService";
import { useEffect, useState } from "react";
import { NotificationModal } from "@/components/NotificationModal";
import { Linking } from "react-native";

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
  const [nearbyEvents, setNearbyEvents] = useState<
    Array<Event & { distance: number }>
  >([]);
  const [selectedEvent, setSelectedEvent] = useState<
    (Event & { distance: number }) | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const updateNearbyEvents = () => {
      const currentLocation = LocationService.currentLocation;
      if (!currentLocation) return;

      const eventsInRange = dummyEvents
        .map((event) => {
          const distance = DistanceService.calculateDistance(
            {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            },
            { lat: event.coordinates.lat, long: event.coordinates.long }
          );
          return { ...event, distance };
        })
        .filter((event) => event.distance <= 1) // Only events within 1km
        .sort((a, b) => a.distance - b.distance); // Sort by distance

      setNearbyEvents(eventsInRange);
    };

    // Initial update
    updateNearbyEvents();

    // Subscribe to location updates
    const unsubscribe = LocationService.subscribeToLocationUpdates(() => {
      updateNearbyEvents();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleEventPress = (event: Event & { distance: number }) => {
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

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedText type="title" style={styles.header}>
        In Range Events
      </ThemedText>
      {nearbyEvents.length === 0 ? (
        <ThemedText style={styles.noEvents}>
          No events within 1km of your location
        </ThemedText>
      ) : (
        <FlatList
          data={nearbyEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              distance={item.distance}
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
                distance: `${selectedEvent.distance.toFixed(1)}km away`,
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
