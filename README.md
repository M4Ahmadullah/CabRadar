# CabRadar

A React Native application for tracking and notifying users about nearby events and station closures.

## Project Status

This project is currently in development and is not yet complete. The frontend has been developed with the following features:

- Authentication (Sign In, Sign Up, Forgot Password)
- Location tracking and permissions
- Event and station closure notifications
- Background location updates
- Push notifications

## Next Steps

The following tasks need to be completed:

1. Connect the frontend to the backend API
2. Implement the actual event and station closure data fetching
3. Complete the notification system integration
4. Test the location tracking and background updates
5. Add proper error handling and loading states
6. Implement proper data persistence

## Backend Integration

The backend API endpoints are expected to be available at:

- Base URL: `http://localhost:3000`
- Authentication endpoints:
  - POST `/auth/signup`
  - POST `/auth/signin`
  - POST `/auth/forgot-password`
- Events endpoints:
  - GET `/events` - List all events
  - POST `/events` - Create new event
  - GET `/events/:id` - Get specific event

## Environment Variables

Create a `.env` file with the following variables:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on iOS/Android:

```bash
npm run ios
# or
npm run android
```

## Project Structure

- `app/` - Main application screens and navigation
- `components/` - Reusable UI components
- `contexts/` - React context providers
- `services/` - API and service integrations
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `types/` - TypeScript type definitions

## Notes for Developers

- The authentication flow is set up but needs to be connected to the backend
- Location tracking is implemented but needs testing with real data
- Notifications are configured but need to be connected to actual events
- The middleware handles route protection but may need adjustments based on backend integration

## Dependencies

- Expo
- React Native
- React Navigation
- Expo Location
- Expo Notifications
- Firebase (for authentication)
- React Hook Form
- Yup (for form validation)

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
