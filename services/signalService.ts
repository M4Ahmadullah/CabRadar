import { SignalData, dummySignals } from "@/data/dummyEvents";
import DistanceService from "./distanceService";
import NotificationService from "./notificationService";
import LocationService from "./locationService";

class SignalService {
  private static pollingInterval: ReturnType<typeof setInterval> | null = null;

  static async fetchSignals(): Promise<SignalData> {
    // In a real app, this would be an API call
    // For now, return dummy data
    return dummySignals;
  }

  static async startPolling(): Promise<void> {
    // Check signals immediately when starting
    await this.fetchAndLogSignals();

    // Then set up the interval for subsequent checks
    this.pollingInterval = setInterval(() => {
      this.fetchAndLogSignals();
    }, 15000); // Match location update interval (15 seconds)
  }

  static stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      // Stop any ongoing notifications when radar is turned off
      NotificationService.stopAllNotifications();
    }
  }

  // Add time check for events (30 seconds before end)
  private static shouldNotifyForEvent(eventEndTime: string): boolean {
    const endTime = new Date(eventEndTime);
    const now = new Date();
    const diffInMinutes = (endTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 15 && diffInMinutes > 0;
  }

  // Add time check for station closures (within last 30 seconds)
  private static shouldNotifyForClosure(closureStartTime: string): boolean {
    const startTime = new Date(closureStartTime);
    const now = new Date();
    const diffInMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
    return diffInMinutes <= 15 && diffInMinutes > 0; // Back to 15 minutes
  }

  private static async fetchAndLogSignals(): Promise<void> {
    try {
      const signals = await this.fetchSignals();
      const currentLocation = LocationService.currentLocation;

      if (!currentLocation) return;

      const userCoords = {
        lat: currentLocation.coords.latitude,
        long: currentLocation.coords.longitude,
      };

      const eventDistance = DistanceService.calculateDistance(
        userCoords,
        signals.Event.Coordinates
      );

      const transportDistance = DistanceService.calculateDistance(
        userCoords,
        signals.PublicTranspo.Coordinates
      );

      // Create a single, well-formatted status log
      const statusLog = {
        timestamp: new Date().toLocaleTimeString(),
        currentLocation: {
          lat: userCoords.lat.toFixed(5),
          long: userCoords.long.toFixed(5),
        },
        events: {
          granada: {
            name: signals.Event.Location,
            coordinates: signals.Event.Coordinates,
            distance: `${eventDistance.toFixed(3)}km`,
            isInRange: eventDistance <= 1,
            endsAt: new Date(signals.Event.EventEnds).toLocaleTimeString(),
            minutesRemaining: (
              (new Date(signals.Event.EventEnds).getTime() - Date.now()) /
              (1000 * 60)
            ).toFixed(2),
            shouldNotify:
              eventDistance <= 1 &&
              this.shouldNotifyForEvent(signals.Event.EventEnds),
          },
          kkia: {
            name: signals.PublicTranspo.Location,
            coordinates: signals.PublicTranspo.Coordinates,
            distance: `${transportDistance.toFixed(3)}km`,
            isInRange: transportDistance <= 1,
            shouldNotify:
              transportDistance <= 1 &&
              this.shouldNotifyForClosure(signals.PublicTranspo.SignalStart),
          },
        },
      };

      // Log the status with proper formatting
      console.log(
        "\n📍 CabRadar Status Update\n" +
          JSON.stringify(statusLog, null, 2) +
          "\n"
      );

      // Send notifications if needed
      if (
        eventDistance <= 1 &&
        this.shouldNotifyForEvent(signals.Event.EventEnds)
      ) {
        await NotificationService.startRepeatingNotification(
          "Event",
          signals.Event.Location,
          `${eventDistance.toFixed(3)}km`,
          signals.Event.Message,
          signals.Event.Coordinates
        );
      }

      if (
        transportDistance <= 1 &&
        this.shouldNotifyForClosure(signals.PublicTranspo.SignalStart)
      ) {
        await NotificationService.startRepeatingNotification(
          "Transport Closure",
          signals.PublicTranspo.Location,
          `${transportDistance.toFixed(3)}km`,
          signals.PublicTranspo.Message,
          signals.PublicTranspo.Coordinates
        );
      }
    } catch (error) {
      console.error("[SignalService] Error:", error);
    }
  }
}

export default SignalService;
