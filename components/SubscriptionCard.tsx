import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import { clsx } from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
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
              <Text numberOfLines={1} className="sub-value">
                {status?.trim() || "Not set"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
