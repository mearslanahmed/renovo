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
import { useState, useMemo } from "react";
import EditSubModal from "@/components/EditSubscriptionModal";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  Alert,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { useCurrency } from "@/context/CurrencyContext";
import UserAvatar from "@/components/UserAvatar";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";

const SafeAreaView = styled(RNSafeAreaView);

const ItemSeparator = () => <View className="h-3" />;

const FILTER_CATEGORIES = ["All", "Entertainment", "Productivity", "Education", "Health", "Finance", "AI", "Other"];

export default function App() {
  const { user } = useUser();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const posthog = usePostHog();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscriptions();
    } catch (e) {
      console.error(e);
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

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = sub.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const subCat = (sub.category || "other").toLowerCase();
      const matchesCategory =
        selectedCategoryFilter === "All" ||
        subCat === selectedCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, searchQuery, selectedCategoryFilter]);

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
            {/* Header with Avatar and Add Button */}
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

            {/* Main Expenses Balance Card */}
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

            {/* Upcoming Renewals Carousel */}
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

            {/* Search Bar */}
            <View className="mb-3 flex-row items-center rounded-2xl bg-card border border-black/10 px-4 py-2.5 shadow-sm">
              <Ionicons name="search-outline" size={18} color="#666666" className="mr-2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions..."
                placeholderTextColor="#888888"
                className="flex-1 font-sans-medium text-sm text-primary py-1"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#888888" />
                </Pressable>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {FILTER_CATEGORIES.map((cat) => {
                const isSelected = selectedCategoryFilter === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategoryFilter(cat)}
                    className={clsx(
                      "mr-2 px-3.5 py-1.5 rounded-full border",
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-card border-black/10"
                    )}
                  >
                    <Text
                      className={clsx(
                        "text-xs font-sans-semibold",
                        isSelected ? "text-white" : "text-primary"
                      )}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="flex-row items-center justify-between mb-3">
              <ListHeading title="All Subscriptions" />
              <Text className="text-xs font-sans-bold text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? "sub" : "subs"}
              </Text>
            </View>
          </>
        }
        data={filteredSubscriptions}
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
          <View className="items-center justify-center py-10 rounded-3xl bg-card border border-black/10 p-5 mt-2">
            <Ionicons name="layers-outline" size={36} color="#888888" className="mb-2" />
            <Text className="text-base font-sans-bold text-primary mb-1">
              No Subscriptions Found
            </Text>
            <Text className="text-xs font-sans-medium text-muted-foreground text-center">
              {searchQuery || selectedCategoryFilter !== "All"
                ? "No subscriptions match your search or filter criteria."
                : "Tap the + button above to add your first subscription!"}
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
