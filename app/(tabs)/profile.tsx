import { AppHeader } from "@/components/header_component";
import MyTxt from "@/components/txt_components";
import { auth } from '@/config/firebase';
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { signOut } from 'firebase/auth';
import React from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";

const Profile = () => {
  const { user } = useAuth();

  type AccountOption = {
    title: string;
    routeName?: Href;
    bgColor: string;
    icon: React.ReactNode;
    action?: () => void;
  };
  const accountOptions: AccountOption[] = [
    {
      title: "Edit Profile",
      routeName: "/(modals)/profile_modal" as const, // ✅ TS now treats it as a literal
      bgColor: Colors.primaryLightOverlay,
      icon: (
        <Ionicons name="person" size={AppSizes.tabIcon} color={Colors.white} />
      ),
    },
    {
      title: "Settings",
      bgColor: Colors.greenOverlay,
      icon: (
        <Ionicons
          name="settings"
          size={AppSizes.tabIcon}
          color={Colors.white}
        />
      ),
    },
    {
      title: "Privacy Policy",
      bgColor: Colors.neutral700,
      icon: (
        <Ionicons
          name="lock-closed"
          size={AppSizes.tabIcon}
          color={Colors.white}
        />
      ),
    },
    {
      title: "Logout",
      bgColor: Colors.roseOverlay,
      icon: (
        <Ionicons name="log-out" size={AppSizes.tabIcon} color={Colors.white} />
      ),
      action: () => {
        // logout logic
      },
    },
  ];
  const logOut = async () => {
    await signOut(auth);
  }
  const showLogouAlert = () => {
    Alert.alert("Confirm", "Are You sure you want ti logout?", [
      { text: "Canecl", onPress: () => {} },
      { text: "Logout", onPress: logOut, style: "destructive" },
    ]);
  };
  const handelOnTap = (items: AccountOption) => {
    if (items.title==="Logout") {
      showLogouAlert();
    }
    if (items.routeName) {
      router.push(items.routeName);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <AppHeader title="Profile" />
      <View style={styles.container}>
        {/* User Info */}
        <View style={styles.userInfo}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Image
              source={
                user?.image
                  ? { uri: user.image }
                  : require("@/assets/images/3d_profile.png")
              }
              style={{ width: "100%", height: "100%", borderRadius: 200 }}
            />
          </View>
          {/* Name & Email */}
          <View style={styles.nameContiner}>
            <MyTxt fontSize={24} fontWeight={"600"}>
              {user?.name}
            </MyTxt>
            <MyTxt fontSize={15}>{user?.email}</MyTxt>
          </View>
        </View>

        <View style={styles.accOpctions}>
          {accountOptions.map((item, index) => (
            <Pressable
              key={index}
              style={styles.tile}
              onPress={()=>handelOnTap(item)}
            >
              {/* Left Icon */}
              <View style={styles.tileIconName}>
                <View
                  style={[styles.tileIcon, { backgroundColor: item.bgColor }]}
                >
                  {item.icon}
                </View>
                {/* Title */}
                <MyTxt fontWeight={"600"}>{item.title}</MyTxt>
              </View>

              {/* Right Arrow */}
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.neutral300}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  container: {
    padding: AppSizes.bodyPadding,
    backgroundColor: Colors.black,
  },
  userInfo: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  nameContiner: {
    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
    gap: 4,
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: Colors.neutral300,
    height: 110,
    width: 110,
    borderRadius: 200,
  },
  accOpctions: {
    marginTop: 30,
  },
  tile: {
    padding: 10,
    // marginTop: 5,
    borderRadius: AppSizes.borderRadius,
    // backgroundColor: Colors.neutral600,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tileIconName: { flexDirection: "row", gap: 15 },
  tileIcon: { padding: 8, borderRadius: AppSizes.borderRadius },
});
export default Profile;
