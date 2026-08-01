import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState, useMemo } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/context/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isModalVisible, setModalVisible] = useState(false);
  const posthog = usePostHog();

  const upcomingSubscriptions = useMemo(() => {
    const today = dayjs().startOf("day");
    return subscriptions
      .filter((sub) => sub.status === "active" && sub.renewalDate)
      .map((sub) => {
        const renewal = dayjs(sub.renewalDate).startOf("day");
        const daysLeft = renewal.diff(today, "day");
        return {
          id: sub.id,
          icon: sub.icon,
          name: sub.name,
          price: sub.price,
          currency: sub.currency,
          daysLeft,
        };
      })
      .filter((sub) => sub.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>
              <Pressable
                onPress={() => {
                  posthog.capture('add_subscription_tapped');
                  setModalVisible(true);
                }}
                testID="add-subscription-button"
                className="size-12 items-center justify-center rounded-full border border-black/10 bg-background"
              >
                <Image source={icons.plus} className="size-6" style={{ tintColor: "#081126" }} />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
              if (isExpanding) {
                posthog.capture('subscription_card_expanded', {
                  subscription_id: item.id,
                });
              }
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(newSub) => {
          addSubscription(newSub);
        }}
      />
    </SafeAreaView>
  );
}
