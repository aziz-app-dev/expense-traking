import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { generateIncomeSuggestions, INDUSTRIES } from "@/services/ai_services";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MyTxt from "./txt_components";

// Render AI text: numbered idea titles as bold headings, and "How:/Est:"
// labels in bold too.
const renderBody = (text: string) =>
  text.split("\n").map((raw, i) => {
    const line = raw.replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
    if (!line) return <View key={i} style={{ height: 10 }} />;

    // Numbered idea title, e.g. "1. Freelance app development"
    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      return (
        <MyTxt
          key={i}
          fontSize={16}
          fontWeight="700"
          color={Colors.white}
          style={{ marginTop: 6, marginBottom: 4 }}
        >
          {line}
        </MyTxt>
      );
    }

    // "How:" / "Est:" style label lines
    const idx = line.indexOf(":");
    const heading = idx > 0 ? line.slice(0, idx) : "";
    const isHeading = idx > 0 && idx <= 22 && /^[A-Za-z][A-Za-z ]*$/.test(heading);
    return (
      <MyTxt
        key={i}
        fontSize={14}
        color={Colors.textLighter}
        style={{ lineHeight: 22, marginBottom: 4 }}
      >
        {isHeading ? (
          <>
            <MyTxt fontSize={14} fontWeight="700" color={Colors.primary}>
              {heading}:
            </MyTxt>
            {" " + line.slice(idx + 1).trim()}
          </>
        ) : (
          line
        )}
      </MyTxt>
    );
  });

type Props = {
  totalIncome: number;
  style?: any;
  label?: string;
};

const IncomeIdeas = ({
  totalIncome,
  style,
  label = "How to Grow My Income",
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [moreError, setMoreError] = useState("");
  const [industry, setIndustry] = useState("");
  const cache = useRef<Map<string, string>>(new Map());

  // Remember the user's chosen field across app launches.
  useEffect(() => {
    AsyncStorage.getItem("preferred_industry").then((saved) => {
      if (saved) setIndustry(saved);
    });
  }, []);

  const selectIndustry = (value: string) => {
    setIndustry(value);
    AsyncStorage.setItem("preferred_industry", value).catch(() => {});
  };

  const handleGenerate = async () => {
    if (!industry) return;
    const cacheKey = `${industry}#${Math.round(totalIncome / 1000)}`;
    setLoading(true);
    setText("");
    setError("");
    setMoreError("");

    const cached = cache.current.get(cacheKey);
    if (cached) {
      console.log("[AI] income ideas cache hit — reusing previous result");
      setText(cached);
      setLoading(false);
      return;
    }

    const res = await generateIncomeSuggestions(industry, totalIncome);
    if (res.success && res.report) {
      cache.current.set(cacheKey, res.report);
      setText(res.report);
    } else {
      setError(res.msg || "Could not generate suggestions.");
    }
    setLoading(false);
  };

  // Fetch another batch of fresh ideas and append them (renumbered), telling
  // the model which ones were already shown so it doesn't repeat.
  const handleMore = async () => {
    if (!industry || moreLoading) return;
    setMoreLoading(true);
    setMoreError("");

    const existingTitles = (text.match(/^\s*\d+\.\s+(.*)$/gm) || []).map((l) =>
      l.replace(/^\s*\d+\.\s+/, "").trim()
    );
    const startNum = existingTitles.length + 1;

    const res = await generateIncomeSuggestions(
      industry,
      totalIncome,
      existingTitles
    );

    if (res.success && res.report) {
      let n = startNum;
      const renumbered = res.report
        .split("\n")
        .map((line) => {
          const m = line.trim().match(/^(\d+)\.\s+(.*)$/);
          if (m) return `${n++}. ${m[2]}`;
          return line;
        })
        .join("\n");
      setText((prev) => `${prev.trimEnd()}\n\n${renumbered}`);
    } else {
      setMoreError(res.msg || "Could not load more ideas.");
    }
    setMoreLoading(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.incomeButton, style]}
        activeOpacity={0.85}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="bulb" size={17} color={Colors.primary} />
        <MyTxt fontSize={14} fontWeight="700" color={Colors.white}>
          {label}
        </MyTxt>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="bulb" size={20} color={Colors.primary} />
              <MyTxt fontSize={18} fontWeight="700">
                Grow My Income
              </MyTxt>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingBottom: 20 }}
          >
            <MyTxt fontSize={13} color={Colors.neutral350}>
              Pick your field to get personalized ideas for earning more.
            </MyTxt>

            {/* Industry preference chips */}
            <View style={styles.cloud}>
              {INDUSTRIES.map((item) => {
                const active = industry === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => selectIndustry(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <MyTxt
                      fontSize={12}
                      fontWeight="600"
                      color={active ? Colors.black : Colors.neutral300}
                    >
                      {item}
                    </MyTxt>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, (!industry || loading) && { opacity: 0.5 }]}
              activeOpacity={0.85}
              disabled={!industry || loading}
              onPress={handleGenerate}
            >
              <Ionicons name="sparkles" size={16} color={Colors.black} />
              <MyTxt fontSize={14} fontWeight="700" color={Colors.black}>
                Get Income Ideas
              </MyTxt>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <MyTxt fontSize={14} color={Colors.neutral350} style={{ marginTop: 10 }}>
                  Finding ways to grow your income...
                </MyTxt>
              </View>
            ) : error ? (
              <MyTxt
                fontSize={14}
                color={Colors.rose}
                align="center"
                style={{ paddingVertical: 16 }}
              >
                {error}
              </MyTxt>
            ) : text ? (
              <>
                {renderBody(text)}

                {moreError ? (
                  <MyTxt
                    fontSize={13}
                    color={Colors.rose}
                    align="center"
                    style={{ marginTop: 8 }}
                  >
                    {moreError}
                  </MyTxt>
                ) : null}

                <TouchableOpacity
                  style={styles.moreBtn}
                  activeOpacity={0.85}
                  disabled={moreLoading}
                  onPress={handleMore}
                >
                  {moreLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={Colors.primary}
                      />
                      <MyTxt fontSize={14} fontWeight="700" color={Colors.primary}>
                        More Ideas
                      </MyTxt>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default IncomeIdeas;

const styles = StyleSheet.create({
  incomeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
    borderWidth: 1.5,
    borderColor: Colors.neutral700,
    backgroundColor: Colors.neutral800,
  },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: AppSizes.borderRadius,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.neutral800,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "80%",
    backgroundColor: Colors.neutral900,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: AppSizes.bodyPadding,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.neutral800,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: AppSizes.borderRadius,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
