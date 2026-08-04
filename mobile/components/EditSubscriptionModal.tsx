import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";

export interface EditSubscriptionModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSubmit: (id: string, updatedData: any) => Promise<void>;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5a2a2",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#a2c4f5",
  Music: "#d0a2f5",
  Other: "#e0e0e0",
};

const BACKEND_CATEGORY_MAP: Record<string, string> = {
  "AI Tools": "ai",
  "Developer Tools": "productivity",
  Entertainment: "entertainment",
  Design: "productivity",
  Productivity: "productivity",
  Cloud: "productivity",
  Music: "entertainment",
  Other: "other",
};

const STATUS_OPTIONS: Array<"active" | "canceled" | "expired"> = [
  "active",
  "canceled",
  "expired",
];

export default function EditSubscriptionModal({
  visible,
  subscription,
  onClose,
  onSubmit,
}: EditSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Other");
  const [status, setStatus] = useState<"active" | "canceled" | "expired">("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name || "");
      setPrice(subscription.price ? String(subscription.price) : "");
      setFrequency(
        subscription.frequency?.toLowerCase() === "yearly" ? "Yearly" : "Monthly"
      );
      // Map category back to display string if possible
      const cat = subscription.category || "other";
      const displayCat =
        CATEGORIES.find((c) => c.toLowerCase() === cat || BACKEND_CATEGORY_MAP[c] === cat) ||
        "Other";
      setCategory(displayCat);
      setStatus((subscription.status as any) || "active");
    }
  }, [subscription]);

  const isFormValid = name.trim().length > 0 && parseFloat(price) > 0;

  const handleSubmit = async () => {
    if (!isFormValid || !subscription) return;

    setLoading(true);
    try {
      const parsedPrice = parseFloat(price);
      const normalizedCategory = BACKEND_CATEGORY_MAP[category] || "other";

      const updatedData: any = {
        name: name.trim(),
        price: parsedPrice,
        frequency: frequency.toLowerCase(),
        category: normalizedCategory,
        plan: category,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"],
        status,
      };

      await onSubmit(subscription.id, updatedData);
      onClose();
    } catch (err) {
      console.error("Failed to submit edit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="modal-overlay">
          <Pressable style={{ flex: 1 }} onPress={onClose} />

          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">Edit Subscription</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Ionicons name="close" size={20} color="#081126" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View className="modal-body">
                {/* Name Input */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <View className="auth-input-wrap">
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Subscription Name"
                      placeholderTextColor="#666666"
                      className="auth-input-inner"
                    />
                  </View>
                </View>

                {/* Price Input */}
                <View className="auth-field">
                  <Text className="auth-label">Price ($)</Text>
                  <View className="auth-input-wrap">
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#666666"
                      className="auth-input-inner"
                    />
                  </View>
                </View>

                {/* Frequency Toggles */}
                <View className="auth-field">
                  <Text className="auth-label">Billing Frequency</Text>
                  <View className="picker-row">
                    <Pressable
                      onPress={() => setFrequency("Monthly")}
                      className={clsx(
                        "picker-option",
                        frequency === "Monthly" && "picker-option-active"
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Monthly" && "picker-option-text-active"
                        )}
                      >
                        Monthly
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setFrequency("Yearly")}
                      className={clsx(
                        "picker-option",
                        frequency === "Yearly" && "picker-option-active"
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Yearly" && "picker-option-text-active"
                        )}
                      >
                        Yearly
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Status Toggles */}
                <View className="auth-field">
                  <Text className="auth-label">Status</Text>
                  <View className="picker-row">
                    {STATUS_OPTIONS.map((st) => (
                      <Pressable
                        key={st}
                        onPress={() => setStatus(st)}
                        className={clsx(
                          "picker-option capitalize",
                          status === st && "picker-option-active"
                        )}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text capitalize",
                            status === st && "picker-option-text-active"
                          )}
                        >
                          {st}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Category Selection */}
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={clsx(
                          "category-chip",
                          category === cat && "category-chip-active"
                        )}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            category === cat && "category-chip-text-active"
                          )}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <Pressable
                  className={clsx(
                    "auth-button mt-4",
                    (!isFormValid || loading) && "auth-button-disabled"
                  )}
                  onPress={handleSubmit}
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="auth-button-text">Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
