import { expenseCategories, incomeCategories } from "@/constants/data";
import { TransactionItemPropes, TransactionListType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Currency from "./currency_components";
import Loading from "./loader_component";
import MyTxt from "./txt_components";

const TransactionList = ({
  data,
  loading,
  title,
  emptyListMsg,
  onViewAll,
  titleSize = 20,
  fill = false,
}: TransactionListType) => {
  const handelClick = () => {};
  return (
    <View style={[styles.continer, fill && styles.fill]}>
      <View style={styles.titleRow}>
        <MyTxt fontWeight={"600"} fontSize={titleSize} color={Colors.white}>
          {title}
        </MyTxt>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} hitSlop={10}>
            <MyTxt fontWeight={"600"} fontSize={14} color={Colors.primary}>
              View all
            </MyTxt>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.list, fill && styles.fill]}>
        <FlashList
          data={data}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={fill ? { paddingBottom: 90 } : undefined}
          renderItem={({ item, index }) => (
            <TransactionItme
              item={item}
              index={index}
              handleClick={handelClick}
            />
          )}
        />
      </View>
      {!loading && data?.length === 0 && (
        <MyTxt color={Colors.neutral400} align="center">
          {emptyListMsg}
        </MyTxt>
      )}
      {loading && <Loading />}
    </View>
  );
};

const TransactionItme = ({
  item,
  index,
  handleClick,
}: TransactionItemPropes) => {
  const categories =
    item.type === "income" ? incomeCategories : expenseCategories;
  const cat = categories[item.cat ?? "others"] ?? categories.others;
  const catIcon = cat.icon;
  const formatDate = (date?: any) => {
    if (!date) return "";

    let dateObj: Date;

    // Firebase timestamp has `seconds` and `nanoseconds` fields
    if (date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else if (typeof date === "string") {
      dateObj = new Date(date); // fallback if it's a string
    } else if (date instanceof Date) {
      dateObj = date; // already a Date
    } else {
      return "";
    }

    // Format as "5 Jan"
    return dateObj.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(40)}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          router.push({
            pathname: "/(modals)/transaction_modal",
            params: {
              id: item.id,
              type: item.type,
              amount: item.amount,
              cat: item.cat,
              date: (item.date as any)?.seconds ? (item.date as any).seconds * 1000 : "",
              des: item.des,
              uid: item.uid,
              image: item.image,
              walletId: item.walletId,
            },
          });
        }}
      >
        <View style={[styles.icon, { backgroundColor: cat.bgColor }]}>
          {catIcon && (
            <Ionicons
              name={catIcon}
              size={AppSizes.tabIcon}
              color={Colors.white}
            />
          )}
        </View>
        <View style={styles.catDes}>
          <MyTxt fontSize={16} fontWeight={"500"}>
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
    </Animated.View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  continer: {
    gap: 17,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fill: {
    flex: 1,
  },
  list: {
    minHeight: 3,
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
