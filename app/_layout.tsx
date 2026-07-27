import "@/global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Bold": require("../assets/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Medium": require("../assets/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-ExtraBold": require("../assets/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "PlusJakartaSans-Light": require("../assets/assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);
  if (!fontsLoaded && !fontsError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
