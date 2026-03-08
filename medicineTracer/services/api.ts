import axios from "axios";

// ===================================
// BASE URL CONFIGURATION
// ===================================
const API_BASE_URL = "http://192.168.100.100:8000"; // Replace with your server IP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===================================
// VERIFY MEDICINE - PUBLIC ENDPOINT
// ===================================
export const verifyMedicine = async (batchId: string) => {
  try {
    const response = await api.get(`/medicine/api/verify_batch/${batchId}/`);
    return response.data;
  } catch (error: any) {
    // If 404, the batch doesn't exist - API returns structured error
    if (error.response?.status === 404) {
      return error.response.data; // Return the structured error response
    }
    throw error;
  }
};

// ===================================
// REPORT SUSPICIOUS MEDICINE
// ===================================
export const reportSuspiciousMedicine = async (reportData: {
  batch_id: string;
  reason: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_email?: string;
  location?: string;
  additional_details?: string;
}) => {
  try {
    const response = await api.post(
      "/medicine/api/customer/report-suspicious/",
      reportData
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export default api;