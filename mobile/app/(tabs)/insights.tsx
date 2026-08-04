import { FlatList, Image, Text, View, ScrollView } from "react-native";
import React, { useEffect, useMemo } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { BarChart } from "react-native-gifted-charts";
import { formatCurrency, CURRENCIES } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import { useSubscriptions } from "@/context/SubscriptionContext";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import { useCurrency } from "@/context/CurrencyContext";
import { clsx } from "clsx";

const SafeAreaView = styled(RNSafeAreaView);

const CATEGORY_DISPLAY_MAP: Record<string, { label: string; color: string }> = {
  entertainment: { label: "Entertainment", color: "#f5a2a2" },
  productivity: { label: "Productivity", color: "#b8e8d0" },
  education: { label: "Education", color: "#e8def8" },
  health: { label: "Health", color: "#b8e8d0" },
  finance: { label: "Finance", color: "#f5c542" },
  ai: { label: "AI", color: "#b8d4e3" },
  other: { label: "Other", color: "#e0e0e0" },
};

const Insights = () => {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const { currency: preferredCurrency } = useCurrency();

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.status === "active");
  }, [subscriptions]);

  const totalMonthlyBalance = useMemo(() => {
    return activeSubscriptions.reduce((sum, sub) => {
      const price = Number(sub.price) || 0;
      const freq = sub.frequency?.toLowerCase();
      if (freq === "yearly") return sum + price / 12;
      if (freq === "weekly") return sum + price * 4.33;
      return sum + price;
    }, 0);
  }, [activeSubscriptions]);

  const yearlyProjection = useMemo(() => {
    return totalMonthlyBalance * 12;
  }, [totalMonthlyBalance]);

  const avgCostPerSub = useMemo(() => {
    if (activeSubscriptions.length === 0) return 0;
    return totalMonthlyBalance / activeSubscriptions.length;
  }, [activeSubscriptions, totalMonthlyBalance]);

  const highestSub = useMemo(() => {
    if (activeSubscriptions.length === 0) return null;
    return [...activeSubscriptions].sort((a, b) => Number(b.price) - Number(a.price))[0];
  }, [activeSubscriptions]);

  // Category Breakdown Data
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubscriptions.forEach((sub) => {
      const catKey = (sub.category || "other").toLowerCase().trim();
      const price = Number(sub.price) || 0;
      const freq = sub.frequency?.toLowerCase();
      const monthlyCost =
        freq === "yearly" ? price / 12 : freq === "weekly" ? price * 4.33 : price;

      map[catKey] = (map[catKey] || 0) + monthlyCost;
    });

    return Object.entries(map)
      .map(([key, amount]) => {
        const config = CATEGORY_DISPLAY_MAP[key] || {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: "#e0e0e0",
        };
        const percentage =
          totalMonthlyBalance > 0 ? Math.round((amount / totalMonthlyBalance) * 100) : 0;
        return {
          key,
          label: config.label,
          color: config.color,
          amount,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubscriptions, totalMonthlyBalance]);

  // Weekly Renewals Bar Chart Data
  const chartData = useMemo(() => {
    const today = dayjs();
    const currentDay = today.day();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentWeekStart = today.add(diffToMonday, "day").startOf("day");
    const currentWeekEnd = currentWeekStart.add(6, "day").endOf("day");

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyTotals = [0, 0, 0, 0, 0, 0, 0];

    activeSubscriptions.forEach((sub) => {
      if (sub.renewalDate) {
        const renewal = dayjs(sub.renewalDate);
        if (
          renewal.isAfter(currentWeekStart.subtract(1, "minute")) &&
          renewal.isBefore(currentWeekEnd.add(1, "minute"))
        ) {
          let dayIndex = renewal.day() - 1;
          if (dayIndex === -1) dayIndex = 6;
          dailyTotals[dayIndex] += Number(sub.price) || 0;
        }
      }
    });

    const maxVal = Math.max(...dailyTotals);
    const currObj = CURRENCIES.find((c) => c.code === preferredCurrency) || CURRENCIES[0];

    return dailyTotals.map((total, index) => {
      const isToday = index === (today.day() === 0 ? 6 : today.day() - 1);
      return {
        value: total > 0 ? total : maxVal > 0 ? maxVal * 0.08 : 2,
        label: days[index],
        frontColor: isToday ? "#ea7a53" : "#081126",
        topLabelComponent:
          total > 0
            ? () => (
                <View className="absolute -top-9 -left-4 z-10 min-w-[44px] items-center justify-center rounded-lg bg-card px-2 py-1 border border-black/10 shadow-sm">
                  <Text className="text-[11px] font-sans-bold text-accent">
                    {currObj.symbol}
                    {total.toFixed(0)}
                  </Text>
                </View>
              )
            : undefined,
      };
    });
  }, [activeSubscriptions, preferredCurrency]);

  const maxChartValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value));
    return max > 40 ? max + 15 : 40;
  }, [chartData]);

  useEffect(() => {
    posthog.capture("insights_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={activeSubscriptions}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-5 pb-20"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            <Text className="text-3xl font-sans-bold text-primary mb-5">
              Insights & Analytics
            </Text>

            {/* Total Expenses Summary Card */}
            <View className="rounded-3xl border border-black/10 bg-accent p-6 shadow-sm mb-5">
              <Text className="text-lg font-sans-semibold text-white/80">
                Total Monthly Spending
              </Text>
              <Text className="text-4xl font-sans-extrabold text-white mt-1 mb-4">
                {formatCurrency(totalMonthlyBalance, preferredCurrency)}
              </Text>

              <View className="flex-row items-center justify-between pt-4 border-t border-white/20">
                <View>
                  <Text className="text-xs font-sans-medium text-white/70">Yearly Projection</Text>
                  <Text className="text-base font-sans-bold text-white">
                    {formatCurrency(yearlyProjection, preferredCurrency)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-sans-medium text-white/70">Avg Per Subscription</Text>
                  <Text className="text-base font-sans-bold text-white">
                    {formatCurrency(avgCostPerSub, preferredCurrency)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Metrics Grid */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 rounded-2xl bg-card border border-black/10 p-3.5">
                <Text className="text-xs font-sans-medium text-muted-foreground">Active Subs</Text>
                <Text className="text-xl font-sans-bold text-primary mt-1">
                  {activeSubscriptions.length}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-card border border-black/10 p-3.5">
                <Text className="text-xs font-sans-medium text-muted-foreground">Highest Expense</Text>
                <Text numberOfLines={1} className="text-base font-sans-bold text-primary mt-1">
                  {highestSub ? highestSub.name : "None"}
                </Text>
                <Text numberOfLines={1} className="text-[11px] font-sans-semibold text-accent">
                  {highestSub ? formatCurrency(highestSub.price, preferredCurrency) : "--"}
                </Text>
              </View>
            </View>

            {/* Category Breakdown Section */}
            {categoryBreakdown.length > 0 && (
              <View className="mb-6 rounded-3xl bg-card border border-black/10 p-5">
                <Text className="text-xl font-sans-bold text-primary mb-4">
                  Spending by Category
                </Text>
                <View className="gap-3">
                  {categoryBreakdown.map((item) => (
                    <View key={item.key} className="gap-1.5">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View
                            className="size-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <Text className="text-sm font-sans-semibold text-primary">
                            {item.label}
                          </Text>
                        </View>
                        <Text className="text-sm font-sans-bold text-primary">
                          {formatCurrency(item.amount, preferredCurrency)}{" "}
                          <Text className="text-xs font-sans-medium text-muted-foreground">
                            ({item.percentage}%)
                          </Text>
                        </Text>
                      </View>
                      {/* Progress Bar */}
                      <View className="h-2.5 w-full rounded-full bg-background overflow-hidden border border-black/5">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(item.percentage, 5)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Weekly Schedule Chart */}
            <View className="mb-6">
              <ListHeading title="This Week's Renewals" />
              <View className="mt-3 rounded-3xl bg-muted p-5 pt-10 pb-6 border border-black/5">
                <BarChart
                  data={chartData}
                  barWidth={14}
                  spacing={22}
                  roundedTop
                  roundedBottom
                  hideRules={false}
                  rulesType="dashed"
                  rulesColor="rgba(0,0,0,0.06)"
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{
                    color: "#081126",
                    opacity: 0.6,
                    fontSize: 11,
                    fontFamily: "PlusJakartaSans-Medium",
                  }}
                  noOfSections={4}
                  maxValue={maxChartValue}
                  formatYLabel={(label) => label}
                  dashWidth={0}
                  xAxisLabelTextStyle={{
                    color: "#081126",
                    opacity: 0.7,
                    fontSize: 12,
                    fontFamily: "PlusJakartaSans-Bold",
                  }}
                />
              </View>
            </View>

            <View className="mb-4">
              <ListHeading title="Active Subscriptions" />
            </View>
          </>
        )}
        renderItem={({ item }) => {
          const cardBg = item.color || "#fff8e7";
          const freqText = item.frequency ? item.frequency.toLowerCase() : "monthly";

          return (
            <View
              className="mb-3 flex-row items-center justify-between rounded-2xl p-4 border border-black/10 shadow-sm"
              style={{ backgroundColor: cardBg }}
            >
              <View className="flex-row items-center gap-3 flex-1 pr-2">
                <SubscriptionIcon
                  name={item.name}
                  icon={item.icon}
                  color={item.color}
                  className="size-12 rounded-xl"
                  size={36}
                />
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-base font-sans-bold text-primary">
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} className="mt-0.5 text-xs font-sans-medium text-primary/70 capitalize">
                    {item.category || "General"} • {freqText}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-base font-sans-bold text-primary">
                  {formatCurrency(item.price, preferredCurrency)}
                </Text>
                <Text className="text-[11px] font-sans-semibold text-primary/60">
                  per {freqText === "yearly" ? "year" : freqText === "weekly" ? "week" : "month"}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              No active subscriptions to calculate insights.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Insights;