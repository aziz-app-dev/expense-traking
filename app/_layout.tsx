import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomAlertHost } from "@/components/custom_alert";
import { Colors } from "@/constants/theme";
import { AuthProvider } from "@/context/auth_context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
            {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/welcom" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="all_transactions" options={{ headerShown: false }} />
            <Stack.Screen name="(modals)/profile_modal" options={{ presentation: "transparentModal", headerShown: false, animation: "fade" }} />
            <Stack.Screen name="(modals)/wallet_modal" options={{ presentation: "transparentModal", headerShown: false, animation: "fade" }} />
            <Stack.Screen name="(modals)/transaction_modal" options={{ presentation: "transparentModal", headerShown: false, animation: "fade" }} />
            <Stack.Screen name="(modals)/search_modal" options={{ presentation: "transparentModal", headerShown: false, animation: "fade" }} />
          </Stack>
          <CustomAlertHost />
          <StatusBar style="light" backgroundColor={Colors.black} translucent={false} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
}
