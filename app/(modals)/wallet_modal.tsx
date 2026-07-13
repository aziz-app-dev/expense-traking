import BackBtn from "@/components/back_btn_component";
import MyBtn from "@/components/btn_component";
import MyInput from "@/components/input_field_component";
import Loading from "@/components/loader_component";
import MyTxt from "@/components/txt_components";
import { WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import {
  createAndUpdateWallet,
  deleteWalete,
} from "@/services/wallet_services";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { showAlert } from "@/components/custom_alert";

const WalletModal = () => {
  const oldWallet: { name: string; image: string; id: string } =
    useLocalSearchParams();
  console.log("Wallet Data:", oldWallet);

  const [walletData, setWalletData] = useState<{
    name: string;
    image: any;
  }>({ name: "", image: null });
  const isOldWallet = oldWallet?.id;
  const { user } = useAuth();
  const [loadin, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  useEffect(() => {
    if (oldWallet?.id) {
      setWalletData({ name: oldWallet?.name, image: oldWallet?.image });
    }
  }, [oldWallet?.id, oldWallet?.image, oldWallet?.name]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setWalletData((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const onSubmit = async () => {
    const { name, image } = walletData;

    if (!name.trim() || !image) {
      showAlert("Wallet", "Please fill all the fields");
      return;
    }

    setLoading(true);

    try {
      const data: WalletType = {
        name,
        image,
        uid: user?.uid,
      };
      if (oldWallet?.id) data.id = oldWallet?.id;
      const res = await createAndUpdateWallet(data);
      setLoading(false);

      if (res?.success) {
        console.log(res);
        router.back();
      } else {
        showAlert("Wallet", res.msg);
      }
    } catch (error) {
      console.log(error);
      showAlert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    setDelLoading(true);
    if (!oldWallet?.id) return;
    const res = await deleteWalete(oldWallet?.id);
    setDelLoading(false);
    if (res.success) {
      router.back();
    } else {
      setDelLoading(false);
      showAlert("Wallet", res.msg);
    }
  };
  const showDeleteAlert = () => {
    showAlert("Confirm", "Are you sure you want to delete this wallet?", [
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

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <BackBtn onPress={() => router.back()} />
          <MyTxt fontSize={20} lineHeight={28} fontWeight="600">
            {oldWallet?.id ? "Update Wallet" : "New Wallet"}
          </MyTxt>
          <View />
        </View>

        <ScrollView>
          {/* Wallet Name Input */}
          <View style={styles.userDataContainer}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight="700">
              Wallet Name
            </MyTxt>
            <MyInput
              autoCapitalize="words"
              placeholder="Name of Wallet"
              keyboardType="default"
              onChangeText={(val) => {
                setWalletData({
                  ...walletData,
                  name: val,
                });
              }}
              value={walletData.name}
            />
          </View>

          {/* Image Upload Container */}
          <View style={{ padding: AppSizes.bodyPadding }}>
            <MyTxt
              color={Colors.neutral300}
              fontSize={15}
              fontWeight="700"
              style={{ marginBottom: 10 }}
            >
              Wallet Icon
            </MyTxt>

            {/* IF IMAGE EXISTS */}
            {walletData.image ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: walletData.image }}
                  style={styles.walletImage}
                />

                {/* Close Icon */}
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() =>
                    setWalletData((prev) => ({ ...prev, image: null }))
                  }
                >
                  <Ionicons name="close" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              /* IF NO IMAGE */
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
          style={[styles.footer, { marginHorizontal: isOldWallet ? 25 : 0 }]}
        >
          {oldWallet?.id && (
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
            title={oldWallet?.id ? "Update Wallet" : "Add Wallet"}
            loading={loadin}
            fontSize={18}
          />
        </View>
      </View>
    </View>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: AppSizes.borderRadius,
    borderTopRightRadius: AppSizes.borderRadius,
    minHeight: "100%",
  },
  header: {
    padding: AppSizes.bodyPadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userDataContainer: {
    padding: AppSizes.bodyPadding,
  },
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
    // ✅ Android elevation
    elevation: 10,

    // ✅ iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: -0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingTop: 15,
    marginBottom: 15,
    // borderColor: Colors.neutral600,
    // borderTopWidth: 1,
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
