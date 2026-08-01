import { FlatList, Image, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";
import { BarChart } from "react-native-gifted-charts";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import { useSubscriptions } from "@/context/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const posthog = usePostHog();
  const router = useRouter();
  const { subscriptions } = useSubscriptions();

  const chartData = React.useMemo(() => {
    const today = dayjs();
    const currentDay = today.day();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentWeekStart = today.add(diffToMonday, "day").startOf("day");
    const currentWeekEnd = currentWeekStart.add(6, "day").endOf("day");

    const days = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];

    subscriptions.forEach((sub) => {
      if (sub.status === "active" && sub.renewalDate) {
        const renewal = dayjs(sub.renewalDate);
        if (
          renewal.isAfter(currentWeekStart.subtract(1, "minute")) &&
          renewal.isBefore(currentWeekEnd.add(1, "minute"))
        ) {
          let dayIndex = renewal.day() - 1;
          if (dayIndex === -1) dayIndex = 6;
          dailyTotals[dayIndex] += sub.price;
        }
      }
    });

    return dailyTotals.map((total, index) => {
      const isToday = index === (today.day() === 0 ? 6 : today.day() - 1);
      return {
        value: total > 0 ? total : 5, // minimum value so bars show up
        label: days[index],
        frontColor: isToday ? "#ea7a53" : "#081126",
        topLabelComponent:
          total > 0
            ? () => (
                <View className="absolute -top-9 -left-4 z-10 min-w-[40px] items-center justify-center rounded-lg bg-white px-2 py-1 shadow-sm">
                  <Text className="text-xs font-sans-bold text-accent">
                    ${total.toFixed(0)}
                  </Text>
                </View>
              )
            : undefined,
      };
    });
  }, [subscriptions]);

  const maxChartValue = React.useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value));
    return max > 40 ? max + 10 : 45;
  }, [chartData]);

  useEffect(() => {
    posthog.capture("insights_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={subscriptions.filter((s) => s.status === "active")}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-5 pb-20"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <Text className="text-3xl font-sans-bold text-primary mb-5">
              Monthly Insights
            </Text>

            <ListHeading title="This Week" />
            <View className="mt-4 rounded-3xl bg-muted p-5 pt-10 pb-8">
              <BarChart
                data={chartData}
                barWidth={12}
                spacing={24}
                roundedTop
                roundedBottom
                hideRules={false}
                rulesType="dashed"
                rulesColor="rgba(0,0,0,0.05)"
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{
                  color: "#081126",
                  opacity: 0.6,
                  fontSize: 12,
                  fontFamily: "PlusJakartaSans-Medium",
                }}
                noOfSections={4}
                maxValue={maxChartValue}
                formatYLabel={(label) => label}
                dashWidth={0}
                xAxisLabelTextStyle={{
                  color: "#081126",
                  opacity: 0.6,
                  fontSize: 12,
                  fontFamily: "PlusJakartaSans-Medium",
                }}
              />
            </View>

            <View className="mt-5 rounded-3xl border border-black/10 bg-card p-5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xl font-sans-bold text-primary">
                  Expenses
                </Text>
                <Text className="text-xl font-sans-bold text-primary">
                  -$424.63
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-sans-semibold text-muted-foreground">
                  March 2026
                </Text>
                <Text className="text-base font-sans-semibold text-muted-foreground">
                  +12%
                </Text>
              </View>
            </View>

            <View className="mt-6 mb-4">
              <ListHeading title="Active Subscriptions" />
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View
            className="mb-4 flex-row items-center justify-between rounded-3xl p-5"
            style={{ backgroundColor: item.color || "#e8def8" }}
          >
            <View className="flex-row items-center gap-4">
              <View className="size-14 items-center justify-center rounded-2xl bg-white/30">
                <Image source={item.icon} className="size-8" />
              </View>
              <View>
                <Text className="text-lg font-sans-bold text-primary">
                  {item.name}
                </Text>
                <Text className="mt-1 text-sm font-sans-semibold text-primary/60">
                  {dayjs(item.startDate).format("MMMM D, HH:mm")}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-lg font-sans-bold text-primary">
                {formatCurrency(item.price, item.currency)}
              </Text>
              <Text className="mt-1 text-sm font-sans-semibold text-primary/60">
                per month
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Insights;