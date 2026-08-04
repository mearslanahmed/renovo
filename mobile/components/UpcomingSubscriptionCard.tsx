import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";
import SubscriptionIcon from "./SubscriptionIcon";
import { useCurrency } from "@/context/CurrencyContext";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscriptionCardProps) => {
  const { currency: preferredCurrency } = useCurrency();

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <SubscriptionIcon name={name} icon={icon} className="upcoming-icon" size={40} />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, preferredCurrency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1
              ? `${daysLeft} days left`
              : daysLeft === 1
                ? "1 day left"
                : daysLeft === 0
                  ? "Today"
                  : "Overdue"}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
