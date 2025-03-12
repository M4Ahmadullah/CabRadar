// Import the Event type from types
import { Event } from "@/types";

export type EventSignal = {
  Type: "Event";
  Location: string;
  Coordinates: {
    lat: number;
    long: number;
  };
  EventEnds: string;
  SignalEnds: string;
  Message: string;
};

export type TransportSignal = {
  Type: "PublicTranspo";
  Location: string;
  Coordinates: {
    lat: number;
    long: number;
  };
  SignalStart: string;
  Message: string;
};

export type SignalData = {
  Event: EventSignal;
  PublicTranspo: TransportSignal;
};

// Helper to get time in seconds from now
const getFutureTime = (secondsFromNow: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + secondsFromNow);
  return date.toISOString();
};

// Saudi Arabia test locations (based on 24.80911, 46.70660)
export const saudiSignals: SignalData = {
  Event: {
    Type: "Event",
    Location: "Granada Mall",
    Coordinates: {
      lat: 24.81511,
      long: 46.7086,
    },
    EventEnds: getFutureTime(900), // 15 minutes (15 * 60 seconds)
    SignalEnds: getFutureTime(1200), // 20 minutes from now
    Message: "Event ending at Granada Mall soon",
  },
  PublicTranspo: {
    Type: "PublicTranspo",
    Location: "King Khalid International Airport",
    Coordinates: {
      lat: 24.95911,
      long: 46.7066,
    },
    SignalStart: getFutureTime(0), // Starting now
    Message: "Closure at KKIA Terminal 5",
  },
};

// London test locations (for other testers)
export const londonSignals: SignalData = {
  Event: {
    Type: "Event",
    Location: "Wembley Stadium",
    Coordinates: {
      lat: 51.55592,
      long: -0.27952,
    },
    EventEnds: getFutureTime(15),
    SignalEnds: getFutureTime(30),
    Message: "Event ending at Wembley Stadium soon",
  },
  PublicTranspo: {
    Type: "PublicTranspo",
    Location: "Wembley Central Station",
    Coordinates: {
      lat: 51.5529,
      long: -0.29662,
    },
    SignalStart: getFutureTime(-10),
    Message: "Closure at Wembley Central Station",
  },
};

// Use Saudi signals by default for local development
export const dummySignals = saudiSignals;

// Test events list
export const dummyEvents: Event[] = [
  // Saudi Events
  {
    id: "1",
    name: "Granada Mall Event",
    type: "event",
    coordinates: {
      latitude: 24.81511,
      longitude: 46.7086,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  },
  {
    id: "2",
    name: "KKIA Terminal 5 Closure",
    type: "station_closure",
    coordinates: {
      latitude: 24.95911,
      longitude: 46.7066,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
  },
  // London Events (kept for other testers)
  {
    id: "3",
    name: "Wembley Stadium Event",
    type: "event",
    coordinates: {
      latitude: 51.556,
      longitude: -0.2795,
    },
    endTime: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: "4",
    name: "Wembley Central Closure",
    type: "station_closure",
    coordinates: {
      latitude: 51.532,
      longitude: -0.124,
    },
    endTime: new Date(Date.now() + 7200000).toISOString(),
  },
];

// Test locations for simulating user movement
export const testLocations = [
  {
    // Inside range of Wembley (0.5km)
    coordinates: {
      latitude: 51.5565,
      longitude: -0.279,
    },
    description: "Near Wembley",
  },
  {
    // Outside range (1.5km)
    coordinates: {
      latitude: 51.567,
      longitude: -0.289,
    },
    description: "Far from Wembley",
  },
  // Add more test positions
];

// dummySignals is already exported above, no need to re-export
