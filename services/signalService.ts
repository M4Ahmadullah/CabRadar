import { dummyEvents } from "@/data/dummyEvents";
import DistanceService from "./distanceService";
import NotificationService from "./notificationService";
import LocationService from "./locationService";
import { Event, Coordinates } from "@/types";

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
    if (this._isPolling) return true;

    try {
      const currentLocation = LocationService.currentLocation;
      if (!currentLocation) {
        console.error("[SignalService] No location available");
        return false;
      }

      this._isPolling = true;
      this.lastNotificationTimes = {};

      // Immediate first check
      await this.fetchAndLogSignals(true);

      // Start polling
      this.pollingInterval = setInterval(() => {
        this.fetchAndLogSignals(false);
      }, this.POLLING_INTERVAL);

      return true;
    } catch (error) {
      console.error("[SignalService] Error:", error);
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

      for (const event of dummyEvents) {
        const distance = DistanceService.calculateDistance(
          currentLocation.coords,
          event.coordinates
        );

        const isInRange = distance <= 1;
        const minutesRemaining = this.getMinutesRemaining(event.endTime);
        const now = Date.now();

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
      }

      if (isInitialCheck) {
        console.log("🔄 Started polling for events every 15 seconds");
      }
    } catch (error) {
      console.error("[SignalService] Error:", error);
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
}

export default SignalService;
