import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import { clsx } from "clsx";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SubscriptionIcon from "./SubscriptionIcon";
import { useCurrency } from "@/context/CurrencyContext";

const SubscriptionCard = ({
  name,
  price,
  currency,
  frequency,
  icon,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  onEditPress,
  onDeletePress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  const { currency: preferredCurrency } = useCurrency();

  const normalizedStatus = (status || "active").toLowerCase();
  const statusLabel = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  const cardColor = color || "#fff8e7";

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded && "border-primary/30 shadow-md")}
      style={{ backgroundColor: cardColor }}
    >
      <View className="sub-head">
        <View className="sub-main">
          <SubscriptionIcon name={name} icon={icon} color={color} className="sub-icon" size={40} />
          <View className="sub-copy flex-1">
            <View className="flex-row items-center gap-2 pr-2">
              <Text numberOfLines={1} className="sub-title shrink">
                {name}
              </Text>
              <View className="px-2 py-0.5 rounded-full bg-black/10 border border-black/10">
                <Text className="text-[10px] font-sans-bold uppercase text-primary">
                  {statusLabel}
                </Text>
              </View>
            </View>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, preferredCurrency)}</Text>
          <Text className="sub-frequency">{frequency}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <Text className="sub-label">Payment:</Text>
              <Text numberOfLines={1} className="sub-value">
                {paymentMethod?.trim() || "Not set"}
              </Text>
            </View>

            <View className="sub-row">
              <Text className="sub-label">Category:</Text>
              <Text numberOfLines={1} className="sub-value">
                {category?.trim() || plan?.trim() || "Not set"}
              </Text>
            </View>

            <View className="sub-row">
              <Text className="sub-label">Started:</Text>
              <Text numberOfLines={1} className="sub-value">
                {startDate ? formatSubscriptionDateTime(startDate) : "Not set"}
              </Text>
            </View>

            <View className="sub-row">
              <Text className="sub-label">Renewal Date:</Text>
              <Text numberOfLines={1} className="sub-value">
                {renewalDate
                  ? formatSubscriptionDateTime(renewalDate)
                  : "Not set"}
              </Text>
            </View>

            <View className="sub-row">
              <Text className="sub-label">Status:</Text>
              <View className="px-2.5 py-0.5 rounded-full bg-black/10 border border-black/10">
                <Text className="text-xs font-sans-bold uppercase text-primary">
                  {statusLabel}
                </Text>
              </View>
            </View>

            {(onEditPress || onDeletePress) && (
              <View className="mt-4 flex-row items-center justify-end gap-3 pt-3 border-t border-black/10">
                {onEditPress && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onEditPress();
                    }}
                    className="flex-row items-center gap-1.5 rounded-full bg-black/5 px-4 py-2"
                  >
                    <Ionicons name="pencil-outline" size={16} color="#081126" />
                    <Text className="text-xs font-sans-medium text-primary">Edit</Text>
                  </Pressable>
                )}
                {onDeletePress && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDeletePress();
                    }}
                    className="flex-row items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-2"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text className="text-xs font-sans-medium text-red-500">Delete</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
