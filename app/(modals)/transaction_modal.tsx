import BackBtn from "@/components/back_btn_component";
import MyBtn from "@/components/btn_component";
import MyInput from "@/components/input_field_component";
import Loading from "@/components/loader_component";
import MyTxt from "@/components/txt_components";
import { expenseCategories, incomeCategories, transtionType } from "@/constants/data";
import { TransactionType, WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { createAndUpdateTransactions, deleteTransaction } from "@/services/transactions_services";
import { Ionicons } from "@expo/vector-icons";
import { orderBy, where } from "@firebase/firestore";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { showAlert } from "@/components/custom_alert";

const TransactionModal = () => {
  type ParamsType = {
    id: string;
    type: "income" | "expense";
    amount: string; // ← must be string
    cat: string;
    date: string; // ← must be string
    des: string;
    uid: string;
    image: string;
    walletId: string;
  };

  const oldTransaction: ParamsType = useLocalSearchParams();

  const { user } = useAuth();
  const [transactionData, setTransactionData] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    des: "",
    cat: "",
    date: new Date(),
    image: null,
    walletId: "",
  });
  const [loadin, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("create", "desc")]
    : [];

  const {
    data: wallets,
    loading: WalletLoading,
    error: WalletError,
  } = useFeatchData<WalletType>("wallets", constraints);

  const isOldTransaction = oldTransaction?.id;

  useEffect(() => {
    if (oldTransaction?.id) {
      setTransactionData({
        type: oldTransaction?.type,
        date: oldTransaction.date ? new Date(Number(oldTransaction.date)) : new Date(),
        amount: Number(oldTransaction.amount??""),
        cat: oldTransaction.cat??"",
        id: oldTransaction?.id??"",
        uid: oldTransaction.uid??"",
        walletId: oldTransaction?.walletId??"",
        des: oldTransaction?.des??"",
        image: oldTransaction?.image,
      });
    }
  }, [
    oldTransaction.amount,
    oldTransaction.cat,
    oldTransaction.date,
    oldTransaction?.des,
    oldTransaction.id,
    oldTransaction?.image,
    oldTransaction.type,
    oldTransaction.uid,
    oldTransaction.walletId,
  ]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setTransactionData((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const onSubmit = async () => {
    const { type, amount, walletId, des, date, cat, image } = transactionData;

    if (
      (type === "expense" && !cat) ||
      // !image ||
      !amount ||
      !date ||
      !walletId
    ) {
      showAlert("Transactions", "Please fill all the fields");
      return;
    }
    console.log("Next");
    let transaction: TransactionType = {
      type,
      amount,
      walletId,
      des,
      date,
      cat,
      image,
      uid: user?.uid,
      ...(oldTransaction?.id && { id: oldTransaction.id }),
    };
    console.log("transactionData: ", transaction);

    setLoading(true);
    const res = await createAndUpdateTransactions(transaction);
    setLoading(false);
    console.log(res);

    if (res.success) {
      router.back();
    } else {
      showAlert("Transactions", res.msg);
    }
  };

  const onDelete = async () => {
    setDelLoading(true);
    if (!oldTransaction?.id) return;
    const res = await deleteTransaction(oldTransaction?.id);
    setDelLoading(false);
    if (res.success) {
      router.back();
    } else {
      setDelLoading(false);
      showAlert("Wallet", res.msg);
    }
  };
  const showDeleteAlert = () => {
    showAlert("Confirm", "Are you sure you want to delete this transaction?", [
      {
        text: "cancle",
        onPress: () => {
          console.log("Cancel");
        },
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(),
        style: "destructive",
      },
    ]);
  };

  const setDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setTransactionData((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    }
    setShowDatePicker(false);
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View
        style={[
          styles.modalContainer,
          Platform.OS === "web" && { overflow: "visible" },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackBtn onPress={() => router.back()} />
          <MyTxt fontSize={20} fontWeight="600">
            {oldTransaction?.id ? "Update Transaction" : "New Transaction"}
          </MyTxt>
          <View />
        </View>

        <ScrollView
          style={[
            styles.from,
            Platform.OS === "web" && { overflow: "visible" },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Type Input */}
          <View style={[styles.inPutContainer, { zIndex: 4 }]}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Type
            </MyTxt>
            {/* <Dropdown
              style={styles.dropDownContiner}
              itemTextStyle={{ color: Colors.white }}
              placeholderStyle={styles.dropDownSlectedColor}
              selectedTextStyle={styles.dropDownSlectedColor}
              iconStyle={styles.dropDownIcon}
              data={transtionType}
              dropdownPosition="bottom"
              // renderInModal={false}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transactionData.type}
              itemContainerStyle={styles.dropDownItemContienr}
              containerStyle={styles.dropDownListContiner}
              activeColor={Colors.neutral700}
              onChange={(item) => {
                setTransactionData({
                  ...transactionData,
                  type: item.value, // default to expense
                  walletId: "", // reset wallet if type changes
                });
              }}
            /> */}
            <Dropdown
              style={styles.dropDownContiner}
              data={transtionType}
              labelField="label"
              valueField="value"
              value={transactionData.type}
              dropdownPosition="bottom"
              mode="default"
              itemTextStyle={{ color: Colors.white }}
              selectedTextStyle={styles.dropDownSlectedColor}
              placeholderStyle={styles.dropDownSlectedColor}
              iconStyle={styles.dropDownIcon}
              itemContainerStyle={styles.dropDownItemContienr}
              containerStyle={styles.dropDownListContiner}
              activeColor={Colors.neutral700}
              onChange={(item) => {
                setTransactionData((prev) => ({
                  ...prev,
                  type: item.value,
                  walletId: "",
                  cat: "",
                }));
              }}
            />
          </View>

          {/* ! wallets drop down */}
          <View style={[styles.inPutContainer, { zIndex: 3 }]}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Wallet
            </MyTxt>
            <Dropdown
              style={styles.dropDownContiner}
              itemTextStyle={{ color: Colors.white }}
              placeholderStyle={styles.dropDownSlectedColor}
              selectedTextStyle={styles.dropDownSlectedColor}
              iconStyle={styles.dropDownIcon}
              itemContainerStyle={styles.dropDownItemContienr}
              containerStyle={styles.dropDownListContiner}
              data={wallets.map((wallet) => ({
                label: `${wallet.name} (Rs.${wallet.amount})`,
                value: wallet.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transactionData.walletId}
              activeColor={Colors.neutral700}
              mode="default"
              onChange={(item) => {
                setTransactionData({
                  ...transactionData,
                  walletId: item.value ?? "",
                });
              }}
            />
          </View>

          {/* ! Categoies drop down */}
          <View style={[styles.inPutContainer, { zIndex: 2 }]}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              {transactionData.type === "income" ? "Income Categories" : "Expense Categories"}
            </MyTxt>
            <Dropdown
              style={styles.dropDownContiner}
              itemTextStyle={{ color: Colors.white }}
              placeholderStyle={styles.dropDownSlectedColor}
              selectedTextStyle={styles.dropDownSlectedColor}
              iconStyle={styles.dropDownIcon}
              itemContainerStyle={styles.dropDownItemContienr}
              containerStyle={styles.dropDownListContiner}
              data={Object.values(transactionData.type === "income" ? incomeCategories : expenseCategories)}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transactionData.cat}
              activeColor={Colors.neutral700}
              mode="default"
              onChange={(item) => {
                setTransactionData({
                  ...transactionData,
                  cat: item.value ?? "",
                });
              }}
            />
          </View>

          {/* ! Date Picker */}
          <View style={styles.inPutContainer}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Date
            </MyTxt>
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <MyTxt color={Colors.neutral300} fontSize={14}>
                {(transactionData.date as Date).toLocaleDateString()}
              </MyTxt>
            </Pressable>

            {showDatePicker && (
              <View style={Platform.OS === "ios" && styles.iosDatePicker}>
                <DateTimePicker
                  style={{}}
                  value={transactionData.date as Date}
                  mode="date"
                  display="calendar"
                  // themeVariant="dark"
                  onChange={setDate}
                />
              </View>
            )}
          </View>

          {/* ! Amount  */}
          <View style={styles.inPutContainer}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Amount
            </MyTxt>
            <MyInput
              textColor={Colors.neutral300}
              marginVertical={0}
              keyboardType="numeric"
              value={`${transactionData.amount?.toString()}`}
              onChangeText={(value) => {
                setTransactionData({
                  ...transactionData,
                  amount: Number(value.replace(/[^0-9]/g, "")),
                });
              }}
            />
          </View>

          {/* ! DES  */}
          <View style={styles.inPutContainer}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Description
            </MyTxt>
            <MyInput
              textColor={Colors.neutral300}
              marginVertical={0}
              placeholder="Enter description"
              multiline={true}
              style={{
                flexDirection: "row",
                // height:100,
                alignItems: "flex-start",
                alignSelf: "flex-start",
                justifyContent: "flex-start",
                maxHeight: 100,
                minHeight: 45,

                paddingVertical: 1,
                color: Colors.white,
              }}
              value={transactionData.des ?? ""}
              onChangeText={(value) =>
                setTransactionData((prev) => ({
                  ...prev,
                  des: value, // hard enforce max 5 chars
                }))
              }
              numberOfLines={5}
            />
          </View>

          {/* Image Upload Container */}
          <View style={{ marginTop: 20 }}>
            <MyTxt
              color={Colors.neutral300}
              fontSize={15}
              fontWeight="700"
              style={{ marginBottom: 10 }}
            >
              Transaction Icon
            </MyTxt>

            {transactionData.image ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: transactionData.image }}
                  style={styles.walletImage}
                />
                {/* Close Icon */}
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() =>
                    setTransactionData((prev) => ({ ...prev, image: null }))
                  }
                >
                  <Ionicons name="close" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={pickImage}
              >
                <View style={styles.conainerTxt}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={AppSizes.tabIcon}
                    color={Colors.neutral400}
                  />
                  <MyTxt
                    color={Colors.neutral400}
                    fontSize={14}
                    style={{ marginTop: 6 }}
                  >
                    Upload Icon
                  </MyTxt>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <View
          style={[
            styles.footter,
            { marginHorizontal: isOldTransaction ? 25 : 0 },
          ]}
        >
          {oldTransaction?.id && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={showDeleteAlert}
            >
              {delLoading && <Loading />}
              <Ionicons
                name="trash"
                size={AppSizes.inputIcon}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}

          <MyBtn
            onPress={onSubmit}
            title={oldTransaction?.id ? "Update Transtion" : "Add Transaction"}
            loading={loadin}
            fontSize={18}
          />
        </View>
      </View>
    </View>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // justifyContent: "flex-ce",
  },

  modalContainer: {
    flex: 1, // let ScrollView take all available space
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: AppSizes.borderRadius,
    borderTopRightRadius: AppSizes.borderRadius,
    paddingBottom: 20,
  },

  from: {
    flexGrow: 1, // make ScrollView content flexible
    paddingHorizontal: AppSizes.bodyPadding,
    paddingBottom: 40,
    gap: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  // modalContainer: {
  //   backgroundColor: Colors.neutral900,
  //   borderTopLeftRadius: AppSizes.borderRadius,
  //   borderTopRightRadius: AppSizes.borderRadius,
  //   minHeight: "100%",
  // },
  header: {
    paddingTop: AppSizes.bodyPadding,
    paddingHorizontal: AppSizes.bodyPadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // from: {
  //   gap: 20,
  //   paddingHorizontal: AppSizes.bodyPadding,
  //   paddingBottom: 40,
  // },
  uploadContainer: {
    height: 70,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.neutral500,
    backgroundColor: Colors.neutral800,
    borderRadius: AppSizes.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    gap: 5,
  },
  conainerTxt: {
    gap: 10,
    flexDirection: "row",
  },
  imageWrapper: {
    position: "relative",
    alignSelf: "flex-start",
  },
  walletImage: {
    width: 140,
    height: 140,
    borderRadius: AppSizes.borderRadius,
  },
  closeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.rose,
    borderRadius: 20,
    padding: 4,
    elevation: 10, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  footter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: AppSizes.bodyPadding,
    gap: 12,
    paddingTop: 15,
    marginBottom: 5,
  },
  inPutContainer: {
    marginTop: 25,
    gap: 10,
    position: "relative",
    zIndex: 1,
  },
  iosDropDown: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    color: Colors.white,
    borderRadius: 17,
    borderCurve: "continuous",
    padding: 15,
  },
  dropDownSlectedColor: {
    color: Colors.neutral300,
    fontSize: 14,
  },
  androidDropDown: {
    // flexDirection:"row",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    color: Colors.white,
    borderRadius: 17,
    borderCurve: "continuous",
    // padding:15,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateInput: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.neutral500,
    borderRadius: AppSizes.borderRadius,
    borderCurve: "continuous",
    paddingHorizontal: 15,
  },
  iosDatePicker: {},

  datePickerBtn: {
    backgroundColor: Colors.neutral700,
    alignSelf: "flex-end",
    padding: 7,
    marginRight: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  dropDownContiner: {
    height: 48,
    borderColor: Colors.neutral500,
    borderWidth: 1.5,
    paddingHorizontal: 15,
    borderRadius: AppSizes.borderRadius,
    zIndex: 1000,
  },

  dropDownItemTxt: {
    color: Colors.white,
  },
  dropDownListContiner: {
    backgroundColor: Colors.neutral900,
    borderRadius: AppSizes.borderRadius,
    borderCurve: "continuous",
    paddingVertical: 7,
    top: 5,
    borderColor: Colors.neutral500,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  fropDownPlaceholder: {
    color: Colors.white,
  },
  dropDownItemContienr: {
    borderRadius: AppSizes.borderRadius,
    marginHorizontal: 7,
  },
  dropDownIcon: {
    height: 25,
    tintColor: Colors.neutral300,
  },
  iconContainer: {
    width: 52,
    height: 52,
    backgroundColor: Colors.rose,
    borderRadius: AppSizes.borderRadius, // ✅ remove rounding
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
});
