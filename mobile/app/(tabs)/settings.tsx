import { Text, Pressable, View, Image, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { icons } from "@/constants/icons";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const posthog = usePostHog();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleSignOut = () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    signOut();
  };

  const togglePush = () => {
    posthog.capture("toggled_push_notifications", { enabled: !pushEnabled });
    setPushEnabled(!pushEnabled);
  };

  const toggleDarkMode = () => {
    posthog.capture("toggled_dark_mode", { enabled: !darkModeEnabled });
    setDarkModeEnabled(!darkModeEnabled);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5"
      >
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        <View className="settings-avatar-wrap">
          <Image
            source={{
              uri:
                user?.imageUrl ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            }}
            className="settings-avatar"
          />
          <Text className="settings-name">
            {user?.fullName ||
              user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
              "Renovo User"}
          </Text>
          <Text className="settings-email">
            {user?.primaryEmailAddress?.emailAddress || "user@example.com"}
          </Text>
        </View>

        <View className="mt-8 mb-2">
          <Text className="text-sm font-sans-bold uppercase tracking-widest text-muted-foreground">
            Preferences
          </Text>
        </View>

        <View className="settings-section mt-2">
          <View className="settings-row border-b border-black/5">
            <View className="settings-row-left">
              <View className="settings-icon-wrap">
                <Image
                  source={icons.wallet}
                  className="settings-icon"
                  style={{ tintColor: "#081126" }}
                />
              </View>
              <Text className="settings-label">Currency</Text>
            </View>
            <Text className="settings-value">USD ($)</Text>
          </View>

          <View className="settings-row border-b border-black/5">
            <View className="settings-row-left">
              <View className="settings-icon-wrap">
                <Image
                  source={icons.activity}
                  className="settings-icon"
                  style={{ tintColor: "#081126" }}
                />
              </View>
              <Text className="settings-label">Push Notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={togglePush}
              trackColor={{ false: "rgba(0,0,0,0.1)", true: "#ea7a53" }}
              thumbColor={"#ffffff"}
            />
          </View>

          <View className="settings-row border-b-0">
            <View className="settings-row-left">
              <View className="settings-icon-wrap">
                <Image
                  source={icons.setting}
                  className="settings-icon"
                  style={{ tintColor: "#081126" }}
                />
              </View>
              <Text className="settings-label">Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "rgba(0,0,0,0.1)", true: "#ea7a53" }}
              thumbColor={"#ffffff"}
            />
          </View>
        </View>

        <View className="mt-8 mb-2">
          <Text className="text-sm font-sans-bold uppercase tracking-widest text-muted-foreground">
            Support & About
          </Text>
        </View>

        <View className="settings-section mt-2">
          <Pressable className="settings-row border-b border-black/5">
            <View className="settings-row-left">
              <Text className="settings-label">Help & Support</Text>
            </View>
            <Image
              source={icons.back}
              className="size-4 rotate-180 opacity-40"
              style={{ tintColor: "#081126" }}
            />
          </Pressable>

          <Pressable className="settings-row border-b border-black/5">
            <View className="settings-row-left">
              <Text className="settings-label">Terms of Service</Text>
            </View>
            <Image
              source={icons.back}
              className="size-4 rotate-180 opacity-40"
              style={{ tintColor: "#081126" }}
            />
          </Pressable>

          <Pressable className="settings-row border-b-0">
            <View className="settings-row-left">
              <Text className="settings-label">Privacy Policy</Text>
            </View>
            <Image
              source={icons.back}
              className="size-4 rotate-180 opacity-40"
              style={{ tintColor: "#081126" }}
            />
          </Pressable>
        </View>

        <Pressable onPress={handleSignOut} className="settings-logout">
          <Text className="settings-logout-text">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;