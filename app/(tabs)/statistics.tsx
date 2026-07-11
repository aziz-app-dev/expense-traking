import { AppHeader } from "@/components/header_component";
import TransactionList from "@/components/transaction_list_component";
import MyTxt from "@/components/txt_components";
import { TransactionType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import IncomeIdeas from "@/components/income_ideas";
import {
  ForecastBucket,
  generateForecast,
  generateReport,
  ReportPeriod,
} from "@/services/ai_services";
import { orderBy, where } from "@firebase/firestore";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const PERIOD_LABELS: ReportPeriod[] = ["Weekly", "Monthly", "Yearly"];
const PERIOD_PARAMS = ["week", "month", "year"] as const;

// Render the AI text with each "Heading:" label bolded.
const renderReportBody = (text: string) =>
  text.split("\n").map((raw, i) => {
    // Strip any stray markdown the model may add.
    const line = raw.replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
    if (!line) return <View key={i} style={{ height: 6 }} />;

    const idx = line.indexOf(":");
    const heading = idx > 0 ? line.slice(0, idx) : "";
    const isHeading = idx > 0 && idx <= 22 && /^[A-Za-z][A-Za-z ]*$/.test(heading);

    return (
      <MyTxt
        key={i}
        fontSize={15}
        color={Colors.textLighter}
        style={{ lineHeight: 23, marginBottom: 8 }}
      >
        {isHeading ? (
          <>
            <MyTxt fontSize={15} fontWeight="700" color={Colors.white}>
              {heading}:
            </MyTxt>
            {" " + line.slice(idx + 1).trim()}
          </>
        ) : (
          line
        )}
      </MyTxt>
    );
  });

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDateFromTransaction = (date: any): Date => {
  if (!date) return new Date();
  if (date.toDate) return date.toDate(); // Firestore Timestamp
  if (date instanceof Date) return date;
  return new Date(date);
};

// Fingerprint of the data an AI call depends on. If it's unchanged, we reuse
// the cached result instead of calling the API again.
const signatureOf = (txns: TransactionType[]) =>
  `${txns.length}#` +
  txns
    .map((t) => {
      const d: any = t.date;
      const stamp = d?.seconds ?? d ?? "";
      return `${t.id}|${t.amount}|${t.type}|${stamp}`;
    })
    .join(",");

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

  // Transactions that fall inside the currently selected period (already
  // ordered newest-first by the Firestore query).
  const periodTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const date = getDateFromTransaction(t.date);
      if (tabIndex === 0) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return date >= startOfWeek;
      } else if (tabIndex === 1) {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }
      return date.getFullYear() === now.getFullYear();
    });
  }, [transactions, tabIndex]);

  const latestPeriodTransactions = useMemo(
    () => periodTransactions.slice(0, 7),
    [periodTransactions]
  );

  // AI report / forecast state
  const [reportVisible, setReportVisible] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportKind, setReportKind] = useState<"report" | "forecast">("report");
  const [forecastHistory, setForecastHistory] = useState<ForecastBucket[]>([]);
  const [forecastPrediction, setForecastPrediction] = useState<{
    income: number;
    expense: number;
    net: number;
  } | null>(null);

  // Cache of previous AI results keyed by kind + period + data signature, so an
  // unchanged dataset reuses the last result instead of calling the API again.
  const aiCache = useRef<
    Map<
      string,
      {
        report: string;
        history: ForecastBucket[];
        prediction: { income: number; expense: number; net: number } | null;
      }
    >
  >(new Map());

  const applyResult = (r: {
    report: string;
    history: ForecastBucket[];
    prediction: { income: number; expense: number; net: number } | null;
  }) => {
    setReportText(r.report);
    setForecastHistory(r.history);
    setForecastPrediction(r.prediction);
    setReportError("");
  };

  const runAi = async (kind: "report" | "forecast") => {
    // Forecast uses the full history; the report focuses on the selected period.
    const sourceTxns = kind === "forecast" ? transactions : periodTransactions;
    const cacheKey = `${kind}:${PERIOD_LABELS[tabIndex]}:${signatureOf(sourceTxns)}`;

    console.log(
      `[AI] runAi → kind: ${kind}, period: ${PERIOD_LABELS[tabIndex]}, ` +
        `periodTxns: ${periodTransactions.length}, allTxns: ${transactions.length}`
    );

    setReportKind(kind);
    setReportVisible(true);

    // Cache hit → reuse previous result, no API call.
    const cached = aiCache.current.get(cacheKey);
    if (cached) {
      console.log("[AI] cache hit — reusing previous result (no API call)");
      setReportLoading(false);
      applyResult(cached);
      return;
    }

    setReportLoading(true);
    setReportText("");
    setReportError("");
    setForecastHistory([]);
    setForecastPrediction(null);

    const res =
      kind === "forecast"
        ? await generateForecast(PERIOD_LABELS[tabIndex], transactions)
        : await generateReport(PERIOD_LABELS[tabIndex], periodTransactions);

    if (res.success && res.report) {
      const result = {
        report: res.report,
        history: (res as any).history ?? [],
        prediction: (res as any).prediction ?? null,
      };
      aiCache.current.set(cacheKey, result);
      applyResult(result);
    } else {
      setReportError(res.msg || "Could not generate the result.");
    }
    setReportLoading(false);
  };

  // Bar-chart data for the forecast: recent buckets + the predicted "Next" one.
  const forecastChartData = useMemo(() => {
    if (!forecastHistory.length) return [];
    const buckets: (ForecastBucket & { predicted?: boolean })[] =
      forecastHistory.slice(-4).map((b) => ({ ...b }));
    if (forecastPrediction) {
      buckets.push({
        label: "Next",
        income: forecastPrediction.income,
        expense: forecastPrediction.expense,
        predicted: true,
      });
    }
    const data: any[] = [];
    buckets.forEach((b) => {
      data.push({
        value: b.income,
        label: b.label,
        labelWidth: 44,
        spacing: 4,
        frontColor: b.predicted ? Colors.primaryLight : Colors.primary,
      });
      data.push({
        value: b.expense,
        frontColor: b.predicted ? Colors.roseOverlay : Colors.rose,
      });
    });
    return data;
  }, [forecastHistory, forecastPrediction]);

  // Total recorded income — passed to the AI as loose context for suggestions.
  const totalIncome = useMemo(
    () =>
      transactions.reduce(
        (sum, t) => (t.type === "income" ? sum + (Number(t.amount) || 0) : sum),
        0
      ),
    [transactions]
  );

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

        {loading ? (
          // Single loader for the whole statistics screen while data loads.
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <MyTxt fontSize={14} color={Colors.neutral350} style={{ marginTop: 10 }}>
              Loading data...
            </MyTxt>
          </View>
        ) : (
          <>
        <View style={styles.chartContainer}>
          {chartData.length > 0 ? (
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

        {/* AI report + forecast */}
        <View style={styles.aiRow}>
          <TouchableOpacity
            style={[styles.aiButton, { flex: 1 }]}
            activeOpacity={0.85}
            onPress={() => runAi("report")}
          >
            <Ionicons name="sparkles" size={16} color={Colors.black} />
            <MyTxt fontSize={13} fontWeight="700" color={Colors.black}>
              AI Report
            </MyTxt>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiButtonAlt, { flex: 1 }]}
            activeOpacity={0.85}
            onPress={() => runAi("forecast")}
          >
            <Ionicons name="trending-up" size={16} color={Colors.primary} />
            <MyTxt fontSize={13} fontWeight="700" color={Colors.primary}>
              AI Forecast
            </MyTxt>
          </TouchableOpacity>
        </View>

        <IncomeIdeas totalIncome={totalIncome} />

        <TransactionList
          data={latestPeriodTransactions}
          loading={false}
          emptyListMsg={`No ${PERIOD_LABELS[tabIndex].toLowerCase()} transactions yet!`}
          title={`${PERIOD_LABELS[tabIndex]} Transactions`}
          onViewAll={
            periodTransactions.length > 0
              ? () =>
                  router.push(
                    `/all_transactions?period=${PERIOD_PARAMS[tabIndex]}`
                  )
              : undefined
          }
        />
          </>
        )}
      </ScrollView>

      {/* AI Report Modal */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportVisible(false)}
      >
        <Pressable
          style={styles.reportBackdrop}
          onPress={() => setReportVisible(false)}
        />
        <View style={styles.reportSheet}>
          <View style={styles.reportHeader}>
            <View style={styles.reportTitle}>
              <Ionicons
                name={reportKind === "forecast" ? "trending-up" : "sparkles"}
                size={20}
                color={Colors.primary}
              />
              <MyTxt fontSize={18} fontWeight="700">
                {PERIOD_LABELS[tabIndex]}{" "}
                {reportKind === "forecast" ? "Forecast" : "Report"}
              </MyTxt>
            </View>
            <TouchableOpacity
              onPress={() => setReportVisible(false)}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {reportLoading ? (
            <View style={styles.reportLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <MyTxt fontSize={14} color={Colors.neutral350} style={{ marginTop: 10 }}>
                Analyzing your spending...
              </MyTxt>
            </View>
          ) : reportError ? (
            <View style={styles.reportLoading}>
              <Ionicons name="alert-circle-outline" size={40} color={Colors.rose} />
              <MyTxt fontSize={14} color={Colors.neutral350} align="center" style={{ marginTop: 10 }}>
                {reportError}
              </MyTxt>
              <TouchableOpacity
                style={[styles.aiButton, { marginTop: 16, paddingHorizontal: 24 }]}
                onPress={() => runAi(reportKind)}
              >
                <MyTxt fontSize={14} fontWeight="700" color={Colors.black}>
                  Try Again
                </MyTxt>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {reportKind === "forecast" && forecastChartData.length > 0 && (
                <View style={styles.forecastChartBox}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={forecastChartData}
                      barWidth={14}
                      spacing={22}
                      barBorderRadius={4}
                      hideRules
                      yAxisThickness={0}
                      xAxisThickness={0}
                      yAxisLabelWidth={0}
                      hideYAxisText
                      xAxisLabelTextStyle={{ color: Colors.neutral350, fontSize: 10 }}
                      noOfSections={3}
                      minHeight={3}
                      isAnimated
                    />
                  </ScrollView>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                      <MyTxt fontSize={11} color={Colors.neutral350}>Income</MyTxt>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
                      <MyTxt fontSize={11} color={Colors.neutral350}>Expense</MyTxt>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.primaryLight }]} />
                      <MyTxt fontSize={11} color={Colors.neutral350}>Forecast (Next)</MyTxt>
                    </View>
                  </View>
                </View>
              )}
              {renderReportBody(reportText)}
            </ScrollView>
          )}
        </View>
      </Modal>
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
  aiRow: {
    flexDirection: "row",
    gap: 10,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
  },
  aiButtonAlt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.neutral800,
  },
  reportBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  reportSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "75%",
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: AppSizes.bodyPadding,
    gap: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportLoading: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  forecastChartBox: {
    backgroundColor: Colors.neutral800,
    borderRadius: AppSizes.borderRadius,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
});

export default Statistics;
