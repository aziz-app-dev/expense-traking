import { Colors } from "@/constants/theme";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

const Index = () => {
  return (
    <View style={styles.mainContiner}>
      <Image
        resizeMode="contain"
        source={require("@/assets/images/money_bag.png")}
        style={styles.img}
      />
      {/* Loader sits under the splash icon while auth/connection resolves */}
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContiner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral900,
  },
  img: { width: 200, height: 200 },
  loader: { marginTop: 24 },
});

export default Index;
