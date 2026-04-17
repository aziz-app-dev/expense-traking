import BackBtn from "@/components/back_btn_component";
import MyBtn from "@/components/btn_component";
import MyInput from "@/components/input_field_component";
import MySpacer from "@/components/spcer_componet";
import MyTxt from "@/components/txt_components";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import { uploadImageToCloudinary } from "@/services/cloudinary_services";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileModal = () => {
  const { user, updateData } = useAuth();
  const [userData, setUserData] = useState<{
    name: string;
    image: any;
  }>({ name: "", image: null });
  const [loadin, setLoading] = useState(false);

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      image: user?.image || null,
    });
  }, []);

  const onSubmit = async () => {
    if (!user?.uid) return;

    if (!userData.name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = user?.image || null;

      // ✅ Upload ONLY if image is local (file://)
      if (userData.image && userData.image.startsWith("file://")) {
        const uploadedUrl = await uploadImageToCloudinary(userData.image);

        if (!uploadedUrl) {
          Alert.alert("Error", "Image upload failed");
          setLoading(false);
          return;
        }

        imageUrl = uploadedUrl;
      }

      const res = await updateData(user.uid, {
        name: userData.name,
        image: imageUrl,
      });

      if (res.success) {
        Alert.alert("Success", "Profile updated successfully");
        router.back();
      } else {
        Alert.alert("Error", res.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };
  // const onSubmit = async () => {
  //   if (!user?.uid) return;

  //   if (!userData.name.trim()) {
  //     Alert.alert("User", "Please fill all the fields");
  //     return;
  //   }

  //   setLoading(true);

  //   const res = await updateData(user.uid, {
  //     name: userData.name,
  //     image: userData.image,
  //   });

  //   setLoading(false);

  //   if (res.success) {
  //     Alert.alert("Success", "Profile updated successfully");
  //     router.back();
  //   } else {
  //     Alert.alert("Error", res.message || "Something went wrong");
  //   }
  // };

  // const pickImageAsync = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ['images'],
  //     allowsEditing: true,
  //     quality: 0.5,
  //     aspect:[4,3]
  //   });

  //   if (!result.canceled) {
  //     console.log(result.assets[0]);
  //     setUserData({...userData, image:result.assets[0].uri})
  //      await updateData(user.uid, {
  //     name: userData.name,
  //     image: userData.image,
  //   });

  //   } else {
  //     alert('You did not select any image.');
  //   }
  // };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.6,
      aspect: [4, 4],
    });

    if (!result.canceled) {
      // Just store LOCAL uri for preview
      setUserData((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.modalContainer}>
        {/* Header of modal */}
        <View style={styles.header}>
          <BackBtn onPress={() => router.back()} />
          <MyTxt fontSize={20} fontWeight={"600"}>
            {" "}
            Update Profile
          </MyTxt>
          <View />
        </View>
        <ScrollView>
          {/* Avatar of user */}
          <View style={styles.avatar}>
            <Image
              source={
                userData.image
                  ? { uri: userData.image }
                  : user?.image
                  ? { uri: user.image }
                  : require("@/assets/images/3d_profile.png")
              }
              style={{ width: "100%", height: "100%", borderRadius: 200 }}
            />

            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => {
                pickImageAsync();
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={15}
                color={Colors.black}
                style={styles.editIcon1}
              />
            </TouchableOpacity>
          </View>
          {/* user data form */}
          <View style={styles.userDataContainer}>
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight={"700"}>
              Name
            </MyTxt>
            <MyInput
              autoCapitalize="words"
              keyboardType="name-phone-pad"
              onChangeText={(val) => {
                setUserData({
                  ...userData,
                  name: val,
                });
              }}
              value={userData.name}
            />
            <MySpacer height={10} />
            <MyTxt color={Colors.neutral300} fontSize={15} fontWeight={"700"}>
              Email
            </MyTxt>
            <MyInput
              onChangeText={() => {}}
              value={user?.email || ""}
              editable={false}
              textColor={Colors.neutral400}
            />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <MyBtn
            onPress={onSubmit}
            title="Update"
            loading={loadin}
            fontSize={18}
          />
        </View>
      </View>
    </View>
  );
};

export default ProfileModal;

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
  avatar: {
    alignSelf: "center",
    backgroundColor: Colors.neutral300,
    height: 110,
    width: 110,
    borderRadius: 200,
  },
  editIcon: {
    position: "absolute",
    right: 5,
    bottom: 6,
    backgroundColor: Colors.white,
    borderRadius: 100,
    padding: 2,
  },
  editIcon1: {
    padding: 4,
  },
  userDataContainer: {
    padding: AppSizes.bodyPadding,
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
});
