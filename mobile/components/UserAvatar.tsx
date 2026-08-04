import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { useUser } from "@clerk/expo";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

export default function UserAvatar({ size = 48, className }: UserAvatarProps) {
  const { user } = useUser();
  const [imageError, setImageError] = useState(false);

  const emailName = user?.primaryEmailAddress?.emailAddress
    ? user.primaryEmailAddress.emailAddress.split("@")[0]
    : "";
  const displayName = user?.fullName || user?.firstName || emailName || "User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  // Check if user has uploaded a custom image (Clerk sets hasImage = true)
  const hasCustomPhoto = Boolean(user?.hasImage && user?.imageUrl);

  if (hasCustomPhoto && !imageError) {
    return (
      <Image
        source={{ uri: user!.imageUrl }}
        className={className}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Stylish Initial Letter Avatar Badge
  const fontSize = Math.floor(size * 0.42);

  return (
    <View
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#081126",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontSize,
          fontWeight: "700",
          fontFamily: "PlusJakartaSans-Bold",
        }}
      >
        {initial}
      </Text>
    </View>
  );
}
