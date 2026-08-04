import {
  Text,
  Pressable,
  View,
  Image,
  ScrollView,
  Modal,
  Alert,
  Linking,
} from "react-native";
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

type InfoModalType = "help" | "terms" | "privacy" | null;

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const posthog = usePostHog();
  const { currency, setCurrency } = useCurrency();

  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<InfoModalType>(null);

  const handleSignOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Renovo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          posthog.capture("user_signed_out");
          posthog.reset();
          signOut();
        },
      },
    ]);
  };

  const activeCurrencyObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const userEmail = user?.primaryEmailAddress?.emailAddress || "user@example.com";
  const emailPrefix = userEmail.split("@")[0];
  const userName =
    user?.fullName ||
    user?.firstName ||
    emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5"
      >
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        {/* Clean Profile Header */}
        <View className="settings-avatar-wrap">
          <UserAvatar size={80} className="settings-avatar mb-3" />
          <Text className="settings-name">{userName}</Text>
          <Text className="settings-email">{userEmail}</Text>
        </View>

        <View className="mt-8 mb-2">
          <Text className="text-sm font-sans-bold uppercase tracking-widest text-muted-foreground">
            Preferences
          </Text>
        </View>

        {/* Preferences Section */}
        <View className="settings-section mt-2">
          {/* Currency Row */}
          <Pressable
            onPress={() => setCurrencyModalVisible(true)}
            className="settings-row border-b-0 flex-row items-center justify-between"
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
        </View>

        <View className="mt-8 mb-2">
          <Text className="text-sm font-sans-bold uppercase tracking-widest text-muted-foreground">
            Support & Legal
          </Text>
        </View>

        {/* Support & Legal Section */}
        <View className="settings-section mt-2">
          {/* Help & Support */}
          <Pressable
            onPress={() => {
              posthog.capture("settings_help_tapped");
              setActiveInfoModal("help");
            }}
            className="settings-row border-b border-black/5"
          >
            <View className="settings-row-left">
              <Text className="settings-label">Help & Support</Text>
            </View>
            <Image
              source={icons.back}
              className="size-4 rotate-180 opacity-40"
              style={{ tintColor: "#081126" }}
            />
          </Pressable>

          {/* Terms of Service */}
          <Pressable
            onPress={() => {
              posthog.capture("settings_terms_tapped");
              setActiveInfoModal("terms");
            }}
            className="settings-row border-b border-black/5"
          >
            <View className="settings-row-left">
              <Text className="settings-label">Terms of Service</Text>
            </View>
            <Image
              source={icons.back}
              className="size-4 rotate-180 opacity-40"
              style={{ tintColor: "#081126" }}
            />
          </Pressable>

          {/* Privacy Policy */}
          <Pressable
            onPress={() => {
              posthog.capture("settings_privacy_tapped");
              setActiveInfoModal("privacy");
            }}
            className="settings-row border-b-0"
          >
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

        <Pressable onPress={handleSignOut} className="settings-logout mt-8">
          <Text className="settings-logout-text">Log out</Text>
        </Pressable>

        <View className="mt-8 mb-6 items-center">
          <Text className="text-xs font-sans-semibold text-muted-foreground/60">
            Renovo Subscription Manager v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
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
                        ? "bg-primary border-primary shadow-sm"
                        : "bg-background border-black/10"
                    )}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={clsx(
                          "size-9 rounded-full items-center justify-center border",
                          isSelected
                            ? "bg-white/20 border-white/20"
                            : "bg-card border-black/10"
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
                        <Text
                          className={clsx(
                            "font-sans-semibold text-sm",
                            isSelected ? "text-white" : "text-primary"
                          )}
                        >
                          {c.name}
                        </Text>
                        <Text
                          className={clsx(
                            "font-sans-medium text-xs",
                            isSelected ? "text-white/70" : "text-muted-foreground"
                          )}
                        >
                          {c.code}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Info Modals (Help, Terms, Privacy) */}
      <Modal
        visible={activeInfoModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveInfoModal(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setActiveInfoModal(null)}
        >
          <Pressable
            className="w-full bg-card rounded-t-3xl p-6 border-t border-black/10 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between pb-4 border-b border-black/10 mb-4">
              <Text className="text-xl font-sans-bold text-primary">
                {activeInfoModal === "help" && "Help & Support"}
                {activeInfoModal === "terms" && "Terms of Service"}
                {activeInfoModal === "privacy" && "Privacy Policy"}
              </Text>
              <Pressable
                className="size-8 items-center justify-center rounded-full bg-black/5"
                onPress={() => setActiveInfoModal(null)}
              >
                <Ionicons name="close" size={20} color="#081126" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="pb-6">
              {/* HELP & SUPPORT CONTENT */}
              {activeInfoModal === "help" && (
                <View className="gap-4">
                  <Text className="text-sm font-sans-medium text-primary leading-6">
                    Welcome to Renovo Support! Need assistance or have questions about managing your subscriptions?
                  </Text>

                  <View className="rounded-2xl bg-background p-4 border border-black/5 gap-2">
                    <Text className="font-sans-bold text-base text-primary">Frequently Asked Questions</Text>

                    <Text className="font-sans-semibold text-sm text-primary mt-2">Q: How do I add a new subscription?</Text>
                    <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                      Tap the "+" button on your Home screen or Subscriptions screen. You can select popular platform presets or enter custom subscription details.
                    </Text>

                    <Text className="font-sans-semibold text-sm text-primary mt-2">Q: How do I edit or delete a subscription?</Text>
                    <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                      Tap any subscription card to expand its details. Tap the Edit button (pencil) or Delete button (trash).
                    </Text>

                    <Text className="font-sans-semibold text-sm text-primary mt-2">Q: How do I switch currencies?</Text>
                    <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                      Go to Settings → Currency and pick any of the 9 supported global currencies.
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => {
                      Linking.openURL("mailto:support@renovo.app?subject=Renovo%20App%20Support");
                    }}
                    className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 px-4"
                  >
                    <Ionicons name="mail-outline" size={18} color="#ffffff" />
                    <Text className="font-sans-bold text-sm text-white">Email Support Team</Text>
                  </Pressable>
                </View>
              )}

              {/* TERMS OF SERVICE CONTENT */}
              {activeInfoModal === "terms" && (
                <View className="gap-3">
                  <Text className="font-sans-bold text-base text-primary">Terms of Service</Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    1. Acceptance of Terms: By downloading and using Renovo, you agree to these Terms of Service. Renovo provides personal subscription tracking and expense analytics.
                  </Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    2. User Responsibilities: You are responsible for maintaining the accuracy of your subscription data and account credentials.
                  </Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    3. Modifications: We reserve the right to improve and update features of the app to enhance user experience.
                  </Text>
                </View>
              )}

              {/* PRIVACY POLICY CONTENT */}
              {activeInfoModal === "privacy" && (
                <View className="gap-3">
                  <Text className="font-sans-bold text-base text-primary">Privacy Policy</Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    1. Data Protection: Your data is confidential. We do not sell or share your personal subscription details with third parties.
                  </Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    2. Security: User authentication is secured end-to-end via Clerk authentication services.
                  </Text>
                  <Text className="font-sans-medium text-xs text-muted-foreground leading-5">
                    3. Full Control: You can delete your subscriptions or account anytime from your dashboard.
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;