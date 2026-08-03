import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";

export interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: any) => void;
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

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Other");

  const isFormValid = name.trim().length > 0 && parseFloat(price) > 0;

  const handleClose = () => {
    // Reset state before closing
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    onClose();
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const parsedPrice = parseFloat(price);
    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Monthly"
        ? dayjs().add(1, "month").toISOString()
        : dayjs().add(1, "year").toISOString();

    const newSubscription: any = {
      name: name.trim(),
      price: parsedPrice,
      frequency: frequency.toLowerCase(),
      category: category.toLowerCase(),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"],
      status: "active",
      startDate,
      icon: icons.wallet,
      currency: "USD",
      paymentMethod: "Visa ending in 0000",
    };

    onSubmit(newSubscription);
    
    posthog.capture('subscription_created', {
      subscription_name: name.trim(),
      subscription_price: parsedPrice,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="modal-overlay">
          <Pressable style={{ flex: 1 }} onPress={handleClose} />

          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
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
                      placeholder="e.g. Netflix"
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
                    !isFormValid && "auth-button-disabled"
                  )}
                  onPress={handleSubmit}
                  disabled={!isFormValid}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
