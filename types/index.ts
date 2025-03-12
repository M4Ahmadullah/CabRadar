export type Event = {
  id: string;
  name: string;
  type: "event" | "station_closure";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  endTime: string;
};

export interface Location {
  latitude: number;
  longitude: number;
}
