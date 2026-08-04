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

import dayjs from "dayjs";

export interface EditSubscriptionModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSubmit: (id: string, updatedData: any) => Promise<void>;
}

const PAYMENT_METHODS = ["Credit Card", "Apple Pay", "PayPal", "Bank Transfer", "Other"];

const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Education",
  "Health",
  "Finance",
  "AI",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5a2a2",
  Productivity: "#b8e8d0",
  Education: "#e8def8",
  Health: "#b8e8d0",
  Finance: "#f5c542",
  AI: "#b8d4e3",
  Other: "#e0e0e0",
};

const BACKEND_CATEGORY_MAP: Record<string, string> = {
  Entertainment: "entertainment",
  Productivity: "productivity",
  Education: "education",
  Health: "health",
  Finance: "finance",
  AI: "ai",
  Other: "other",
};

const FREQUENCIES: Array<"Weekly" | "Monthly" | "Yearly"> = [
  "Weekly",
  "Monthly",
  "Yearly",
];

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
  const [frequency, setFrequency] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Other");
  const [status, setStatus] = useState<"active" | "canceled" | "expired">("active");
  const [startDateStr, setStartDateStr] = useState(dayjs().format("YYYY-MM-DD"));
  const [renewalDateStr, setRenewalDateStr] = useState(dayjs().add(1, "month").format("YYYY-MM-DD"));
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setName(subscription.name || "");
      setPrice(subscription.price ? String(subscription.price) : "");
      
      const freqLower = subscription.frequency?.toLowerCase() || "monthly";
      const matchedFreq = FREQUENCIES.find((f) => f.toLowerCase() === freqLower) || "Monthly";
      setFrequency(matchedFreq);
      // Map category back to display string if possible
      const cat = subscription.category || "other";
      const displayCat =
        CATEGORIES.find((c) => c.toLowerCase() === cat || BACKEND_CATEGORY_MAP[c] === cat) ||
        "Other";
      setCategory(displayCat);
      setStatus((subscription.status as any) || "active");
      setStartDateStr(
        subscription.startDate ? dayjs(subscription.startDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
      );
      setRenewalDateStr(
        subscription.renewalDate ? dayjs(subscription.renewalDate).format("YYYY-MM-DD") : ""
      );
      setPaymentMethod(subscription.paymentMethod || "Credit Card");
    }
  }, [subscription]);

  const isFormValid = name.trim().length > 0 && parseFloat(price) > 0;

  const handleSubmit = async () => {
    if (!isFormValid || !subscription) return;

    setLoading(true);
    try {
      const parsedPrice = parseFloat(price);
      const normalizedCategory = BACKEND_CATEGORY_MAP[category] || "other";
      const parsedStart = dayjs(startDateStr).isValid() ? dayjs(startDateStr).toISOString() : undefined;
      const parsedRenewal = renewalDateStr.trim() && dayjs(renewalDateStr.trim()).isValid()
        ? dayjs(renewalDateStr.trim()).toISOString()
        : undefined;

      const updatedData: any = {
        name: name.trim(),
        price: parsedPrice,
        frequency: frequency.toLowerCase(),
        category: normalizedCategory,
        plan: category,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"],
        status,
        startDate: parsedStart,
        renewalDate: parsedRenewal,
        paymentMethod,
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
                  <View className="picker-row flex-row flex-wrap gap-2">
                    {FREQUENCIES.map((freq) => (
                      <Pressable
                        key={freq}
                        onPress={() => setFrequency(freq)}
                        className={clsx(
                          "picker-option flex-1 min-w-[70px]",
                          frequency === freq && "picker-option-active"
                        )}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text text-center text-xs",
                            frequency === freq && "picker-option-text-active"
                          )}
                        >
                          {freq}
                        </Text>
                      </Pressable>
                    ))}
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
                            "mr-2.5 px-3.5 py-2 rounded-2xl border",
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
