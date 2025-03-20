// Import the Event type from types
import { Event } from "@/types";

// Test Locations (for simulator testing):
// Saudi Tester:  24.80895, 46.70663
// Dubai Tester:  25.030504, 55.204456
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
  // {
  //   id: "5",
  //   name: "Union Coop Hypermarket Event",
  //   type: "event",
  //   coordinates: {
  //     lat: 25.045678,
  //     long: 55.219234,
  //   },
  //   endTime: new Date(Date.now() + 3600000).toISOString(),
  //   message: "Special event ending at Union Coop Hypermarket",
  // },
  // {
  //   id: "6",
  //   name: "Al Qiyadah Metro Closure",
  //   type: "station_closure",
  //   coordinates: {
  //     lat: 25.0225,
  //     long: 55.2021,
  //   },
  //   endTime: new Date(Date.now() + 7200000).toISOString(),
  //   message: "Temporary closure at Al Qiyadah Metro Station",
  // },

  // Add these two new events to the activeEvents array
  {
    id: "7",
    name: "Riyadh Park Event",
    type: "event",
    coordinates: {
      lat: 24.789123, // About 0.5 km from your location
      long: 46.685234,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    message: "Special event at Riyadh Park ending soon",
  },
  {
    id: "8",
    name: "King Fahd Library",
    type: "station_closure",
    coordinates: {
      lat: 24.806789, // About 1.5 km from your location
      long: 46.689012,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours
    message: "Temporary closure at King Fahd Library Station",
  },
  // Add these after your existing events
  {
    id: "9",
    name: "Al Nakheel Mall",
    type: "event",
    coordinates: {
      lat: 24.779234, // ~1.5km South
      long: 46.684891,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Special sale event at Al Nakheel Mall",
  },
  {
    id: "10",
    name: "Digital City",
    type: "station_closure",
    coordinates: {
      lat: 24.792567, // ~1.5km East
      long: 46.704567,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Temporary closure at Digital City Station",
  },
  {
    id: "11",
    name: "Kingdom Tower",
    type: "event",
    coordinates: {
      lat: 24.80789, // ~1.5km North-East
      long: 46.703123,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Event ending at Kingdom Tower",
  },
  {
    id: "12",
    name: "Al Faisaliah Tower",
    type: "station_closure",
    coordinates: {
      lat: 24.780123, // ~1.5km South-West
      long: 46.672345,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Station closure near Al Faisaliah",
  },
  {
    id: "13",
    name: "Panorama Mall",
    type: "event",
    coordinates: {
      lat: 24.791234, // ~0.8km West
      long: 46.676789,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Special event at Panorama Mall",
  },
  {
    id: "14",
    name: "Al Olaya Metro",
    type: "station_closure",
    coordinates: {
      lat: 24.806234, // ~1.5km North
      long: 46.682345,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Maintenance at Al Olaya Metro",
  },
  {
    id: "15",
    name: "Mode Al Riyadh",
    type: "event",
    coordinates: {
      lat: 24.778901, // ~1.5km South-East
      long: 46.698765,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
    message: "Fashion event at Mode Al Riyadh",
  },
  {
    id: "16",
    name: "Riyadh Gallery",
    type: "station_closure",
    coordinates: {
      lat: 24.805678, // ~1.5km North-West
      long: 46.672345,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Station closure near Riyadh Gallery",
  },
  {
    id: "17",
    name: "Al Safarat District",
    type: "station_closure",
    coordinates: {
      lat: 24.780567, // ~1.5km South-West
      long: 46.679012,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
    message: "Station closure in Al Safarat District",
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
