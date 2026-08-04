import React, { useState, useMemo } from "react";
import { FlatList, Text, TextInput, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import SubscriptionCard from "@/components/SubscriptionCard";
import EditSubModal from "@/components/EditSubscriptionModal";
import { useSubscriptions } from "@/context/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions, updateSubscription, deleteSubscription } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const query = searchQuery.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(query) ||
        (sub.category && sub.category.toLowerCase().includes(query)) ||
        (sub.plan && sub.plan.toLowerCase().includes(query))
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Text className="text-3xl font-sans-bold text-primary mb-5">Subscriptions</Text>

      <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 mb-6">
        <Ionicons name="search-outline" size={20} color="#666666" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
          placeholderTextColor="#666666"
          className="flex-1 ml-3 font-sans-medium text-base text-primary"
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color="#666666"
            onPress={() => setSearchQuery("")}
            suppressHighlighting
          />
        )}
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyboardDismissMode="on-drag"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4">
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
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-mutedForeground font-sans-medium text-base">
              No subscriptions found
            </Text>
          </View>
        )}
      />
      </KeyboardAvoidingView>
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
