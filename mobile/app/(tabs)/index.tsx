import { useUser } from "@clerk/expo";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { icons } from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState, useMemo } from "react";
import EditSubModal from "@/components/EditSubscriptionModal";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useCurrency } from "@/context/CurrencyContext";
import UserAvatar from "@/components/UserAvatar";

const SafeAreaView = styled(RNSafeAreaView);

const ItemSeparator = () => <View className="h-3" />;

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const { currency: preferredCurrency } = useCurrency();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
  } = useSubscriptions();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const posthog = usePostHog();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscriptions();
    } catch (e) {
      // Silent catch
    } finally {
      setRefreshing(false);
    }
  };

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

  // Show up to 4 recent active subscriptions on Home screen dashboard
  const recentSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .slice(0, 4);
  }, [subscriptions]);

  const emailUsername = user?.primaryEmailAddress?.emailAddress
    ? user.primaryEmailAddress.emailAddress.split("@")[0]
    : "";
  const derivedName = emailUsername
    ? emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)
    : "User";

  const userName = user?.fullName || user?.firstName || derivedName;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#081126"
            colors={["#ea7a53", "#081126"]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Greeting Header */}
            <View className="home-header">
              <View className="home-user">
                <UserAvatar size={48} className="home-avatar" />
                <Text className="home-user-name">{userName}</Text>
              </View>
              <Pressable
                onPress={() => {
                  posthog.capture("add_subscription_tapped");
                  setModalVisible(true);
                }}
                testID="add-subscription-button"
                className="size-12 items-center justify-center rounded-full border border-black/10 bg-card shadow-sm"
              >
                <Image source={icons.plus} className="size-6" style={{ tintColor: "#081126" }} />
              </Pressable>
            </View>

            {/* Monthly Expenses Balance Card */}
            <View className="home-balance-card shadow-sm">
              <Text className="home-balance-label">Monthly Expenses</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(totalMonthlyBalance, preferredCurrency)}
                </Text>
                <View className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                  <Text className="text-sm font-sans-bold text-white">
                    Next: {nextRenewalDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Upcoming Renewals Carousel (Next 7 Days) */}
            {upcomingSubscriptions.length > 0 && (
              <View className="mb-5">
                <ListHeading title="Upcoming (Next 7 Days)" />
                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {/* Recent Subscriptions Header with View All Link */}
            <View className="mb-3">
              <ListHeading
                title="Recent Subscriptions"
                actionText="View All"
                onActionPress={() => {
                  posthog.capture("view_all_subscriptions_tapped");
                  router.push("/(tabs)/subscriptions");
                }}
              />
            </View>
          </>
        }
        data={recentSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id
              );
              if (isExpanding) {
                posthog.capture("subscription_card_expanded", {
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
                        // Silent catch
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
          <View className="items-center justify-center py-10 rounded-3xl bg-card border border-black/10 p-5 mt-2">
            <Text className="text-base font-sans-bold text-primary mb-1">
              No Subscriptions Yet
            </Text>
            <Text className="text-xs font-sans-medium text-muted-foreground text-center">
              Tap the + button above to add your first subscription!
            </Text>
          </View>
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
