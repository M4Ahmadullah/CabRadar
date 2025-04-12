export type Coordinates = {
  lat: number;
  long: number;
};

export type Event = {
  id: string;
  name: string;
  type: "event" | "station_closure";
  coordinates: Coordinates;
  endTime: string;
  message: string;
  distance?: number; // Optional distance field from backend
};

export interface Location {
  latitude: number;
  longitude: number;
}
