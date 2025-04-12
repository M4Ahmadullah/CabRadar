// Environment configuration
const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  // Add other environment variables here
} as const;

// API endpoints
const API_ENDPOINTS = {
  EVENTS: {
    LIST: `${ENV.API_URL}/events`,
  },
  // Add other API endpoints here
} as const;

export { ENV, API_ENDPOINTS };
