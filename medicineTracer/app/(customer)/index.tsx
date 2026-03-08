// app/(customer)/index.tsx
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import * as Haptics from "expo-haptics";

export default function CustomerScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  // ✅ iOS FIX: Debounce timer to prevent rapid scans
  const lastScanTime = useRef<number>(0);
  const SCAN_COOLDOWN = 3000; // 3 seconds between scans

  useFocusEffect(
    useCallback(() => {
      console.log("📸 Scanner screen focused");
      setScanned(false);
      lastScanTime.current = 0; // Reset scan timer

      return () => {
        console.log("📸 Scanner screen blurred");
        setScanned(true);
      };
    }, [])
  );

  // Animated scan line
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.permissionGradient}
        >
          <Ionicons name="camera-outline" size={80} color="#fff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            PharmaSentinel needs camera access to scan QR codes and verify
            medicine authenticity
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ✅ FIXED: Proper QR scan handler with iOS debouncing
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    const currentTime = Date.now();
    
    // ✅ CRITICAL: iOS FIX - Check cooldown period
    if (currentTime - lastScanTime.current < SCAN_COOLDOWN) {
      console.log("⏸️ Scan cooldown active, ignoring...");
      return;
    }

    // ✅ CRITICAL: Prevent multiple rapid scans
    if (scanned) {
      console.log("⏸️ Already processing scan, ignoring...");
      return;
    }

    console.log("📥 Raw QR Data:", data);

    // ✅ Immediately block further scans
    setScanned(true);
    lastScanTime.current = currentTime;

    // ✅ Haptic feedback (works on both iOS and Android)
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.log("Haptic not available");
    }

    // ✅ Extract batch_id from various QR formats
    let batchId = data.trim();

    try {
      // Format 1: URL with batch_id parameter
      if (data.includes("batch_id=")) {
        const match = data.match(/batch_id=([^&\s]+)/i);
        batchId = match ? match[1] : data;
      }
      // Format 2: URL path /verify/BATCH-ID
      else if (data.includes("/verify/")) {
        const parts = data.split("/");
        const lastPart = parts[parts.length - 1];
        batchId = lastPart.split("?")[0];
      }
      // Format 3: Direct batch ID
      else if (data.match(/^[A-Z0-9-]+$/i)) {
        batchId = data;
      }

      console.log("✅ Extracted Batch ID:", batchId);

      // ✅ iOS FIX: Longer delay for navigation
      const navigationDelay = Platform.OS === 'ios' ? 800 : 500;
      
      setTimeout(() => {
        router.push({
          pathname: "/(customer)/verify",
          params: { batch_id: batchId },
        });
      }, navigationDelay);

      // ✅ iOS FIX: Longer cooldown before re-enabling scanner
      const resetDelay = Platform.OS === 'ios' ? 6000 : 5000;
      
      setTimeout(() => {
        console.log("🔄 Scanner ready again");
        setScanned(false);
      }, resetDelay);

    } catch (error) {
      console.error("❌ QR Parse Error:", error);
      Alert.alert(
        "Scan Error",
        "Could not read QR code. Please try again.",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              lastScanTime.current = 0;
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {permission?.granted && !scanned && (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          enableTorch={flashOn}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/(customer)")}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Medicine QR Code</Text>
            <TouchableOpacity
              style={styles.flashButton}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons
                name={flashOn ? "flash" : "flash-off"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scannerContainer}>
            <View style={styles.scanFrame}>
              {/* Corner Borders */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Animated Scan Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            </View>

            <Text style={styles.instructionText}>
              Align QR code within the frame
            </Text>
            <Text style={styles.subInstructionText}>
              Scanning will happen automatically
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={24} color="#10b981" />
              <Text style={styles.infoText}>Verify medicine authenticity</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="git-network" size={24} color="#3b82f6" />
              <Text style={styles.infoText}>View supply chain trail</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle" size={24} color="#f59e0b" />
              <Text style={styles.infoText}>Detect counterfeit medicines</Text>
            </View>
          </View>
        </CameraView>
      )}

      {/* Scan Success Indicator */}
      {scanned && (
        <View style={styles.scanSuccessOverlay}>
          <View style={styles.scanSuccessContent}>
            <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            <Text style={styles.scanSuccessText}>QR Code Detected!</Text>
            <Text style={styles.scanSuccessSubtext}>Verifying...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#667eea",
  },
  loadingText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 100,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  flashButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#10b981",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 32,
    textAlign: "center",
  },
  subInstructionText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  scanSuccessOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanSuccessContent: {
    alignItems: "center",
  },
  scanSuccessText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  scanSuccessSubtext: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 8,
  },
});