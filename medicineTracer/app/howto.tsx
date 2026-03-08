import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HowToUse() {
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 10, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: -18, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: -22, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F3" }}>
      {/* Floating Decorative Icons */}
      <Animated.View style={{ position: "absolute", top: 160, right: 22, transform: [{ translateY: float1 }], zIndex: 0 }}>
        <Ionicons name="search" size={48} color="#C4A57B" opacity={0.11} />
      </Animated.View>

      <Animated.View style={{ position: "absolute", top: 460, left: 18, transform: [{ translateY: float2 }], zIndex: 0 }}>
        <Ionicons name="shield-checkmark" size={52} color="#9C6644" opacity={0.09} />
      </Animated.View>

      {/* Header */}
      <View style={{ paddingTop: 52, paddingBottom: 26, paddingHorizontal: 20, zIndex: 1 }}>
        <TouchableOpacity
          style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#E8E3D8", justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#8B6F47", shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#3D2817" />
        </TouchableOpacity>

        <Animated.View style={{ alignItems: "center", opacity: fade }}>
          <LinearGradient colors={["#9C6644", "#7A4F30"]} style={{ width: 64, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 12, shadowColor: "#9C6644", shadowOpacity: 0.25, shadowRadius: 12, elevation: 7 }}>
            <Ionicons name="book" size={32} color="#FAF8F3" />
          </LinearGradient>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#3D2817", marginBottom: 4 }}>User Guide</Text>
          <Text style={{ fontSize: 12, color: "#6B5A47", fontWeight: "500" }}>3 Easy Steps to Verify</Text>
        </Animated.View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Steps */}
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideUp }] }}>
          <StepCard
            number="1"
            icon="search-outline"
            title="Locate QR Code"
            desc="Find the PharmaSentinel QR code on medicine packaging"
            gradientColors={["#E8E3D8", "#D4CBBA"]}
            iconColor="#8B6F47"
          />
          <StepCard
            number="2"
            icon="qr-code-outline"
            title="Scan with App"
            desc="Tap 'Verify Medicine' and point camera at the code"
            gradientColors={["#DDD6CC", "#C9BFB0"]}
            iconColor="#6B4423"
          />
          <StepCard
            number="3"
            icon="shield-checkmark-outline"
            title="View Results"
            desc="Get instant verification with blockchain proof"
            gradientColors={["#E5DDD5", "#CFC4B8"]}
            iconColor="#9C6644"
          />
        </Animated.View>

        {/* Verification Results */}
        <Animated.View style={{ marginTop: 22, marginBottom: 18, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#3D2817", marginBottom: 12 }}>Verification Results</Text>

          {[
            { color: "#6B8E23", title: "AUTHENTIC", desc: "Medicine verified safe", icon: "checkmark-circle" },
            { color: "#8B4513", title: "COUNTERFEIT", desc: "Do not use - Report to DRAP", icon: "close-circle" },
            { color: "#CD853F", title: "WARNING", desc: "Check expiry date", icon: "alert-circle" },
          ].map((item, index) => (
            <View key={index} style={{ backgroundColor: "#FFFFFF", borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10, shadowColor: "#8B6F47", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
              <View style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: item.color }} />
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#E8E3D8", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#3D2817", marginBottom: 2 }}>{item.title}</Text>
                <Text style={{ fontSize: 10.5, color: "#6B5A47", fontWeight: "600" }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Helpful Tips */}
        <Animated.View style={{ backgroundColor: "#E8E3D8", borderRadius: 16, padding: 16, marginBottom: 18, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "#FAF8F3", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="bulb" size={18} color="#9C6644" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#3D2817" }}>Helpful Tips</Text>
          </View>
          {["Use good lighting when scanning", "Hold camera steady for clarity", "Verify before first use always"].map((tip, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#8B6F47" }} />
              <Text style={{ fontSize: 12, color: "#5C4A39", fontWeight: "600", flex: 1 }}>{tip}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const StepCard = ({ number, icon, title, desc, gradientColors, iconColor }: any) => (
  <View style={{ borderRadius: 16, overflow: "hidden", marginBottom: 12, shadowColor: "#8B6F47", shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
    <LinearGradient colors={gradientColors} style={{ padding: 16, flexDirection: "row", gap: 14 }}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#8B6F47", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontWeight: "900", color: "#FAF8F3" }}>{number}</Text>
        </View>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#FAF8F3", justifyContent: "center", alignItems: "center" }}>
          <Ionicons name={icon as any} size={28} color={iconColor} />
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: "#3D2817", marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontSize: 11, color: "#5C4A39", lineHeight: 16, fontWeight: "500" }}>{desc}</Text>
      </View>
    </LinearGradient>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },

  /* ================= FLOATING DECOR ================= */
  floatingDecor: {
    position: "absolute",
    zIndex: 0,
  },

  decor1: {
    top: 160,
    right: 22,
  },

  decor2: {
    top: 460,
    left: 18,
  },

  /* ================= HEADER ================= */
  headerSection: {
    paddingTop: 52,
    paddingBottom: 26,
    paddingHorizontal: 20,
    zIndex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  headerContent: {
    alignItems: "center",
  },

  pageIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#9C6644",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 4,
  },

  pageSubtitle: {
    fontSize: 12,
    color: "#6B5A47",
    fontWeight: "500",
  },

  /* ================= CONTENT ================= */
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },

  /* ================= STEPS ================= */
  stepCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  stepGradient: {
    padding: 16,
    flexDirection: "row",
    gap: 14,
  },

  stepLeft: {
    alignItems: "center",
    gap: 8,
  },

  stepNumberBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#8B6F47",
    justifyContent: "center",
    alignItems: "center",
  },

  stepNumber: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FAF8F3",
  },

  stepIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FAF8F3",
    justifyContent: "center",
    alignItems: "center",
  },

  stepContent: {
    flex: 1,
    justifyContent: "center",
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 4,
  },

  stepDesc: {
    fontSize: 11,
    color: "#5C4A39",
    lineHeight: 16,
    fontWeight: "500",
  },

  /* ================= RESULTS ================= */
  resultsSection: {
    marginTop: 22,
    marginBottom: 18,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 12,
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  resultBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },

  resultIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
  },

  resultContent: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 2,
  },

  resultDesc: {
    fontSize: 10.5,
    color: "#6B5A47",
    fontWeight: "600",
  },

  /* ================= TIPS ================= */
  tipsCard: {
    backgroundColor: "#E8E3D8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  tipsIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FAF8F3",
    justifyContent: "center",
    alignItems: "center",
  },

  tipsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3D2817",
  },

  tipsList: {
    gap: 10,
  },

  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B6F47",
  },

  tipText: {
    fontSize: 12,
    color: "#5C4A39",
    fontWeight: "600",
    flex: 1,
  },
});
