import { dummyEvents } from "@/data/dummyEvents";
import DistanceService from "./distanceService";
import NotificationService from "./notificationService";
import LocationService from "./locationService";
import { Event, Coordinates } from "@/types";
import { LocationObject } from "expo-location";

interface StatusLogEvent {
  name: string;
  coordinates: {
    lat: number;
    long: number;
  };
  distance: string;
  isInRange: boolean;
  endsAt: string;
  minutesRemaining: string;
  shouldNotify: boolean;
}

interface StatusLog {
  timestamp: string;
  currentLocation: {
    lat: string;
    long: string;
  };
  events: {
    [key: string]: StatusLogEvent;
  };
}

class SignalService {
  private static pollingInterval: ReturnType<typeof setInterval> | null = null;
  private static POLLING_INTERVAL = 15000; // 15 seconds
  private static lastNotificationTimes: { [eventId: string]: number } = {};
  private static _isPolling = false;

  static async startPolling(): Promise<boolean> {
    try {
      if (this._isPolling) return true;

      // Wait for initial location before starting
      try {
        await LocationService.waitForFirstLocation(10000);
      } catch (error) {
        console.error("[SignalService] Failed to get initial location:", error);
        return false;
      }

      if (!LocationService.currentLocation) {
        console.error("[SignalService] No location available");
        return false;
      }

      // Do initial check immediately first
      await this.fetchAndLogSignals(true);

      // Then start polling
      this._isPolling = true;
      this.pollingInterval = setInterval(() => {
        this.fetchAndLogSignals(false);
      }, this.POLLING_INTERVAL);

      console.log("🔄 Started polling for events every 15 seconds");
      return true;
    } catch (error) {
      console.error("[SignalService] Error starting polling:", error);
      this._isPolling = false;
      return false;
    }
  }

  static async fetchAndLogSignals(
    isInitialCheck: boolean = false
  ): Promise<void> {
    if (!this._isPolling && !isInitialCheck) return;

    try {
      const currentLocation = LocationService.currentLocation;
      if (!currentLocation) {
        if (this._isPolling) {
          console.error("[SignalService] Lost location, stopping polling");
          this.stopPolling();
        }
        return;
      }

      console.log(
        `\n${isInitialCheck ? "🔍" : "📡"} Checking nearby events...`
      );

      const now = Date.now();
      const signals = [...dummyEvents];

      // Convert LocationObject to Coordinates
      const coordinates = this.locationObjectToCoordinates(currentLocation);

      for (const event of signals) {
        try {
          if (
            !event.coordinates ||
            !event.coordinates.lat ||
            !event.coordinates.long
          ) {
            console.warn(`Invalid coordinates for event: ${event.id}`);
            continue;
          }

          const distance = DistanceService.calculateDistance(
            coordinates,
            event.coordinates
          );

          const isInRange = distance <= 1;
          const minutesRemaining = this.getMinutesRemaining(event.endTime);

          // Log event status
          console.log(
            `${isInRange ? "📍" : "📌"} ${event.name}: ${distance.toFixed(1)}km`
          );

          // Only notify if we're actually polling or on initial check
          if (
            (this._isPolling || isInitialCheck) &&
            isInRange &&
            (isInitialCheck ||
              now - (this.lastNotificationTimes[event.id] || 0) >=
                this.POLLING_INTERVAL ||
              (minutesRemaining <= 15 && minutesRemaining > 0))
          ) {
            await NotificationService.startRepeatingNotification(
              event.type,
              event.name,
              `${distance.toFixed(1)}km away`,
              event.message,
              event.coordinates
            );
            this.lastNotificationTimes[event.id] = now;
          }
        } catch (eventError) {
          console.error(`Error processing event ${event.id}:`, eventError);
        }
      }

      if (isInitialCheck) {
        console.log("🔄 Started polling for events every 15 seconds");
      }
    } catch (error) {
      console.error("Signal fetch error:", error);
      if (this._isPolling) {
        this.stopPolling();
      }
    }
  }

  static stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.lastNotificationTimes = {};
      this._isPolling = false;
      console.log("⏹️ Stopped polling for events");
    }
  }

  private static getMinutesRemaining(endTime: string): number {
    return (new Date(endTime).getTime() - Date.now()) / (1000 * 60);
  }

  static isPolling(): boolean {
    return this._isPolling;
  }

  // Add type conversion helper
  private static locationObjectToCoordinates(
    location: LocationObject
  ): Coordinates {
    return {
      lat: location.coords.latitude,
      long: location.coords.longitude,
    };
  }
}

export default SignalService;
