/**
 * Signal Service
 *
 * TODO: This service needs to be:
 * 1. Connected to the backend for event data
 * 2. Implement proper event polling
 * 3. Add event persistence
 * 4. Implement proper error handling
 * 5. Add event filtering
 */

import DistanceService from "./distanceService";
import NotificationService, { NotificationData } from "./notificationService";
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
  // TODO: Implement proper polling management
  private static pollingInterval: ReturnType<typeof setInterval> | null = null;
  private static POLLING_INTERVAL = 15000; // 15 seconds
  private static lastNotificationTimes: { [eventId: string]: number } = {};
  private static _isPolling = false;

  // TODO: Implement proper polling start
  static async startPolling(): Promise<boolean> {
    try {
      if (this._isPolling) return true;

      this.lastNotificationTimes = {};

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

      await this.fetchAndLogSignals(true);

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

  // TODO: Implement proper signal fetching
  static async fetchAndLogSignals(
    isInitialCheck: boolean = false
  ): Promise<void> {
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
      const coordinates = this.locationObjectToCoordinates(currentLocation);

      // TODO: Replace with actual API call
      const response = await fetch("/api/events");
      const data = await response.json();
      const events: Event[] = data.events || [];

      for (const event of events) {
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

          console.log(
            `${isInRange ? "📍" : "📌"} ${event.name}: ${distance.toFixed(1)}km`
          );

          if (
            isInRange &&
            (isInitialCheck ||
              now - (this.lastNotificationTimes[event.id] || 0) >=
                this.POLLING_INTERVAL ||
              (minutesRemaining <= 15 && minutesRemaining > 0))
          ) {
            const notificationData: NotificationData = {
              type: event.type,
              name: event.name,
              message: event.message,
              distance: `${distance.toFixed(1)}km away`,
              coordinates: event.coordinates,
            };

            await NotificationService.startRepeatingNotification(
              event.type,
              event.name,
              `${distance.toFixed(1)}km away`,
              event.message,
              notificationData
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

  // TODO: Implement proper polling stop
  static stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.lastNotificationTimes = {};
      this._isPolling = false;
      console.log("⏹️ Stopped polling for events");
    }
  }

  // TODO: Implement proper time remaining calculation
  private static getMinutesRemaining(endTime: string): number {
    return (new Date(endTime).getTime() - Date.now()) / (1000 * 60);
  }

  // TODO: Implement proper coordinate conversion
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
