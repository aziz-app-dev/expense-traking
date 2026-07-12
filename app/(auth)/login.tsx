import BackBtn from "@/components/back_btn_component";
import MyBtn from "@/components/btn_component";
import MyInput from "@/components/input_field_component";
import MySpacer from "@/components/spcer_componet";
import MyTxt from "@/components/txt_components";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { showAlert } from "@/components/custom_alert";
import { useAuth } from "@/context/auth_context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    
 const footerTxt="Don't have an account?";
  const handleSubmiton = async () => {
      if (
        email == null ||
        email === "" ||
        password == null ||
        password === ""
       
      ) {
        showAlert("Please fill all the fields");
        return;
      }
      setIsLoading(true);
      try {
        const res = await login(email, password);
        if (res.success) {
          router.replace("/(tabs)");
        } else {
          showAlert(res.message);
        }
      } catch (error: any) {
        console.log("Register error:", error);
        showAlert(error.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
  
  return (
    <View style={styles.mainContianer}>
      <BackBtn onPress={() => router.back()} />
      <MySpacer height={20} />
      <View style={{ gap: 5 }}>
        {/* Greeting */}
        <MyTxt
          color={Colors.white}
          fontSize={30}
          lineHeight={36}
          fontWeight={"600"}
        >
          Hey,
        </MyTxt>
        <MyTxt
          color={Colors.white}
          fontSize={30}
          lineHeight={36}
          fontWeight={"600"}
        >
          Welcome Back
        </MyTxt>
        <MySpacer height={20} />

        <MyTxt>
          Login now to track all your expenses and manage your budget
          effectively.
        </MyTxt>

        {/* Form */}
        <MyInput
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
          leftIcon={<Ionicons name="at" size={AppSizes.inputIcon} color={Colors.white} />}
        />
        <MyInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={AppSizes.inputIcon}
              color="white"
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
          leftIcon={<Ionicons name={"lock-closed"} size={AppSizes.inputIcon} color="white" />}
        />
        <MyTxt align="right">Forgot Password?</MyTxt>
        <MySpacer height={20} />
        {/* Submit Button */}
        <MyBtn
          title="Login"
          bgColor={Colors.primary}
          loading={isLoading}
          fontSize={18}
          fontWeight="800"
          onPress={() => handleSubmiton()}
        />

        {/* footer  */}
        <View style={styles.footerTxt}>
          <MyTxt color={Colors.white}>{footerTxt}</MyTxt>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <MyTxt color={Colors.primary} fontWeight="600">
              Sign Up
            </MyTxt>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContianer: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: AppSizes.bodyPadding,
  },
  footerTxt: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 25,
  },
});

export default Login;
