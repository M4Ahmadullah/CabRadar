import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

function ProtectedLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            zIndex: 999,
          },
          default: {
            elevation: 4,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="radar"
        options={{
          title: "Radar",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="antenna.radiowaves.left.and.right"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "In Range Events",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default ProtectedLayout;
