import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { verifyMedicine, reportSuspiciousMedicine } from "../../services/api";

// ===================================
// TYPES
// ===================================

interface AlertItem {
  type: "warning" | "info" | "critical";
  message: string;
  days_left?: number;
  action?: string;
  contact?: string;
}

interface JourneyStep {
  step: number;
  stage: string;
  icon: string;
  location: string;
  date: string;
  status: string;
}

interface Medicine {
  name: string;
  batch_id: string;
  manufacturer: string;
  manufactured_on: string;
  expires_on: string;
  days_until_expiry: number | null;
}

interface Journey {
  title: string;
  total_steps: number;
  steps: JourneyStep[];
}

interface Security {
  blockchain_verified: boolean;
  tamper_proof: boolean;
  verified_at: string;
}

interface BatchInfo {
  batch_id: string;
  name: string;
  manufacturer: string;
  expiry_date?: string;
  days_expired?: number;
  total_manufactured?: number;
  all_sold?: boolean;
  last_sale_date?: string | null;
}

interface Contact {
  drap_hotline: string;
  emergency?: string;
  action_required?: string;
}

interface VerificationData {
  valid: boolean;
  authentic: boolean;
  status: string;
  severity?: string;
  title: string;
  message: string;
  action?: string;
  
  medicine?: Medicine;
  alerts?: AlertItem[];
  journey?: Journey;
  security?: Security;
  
  batch_info?: BatchInfo;
  contact?: Contact;
  warning?: string;
  batch_id?: string;
  blockchain_issue?: string;
}

// Stage icons mapping
const STAGE_ICONS: { [key: string]: any } = {
  "Manufactured": "construct",
  "Distribution Center": "car",
  "Warehouse Storage": "business",
  "Wholesaler": "cube",
  "Retail Pharmacy": "storefront",
  "Sold to Customer": "checkmark-done",
};

export default function VerifyScreen() {
  const { batch_id } = useLocalSearchParams<{ batch_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCounterfeit, setIsCounterfeit] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  
  // Report form fields
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [location, setLocation] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!batch_id) {
      setError("No batch ID provided");
      setLoading(false);
      return;
    }

    fetchVerification();
  }, [batch_id]);

  useEffect(() => {
    if (!loading && (data || isCounterfeit)) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, data, isCounterfeit]);

  const fetchVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsCounterfeit(false);
      const response = await verifyMedicine(batch_id);
      setData(response);
    } catch (err: any) {
      console.error("Verification error:", err);
      
      // Check if it's a 404 - counterfeit medicine
      if (err.response?.status === 404) {
        setIsCounterfeit(true);
        setError(null);
      } else {
        setError(err.message || "Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!reporterName.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }

    if (!reporterPhone.trim()) {
      Alert.alert("Required", "Please enter your phone number");
      return;
    }

    try {
      setReportSubmitting(true);

      const reportData = {
        batch_id: batch_id as string,
        reason: isCounterfeit 
          ? "Counterfeit - Batch not found in system" 
          : `Suspicious medicine - ${data?.status || "Unknown issue"}`,
        reporter_name: reporterName.trim(),
        reporter_phone: reporterPhone.trim(),
        reporter_email: reporterEmail.trim() || undefined,
        location: location.trim() || undefined,
        additional_details: additionalDetails.trim() || undefined,
      };

      const response = await reportSuspiciousMedicine(reportData);

      setShowReportModal(false);
      
      setReporterName("");
      setReporterPhone("");
      setReporterEmail("");
      setLocation("");
      setAdditionalDetails("");

      Alert.alert(
        "Report Submitted",
        `Thank you for reporting! DRAP has been notified.\n\nReport ID: ${response.report_id || "N/A"}`,
        [{ text: "OK" }]
      );
    } catch (err: any) {
      Alert.alert(
        "Submission Failed",
        err.response?.data?.detail || "Failed to submit report. Please contact DRAP at 051-9103200"
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={["#1e293b", "#334155"]} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Verifying Medicine...</Text>
          <Text style={styles.loadingSubtext}>Checking authenticity</Text>
        </LinearGradient>
      </View>
    );
  }

  // ===================================
  // 🚨 COUNTERFEIT ALERT (NOT FOUND)
  // ===================================
  if (isCounterfeit) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={["#881337", "#9f1239"]} style={styles.counterfeitContainer}>
          <TouchableOpacity style={styles.counterfeitBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.counterfeitContent}
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
              {/* Icon */}
              <View style={styles.counterfeitIconWrapper}>
                <View style={styles.counterfeitIconBg}>
                  <Ionicons name="warning-outline" size={64} color="#fff" />
                </View>
              </View>
              
              {/* Title */}
              <Text style={styles.counterfeitTitle}>SUSPICIOUS MEDICINE</Text>
              <Text style={styles.counterfeitSubtitle}>QR Code Not Registered</Text>
              
              {/* Main Warning Box */}
              <View style={styles.counterfeitWarningBox}>
                <View style={styles.counterfeitWarningHeader}>
                  <Ionicons name="shield-half-outline" size={24} color="#fff" />
                  <Text style={styles.counterfeitWarningTitle}>Not Found in System</Text>
                </View>
                <Text style={styles.counterfeitWarningText}>
                  This QR code does not exist in Pakistan's official medicine verification database.
                </Text>
              </View>

              {/* Danger Alert */}
              <View style={styles.counterfeitDangerBox}>
                <View style={styles.counterfeitDangerRow}>
                  <Ionicons name="alert-circle-outline" size={20} color="#fecaca" />
                  <Text style={styles.counterfeitDangerTitle}>Potential Risks</Text>
                </View>
                <Text style={styles.counterfeitDangerText}>
                  This medicine may be counterfeit, tampered with, or illegally imported. Using unverified medicine can be harmful to your health.
                </Text>
              </View>

              {/* Action Required */}
              <View style={styles.counterfeitActionsBox}>
                <Text style={styles.counterfeitActionsTitle}>⚠️ IMMEDIATE ACTION REQUIRED</Text>
                
                <View style={styles.counterfeitActionItem}>
                  <View style={styles.counterfeitActionDot} />
                  <Text style={styles.counterfeitActionText}>DO NOT consume this medicine</Text>
                </View>
                
                <View style={styles.counterfeitActionItem}>
                  <View style={styles.counterfeitActionDot} />
                  <Text style={styles.counterfeitActionText}>Keep the packaging and receipt</Text>
                </View>
                
                <View style={styles.counterfeitActionItem}>
                  <View style={styles.counterfeitActionDot} />
                  <Text style={styles.counterfeitActionText}>Report to DRAP immediately</Text>
                </View>
              </View>

              {/* DRAP Contact */}
              <View style={styles.counterfeitContactBox}>
                <Ionicons name="call-outline" size={20} color="#fff" />
                <View style={styles.counterfeitContactInfo}>
                  <Text style={styles.counterfeitContactLabel}>DRAP Hotline</Text>
                  <Text style={styles.counterfeitContactNumber}>051-9103200</Text>
                </View>
              </View>

              {/* Batch Info */}
              <View style={styles.counterfeitBatchBox}>
                <Text style={styles.counterfeitBatchLabel}>Scanned Batch ID</Text>
                <Text style={styles.counterfeitBatchId}>{batch_id}</Text>
              </View>

              {/* Buttons */}
              <TouchableOpacity 
                style={styles.counterfeitReportBtn}
                onPress={() => setShowReportModal(true)}
              >
                <Ionicons name="flag" size={20} color="#881337" />
                <Text style={styles.counterfeitReportBtnText}>Report to DRAP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.counterfeitSecondaryBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.counterfeitSecondaryBtnText}>Scan Another Medicine</Text>
              </TouchableOpacity>

              <Text style={styles.counterfeitFooter}>
                Powered by Blockchain Technology
              </Text>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Network Error State
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#94a3b8" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchVerification}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!data) return null;

  // Determine status
  const isAuthentic = data.valid && data.authentic && data.status === "VERIFIED";
  const isRecalled = data.status === "RECALLED";
  const isExpired = data.status === "EXPIRED";
  const isExhausted = data.status === "EXHAUSTED";
  const isInvalid = data.status === "BLOCKCHAIN_INVALID";
  const isNotFound = data.status === "NOT_FOUND";
  const isDangerous = isRecalled || isInvalid || isNotFound;

  // Header colors based on status
  const getHeaderColors = (): [string, string] => {
    if (isDangerous) return ["#b91c1c", "#991b1b"];
    if (isExpired || isExhausted) return ["#c2410c", "#9a3412"];
    if (isAuthentic) return ["#16a34a", "#15803d"];
    return ["#475569", "#334155"];
  };

  const getHeaderIcon = () => {
    if (isRecalled || isNotFound) return "warning";
    if (isInvalid) return "shield-half";
    if (isExpired) return "time";
    if (isExhausted) return "alert-circle";
    if (isAuthentic) return "shield-checkmark";
    return "help-circle";
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={getHeaderColors()} style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.resultIconContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons name={getHeaderIcon()} size={72} color="#fff" />
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.resultTitle}>{data.title}</Text>
            <Text style={styles.resultMessage}>{data.message}</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Critical Action Card */}
          {isDangerous && (
            <Animated.View style={[styles.criticalCard, { opacity: fadeAnim }]}>
              <View style={styles.criticalHeader}>
                <Ionicons name="warning" size={26} color="#fff" />
                <Text style={styles.criticalTitle}>Immediate Action Required</Text>
              </View>
              
              <Text style={styles.criticalMessage}>{data.action}</Text>

              {data.contact && (
                <View style={styles.contactCard}>
                  <Text style={styles.contactLabel}>DRAP Hotline</Text>
                  <Text style={styles.contactNumber}>{data.contact.drap_hotline}</Text>
                  {data.contact.emergency && (
                    <Text style={styles.contactEmergency}>{data.contact.emergency}</Text>
                  )}
                </View>
              )}
            </Animated.View>
          )}

          {/* Warning Card for Expired/Exhausted */}
          {(isExpired || isExhausted) && (
            <Animated.View style={[styles.warningCard, { opacity: fadeAnim }]}>
              <View style={styles.warningHeader}>
                <Ionicons name="alert-circle" size={24} color="#c2410c" />
                <Text style={styles.warningTitle}>Action Required</Text>
              </View>
              
              <Text style={styles.warningMessage}>{data.action}</Text>

              {data.contact && (
                <View style={styles.contactInfoSmall}>
                  <Ionicons name="call" size={16} color="#9a3412" />
                  <Text style={styles.contactInfoText}>DRAP: {data.contact.drap_hotline}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Alerts Section */}
          {data.alerts && data.alerts.length > 0 && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {data.alerts.map((alert, index) => (
                <View
                  key={index}
                  style={[
                    styles.alertCard,
                    alert.type === "critical" && styles.alertCritical,
                    alert.type === "warning" && styles.alertWarning,
                    alert.type === "info" && styles.alertInfo,
                  ]}
                >
                  <Ionicons
                    name={
                      alert.type === "critical"
                        ? "alert-circle"
                        : alert.type === "warning"
                        ? "warning"
                        : "information-circle"
                    }
                    size={20}
                    color={
                      alert.type === "critical"
                        ? "#b91c1c"
                        : alert.type === "warning"
                        ? "#c2410c"
                        : "#0284c7"
                    }
                  />
                  <Text style={styles.alertText}>{alert.message}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Medicine Details - Only for Authentic */}
          {isAuthentic && data.medicine && (
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="medical" size={22} color="#16a34a" />
                <Text style={styles.cardTitle}>Medicine Information</Text>
              </View>

              <View style={styles.infoGrid}>
                <InfoItem label="Medicine Name" value={data.medicine.name} />
                <InfoItem label="Batch ID" value={data.medicine.batch_id} mono />
                <InfoItem label="Manufacturer" value={data.medicine.manufacturer} />
                <InfoItem label="Manufactured" value={data.medicine.manufactured_on} />
                <InfoItem 
                  label="Expires On" 
                  value={data.medicine.expires_on}
                  highlight={data.medicine.days_until_expiry !== null && data.medicine.days_until_expiry <= 30}
                />
              </View>
            </Animated.View>
          )}

          {/* Batch Info for Error Cases */}
          {!isAuthentic && data.batch_info && (
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={22} color="#64748b" />
                <Text style={styles.cardTitle}>Batch Details</Text>
              </View>

              <View style={styles.infoGrid}>
                <InfoItem label="Batch ID" value={data.batch_info.batch_id} mono />
                <InfoItem label="Medicine Name" value={data.batch_info.name} />
                <InfoItem label="Manufacturer" value={data.batch_info.manufacturer} />
                
                {data.batch_info.expiry_date && (
                  <InfoItem 
                    label="Expired On" 
                    value={`${data.batch_info.expiry_date}${data.batch_info.days_expired ? ` (${data.batch_info.days_expired} days ago)` : ''}`}
                    highlight
                  />
                )}

                {data.batch_info.total_manufactured && (
                  <InfoItem 
                    label="Total Manufactured" 
                    value={`${data.batch_info.total_manufactured} units`}
                  />
                )}

                {data.batch_info.last_sale_date && (
                  <InfoItem 
                    label="Last Sale Date" 
                    value={data.batch_info.last_sale_date}
                  />
                )}
              </View>
            </Animated.View>
          )}

          {/* Supply Chain Journey - Only for Authentic */}
          {isAuthentic && data.journey && data.journey.steps.length > 0 && (
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="trail-sign" size={22} color="#0284c7" />
                <Text style={styles.cardTitle}>Supply Chain Journey</Text>
              </View>

              <Text style={styles.journeySubtitle}>
                Verified through {data.journey.total_steps} supply chain steps
              </Text>

              <View style={styles.journeyTimeline}>
                {data.journey.steps.map((step, index) => (
                  <View key={step.step} style={styles.timelineItem}>
                    <View style={styles.timelineTrack}>
                      <View style={styles.timelineDot}>
                        <Ionicons
                          name={STAGE_ICONS[step.stage] || "ellipse"}
                          size={14}
                          color="#fff"
                        />
                      </View>
                      {index < data.journey!.steps.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStage}>{step.stage}</Text>
                      <Text style={styles.timelineLocation}>{step.location}</Text>
                      <Text style={styles.timelineDate}>{step.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Security Badge - Only for Authentic */}
          {isAuthentic && data.security && (
            <Animated.View style={[styles.securityBadge, { opacity: fadeAnim }]}>
              <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityText}>Blockchain Verified</Text>
                <Text style={styles.securitySubtext}>
                  Verified on {data.security.verified_at}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Ionicons name="qr-code" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Scan Another</Text>
            </TouchableOpacity>

            {!isAuthentic && (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => setShowReportModal(true)}
              >
                <Ionicons name="flag" size={20} color="#fff" />
                <Text style={styles.dangerButtonText}>Report to DRAP</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Blockchain Technology
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report to DRAP</Text>
              <TouchableOpacity
                onPress={() => setShowReportModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Help protect public health by reporting suspicious medicine.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Your Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={reporterName}
                  onChangeText={setReporterName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={reporterPhone}
                  onChangeText={setReporterPhone}
                  placeholder="03XX-XXXXXXX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={reporterEmail}
                  onChangeText={setReporterEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Area"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Details (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={additionalDetails}
                  onChangeText={setAdditionalDetails}
                  placeholder="Where did you purchase this? Any other information..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.reportInfo}>
                <Ionicons name="information-circle" size={18} color="#0284c7" />
                <Text style={styles.reportInfoText}>
                  Reporting Batch: <Text style={styles.reportInfoBold}>{batch_id}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, reportSubmitting && styles.submitButtonDisabled]}
                onPress={handleReportSubmit}
                disabled={reportSubmitting}
              >
                {reportSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper Component for Info Items
function InfoItem({ 
  label, 
  value, 
  mono = false, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  mono?: boolean; 
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[
        styles.infoValue,
        mono && styles.infoValueMono,
        highlight && styles.infoValueHighlight
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  resultIconContainer: {
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  content: {
    padding: 16,
    marginTop: -16,
  },
  criticalCard: {
    backgroundColor: "#991b1b",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  criticalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  criticalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  criticalMessage: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 20,
    marginBottom: 14,
  },
  contactCard: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  contactNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  contactEmergency: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    textAlign: "center",
  },
  warningCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#c2410c",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9a3412",
  },
  warningMessage: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
    marginBottom: 10,
  },
  contactInfoSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#fed7aa",
  },
  contactInfoText: {
    fontSize: 13,
    color: "#9a3412",
    fontWeight: "600",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  alertCritical: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#b91c1c",
  },
  alertWarning: {
    backgroundColor: "#fff7ed",
    borderLeftWidth: 3,
    borderLeftColor: "#c2410c",
  },
  alertInfo: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
  },
  alertText: {
    fontSize: 13,
    color: "#1e293b",
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
  },
  infoValueMono: {
    fontFamily: "monospace",
  },
  infoValueHighlight: {
    color: "#c2410c",
  },
  journeySubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 14,
  },
  journeyTimeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineTrack: {
    alignItems: "center",
    marginRight: 14,
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 3,
  },
  timelineLocation: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 14,
    borderRadius: 10,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  securityInfo: {
    flex: 1,
  },
  securityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#15803d",
  },
  securitySubtext: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 2,
  },
  actionButtons: {
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b91c1c",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalClose: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 18,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  formTextArea: {
    height: 90,
    paddingTop: 12,
  },
  reportInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
    gap: 8,
  },
  reportInfoText: {
    fontSize: 13,
    color: "#075985",
    flex: 1,
  },
  reportInfoBold: {
    fontWeight: "700",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b91c1c",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  
  // ===================================
  // 🚨 COUNTERFEIT ALERT STYLES
  // ===================================
  counterfeitContainer: {
    flex: 1,
  },
  counterfeitBackBtn: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  counterfeitContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  counterfeitIconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  counterfeitIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterfeitTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  counterfeitSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 24,
  },
  counterfeitWarningBox: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  counterfeitWarningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  counterfeitWarningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  counterfeitWarningText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  counterfeitDangerBox: {
    backgroundColor: "rgba(254,202,202,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(254,202,202,0.3)",
  },
  counterfeitDangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  counterfeitDangerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fecaca",
  },
  counterfeitDangerText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 19,
  },
  counterfeitActionsBox: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  counterfeitActionsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counterfeitActionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  counterfeitActionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginTop: 6,
  },
  counterfeitActionText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 19,
  },
  counterfeitContactBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  counterfeitContactInfo: {
    flex: 1,
  },
  counterfeitContactLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 3,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  counterfeitContactNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  counterfeitBatchBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
  },
  counterfeitBatchLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  counterfeitBatchId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  counterfeitReportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  counterfeitReportBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#881337",
  },
  counterfeitSecondaryBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 24,
  },
  counterfeitSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  counterfeitFooter: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});