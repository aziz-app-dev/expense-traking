import BackBtn from "@/components/back_btn_component";
import Currency from "@/components/currency_components";
import MyInput from "@/components/input_field_component";
import Loading from "@/components/loader_component";
import MyTxt from "@/components/txt_components";
import { expenseCategories, incomeCategories } from "@/constants/data";
import { TransactionType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { Ionicons } from "@expo/vector-icons";
import { orderBy, where } from "@firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TypeFilter = "all" | "income" | "expense";
type PeriodFilter = "all" | "week" | "month" | "year";

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

const PERIOD_FILTERS: { label: string; value: PeriodFilter }[] = [
  { label: "All Time", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const getDateFromTransaction = (date: any): Date => {
  if (!date) return new Date(0);
  if (date.seconds) return new Date(date.seconds * 1000);
  if (date.toDate) return date.toDate();
  if (date instanceof Date) return date;
  return new Date(date);
};

const inPeriod = (date: Date, period: PeriodFilter): boolean => {
  if (period === "all") return true;
  const now = new Date();
  if (period === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (period === "month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  // year
  return date.getFullYear() === now.getFullYear();
};

const AllTransactions = () => {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    period?: string;
    type?: string;
    title?: string;
    focus?: string;
  }>();
  const screenTitle = params.title || "All Transactions";
  const autoFocusSearch = params.focus === "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    (params.type as TypeFilter) || "all"
  );
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(
    (params.period as PeriodFilter) || "all"
  );
  // Filters live in a popup modal opened from the filter icon.
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const hasActiveFilters = typeFilter !== "all" || periodFilter !== "all";

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("date", "desc")]
    : [];

  const { data: transactions, loading } = useFeatchData<TransactionType>(
    "transaction",
    constraints
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (
      transactions?.filter((t) => {
        // Type filter
        if (typeFilter !== "all" && t.type !== typeFilter) return false;

        // Period filter
        if (!inPeriod(getDateFromTransaction(t.date), periodFilter)) return false;

        // Search filter
        if (q) {
          const categories =
            t.type === "income" ? incomeCategories : expenseCategories;
          const cat = categories[t.cat ?? "others"] ?? categories.others;
          const matches =
            t.des?.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q) ||
            t.amount?.toString().includes(q) ||
            t.type?.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      }) ?? []
    );
  }, [transactions, searchQuery, typeFilter, periodFilter]);

  const formatDate = (date?: any) => {
    const d = getDateFromTransaction(date);
    if (d.getTime() === 0) return "";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const handleItemPress = (item: TransactionType) => {
    router.push({
      pathname: "/(modals)/transaction_modal",
      params: {
        id: item.id,
        type: item.type,
        amount: item.amount,
        cat: item.cat,
        date: (item.date as any)?.seconds
          ? (item.date as any).seconds * 1000
          : "",
        des: item.des,
        uid: item.uid,
        image: item.image,
        walletId: item.walletId,
      },
    });
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <BackBtn onPress={() => router.back()} />
        <MyTxt
          fontSize={20}
          fontWeight="600"
          align="center"
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {screenTitle}
        </MyTxt>
        <View style={{ width: 40 }} />
      </View>

      {/* Search + filter button (opens the filter modal) */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <MyInput
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            marginVertical={0}
            autoFocus={autoFocusSearch}
            leftIcon={
              <Ionicons name="search" size={20} color={Colors.neutral400} />
            }
            rightIcon={
              searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.neutral400}
                  />
                </Pressable>
              ) : undefined
            }
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterIconBtn,
            hasActiveFilters && styles.filterIconBtnActive,
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={hasActiveFilters ? Colors.black : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Filter modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setFilterModalVisible(false)}
        />
        <View style={styles.filterSheet}>
          <View style={styles.filterSheetHeader}>
            <MyTxt fontSize={18} fontWeight="700">
              Filters
            </MyTxt>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <MyTxt fontSize={13} color={Colors.neutral400}>
            Type
          </MyTxt>
          <View style={styles.optionRow}>
            {TYPE_FILTERS.map((f) => {
              const active = typeFilter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setTypeFilter(f.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <MyTxt
                    fontSize={13}
                    fontWeight="600"
                    numberOfLines={1}
                    color={active ? Colors.black : Colors.neutral300}
                  >
                    {f.label}
                  </MyTxt>
                </TouchableOpacity>
              );
            })}
          </View>

          <MyTxt fontSize={13} color={Colors.neutral400} style={{ marginTop: 6 }}>
            Time Period
          </MyTxt>
          <View style={styles.optionRow}>
            {PERIOD_FILTERS.map((f) => {
              const active = periodFilter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setPeriodFilter(f.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <MyTxt
                    fontSize={13}
                    fontWeight="600"
                    numberOfLines={1}
                    color={active ? Colors.black : Colors.neutral300}
                  >
                    {f.label}
                  </MyTxt>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setTypeFilter("all");
                setPeriodFilter("all");
              }}
            >
              <MyTxt fontSize={14} fontWeight="600" color={Colors.white}>
                Clear
              </MyTxt>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <MyTxt fontSize={14} fontWeight="700" color={Colors.black}>
                Apply
              </MyTxt>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color={Colors.neutral600}
            />
            <MyTxt color={Colors.neutral400} align="center">
              No transactions found
            </MyTxt>
          </View>
        ) : (
          <>
            <MyTxt fontWeight="600" fontSize={15} style={{ marginBottom: 12 }}>
              {filtered.length} transaction{filtered.length > 1 ? "s" : ""}
            </MyTxt>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map((item, index) => {
                const categories =
                  item.type === "income" ? incomeCategories : expenseCategories;
                const cat = categories[item.cat ?? "others"] ?? categories.others;
                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={styles.row}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={[styles.icon, { backgroundColor: cat.bgColor }]}>
                      {cat.icon && (
                        <Ionicons
                          name={cat.icon}
                          size={AppSizes.tabIcon}
                          color={Colors.white}
                        />
                      )}
                    </View>
                    <View style={styles.catDes}>
                      <MyTxt fontSize={16} fontWeight="500">
                        {cat.label}
                      </MyTxt>
                      <MyTxt fontSize={13} color={Colors.neutral400}>
                        {item.des}
                      </MyTxt>
                    </View>
                    <View style={styles.amountDate}>
                      <Currency
                        type={item.type === "income" ? "income" : "expense"}
                        size={15}
                        amount={Number(item.amount)}
                      />
                      <MyTxt fontSize={12}>{formatDate(item.date)}</MyTxt>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

export default AllTransactions;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: AppSizes.bodyPadding,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.neutral500,
    backgroundColor: Colors.neutral800,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIconBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  filterSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: AppSizes.bodyPadding,
    paddingBottom: 30,
    gap: 10,
  },
  filterSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.neutral800,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
    borderWidth: 1.5,
    borderColor: Colors.neutral600,
    alignItems: "center",
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    backgroundColor: Colors.neutral800,
    padding: 8,
    borderRadius: AppSizes.borderRadius,
  },
  icon: {
    height: 44,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: AppSizes.borderRadius,
    borderCurve: "continuous",
  },
  catDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
});
