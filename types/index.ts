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
};

export interface Location {
  latitude: number;
  longitude: number;
}
