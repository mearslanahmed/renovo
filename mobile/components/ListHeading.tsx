import { View, Text, Pressable } from "react-native";
import React from "react";

const ListHeading = ({ title, actionText, onActionPress }: ListHeadingProps) => {
  return (
    <View className="list-head flex-row items-center justify-between my-3">
      <Text className="list-title text-2xl font-sans-bold text-primary">{title}</Text>
      {actionText && onActionPress && (
        <Pressable
          onPress={onActionPress}
          className="rounded-full border border-black/10 bg-card px-3.5 py-1"
        >
          <Text className="text-xs font-sans-bold text-accent">{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ListHeading;