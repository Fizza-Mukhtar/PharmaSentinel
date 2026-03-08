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

export default function AboutUs() {
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const float = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 10,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -15,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F3" }}>
      {/* DECORATIVE ELEMENTS */}
      <Animated.View 
        style={{
          position: "absolute",
          top: 150,
          right: 20,
          transform: [{ translateY: float }],
          zIndex: 0,
        }}
      >
        <Ionicons name="pulse" size={50} color="#C4A57B" opacity={0.1} />
      </Animated.View>
      
      <Animated.View 
        style={{
          position: "absolute",
          top: 450,
          left: 25,
          transform: [{ translateY: float }],
          zIndex: 0,
        }}
      >
        <Ionicons name="heart" size={45} color="#9C6644" opacity={0.12} />
      </Animated.View>

      {/* HEADER */}
      <View style={{ paddingTop: 60, paddingBottom: 35, paddingHorizontal: 24, zIndex: 1 }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "#E8E3D8",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            shadowColor: "#8B6F47",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#3D2817" />
        </TouchableOpacity>

        <Animated.View style={{ alignItems: "center", opacity: fade }}>
          <LinearGradient
            colors={["#8B6F47", "#6B4423"]}
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              shadowColor: "#8B6F47",
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <Ionicons name="information-circle" size={32} color="#FAF8F3" />
          </LinearGradient>
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#3D2817", marginBottom: 6 }}>About PharmaSentinel</Text>
          <Text style={{ fontSize: 13, color: "#6B5A47", fontWeight: "500" }}>Pharmaceutical Trust & Safety</Text>
        </Animated.View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* MISSION */}
        <Animated.View style={{ marginBottom: 24, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <LinearGradient colors={["#E8E3D8", "#D4CBBA"]} style={{ borderRadius: 20, padding: 26, alignItems: "center" }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#FAF8F3", justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <Ionicons name="flag" size={24} color="#8B6F47" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#3D2817", marginBottom: 12 }}>Our Mission</Text>
            <Text style={{ fontSize: 13, color: "#5C4A39", textAlign: "center", lineHeight: 21, fontWeight: "500" }}>
              Safeguarding public health by ensuring every medicine is authentic 
              through blockchain technology and real-time verification systems.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* PROBLEMS */}
        <Animated.View style={{ flexDirection: "row", gap: 14, marginBottom: 28, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22, alignItems: "center", shadowColor: "#8B6F47", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#E8E3D8", justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <Ionicons name="warning" size={28} color="#9C6644" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#3D2817", marginBottom: 6 }}>10%+</Text>
            <Text style={{ fontSize: 11, color: "#6B5A47", textAlign: "center", lineHeight: 16, fontWeight: "600" }}>Counterfeit medicines globally</Text>
          </View>

          <View style={{ flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 22, alignItems: "center", shadowColor: "#8B6F47", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#E8E3D8", justifyContent: "center", alignItems: "center", marginBottom: 14 }}>
              <Ionicons name="people" size={28} color="#6B4423" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#3D2817", marginBottom: 6 }}>1000s</Text>
            <Text style={{ fontSize: 11, color: "#6B5A47", textAlign: "center", lineHeight: 16, fontWeight: "600" }}>Lives affected annually</Text>
          </View>
        </Animated.View>

        {/* SOLUTION */}
        <Animated.View style={{ marginBottom: 24, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#3D2817", marginBottom: 16 }}>Our Solution</Text>
          {[{icon: "cube", color: "#8B6F47", title: "Blockchain Security", desc: "Immutable tracking of every medicine batch"},
            {icon: "qr-code", color: "#6B4423", title: "Instant Verification", desc: "QR code scanning for real-time authentication"}
          ].map((item, idx) => (
            <View key={idx} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12, shadowColor: "#8B6F47", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#E8E3D8", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#3D2817", marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#6B5A47", lineHeight: 18, fontWeight: "500" }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* VALUES */}
        <Animated.View style={{ backgroundColor: "#E8E3D8", borderRadius: 18, padding: 22, marginBottom: 24, opacity: fade, transform: [{ translateY: slideUp }] }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#3D2817", marginBottom: 18 }}>Core Principles</Text>
          {["Patient safety above all", "Transparency in supply chain", "Innovation for healthcare"].map((val, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#8B6F47" }} />
              <Text style={{ fontSize: 13, color: "#5C4A39", fontWeight: "600", flex: 1 }}>{val}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },

  floatingDecor: {
    position: "absolute",
    zIndex: 0,
  },

  decor1: {
    top: 150,
    right: 20,
  },

  decor2: {
    top: 450,
    left: 25,
  },

  headerSection: {
    paddingTop: 60,
    paddingBottom: 35,
    paddingHorizontal: 24,
    zIndex: 1,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  headerContent: {
    alignItems: "center",
  },

  pageIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#6B5A47",
    fontWeight: "500",
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },

  missionCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 6,
  },

  missionGradient: {
    padding: 26,
    alignItems: "center",
  },

  missionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FAF8F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  missionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 12,
  },

  missionText: {
    fontSize: 13,
    color: "#5C4A39",
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "500",
  },

  problemSection: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },

  problemCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    shadowColor: "#8B6F47",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  problemIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  problemStat: {
    fontSize: 26,
    fontWeight: "900",
    color: "#3D2817",
    marginBottom: 6,
  },

  problemLabel: {
    fontSize: 11,
    color: "#6B5A47",
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "600",
  },

  solutionSection: {
    marginBottom: 24,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 16,
  },

  solutionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    shadowColor: "#8B6F47",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  solutionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
  },

  solutionContent: {
    flex: 1,
  },

  solutionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3D2817",
    marginBottom: 4,
  },

  solutionDesc: {
    fontSize: 12,
    color: "#6B5A47",
    lineHeight: 18,
    fontWeight: "500",
  },

  valuesCard: {
    backgroundColor: "#E8E3D8",
    borderRadius: 18,
    padding: 22,
    marginBottom: 24,
  },

  valuesTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 18,
  },

  valueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  valueDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8B6F47",
  },

  valueText: {
    fontSize: 13,
    color: "#5C4A39",
    fontWeight: "600",
    flex: 1,
  },
});