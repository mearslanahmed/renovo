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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import { posthog } from "@/lib/posthog";

import SubscriptionIcon from "./SubscriptionIcon";

import { useCurrency } from "@/context/CurrencyContext";

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

const POPULAR_PRESETS = [
  { name: "Netflix", category: "Entertainment", icon: "netflix", color: "#f5a2a2", defaultPrice: "15.99" },
  { name: "Spotify", category: "Music", icon: "spotify", color: "#d0a2f5", defaultPrice: "10.99" },
  { name: "ChatGPT", category: "AI Tools", icon: "openai", color: "#b8d4e3", defaultPrice: "20.00" },
  { name: "GitHub Pro", category: "Developer Tools", icon: "github", color: "#e8def8", defaultPrice: "4.00" },
  { name: "Adobe CC", category: "Design", icon: "adobe", color: "#f5c542", defaultPrice: "54.99" },
  { name: "Canva Pro", category: "Design", icon: "canva", color: "#b8e8d0", defaultPrice: "12.99" },
  { name: "Claude Pro", category: "AI Tools", icon: "claude", color: "#b8d4e3", defaultPrice: "20.00" },
  { name: "Notion", category: "Productivity", icon: "notion", color: "#b8e8d0", defaultPrice: "10.00" },
  { name: "Dropbox", category: "Cloud", icon: "dropbox", color: "#a2c4f5", defaultPrice: "11.99" },
];

const PAYMENT_METHODS = ["Credit Card", "Apple Pay", "PayPal", "Bank Transfer", "Other"];

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const { currency: preferredCurrency } = useCurrency();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Other");
  const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [startDateStr, setStartDateStr] = useState(dayjs().format("YYYY-MM-DD"));
  const [renewalDateStr, setRenewalDateStr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const isFormValid = name.trim().length > 0 && parseFloat(price) > 0;

  const handleSelectPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setSelectedIconKey(preset.icon);
    setSelectedColor(preset.color);
    if (!price) setPrice(preset.defaultPrice);
  };

  const handleClose = () => {
    // Reset state before closing
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setSelectedIconKey(null);
    setSelectedColor(null);
    setStartDateStr(dayjs().format("YYYY-MM-DD"));
    setRenewalDateStr("");
    setPaymentMethod("Credit Card");
    onClose();
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

    const parsedPrice = parseFloat(price);
    const parsedStart = dayjs(startDateStr).isValid() ? dayjs(startDateStr).toISOString() : dayjs().toISOString();
    const parsedRenewal = renewalDateStr.trim() && dayjs(renewalDateStr.trim()).isValid()
      ? dayjs(renewalDateStr.trim()).toISOString()
      : undefined;

    const normalizedCategory = BACKEND_CATEGORY_MAP[category] || "other";

    const newSubscription: any = {
      name: name.trim(),
      price: parsedPrice,
      frequency: frequency.toLowerCase(),
      category: normalizedCategory,
      plan: category,
      color: selectedColor || CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"],
      icon: selectedIconKey || name.trim().toLowerCase(),
      status: "active",
      startDate: parsedStart,
      renewalDate: parsedRenewal,
      currency: preferredCurrency || "USD",
      paymentMethod,
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
                {/* Popular Services Quick Select */}
                <View className="auth-field mb-2">
                  <Text className="auth-label">Quick Select Platform</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                    {POPULAR_PRESETS.map((preset) => {
                      const isSelected = name === preset.name;
                      return (
                        <Pressable
                          key={preset.name}
                          onPress={() => handleSelectPreset(preset)}
                          style={
                            isSelected
                              ? { backgroundColor: preset.color, borderColor: "#081126" }
                              : undefined
                          }
                          className={clsx(
                            "mr-2.5 px-3 py-2 rounded-2xl border flex-row items-center gap-2",
                            isSelected
                              ? "border-primary"
                              : "border-black/10 bg-white"
                          )}
                        >
                          <SubscriptionIcon
                            name={preset.name}
                            icon={preset.icon}
                            color={preset.color}
                            size={22}
                          />
                          <Text className="text-xs font-sans-semibold text-primary">
                            {preset.name}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={14} color="#081126" />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Name Input */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <View className="auth-input-wrap">
                    <TextInput
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setSelectedIconKey(null);
                      }}
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

                {/* Dates Section */}
                <View className="flex-row gap-3">
                  <View className="auth-field flex-1">
                    <Text className="auth-label">Start Date</Text>
                    <View className="auth-input-wrap">
                      <Ionicons name="calendar-outline" size={18} color="#666666" />
                      <TextInput
                        value={startDateStr}
                        onChangeText={setStartDateStr}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#666666"
                        className="auth-input-inner text-xs"
                      />
                    </View>
                  </View>

                  <View className="auth-field flex-1">
                    <Text className="auth-label">Renewal (Optional)</Text>
                    <View className="auth-input-wrap">
                      <Ionicons name="time-outline" size={18} color="#666666" />
                      <TextInput
                        value={renewalDateStr}
                        onChangeText={setRenewalDateStr}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999999"
                        className="auth-input-inner text-xs"
                      />
                    </View>
                  </View>
                </View>

                {/* Payment Method */}
                <View className="auth-field">
                  <Text className="auth-label">Payment Method</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = paymentMethod === method;
                      return (
                        <Pressable
                          key={method}
                          onPress={() => setPaymentMethod(method)}
                          className={clsx(
                            "mr-2 px-3 py-2 rounded-2xl border",
                            isSelected
                              ? "bg-primary border-primary"
                              : "bg-white border-black/10"
                          )}
                        >
                          <Text
                            className={clsx(
                              "text-xs font-sans-semibold",
                              isSelected ? "text-white" : "text-primary"
                            )}
                          >
                            {method}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
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
