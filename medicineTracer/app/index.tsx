import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

export default function Index() {
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  
  // Floating animations for decorative elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  const router = useRouter();

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fade, { 
        toValue: 1, 
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true 
      }),
      Animated.spring(slideUp, { 
        toValue: 0,
        friction: 10,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating medicine icons
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(float1, {
            toValue: -20,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float1, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(float2, {
            toValue: -15,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float2, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(float3, {
            toValue: -25,
            duration: 3500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float3, {
            toValue: 0,
            duration: 3500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* FLOATING DECORATIVE ELEMENTS */}
      <View style={styles.decorativeContainer}>
        <Animated.View 
          style={[
            styles.floatingIcon,
            styles.floatingIcon1,
            { transform: [{ translateY: float1 }] }
          ]}
        >
          <Ionicons name="medical" size={40} color="#C4A57B" opacity={0.15} />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.floatingIcon,
            styles.floatingIcon2,
            { transform: [{ translateY: float2 }] }
          ]}
        >
          <Ionicons name="bandage" size={35} color="#8B6F47" opacity={0.12} />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.floatingIcon,
            styles.floatingIcon3,
            { transform: [{ translateY: float3 }, { rotate: spin }] }
          ]}
        >
          <Ionicons name="flask" size={45} color="#6B4423" opacity={0.1} />
        </Animated.View>

        <Animated.View 
          style={[
            styles.floatingIcon,
            styles.floatingIcon4,
            { transform: [{ translateY: float1 }] }
          ]}
        >
          <Ionicons name="fitness" size={38} color="#9C6644" opacity={0.13} />
        </Animated.View>
      </View>

      {/* ELEGANT HEADER */}
      <View style={styles.headerSection}>
        <Animated.View style={[styles.headerContent, { opacity: fade }]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#8B6F47", "#6B4423"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="shield-checkmark" size={32} color="#FAF8F3" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>PharmaSentinel</Text>
          <Text style={styles.tagline}>Pharmaceutical Authenticity Guardian</Text>
        </Animated.View>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.mainContent}>
        {/* HERO SCAN CARD */}
        <Animated.View
          style={[
            styles.heroCard,
            { 
              opacity: fade,
              transform: [{ translateY: slideUp }]
            },
          ]}
        >
          <View style={styles.heroCardInner}>
            <LinearGradient
              colors={["#8B6F47", "#6B4423"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Link href="/(customer)" asChild>
                <TouchableOpacity activeOpacity={0.9} style={styles.heroButton}>
                  <View style={styles.heroIconWrapper}>
                    <View style={styles.heroIconBg}>
                      <Ionicons name="qr-code" size={42} color="#8B6F47" />
                    </View>
                  </View>
                  <View style={styles.heroText}>
                    <Text style={styles.heroTitle}>Verify Medicine</Text>
                    <Text style={styles.heroSubtitle}>
                      Scan QR code for instant authentication
                    </Text>
                  </View>
                  <View style={styles.heroArrow}>
                    <Ionicons name="arrow-forward-circle" size={36} color="#FAF8F3" />
                  </View>
                </TouchableOpacity>
              </Link>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* FEATURES */}
        <Animated.View
          style={[
            styles.featuresSection,
            { opacity: fade, transform: [{ translateY: slideUp }] },
          ]}
        >
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Blockchain Secured"
            colors={["#E8E3D8", "#D4CBBA"]}
            iconColor="#8B6F47"
          />
          <FeatureCard
            icon="pulse-outline"
            title="Real-time Tracking"
            colors={["#E5DDD5", "#CFC4B8"]}
            iconColor="#6B4423"
          />
          <FeatureCard
            icon="analytics-outline"
            title="Supply Chain Verified"
            colors={["#DDD6CC", "#C9BFB0"]}
            iconColor="#9C6644"
          />
        </Animated.View>

        {/* NAVIGATION */}
        <Animated.View
          style={[
            styles.navSection,
            { opacity: fade, transform: [{ translateY: slideUp }] },
          ]}
        >
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/about")}
            activeOpacity={0.8}
          >
            <View style={styles.navIconCircle}>
              <Ionicons name="information-circle-outline" size={22} color="#8B6F47" />
            </View>
            <View style={styles.navContent}>
              <Text style={styles.navTitle}>About Platform</Text>
              <Text style={styles.navSubtitle}>Our mission & values</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A89B88" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => router.push("/howto")}
            activeOpacity={0.8}
          >
            <View style={styles.navIconCircle}>
              <Ionicons name="book-outline" size={22} color="#6B4423" />
            </View>
            <View style={styles.navContent}>
              <Text style={styles.navTitle}>User Guide</Text>
              <Text style={styles.navSubtitle}>How to verify medicines</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A89B88" />
          </TouchableOpacity>
        </Animated.View>

        {/* TRUST BADGE */}
        <Animated.View
          style={[
            styles.trustSection,
            { opacity: fade, transform: [{ translateY: slideUp }] },
          ]}
        >
          <View style={styles.trustBadge}>
            <Ionicons name="ribbon-outline" size={18} color="#8B6F47" />
            <Text style={styles.trustText}>DRAP Certified Platform</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

/* FEATURE CARD */
const FeatureCard = ({ icon, title, colors, iconColor }: any) => (
  <View style={styles.featureCard}>
    <LinearGradient colors={colors} style={styles.featureGradient}>
      <View style={styles.featureIconWrapper}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },

  /* ================= DECOR ================= */
  decorativeContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },

  floatingIcon: {
    position: "absolute",
  },

  floatingIcon1: { top: 70, right: 20 },
  floatingIcon2: { top: 150, left: 15 },
  floatingIcon3: { top: 280, right: 25 },
  floatingIcon4: { top: 380, left: 20 },

  /* ================= HEADER ================= */
  headerSection: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1,
  },

  headerContent: {
    alignItems: "center",
  },

  logoContainer: {
    marginBottom: 12,
  },

  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3D2817",
    marginBottom: 4,
  },

  tagline: {
    fontSize: 11,
    color: "#6B5A47",
    fontWeight: "500",
    textAlign: "center",
  },

  /* ================= CONTENT ================= */
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },

  /* ================= HERO ================= */
  heroCard: {
    marginBottom: 16,
  },

  heroCardInner: {
    borderRadius: 18,
    overflow: "hidden",
  },

  heroGradient: {
    padding: 3,
  },

  heroButton: {
    backgroundColor: "#FAF8F3",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  heroIconWrapper: {},

  heroIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3D2817",
  },

  heroSubtitle: {
    fontSize: 10,
    color: "#6B5A47",
    fontWeight: "500",
    lineHeight: 14,
  },

  heroArrow: {
    opacity: 0.8,
  },

  /* ================= FEATURES ================= */
  featuresSection: {
    gap: 8,
    marginBottom: 14,
  },

  featureCard: {
    borderRadius: 14,
    overflow: "hidden",
  },

  featureGradient: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  featureIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FAF8F3",
    justifyContent: "center",
    alignItems: "center",
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3D2817",
  },

  /* ================= NAV ================= */
  navSection: {
    gap: 8,
    marginBottom: 14,
  },

  navCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  navIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E8E3D8",
    justifyContent: "center",
    alignItems: "center",
  },

  navContent: {
    flex: 1,
  },

  navTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3D2817",
  },

  navSubtitle: {
    fontSize: 10,
    color: "#6B5A47",
    fontWeight: "500",
  },

  /* ================= TRUST ================= */
  trustSection: {
    alignItems: "center",
    marginBottom: 10,
  },

  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8E3D8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  trustText: {
    fontSize: 10,
    color: "#6B4423",
    fontWeight: "700",
  },
});
