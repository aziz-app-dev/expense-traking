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
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const SearchModal = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("date", "desc")]
    : [];

  const { data: transactions, loading } = useFeatchData<TransactionType>(
    "transaction",
    constraints
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    return (
      transactions?.filter((transaction) => {
        // Search by description
        if (transaction.des?.toLowerCase().includes(query)) return true;

        // Search by category label
        const categories =
          transaction.type === "income" ? incomeCategories : expenseCategories;
        const cat =
          categories[transaction.cat ?? "others"] ?? categories.others;
        if (cat.label.toLowerCase().includes(query)) return true;

        // Search by amount
        if (transaction.amount?.toString().includes(query)) return true;

        // Search by type
        if (transaction.type?.toLowerCase().includes(query)) return true;

        return false;
      }) ?? []
    );
  }, [searchQuery, transactions]);

  const formatDate = (date?: any) => {
    if (!date) return "";
    let dateObj: Date;
    if (date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return "";
    }
    return dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
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
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <BackBtn onPress={() => router.back()} />
          <MyTxt fontSize={20} fontWeight="600">
            Search Transactions
          </MyTxt>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <MyInput
            placeholder="Search by description, category, amount..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
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

        {/* Results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim() === "" ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={60}
                color={Colors.neutral600}
              />
              <MyTxt color={Colors.neutral400} align="center">
                Start typing to search transactions
              </MyTxt>
            </View>
          ) : loading ? (
            <Loading />
          ) : filteredTransactions.length === 0 ? (
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
              <MyTxt fontWeight="600" fontSize={16} style={{ marginBottom: 15 }}>
                Results ({filteredTransactions.length})
              </MyTxt>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredTransactions.map((item, index) => {
                  const categories =
                    item.type === "income"
                      ? incomeCategories
                      : expenseCategories;
                  const cat =
                    categories[item.cat ?? "others"] ?? categories.others;

                  return (
                    <TouchableOpacity
                      key={item.id || index}
                      style={styles.row}
                      onPress={() => handleItemPress(item)}
                    >
                      <View
                        style={[styles.icon, { backgroundColor: cat.bgColor }]}
                      >
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
                <View style={{ height: 100 }} />
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: AppSizes.borderRadius,
    borderTopRightRadius: AppSizes.borderRadius,
  },
  header: {
    padding: AppSizes.bodyPadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: AppSizes.bodyPadding,
  },
  resultsContainer: {
    flex: 1,
    padding: AppSizes.bodyPadding,
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
    marginBottom: 15,
    backgroundColor: Colors.neutral800,
    padding: 8,
    paddingHorizontal: 8,
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
