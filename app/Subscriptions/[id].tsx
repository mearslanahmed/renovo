import { useLocalSearchParams, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const subscriptionId = Array.isArray(id) ? id[0] : id;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/subscriptions");
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View>
        <Text>Subscription Details</Text>
        <Text>
          {subscriptionId
            ? `Subscription ${subscriptionId}`
            : "Loading subscription..."}
        </Text>
      </View>
      <Pressable onPress={handleGoBack}>
        <Text>Go Back</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
