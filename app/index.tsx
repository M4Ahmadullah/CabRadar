import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  // This component will be immediately redirected by the middleware
  // based on the authentication state
  return null;
}
