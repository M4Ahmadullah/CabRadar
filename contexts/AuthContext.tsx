import { createContext, useContext, useEffect, useState } from "react";
import { Storage } from "@/services/storage";
import { router } from "expo-router";
import { API } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("[AuthContext] Checking for existing session");
    const checkSession = async () => {
      try {
        const storedToken = await Storage.getToken();
        const storedUser = await Storage.getUser();

        console.log("[AuthContext] Session check results:", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
        });

        if (storedToken && storedUser) {
          console.log("[AuthContext] Valid session found, setting auth state");
          setToken(storedToken);
          setUser(storedUser);
        } else {
          console.log("[AuthContext] No valid session found, clearing state");
          await clearSession();
        }
      } catch (error) {
        console.error("[AuthContext] Error checking session:", error);
        await clearSession();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkSession();
  }, []);

  // Handle navigation after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const isAuthenticated = !!token && !!user;
    if (!isAuthenticated) {
      console.log("[AuthContext] Redirecting to sign-in after initialization");
      router.replace("/(auth)/sign-in");
    }
  }, [isInitialized, token, user]);

  const clearSession = async () => {
    console.log("[AuthContext] Clearing session");
    try {
      await Storage.clear();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("[AuthContext] Error clearing session:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] Attempting sign in");
    try {
      setIsLoading(true);
      const response = await API.auth.signIn({ email, password });
      console.log("[AuthContext] Sign in successful");

      await Storage.setToken(response.token);
      await Storage.setUser(response.user);

      setToken(response.token);
      setUser(response.user);

      console.log("[AuthContext] Redirecting to protected route");
      router.replace("/(protected)/radar");
    } catch (error) {
      console.error("[AuthContext] Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    console.log("[AuthContext] Attempting sign up");
    try {
      setIsLoading(true);
      const response = await API.auth.signUp({ name, email, password });
      console.log("[AuthContext] Sign up successful");

      await Storage.setToken(response.token);
      await Storage.setUser(response.user);

      setToken(response.token);
      setUser(response.user);

      console.log("[AuthContext] Redirecting to protected route");
      router.replace("/(protected)/radar");
    } catch (error) {
      console.error("[AuthContext] Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log("[AuthContext] Attempting sign out");
    try {
      setIsLoading(true);
      await clearSession();
      console.log("[AuthContext] Sign out successful");
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
