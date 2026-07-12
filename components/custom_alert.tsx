import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MyTxt from "./txt_components";

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertState = {
  visible: boolean;
  title?: string;
  message?: string;
  buttons: AlertButton[];
};

const INITIAL: AlertState = { visible: false, buttons: [] };

// Module-level singleton so this works from anywhere — components AND plain
// functions like the service layer (no hooks required to trigger it).
let listener: ((s: AlertState) => void) | null = null;
let current: AlertState = INITIAL;

const emit = () => listener?.({ ...current });

/**
 * Drop-in replacement for React Native's Alert.alert(title, message?, buttons?).
 * Renders a themed custom modal instead of the OS dialog.
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  current = {
    visible: true,
    title,
    message,
    buttons: buttons && buttons.length ? buttons : [{ text: "OK" }],
  };
  emit();
};

const hide = () => {
  current = { ...current, visible: false };
  emit();
};

// Mount once near the app root so showAlert() works globally.
export const CustomAlertHost = () => {
  const [state, setState] = useState<AlertState>(current);

  useEffect(() => {
    listener = setState;
    return () => {
      listener = null;
    };
  }, []);

  const handlePress = (btn: AlertButton) => {
    hide();
    // Let the modal dismiss before running the action (e.g. navigation).
    setTimeout(() => btn.onPress?.(), 0);
  };

  const buttons = state.buttons;
  const rowLayout = buttons.length <= 2;

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={hide}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        <View style={styles.card}>
          {!!state.title && (
            <MyTxt fontSize={18} fontWeight="700" align="center">
              {state.title}
            </MyTxt>
          )}
          {!!state.message && (
            <MyTxt
              fontSize={14}
              color={Colors.neutral300}
              align="center"
              lineHeight={21}
            >
              {state.message}
            </MyTxt>
          )}

          <View style={[styles.buttonsRow, !rowLayout && styles.buttonsColumn]}>
            {buttons.map((btn, i) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";
              return (
                <TouchableOpacity
                  key={`${btn.text}-${i}`}
                  activeOpacity={0.8}
                  onPress={() => handlePress(btn)}
                  style={[
                    styles.button,
                    rowLayout && { flex: 1 },
                    isCancel
                      ? styles.buttonCancel
                      : isDestructive
                      ? styles.buttonDestructive
                      : styles.buttonDefault,
                  ]}
                >
                  <MyTxt
                    fontSize={15}
                    fontWeight="700"
                    color={
                      isCancel
                        ? Colors.neutral300
                        : isDestructive
                        ? Colors.white
                        : Colors.black
                    }
                  >
                    {btn.text}
                  </MyTxt>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.neutral900,
    borderRadius: 20,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.neutral800,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  buttonsColumn: {
    flexDirection: "column",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: AppSizes.borderRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDefault: {
    backgroundColor: Colors.primary,
  },
  buttonDestructive: {
    backgroundColor: Colors.rose,
  },
  buttonCancel: {
    backgroundColor: Colors.neutral800,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },
});
