import { useUser } from "@clerk/expo";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState, useMemo} from "react";
import EditSubModal from "@/components/EditSubscriptionModal";
import { FlatList, Image, Pressable, Text, View, Alert } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useCurrency } from "@/context/CurrencyContext";
import UserAvatar from "@/components/UserAvatar";

const SafeAreaView = styled(RNSafeAreaView);

const ItemSeparator = () => <View className="h-4" />;

export default function App() {
  const { user } = useUser();
  const { currency: preferredCurrency } = useCurrency();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
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
      .filter((sub) => sub.daysLeft >= 0 && sub.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const totalMonthlyBalance = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((sum, sub) => {
        const price = Number(sub.price) || 0;
        const freq = sub.frequency?.toLowerCase();
        if (freq === "yearly") return sum + price / 12;
        if (freq === "weekly") return sum + price * 4.33;
        if (freq === "daily") return sum + price * 30;
        return sum + price;
      }, 0);
  }, [subscriptions]);

  const nextRenewalDate = useMemo(() => {
    const today = dayjs().startOf("day");
    const activeWithDates = subscriptions
      .filter((s) => s.status === "active" && s.renewalDate)
      .map((s) => ({
        ...s,
        diff: dayjs(s.renewalDate).startOf("day").diff(today, "day"),
      }))
      .filter((s) => s.diff >= 0)
      .sort((a, b) => a.diff - b.diff);

    if (activeWithDates.length > 0 && activeWithDates[0].renewalDate) {
      return dayjs(activeWithDates[0].renewalDate).format("MMM D");
    }
    return "--/--";
  }, [subscriptions]);

  const emailUsername = user?.primaryEmailAddress?.emailAddress
    ? user.primaryEmailAddress.emailAddress.split("@")[0]
    : "";
  const derivedName = emailUsername
    ? emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)
    : "User";

  const userName = user?.fullName || user?.firstName || derivedName;
  const userAvatar = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <UserAvatar size={48} className="home-avatar" />
                <Text className="home-user-name">{userName}</Text>
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
              <Text className="home-balance-label">Monthly Expenses</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(totalMonthlyBalance, preferredCurrency)}
                </Text>
                <Text className="home-balance-date">
                  {nextRenewalDate}
                </Text>
              </View>
            </View>

            {upcomingSubscriptions.length > 0 && (
              <View className="mb-5">
                <ListHeading title="Upcoming (Next 7 Days)" />
                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            <ListHeading title="All Subscriptions" />
          </>
        }
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
            onEditPress={() => {
              setEditingSubscription(item);
            }}
            onDeletePress={() => {
              Alert.alert(
                "Delete Subscription",
                `Are you sure you want to delete ${item.name}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteSubscription(item.id);
                      } catch (err) {
                        console.error("Delete error:", err);
                      }
                    },
                  },
                ]
              );
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={ItemSeparator}
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
      <EditSubModal
        visible={!!editingSubscription}
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onSubmit={async (id, updatedData) => {
          await updateSubscription(id, updatedData);
        }}
      />
    </SafeAreaView>
  );
}
