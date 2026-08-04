import { Text, Pressable, View, Image, ScrollView, Switch, Modal } from "react-native";
import React, { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useAuth, useUser } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { icons } from "@/constants/icons";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import UserAvatar from "@/components/UserAvatar";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const posthog = usePostHog();
  const { currency, setCurrency } = useCurrency();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);

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

  const activeCurrencyObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5"
      >
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        <View className="settings-avatar-wrap">
          <UserAvatar size={80} className="settings-avatar mb-3" />
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
          <Pressable
            onPress={() => setCurrencyModalVisible(true)}
            className="settings-row border-b border-black/5 flex-row items-center justify-between"
          >
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
            <View className="flex-row items-center gap-2">
              <Text className="settings-value font-sans-semibold text-primary">
                {activeCurrencyObj.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </View>
          </Pressable>

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

      <Modal
        visible={isCurrencyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/60 p-5"
          onPress={() => setCurrencyModalVisible(false)}
        >
          <Pressable
            className="w-full max-w-sm bg-card rounded-3xl p-5 border border-black/10 shadow-2xl"
            style={{ maxHeight: 420 }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-black/10">
              <Text className="text-lg font-sans-bold text-primary">Select Currency</Text>
              <Pressable
                className="size-8 items-center justify-center rounded-full bg-black/5"
                onPress={() => setCurrencyModalVisible(false)}
              >
                <Ionicons name="close" size={18} color="#081126" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 330 }}>
              {CURRENCIES.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <Pressable
                    key={c.code}
                    onPress={() => {
                      setCurrency(c.code);
                      posthog.capture("currency_changed", { currency: c.code });
                      setCurrencyModalVisible(false);
                    }}
                    className={clsx(
                      "flex-row items-center justify-between py-3 px-3.5 rounded-2xl mb-2 border",
                      isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-white/60 border-black/5"
                    )}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={clsx(
                          "size-9 rounded-full items-center justify-center border",
                          isSelected
                            ? "bg-primary border-primary"
                            : "bg-background border-black/10"
                        )}
                      >
                        <Text
                          className={clsx(
                            "font-sans-bold text-xs",
                            isSelected ? "text-white" : "text-primary"
                          )}
                        >
                          {c.symbol}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-sans-semibold text-sm text-primary">{c.name}</Text>
                        <Text className="font-sans-medium text-xs text-muted-foreground">{c.code}</Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#081126" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;