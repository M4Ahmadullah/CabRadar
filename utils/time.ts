// Will contain time formatting and checking functions
export const formatEventTime = (date: string) => {
  return new Date(date).toLocaleTimeString();
};

export const isEventEnding = (endTime: string) => {
  // We'll implement 15-minute check here later
};
