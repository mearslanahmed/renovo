import { icons } from "@/constants/icons";
import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface SubscriptionIconProps {
  name: string;
  icon?: ImageSourcePropType | string;
  color?: string;
  className?: string;
  size?: number;
}

// Brand preset matching
const PRESET_ICONS: Record<string, ImageSourcePropType> = {
  netflix: icons.netflix,
  spotify: icons.spotify,
  notion: icons.notion,
  dropbox: icons.dropbox,
  openai: icons.openai,
  chatgpt: icons.openai,
  adobe: icons.adobe,
  figma: icons.figma,
  github: icons.github,
  claude: icons.claude,
  canva: icons.canva,
  medium: icons.medium,
};

const MONO_ICONS = new Set([
  "wallet",
  "default",
  "setting",
  "activity",
  "add",
  "back",
  "menu",
  "plus",
  "home",
]);

export default function SubscriptionIcon({
  name,
  icon,
  color = "#081126",
  className = "w-10 h-10 rounded-full",
  size = 40,
}: SubscriptionIconProps) {
  // 1. Direct local require source (number)
  if (typeof icon === "number" || (typeof icon === "object" && icon !== null)) {
    const isWallet = icon === icons.wallet;
    return (
      <Image
        source={icon as ImageSourcePropType}
        className={className}
        style={isWallet ? { tintColor: "#081126" } : undefined}
      />
    );
  }

  // 2. String icon key passed in (e.g., 'wallet', 'spotify', 'github')
  if (typeof icon === "string" && icon in icons) {
    const isMono = MONO_ICONS.has(icon);
    return (
      <Image
        source={icons[icon as keyof typeof icons]}
        className={className}
        style={isMono ? { tintColor: "#081126" } : undefined}
      />
    );
  }

  // 3. String URL (e.g., 'https://...')
  if (
    typeof icon === "string" &&
    (icon.startsWith("http://") || icon.startsWith("https://"))
  ) {
    return <Image source={{ uri: icon }} className={className} />;
  }

  // 4. Check name match in presets (e.g. name = "Netflix" or "GitHub Pro")
  const normalizedName = name ? name.toLowerCase().trim() : "";
  for (const [key, imageSource] of Object.entries(PRESET_ICONS)) {
    if (normalizedName.includes(key)) {
      return <Image source={imageSource} className={className} />;
    }
  }

  // 5. Default Fallback Icon: Wallet icon tinted dark #081126
  return (
    <Image
      source={icons.wallet}
      className={className}
      style={{ tintColor: "#081126" }}
    />
  );
}
