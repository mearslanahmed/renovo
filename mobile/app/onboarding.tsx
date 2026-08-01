import { View, Text, Image, Pressable } from "react-native";
import { useEffect } from "react";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  const posthog = usePostHog();
  const router = useRouter();

  useEffect(() => {
    posthog.capture("onboarding_started");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 bg-accent">
      <View className="flex-1">
        {/* Pattern Image filling top area */}
        <View className="flex-1 items-center justify-center overflow-hidden">
          <Image
            source={images.splashPattern}
            className="w-full h-[90%]"
            resizeMode="contain"
          />
        </View>

        {/* Text and Button Section */}
        <View className="px-6 pb-12 pt-8">
          <Text className="text-center text-4xl font-sans-extrabold text-white">
            Gain Financial Clarity
          </Text>
          <Text className="mt-3 text-center text-lg font-sans-medium text-white/90">
            Track, analyze and cancel with ease
          </Text>

          <Pressable
            onPress={() => {
              posthog.capture("onboarding_completed");
              router.push("/(auth)/sign-in");
            }}
            className="mt-12 items-center rounded-full bg-white py-5 shadow-sm"
          >
            <Text className="text-lg font-sans-bold text-primary">
              Get Started
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;