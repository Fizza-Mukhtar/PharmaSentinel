// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:8000/api/";

// === AXIOS INSTANCE ===
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === REQUEST INTERCEPTOR: Attach access token ===
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === RESPONSE INTERCEPTOR: Handle token expiry ===
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.refresh) {
        try {
          const res = await axios.post(`${API_URL}token/refresh/`, {
            refresh: user.refresh,
          });

          const updatedUser = { ...user, access: res.data.access };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("user");
          window.location.href = "/";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// === LOGIN USER ===
export const loginUser = async (username, password) => {
  try {
    const res = await api.post("login/", { username, password });
    if (res.data.access && res.data.user) {
      const userData = {
        ...res.data.user,
        access: res.data.access,
        refresh: res.data.refresh,
      };
      localStorage.setItem("user", JSON.stringify(userData));
    }
    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data);
    throw error.response?.data || { detail: "Login failed" };
  }
};

// === REGISTER USER ===
export const registerUser = async (userData) => {
  try {
    const res = await api.post("register/", userData);
    return res.data;
  } catch (error) {
    console.error("Register error:", error.response?.data);
    throw error.response?.data || { detail: "Registration failed" };
  }
};

// === GET ALL USERS ===
export const getAllUsers = async () => {
  try {
    const res = await api.get("users/");
    return res.data;
  } catch (error) {
    console.error("Get users error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch users" };
  }
};

// === UPDATE USER ===
export const updateUser = async (userId, userData) => {
  try {
    const res = await api.put(`users/${userId}/`, userData);
    return res.data;
  } catch (error) {
    console.error("Update user error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to update user" };
  }
};

// === DELETE USER ===
export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`users/${userId}/`);
    return res.data;
  } catch (error) {
    console.error("Delete user error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to delete user" };
  }
};

// === LOGOUT USER ===
export const logoutUser = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};


// ==================== MEDICINE BATCH APIs ====================

// Get Manufacturer Dashboard Data
export const getManufacturerDashboard = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`manufacturer_dashboard/?${params}`);
    return res.data;
  } catch (error) {
    console.error("Dashboard error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch dashboard" };
  }
};

// Create New Batch
export const createBatch = async (batchData) => {
  try {
    const res = await api.post("add_batch/", batchData);
    return res.data;
  } catch (error) {
    console.error("Create batch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to create batch" };
  }
};

// View All Batches
export const viewBatches = async () => {
  try {
    const res = await api.get("view_batches/");
    return res.data;
  } catch (error) {
    console.error("View batches error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch batches" };
  }
};

// Transfer Batch
export const transferBatch = async (transferData) => {
  try {
    const res = await api.post("transfer_batch/", transferData);
    return res.data;
  } catch (error) {
    console.error("Transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to transfer batch" };
  }
};

// Verify Blockchain
export const verifyBlockchain = async (batchId) => {
  try {
    const res = await api.get(`verify_batch/${batchId}/`);
    return res.data;
  } catch (error) {
    console.error("Verify error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to verify blockchain" };
  }
};

// Export Batches CSV
export const exportBatchesCSV = async () => {
  try {
    const res = await api.get("export_batches_csv/", {
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    console.error("Export error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to export CSV" };
  }
};

// Get Blockchain History
export const getBlockchainHistory = async (batchId) => {
  try {
    const res = await api.get(`blockchain/history/${batchId}/`);
    return res.data;
  } catch (error) {
    console.error("Blockchain history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch blockchain history" };
  }
};

export default api;