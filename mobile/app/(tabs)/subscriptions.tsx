import React, { useState, useMemo } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import SubscriptionCard from "@/components/SubscriptionCard";
import EditSubModal from "@/components/EditSubscriptionModal";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/context/SubscriptionContext";
import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";

const SafeAreaView = styled(RNSafeAreaView);

type StatusFilter = "all" | "active" | "canceled" | "expired";

const CATEGORIES = ["All", "Entertainment", "Productivity", "Education", "Health", "Finance", "AI", "Other"];

const Subscriptions = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
  } = useSubscriptions();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Status filter
      const subStatus = (sub.status || "active").toLowerCase();
      if (selectedStatus !== "all" && subStatus !== selectedStatus) return false;

      // Category filter
      const subCategory = (sub.category || "other").toLowerCase();
      if (
        selectedCategory !== "All" &&
        subCategory !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = sub.name.toLowerCase().includes(query);
        const catMatch = sub.category && sub.category.toLowerCase().includes(query);
        const planMatch = sub.plan && sub.plan.toLowerCase().includes(query);
        if (!nameMatch && !catMatch && !planMatch) return false;
      }

      return true;
    });
  }, [subscriptions, searchQuery, selectedStatus, selectedCategory]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Clean Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-sans-bold text-primary">Subscriptions</Text>
          <Pressable
            onPress={() => setAddModalVisible(true)}
            className="size-11 items-center justify-center rounded-full border border-black/10 bg-card shadow-sm"
          >
            <Image source={icons.plus} className="size-5" style={{ tintColor: "#081126" }} />
          </Pressable>
        </View>

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
              {/* Search Bar */}
              <View className="flex-row items-center bg-card rounded-2xl border border-black/10 px-4 py-2.5 mb-3 shadow-sm">
                <Ionicons name="search-outline" size={18} color="#666666" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search subscriptions..."
                  placeholderTextColor="#888888"
                  className="flex-1 ml-3 font-sans-medium text-sm text-primary py-1"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#888888" />
                  </Pressable>
                )}
              </View>

              {/* Status Segmented Controls */}
              <View className="flex-row rounded-2xl bg-card border border-black/10 p-1 mb-3">
                {(["all", "active", "canceled", "expired"] as StatusFilter[]).map((statusKey) => {
                  const isSelected = selectedStatus === statusKey;
                  const label =
                    statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
                  return (
                    <Pressable
                      key={statusKey}
                      onPress={() => setSelectedStatus(statusKey)}
                      className={clsx(
                        "flex-1 py-2 items-center rounded-xl",
                        isSelected ? "bg-primary shadow-sm" : "bg-transparent"
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-xs font-sans-semibold capitalize",
                          isSelected ? "text-white" : "text-primary"
                        )}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
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
            </>
          }
          data={filteredSubscriptions}
          keyboardDismissMode="on-drag"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-3">
              <SubscriptionCard
                {...item}
                expanded={expandedId === item.id}
                onPress={() =>
                  setExpandedId((prev) => (prev === item.id ? null : item.id))
                }
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
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 rounded-3xl bg-card border border-black/10 p-5 mt-2">
              <Ionicons name="filter-outline" size={36} color="#888888" className="mb-2" />
              <Text className="text-base font-sans-bold text-primary mb-1">
                No Subscriptions Found
              </Text>
              <Text className="text-xs font-sans-medium text-muted-foreground text-center">
                {searchQuery || selectedCategory !== "All" || selectedStatus !== "all"
                  ? "Try adjusting your search query, status tab, or category filters."
                  : "No subscriptions added yet. Tap the + button to add your first subscription!"}
              </Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>

      <CreateSubscriptionModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
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
};

export default Subscriptions;
