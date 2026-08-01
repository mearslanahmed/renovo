import { tabs } from "@/constants/data";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { colors, components } from "@/constants/theme";
import { clsx } from "clsx";
import { Tabs, Redirect } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { useEffect } from "react";
import { usePostHog } from "posthog-react-native";

const tabBar = components.tabBar;

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        posthog.identify(email, { email });
      }
    }
  }, [isLoaded, isSignedIn, user, posthog]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image source={icon} resizeMode="contain" className="tabs-glyph" />
        </View>
      </View>
    );
  };

  return (
    <SubscriptionProvider>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
        ))}
      </Tabs>
    </SubscriptionProvider>
  );
};

export default TabLayout;
