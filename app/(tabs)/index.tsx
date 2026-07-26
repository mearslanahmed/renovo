import "@/global.css"
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
        <Text className="text-background">Go to Onboarding</Text>
      </Link>

      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
        <Text className="text-background">Go to Sign In</Text>
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        <Text className="text-background">Go to Sign up</Text>
      </Link>

      <Link href="/Subscriptions/spotify">Spotify Subscription</Link>
      <Link
      href={{
        pathname: "/Subscriptions/[id]",
        params: {id: "claude"},
      }}
      >
        Claude Max Subscription
      </Link>

    </SafeAreaView>
  );
}