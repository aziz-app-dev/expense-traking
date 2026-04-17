import { AppHeader } from "@/components/header_component";
import TransactionList from "@/components/transaction_list_component";
import MyTxt from "@/components/txt_components";
import { TransactionType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { orderBy, where } from "@firebase/firestore";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDateFromTransaction = (date: any): Date => {
  if (!date) return new Date();
  if (date.toDate) return date.toDate(); // Firestore Timestamp
  if (date instanceof Date) return date;
  return new Date(date);
};

const Statistics = () => {
  const { user } = useAuth();
  
  const [tabIndex, setTabIndex] = useState(0);

  const { data: transactions, loading } = useFeatchData<TransactionType>(
    "transaction",
    user?.uid ? [where("uid", "==", user.uid), orderBy("date", "desc")] : []
  );

  const processWeeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekData: { [key: number]: { income: number; expense: number } } = {};
    for (let i = 0; i < 7; i++) {
      weekData[i] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const date = getDateFromTransaction(t.date);
      if (date >= startOfWeek) {
        const dayIndex = date.getDay();
        if (t.type === "income") {
          weekData[dayIndex].income += t.amount || 0;
        } else {
          weekData[dayIndex].expense += t.amount || 0;
        }
      }
    });

    const chartData: any[] = [];
    for (let i = 0; i < 7; i++) {
      const income = weekData[i].income;
      const expense = weekData[i].expense;

      chartData.push({
        value: income,
        label: DAYS[i],
        labelWidth: 30,
        spacing: 6,
        frontColor: Colors.primary,
        topLabelComponent: () => (
          <MyTxt  fontSize={10} fontWeight={"bold"}>
            {income > 0 ? income : ""}
          </MyTxt>
        ),
      });
      chartData.push({
        value: expense,
        frontColor: Colors.rose,
        topLabelComponent: () => (
          <MyTxt  fontSize={10} fontWeight={"bold"}>
            {expense > 0 ? expense : ""}
          </MyTxt>
        ),
      });
    }
    return chartData;
  }, [transactions]);

  const processMonthlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const weeksData: { [key: number]: { income: number; expense: number } } = {};
    for (let i = 1; i <= 5; i++) {
      weeksData[i] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const date = getDateFromTransaction(t.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        const weekIndex = Math.min(weekOfMonth, 5);
        if (t.type === "income") {
          weeksData[weekIndex].income += t.amount || 0;
        } else {
          weeksData[weekIndex].expense += t.amount || 0;
        }
      }
    });

    const chartData: any[] = [];
    for (let i = 1; i <= 5; i++) {
      const income = weeksData[i].income;
      const expense = weeksData[i].expense;

      chartData.push({
        value: income,
        label: `W${i}`,
        labelWidth: 30,
        spacing: 6,
        frontColor: Colors.primary,
        topLabelComponent: () => (
          <MyTxt fontSize={10} fontWeight={"bold"}>
            {income > 0 ? income : ""}
          </MyTxt>
        ),
      });
      chartData.push({
        value: expense,
        frontColor: Colors.rose,
        topLabelComponent: () => (
          <MyTxt fontSize={10} fontWeight={"bold"}>
            {expense > 0 ? expense : ""}
          </MyTxt>
        ),
      });
    }
    return chartData;
  }, [transactions]);

  const processYearlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const monthsData: { [key: number]: { income: number; expense: number } } = {};
    for (let i = 0; i < 12; i++) {
      monthsData[i] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const date = getDateFromTransaction(t.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (t.type === "income") {
          monthsData[monthIndex].income += t.amount || 0;
        } else {
          monthsData[monthIndex].expense += t.amount || 0;
        }
      }
    });

    const chartData: any[] = [];
    for (let i = 0; i < 12; i++) {
      const income = monthsData[i].income;
      const expense = monthsData[i].expense;

      chartData.push({
        value: income,
        label: MONTHS[i],
        labelWidth: 25,
        spacing: 4,
        frontColor: Colors.primary,
        topLabelComponent: () => (
          <MyTxt  fontSize={8} fontWeight={"bold"}>
            {income > 0 ? income : ""}
          </MyTxt>
        ),
      });
      chartData.push({
        value: expense,
        frontColor: Colors.rose,
        topLabelComponent: () => (
          <MyTxt fontSize={8} fontWeight={"bold"}>
            {expense > 0 ? expense : ""}
          </MyTxt>
        ),
      });
    }
    return chartData;
  }, [transactions]);

  const chartData = useMemo(() => {
    switch (tabIndex) {
      case 0:
        return processWeeklyData;
      case 1:
        return processMonthlyData;
      case 2:
        return processYearlyData;
      default:
        return processWeeklyData;
    }
  }, [tabIndex, processWeeklyData, processMonthlyData, processYearlyData]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    const now = new Date();

    transactions.forEach((t) => {
      const date = getDateFromTransaction(t.date);
      let include = false;

      if (tabIndex === 0) {
        // Weekly
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        include = date >= startOfWeek;
      } else if (tabIndex === 1) {
        // Monthly
        include = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      } else {
        // Yearly
        include = date.getFullYear() === now.getFullYear();
      }

      if (include) {
        if (t.type === "income") {
          income += t.amount || 0;
        } else {
          expense += t.amount || 0;
        }
      }
    });

    return { income, expense };
  }, [transactions, tabIndex]);

  const getBarWidth = () => {
    return tabIndex === 2 ? 15 : 25;
  };

  const getSpacing = () => {
    return tabIndex === 2 ? 12 : 25;
  };

  return (
    <View style={styles.mainContainer}>
      <AppHeader title={"Statistics"} />
      <ScrollView
        contentContainerStyle={{
          gap: 20,
          paddingTop: 5,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          values={["Weekly", "Monthly", "Yearly"]}
          selectedIndex={tabIndex}
          onChange={(event) => {
            setTabIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          fontStyle={{ ...styles.segmentFontStyle, color: Colors.white }}
          style={{ height: 40 }}
          activeFontStyle={styles.segmentFontStyle}
          tintColor={Colors.neutral200}
          backgroundColor={Colors.neutral800}
          appearance="dark"
        />

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.neutral800 }]}>
            <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <MyTxt fontSize={12} color={Colors.neutral350}>Income</MyTxt>
          </View>
       
            <MyTxt fontSize={18} fontWeight="bold" color={Colors.primary}>
              Rs. {totals.income.toLocaleString()}
            </MyTxt>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.neutral800 }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
            <MyTxt fontSize={12} color={Colors.neutral350}>Expense</MyTxt>
          </View>
            <MyTxt fontSize={18} fontWeight="bold" color={Colors.rose}>
              Rs. {totals.expense.toLocaleString()}
            </MyTxt>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <MyTxt fontSize={14} color={Colors.neutral350} style={{ marginTop: 10 }}>
                Loading data...
              </MyTxt>
            </View>
          ) : chartData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={chartData}
                barWidth={getBarWidth()}
                spacing={getSpacing()}
                barBorderRadius={AppSizes.borderRadius}
                hideRules
                yAxisLabelPrefix="Rs."
                floatingYAxisLabels
                yAxisThickness={0}
                yAxisLabelWidth={60}
                xAxisLabelTextStyle={{ color: Colors.neutral350, fontSize: 10 }}
                yAxisTextStyle={{ color: Colors.neutral350 }}
                noOfSections={4}
                minHeight={5}
              />
            </ScrollView>
          ) : (
            <View style={styles.noChart}>
              <MyTxt fontSize={14} color={Colors.neutral350}>
                No transactions found
              </MyTxt>
            </View>
          )}
        </View>

        <TransactionList
          data={transactions}
          loading={loading}
          emptyListMsg="No Transaction added yet!"
          title="Recent Transactions"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: AppSizes.bodyPadding,
    gap: 10,
  },
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignContent: "center",
    minHeight: 240,
    marginTop:10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: AppSizes.borderRadius,
    gap: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  segmentFontStyle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.black,
  },
  noChart: {
    backgroundColor: "rgba(0,0,0,0.6)",
    height: 210,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: AppSizes.borderRadius,
  },
});

export default Statistics;
