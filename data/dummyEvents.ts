// Import the Event type from types
import { Event } from "@/types";

// Test Locations (for simulator testing):
// Saudi Tester:  24.80895, 46.70663
// Dubai Tester:  25.0192, 55.2011
// London Tester: 51.56327, -0.28784

// All active events in the system
export const activeEvents: Event[] = [
  // Saudi Region Events
  {
    id: "1",
    name: "Granada Mall Event",
    type: "event",
    coordinates: {
      lat: 24.81511,
      long: 46.7086,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    message: "Event ending at Granada Mall soon",
  },
  {
    id: "2",
    name: "KKIA Terminal 5 Closure",
    type: "station_closure",
    coordinates: {
      lat: 24.95911,
      long: 46.7066,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours
    message: "Closure at KKIA Terminal 5",
  },

  // London Region Events
  {
    id: "3",
    name: "Wembley Stadium Event",
    type: "event",
    coordinates: {
      lat: 51.556,
      long: -0.2795,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Event ending at Wembley Stadium soon",
  },
  {
    id: "4",
    name: "Wembley Central Closure",
    type: "station_closure",
    coordinates: {
      lat: 51.532,
      long: -0.124,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Closure at Wembley Central Station",
  },

  // Dubai Region Events
  {
    id: "5",
    name: "Lulu Hypermarket Event",
    type: "event",
    coordinates: {
      lat: 25.0283,
      long: 55.2095,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Special event ending at Lulu Hypermarket",
  },
  {
    id: "6",
    name: "Al Qiyadah Metro Closure",
    type: "station_closure",
    coordinates: {
      lat: 25.0225,
      long: 55.2021,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Temporary closure at Al Qiyadah Metro Station",
  },
];

// Helper to get time in seconds from now
const getFutureTime = (secondsFromNow: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + secondsFromNow);
  return date.toISOString();
};

// Export a single source of events
export const dummyEvents = activeEvents;
