import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          borderTopColor: "transparent",
          backgroundColor: Colors.neutral800, // 👈 tab bar bg color
          height: AppSizes.tabHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        // headerShown: false,

        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          // headerShown: false,

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={AppSizes.tabIcon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={AppSizes.tabIcon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={AppSizes.tabIcon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={AppSizes.tabIcon}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
