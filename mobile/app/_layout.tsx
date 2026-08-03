import "@/global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

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

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <PostHogProvider
        client={posthog}
        debug={false}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
          maxElementsCaptured: 20,
        }}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </PostHogProvider>
    </ClerkProvider>
  );
}
