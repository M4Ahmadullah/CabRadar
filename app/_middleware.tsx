import { Redirect, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Middleware for handling route protection and authentication
 *
 * TODO: This middleware needs to be connected to the backend authentication
 * The current implementation is a placeholder and should be updated to:
 * 1. Check actual authentication state from backend
 * 2. Handle token refresh
 * 3. Implement proper error handling
 * 4. Add loading states for authentication checks
 */

export default function Middleware() {
  // TODO: Replace with actual backend authentication check
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  // Don't redirect while loading
  if (isLoading) {
    return null;
  }

  // TODO: These route checks may need to be updated based on backend integration
  const inAuthGroup = segments[0] === "(auth)";
  const inProtectedGroup = segments[0] === "(protected)";
  const isRootRoute =
    segments[0] === "_middleware" || segments[0] === "_sitemap";

  // TODO: Add proper logging service
  console.log("[Middleware] Route check:", {
    segments,
    isAuthenticated,
    inAuthGroup,
    inProtectedGroup,
    isRootRoute,
  });

  // TODO: Update redirects to use proper route structure
  // If not authenticated and trying to access protected route
  if (!isAuthenticated && (inProtectedGroup || isRootRoute)) {
    console.log("[Middleware] Redirecting to sign-in");
    return <Redirect href="/sign-in" />;
  }

  // If authenticated and trying to access auth route
  if (isAuthenticated && inAuthGroup) {
    console.log("[Middleware] Redirecting to radar");
    return <Redirect href="/radar" />;
  }

  // If authenticated and on root route
  if (isAuthenticated && isRootRoute) {
    console.log("[Middleware] Redirecting to radar");
    return <Redirect href="/radar" />;
  }

  return null;
}
