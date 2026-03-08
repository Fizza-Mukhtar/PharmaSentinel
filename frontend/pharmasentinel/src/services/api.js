// src/services/api.js - IMPROVED VERSION WITH ALL SHOPKEEPER ENDPOINTS
import axios from "axios";

const API_URL = "http://192.168.100.100:8000/"; // Base URL of your backend

// =======================
// AXIOS INSTANCE
// =======================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =======================
// REQUEST INTERCEPTOR (Attach JWT Access Token)
// =======================
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =======================
// RESPONSE INTERCEPTOR (Handle Token Refresh)
// =======================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.refresh) {
        try {
          const res = await axios.post(`${API_URL}api/token/refresh/`, {
            refresh: user.refresh,
          });

          const updatedUser = { ...user, access: res.data.access };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// =======================
// HELPER FUNCTION FOR CSV DOWNLOADS
// =======================
const downloadCSV = async (endpoint, filename) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.access;
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`📥 Downloading CSV from: ${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ CSV Download Error Response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to download'}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`✅ CSV downloaded successfully: ${filename}`);
    return { success: true, message: `${filename} downloaded successfully` };
  } catch (error) {
    console.error("❌ CSV Download error:", error);
    throw { detail: error.message || "Failed to download CSV" };
  }
};

// =========================================================
// 🔐 AUTH APIs
// =========================================================

// LOGIN USER
export const loginUser = async (username, password) => {
  try {
    const res = await api.post("api/login/", { username, password });

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

// REGISTER USER (Admin creates users)
export const registerUser = async (userData) => {
  try {
    const res = await api.post("api/register/", userData);
    return res.data;
  } catch (error) {
    console.error("Register error:", error.response?.data);
    throw error.response?.data || { detail: "Registration failed" };
  }
};

// GET ALL USERS
export const getAllUsers = async () => {
  try {
    const res = await api.get("api/users/");
    return res.data;
  } catch (error) {
    console.error("Get users error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch users" };
  }
};

// UPDATE USER
export const updateUser = async (userId, userData) => {
  try {
    const res = await api.put(`api/users/${userId}/`, userData);
    return res.data;
  } catch (error) {
    console.error("Update user error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to update user" };
  }
};

// DELETE USER
export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`api/users/${userId}/`);
    return res.data;
  } catch (error) {
    console.error("Delete user error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to delete user" };
  }
};

// LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// =========================================================
// 🧪 MANUFACTURER APIs
// =========================================================

// Create new batch
export const createBatch = async (batchData) => {
  try {
    console.log("🔨 Creating new batch:", batchData.batch_id);
    const res = await api.post("medicine/api/add_batch/", batchData);
    console.log("✅ Batch created successfully:", res.data.batch_id);
    return res.data;
  } catch (error) {
    console.error("❌ Create batch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to create batch" };
  }
};

// Manufacturer Dashboard Stats with Filters
export const fetchDashboardStats = async (queryParams = "") => {
  try {
    const url = queryParams 
      ? `medicine/api/manufacturer_dashboard/?${queryParams}`
      : "medicine/api/manufacturer_dashboard/";
    
    console.log("🔍 Fetching dashboard with URL:", url);
    const res = await api.get(url, { withCredentials: true });
    console.log("✅ Dashboard data received");
    return res.data;
  } catch (error) {
    console.error("❌ Dashboard fetch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch dashboard stats" };
  }
};

// List all batches
export const fetchBatches = async () => {
  try {
    console.log("📦 Fetching manufacturer batches");
    const res = await api.get("medicine/api/view_batches/");
    console.log(`✅ Fetched ${res.data.batches?.length || 0} batches`);
    return res.data.batches || res.data;
  } catch (error) {
    console.error("❌ Fetch batches error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch batches" };
  }
};

// Transfer batch (Generic - works for all roles)
export const transferBatch = async (transferData) => {
  try {
    console.log("📤 Transferring batch:", transferData.batch_id);
    const res = await api.post("medicine/api/transfer_batch/", transferData);
    console.log("✅ Batch transfer initiated");
    return res.data;
  } catch (error) {
    console.error("❌ Transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Transfer failed" };
  }
};

// Verify specific batch
export const verifyBatch = async (batchId) => {
  try {
    console.log("🔍 Verifying batch:", batchId);
    const res = await api.get(`medicine/api/verify_batch/${batchId}/`);
    console.log("✅ Batch verification complete");
    return res.data;
  } catch (error) {
    console.error("❌ Verify batch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to verify batch" };
  }
};


// Export Manufacturer Batches CSV
export const exportBatchesCSV = async () => {
  return downloadCSV(
    'medicine/api/export_batches_csv/',
    `manufacturer_batches_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// =========================================================
// 🔗 BLOCKCHAIN APIs
// =========================================================

export const verifyBatchPublic = async (batchId) => {
  try {
    console.log("🔗 Public blockchain verification:", batchId);
    const res = await api.get(`api/blockchain/verify/${batchId}/`);
    return res.data;
  } catch (error) {
    console.error("❌ Verify blockchain error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to verify blockchain" };
  }
};

export const getAdminChainTrail = async (batchId) => {
  try {
    console.log("🔗 Fetching admin chain trail:", batchId);
    const res = await api.get(`api/blockchain/admin-trail/${batchId}/`);
    return res.data;
  } catch (error) {
    console.error("❌ Get chain trail error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to get chain trail" };
  }
};

export const getBatchHistory = async (batchId) => {
  try {
    console.log("📜 Fetching batch history:", batchId);
    const res = await api.get(`api/blockchain/history/${batchId}/`);
    return res.data;
  } catch (error) {
    console.error("❌ Get batch history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to get batch history" };
  }
};

// Fetch batch details
export const fetchBatchDetails = async (batchId) => {
  try {
    console.log("🔍 Fetching batch details:", batchId);
    const res = await api.get(`medicine/api/batches/${batchId}/`);
    console.log("✅ Batch details fetched");
    return res.data;
  } catch (error) {
    console.error("❌ Fetch batch details error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch batch details" };
  }
};

// List all batches (general)
export const listAllBatches = async () => {
  try {
    console.log("📦 Fetching all batches");
    const res = await api.get("medicine/api/listbatches/");
    return res.data;
  } catch (error) {
    console.error("❌ List batches error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to list batches" };
  }
};

// =========================================================
// 🚚 DISTRIBUTOR APIs
// =========================================================

// Get Distributor Stats
export const getDistributorStats = async () => {
  try {
    console.log("📊 Fetching distributor stats");
    try {
      const res = await api.get("medicine/api/distributor/report/");
      console.log("✅ Distributor report fetched");
      return res.data;
    } catch (errReport) {
      console.warn("⚠️ distributor/report failed, trying dashboard", errReport?.response?.status);
      const res2 = await api.get("medicine/api/distributor/dashboard/");
      console.log("✅ Distributor dashboard fetched");
      return res2.data;
    }
  } catch (error) {
    console.error("❌ getDistributorStats error:", error?.response?.data);
    throw error?.response?.data || { detail: "Failed to fetch distributor stats" };
  }
};

// Get Incoming Batches
export const getDistributorIncoming = async () => {
  try {
    console.log("📥 Fetching distributor incoming batches");
    const res = await api.get("medicine/api/distributor/incoming/");
    console.log(`✅ Fetched ${res.data.count} incoming batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get distributor incoming error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch incoming batches" };
  }
};

// Confirm Receive Batch
export const confirmDistributorReceive = async (transferId) => {
  try {
    console.log("✅ Confirming distributor receive:", transferId);
    const res = await api.post("medicine/api/distributor/confirm-receive/", {
      transfer_id: transferId,
    });
    console.log("✅ Batch received successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Confirm distributor receive error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to confirm receipt" };
  }
};

// Get Distributor Inventory
export const getDistributorInventory = async () => {
  try {
    console.log("📦 Fetching distributor inventory");
    const res = await api.get("medicine/api/distributor/inventory/");
    console.log(`✅ Fetched ${res.data.total_batches} batches in inventory`);
    return res.data;
  } catch (error) {
    console.error("❌ Get distributor inventory error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch inventory" };
  }
};

// Get Distributor Notifications
export const getDistributorNotifications = async () => {
  try {
    console.log("🔔 Fetching distributor notifications");
    const res = await api.get("medicine/api/distributor/notifications/");
    console.log(`✅ Fetched ${res.data.count} notifications`);
    return res.data;
  } catch (error) {
    console.error("❌ Get distributor notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Get Distributor Report
export const getDistributorReport = async () => {
  try {
    console.log("📊 Fetching distributor report");
    const res = await api.get("medicine/api/distributor/report/");
    console.log("✅ Distributor report fetched");
    return res.data;
  } catch (error) {
    console.error("❌ Get distributor report error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch report" };
  }
};

// Get Transfer History
export const getDistributorTransferHistory = async () => {
  try {
    console.log("📜 Fetching distributor transfer history");
    const res = await api.get("medicine/api/distributor/history-transfer/");
    console.log(`✅ Fetched ${res.data.count} transfers`);
    return res.data;
  } catch (error) {
    console.error("❌ Get distributor transfer history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch transfer history" };
  }
};


export const getManufacturerTransfers = async () => {
  try {
    console.log("📜 Fetching manufacturer transfer history");
    const res = await api.get("medicine/api/transfers/");
    console.log(`✅ Fetched ${res.data.count} transfers`);
    return res.data;
  } catch (error) {
    console.error("❌ Get manufacturer transfer history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch transfer history" };
  }
};


// Get Manufacturer Notifications
export const getManufacturerNotifications = async () => {
  try {
    console.log("🔔 Fetching manufacturer notifications");
    const res = await api.get("medicine/api/manufacturer/notifications/");
    console.log(`✅ Fetched ${res.data.count} notifications`);
    return res.data;
  } catch (error) {
    console.error("❌ Get manufacturer notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};


// Get Warehouse Users for Transfer
export const getWarehouseUsersForDistributor = async () => {
  try {
    console.log("👥 Fetching warehouse users");
    const res = await api.get("medicine/api/distributor/warehouse-users/");
    console.log(`✅ Fetched ${res.data.count} warehouse users`);
    return res.data.warehouse_users || [];
  } catch (error) {
    console.error("❌ Get warehouse users error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch warehouse users" };
  }
};

// Transfer to Warehouse
export const transferToWarehouse = async (transferData) => {
  try {
    console.log("📤 Transferring to warehouse:", transferData);
    const res = await api.post("medicine/api/distributor/transfer-to-warehouse/", transferData);
    console.log("✅ Transfer to warehouse initiated");
    return res.data;
  } catch (error) {
    console.error("❌ Transfer to warehouse error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to transfer to warehouse" };
  }
};

// Reject Batch (Generic)
export const rejectBatch = async (transferId, reason = "") => {
  try {
    console.log(`❌ Rejecting transfer ${transferId}`);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = (user?.role || "").toUpperCase();

    const map = {
      DISTRIBUTOR: "medicine/api/distributor/reject-transfer/",
      WAREHOUSE: "medicine/api/warehouse/reject-transfer/",
      WHOLESALER: "medicine/api/wholesaler/reject-transfer/",
      SHOPKEEPER: "medicine/api/shopkeeper/reject-transfer/",
    };

    const endpoint = map[role] || "medicine/api/distributor/reject-transfer/";
    const payload = { transfer_id: transferId };
    if (reason) payload.reason = reason;

    const res = await api.post(endpoint, payload);
    console.log("✅ Transfer rejected successfully");
    return res.data;
  } catch (error) {
    console.error("❌ rejectBatch error:", error?.response?.data);
    throw error?.response?.data || { detail: "Failed to reject transfer" };
  }
};

// Export Distributor CSV Reports
export const exportDistributorIncomingCSV = async () => {
  return downloadCSV(
    'medicine/api/distributor/export/incoming/',
    `distributor_incoming_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportDistributorOutgoingCSV = async () => {
  return downloadCSV(
    'medicine/api/distributor/export/outgoing/',
    `distributor_outgoing_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportDistributorExpiredCSV = async () => {
  return downloadCSV(
    'medicine/api/distributor/export/expired/',
    `distributor_expired_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportDistributorInventoryCSV = async () => {
  return downloadCSV(
    'medicine/api/distributor/export/inventory/',
    `distributor_inventory_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// =========================================================
// 🏭 WAREHOUSE APIs
// =========================================================

// Get Warehouse Dashboard Stats
export const getWarehouseStats = async () => {
  try {
    console.log("📊 Fetching warehouse stats");
    const res = await api.get("medicine/api/warehouse/report/");
    console.log("✅ Warehouse stats fetched");
    return res.data;
  } catch (error) {
    console.error("❌ Get warehouse stats error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch warehouse stats" };
  }
};

// Get Incoming Batches
export const getIncomingBatches = async () => {
  try {
    console.log("📥 Fetching warehouse incoming batches");
    const res = await api.get("medicine/api/warehouse/incoming/");
    console.log(`✅ Fetched ${res.data.count} incoming batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get incoming batches error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch incoming batches" };
  }
};

// Confirm Receive Batch
export const confirmReceiveBatch = async (transferId) => {
  try {
    console.log("✅ Confirming warehouse receive:", transferId);
    const res = await api.post("medicine/api/warehouse/confirm-receive/", {
      transfer_id: transferId,
    });
    console.log("✅ Batch received by warehouse");
    return res.data;
  } catch (error) {
    console.error("❌ Confirm receive error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to confirm receipt" };
  }
};

// Get Warehouse Inventory
export const getWarehouseInventory = async () => {
  try {
    console.log("📦 Fetching warehouse inventory");
    const res = await api.get("medicine/api/warehouse/inventory/");
    console.log(`✅ Fetched ${res.data.total_batches} batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get warehouse inventory error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch inventory" };
  }
};

// Get Warehouse Notifications
export const getWarehouseNotifications = async () => {
  try {
    console.log("🔔 Fetching warehouse notifications");
    const res = await api.get("medicine/api/warehouse/notifications/");
    console.log(`✅ Fetched ${res.data.count} notifications`);
    return res.data;
  } catch (error) {
    console.error("❌ Get warehouse notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Get Warehouse Transfer History
export const getWarehouseTransferHistory = async () => {
  try {
    console.log("📜 Fetching warehouse transfer history");
    const res = await api.get("medicine/api/warehouse/history-transfer/");
    console.log(`✅ Fetched ${res.data.count} transfers`);
    return res.data;
  } catch (error) {
    console.error("❌ Get warehouse transfer history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch transfer history" };
  }
};

// Get Wholesaler Users for Transfer Dropdown
export const getWholesalerUsers = async () => {
  try {
    console.log("👥 Fetching wholesaler users");
    const res = await api.get("medicine/api/warehouse/wholesaler-users/");
    console.log(`✅ Fetched ${res.data.count} wholesaler users`);
    return res.data.wholesaler_users || [];
  } catch (error) {
    console.error("❌ Get wholesalers error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch wholesalers" };
  }
};

// Transfer to Wholesaler
export const transferToWholesaler = async (transferData) => {
  try {
    console.log("📤 Transferring to wholesaler:", transferData);
    const res = await api.post("medicine/api/warehouse/transfer-to-wholesaler/", transferData);
    console.log("✅ Transfer to wholesaler initiated");
    return res.data;
  } catch (error) {
    console.error("❌ Transfer to wholesaler error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to transfer to wholesaler" };
  }
};

// Export Warehouse CSV Reports
export const exportWarehouseInventoryCSV = async () => {
  return downloadCSV(
    'medicine/api/warehouse/export/inventory/',
    `warehouse_inventory_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWarehouseIncomingCSV = async () => {
  return downloadCSV(
    'medicine/api/warehouse/export/incoming/',
    `warehouse_incoming_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWarehouseOutgoingCSV = async () => {
  return downloadCSV(
    'medicine/api/warehouse/export/outgoing/',
    `warehouse_outgoing_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWarehouseExpiredCSV = async () => {
  return downloadCSV(
    'medicine/api/warehouse/export/expired/',
    `warehouse_expired_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// =========================================================
// 🏬 WHOLESALER APIs
// =========================================================

// Get Wholesaler Stats
export const getWholesalerStats = async () => {
  try {
    console.log("📊 Fetching wholesaler stats");
    const res = await api.get("medicine/api/wholesaler/report/");
    console.log("✅ Wholesaler stats fetched");
    return res.data;
  } catch (error) {
    console.error("❌ Get wholesaler stats error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch wholesaler stats" };
  }
};

// Get Incoming Transfer Requests
export const getWholesalerIncoming = async () => {
  try {
    console.log("📥 Fetching wholesaler incoming batches");
    const res = await api.get("medicine/api/wholesaler/incoming/");
    console.log(`✅ Fetched ${res.data.count} incoming batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get wholesaler incoming error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch incoming batches" };
  }
};

// Accept Transfer
export const acceptWholesalerTransfer = async (transferId) => {
  try {
    console.log("✅ Accepting wholesaler transfer:", transferId);
    const res = await api.post("medicine/api/wholesaler/accept-transfer/", {
      transfer_id: transferId
    });
    console.log("✅ Transfer accepted successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Accept wholesaler transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to accept transfer" };
  }
};

// Reject Transfer
export const rejectWholesalerTransfer = async (transferId, reason) => {
  try {
    console.log("❌ Rejecting wholesaler transfer:", transferId);
    const res = await api.post("medicine/api/wholesaler/reject-transfer/", {
      transfer_id: transferId,
      reason: reason
    });
    console.log("✅ Transfer rejected successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Reject wholesaler transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to reject transfer" };
  }
};

// Get Wholesaler Inventory
export const getWholesalerInventory = async () => {
  try {
    console.log("📦 Fetching wholesaler inventory");
    const res = await api.get("medicine/api/wholesaler/inventory/");
    console.log(`✅ Fetched ${res.data.total_batches} batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get wholesaler inventory error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch inventory" };
  }
};

// Get Wholesaler Notifications
export const getWholesalerNotifications = async () => {
  try {
    console.log("🔔 Fetching wholesaler notifications");
    const res = await api.get("medicine/api/wholesaler/notifications/");
    console.log(`✅ Fetched ${res.data.count} notifications`);
    return res.data;
  } catch (error) {
    console.error("❌ Get wholesaler notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Get Wholesaler Transfer History
export const getWholesalerTransferHistory = async () => {
  try {
    console.log("📜 Fetching wholesaler transfer history");
    const res = await api.get("medicine/api/wholesaler/history-transfer/");
    console.log(`✅ Fetched ${res.data.count} transfers`);
    return res.data;
  } catch (error) {
    console.error("❌ Get wholesaler transfer history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch transfer history" };
  }
};

// Get Shopkeeper Users
export const getShopkeeperUsers = async () => {
  try {
    console.log("👥 Fetching shopkeeper users");
    const res = await api.get("medicine/api/wholesaler/shopkeeper-users/");
    console.log(`✅ Fetched ${res.data.count} shopkeeper users`);
    return res.data.shopkeeper_users || [];
  } catch (error) {
    console.error("❌ Get shopkeeper users error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch shopkeeper users" };
  }
};

// Transfer to Shopkeeper
export const transferToShopkeeper = async (transferData) => {
  try {
    console.log("📤 Transferring to shopkeeper:", transferData);
    const res = await api.post("medicine/api/wholesaler/transfer-to-shopkeeper/", transferData);
    console.log("✅ Transfer to shopkeeper initiated");
    return res.data;
  } catch (error) {
    console.error("❌ Transfer to shopkeeper error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to transfer to shopkeeper" };
  }
};

// Export Wholesaler CSV Reports
export const exportWholesalerIncomingCSV = async () => {
  return downloadCSV(
    'medicine/api/wholesaler/export/incoming/',
    `wholesaler_incoming_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWholesalerOutgoingCSV = async () => {
  return downloadCSV(
    'medicine/api/wholesaler/export/outgoing/',
    `wholesaler_outgoing_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWholesalerExpiredCSV = async () => {
  return downloadCSV(
    'medicine/api/wholesaler/export/expired/',
    `wholesaler_expired_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportWholesalerInventoryCSV = async () => {
  return downloadCSV(
    'medicine/api/wholesaler/export/inventory/',
    `wholesaler_inventory_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// =========================================================
// 🏪 SHOPKEEPER APIs (COMPLETE & FIXED)
// =========================================================

// Get Shopkeeper Dashboard Stats
export const getShopkeeperDashboard = async () => {
  try {
    console.log("📊 Fetching shopkeeper dashboard");
    const res = await api.get("medicine/api/shopkeeper/dashboard/");
    console.log("✅ Dashboard data fetched");
    return res.data;
  } catch (error) {
    console.error("❌ Get shopkeeper dashboard error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch dashboard" };
  }
};

// Get Incoming Transfer Requests from Wholesaler
export const getShopkeeperIncoming = async () => {
  try {
    console.log("📥 Fetching shopkeeper incoming batches");
    const res = await api.get("medicine/api/shopkeeper/incoming/");
    console.log(`✅ Fetched ${res.data.count} incoming batches`);
    return res.data;
  } catch (error) {
    console.error("❌ Get shopkeeper incoming error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch incoming requests" };
  }
};

// Accept Transfer from Wholesaler
export const shopkeeperAcceptTransfer = async (transferId) => {
  try {
    console.log("✅ Accepting shopkeeper transfer:", transferId);
    const res = await api.post("medicine/api/shopkeeper/accept-transfer/", {
      transfer_id: transferId
    });
    console.log("✅ Transfer accepted successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Accept transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to accept transfer" };
  }
};

// Reject Transfer from Wholesaler
export const shopkeeperRejectTransfer = async (transferId, reason) => {
  try {
    console.log("❌ Rejecting shopkeeper transfer:", transferId);
    const res = await api.post("medicine/api/shopkeeper/reject-transfer/", {
      transfer_id: transferId,
      reason: reason
    });
    console.log("✅ Transfer rejected successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Reject transfer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to reject transfer" };
  }
};

// Get Shopkeeper Inventory
export const getShopkeeperInventory = async () => {
  try {
    console.log("📦 Fetching shopkeeper inventory");
    const res = await api.get("medicine/api/shopkeeper/inventory/");
    console.log(`✅ Fetched inventory data`);
    return res.data;
  } catch (error) {
    console.error("❌ Get shopkeeper inventory error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch inventory" };
  }
};

// Sell Medicine to Customer (Mark as SOLD)
export const shopkeeperSellMedicine = async (batchId, quantity, customerName = "") => {
  try {
    console.log("💰 Selling medicine:", batchId);
    const res = await api.post("medicine/api/shopkeeper/sell-medicine/", {
      batch_id: batchId,
      quantity: quantity,
      customer_name: customerName
    });
    console.log("✅ Sale recorded successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Sell medicine error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to sell medicine" };
  }
};

// Get Sales History
export const getShopkeeperSalesHistory = async () => {
  try {
    console.log("📊 Fetching shopkeeper sales history");
    const res = await api.get("medicine/api/shopkeeper/sales-history/");
    console.log(`✅ Fetched ${res.data.count} sales`);
    return res.data;
  } catch (error) {
    console.error("❌ Get sales history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch sales history" };
  }
};

// Get Transfer History
export const getShopkeeperTransferHistory = async () => {
  try {
    console.log("📜 Fetching shopkeeper transfer history");
    const res = await api.get("medicine/api/shopkeeper/transfer-history/");
    console.log(`✅ Fetched ${res.data.count} transfers`);
    return res.data;
  } catch (error) {
    console.error("❌ Get transfer history error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch transfer history" };
  }
};

// Get Shopkeeper Notifications
export const getShopkeeperNotifications = async () => {
  try {
    console.log("🔔 Fetching shopkeeper notifications");
    const res = await api.get("medicine/api/shopkeeper/notifications/");
    console.log(`✅ Fetched ${res.data.count} notifications`);
    return res.data;
  } catch (error) {
    console.error("❌ Get shopkeeper notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Get Shopkeeper Report
export const getShopkeeperReport = async () => {
  try {
    console.log("📊 Fetching shopkeeper report");
    const res = await api.get("medicine/api/shopkeeper/report/");
    console.log("✅ Report fetched successfully");
    return res.data;
  } catch (error) {
    console.error("❌ Get shopkeeper report error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch report" };
  }
};


// =========================================================
// 🏪 SHOPKEEPER CSV EXPORT APIs (COMPLETE & FIXED)
// =========================================================

// Export Shopkeeper Inventory CSV
export const exportShopkeeperInventoryCSV = async () => {
  return downloadCSV(
    'medicine/api/shopkeeper/export/inventory/',
    `shopkeeper_inventory_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// Export Shopkeeper Sales History CSV
export const exportShopkeeperSalesCSV = async () => {
  return downloadCSV(
    'medicine/api/shopkeeper/export/sales/',
    `shopkeeper_sales_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// Export Shopkeeper Incoming Transfers CSV
export const exportShopkeeperIncomingCSV = async () => {
  return downloadCSV(
    'medicine/api/shopkeeper/export/incoming/',
    `shopkeeper_incoming_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// Export Shopkeeper Expired Medicines CSV
export const exportShopkeeperExpiredCSV = async () => {
  return downloadCSV(
    'medicine/api/shopkeeper/export/expired/',
    `shopkeeper_expired_${new Date().toISOString().split('T')[0]}.csv`
  );
};

// =========================================================
// 🔍 CUSTOMER VERIFICATION (PUBLIC - NO AUTH)
// =========================================================

// Verify Medicine for Customer (Public Endpoint)
export const verifyMedicineForCustomer = async (batchId) => {
  try {
    console.log("🔍 Customer verifying medicine:", batchId);
    const res = await axios.get(`${API_URL}medicine/api/verify-medicine/${batchId}/`);
    console.log("✅ Medicine verified");
    return res.data;
  } catch (error) {
    console.error("❌ Verify medicine error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to verify medicine" };
  }
};


// Helper function to get auth header
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    headers: {
      'Authorization': `Bearer ${user?.access}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getDrapDashboard = async () => {
  try {
    const res = await api.get("medicine/api/drap/drapdashboard/");
    return res.data;
  } catch (error) {
    console.error("Get DRAP dashboard error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch dashboard" };
  }
};

// Manufacturers
export const getDrapManufacturers = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/manufacturers/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get manufacturers error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch manufacturers" };
  }
};

export const getDrapManufacturerDetail = async (manufacturerId) => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/manufacturers/${manufacturerId}/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get manufacturer detail error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch manufacturer details" };
  }
};

export const blockManufacturer = async (manufacturerId) => {
  try {
    const res = await axios.post(
      `${API_URL}medicine/api/drap/manufacturers/${manufacturerId}/block/`,
      {},
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Block manufacturer error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to block manufacturer" };
  }
};

// Batches
export const getDrapBatches = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_URL}medicine/api/drap/batches/${params ? '?' + params : ''}`;
    const res = await axios.get(url, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error("Get batches error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch batches" };
  }
};

export const getDrapBatchDetail = async (batchId) => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/batches/${batchId}/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get batch detail error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch batch details" };
  }
};

export const validateBatchBlockchain = async (batchId) => {
  try {
    const res = await axios.post(
      `${API_URL}medicine/api/drap/batches/${batchId}/validate/`,
      {},
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Validate blockchain error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to validate blockchain" };
  }
};

export const markBatchSuspicious = async (batchId, reason) => {
  try {
    const res = await axios.post(
      `${API_URL}medicine/api/drap/batches/${batchId}/mark-suspicious/`,
      { reason },
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Mark suspicious error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to mark batch" };
  }
};

export const recallBatch = async (batchId, reason) => {
  try {
    const res = await axios.post(
      `${API_URL}medicine/api/drap/batches/${batchId}/recall/`,
      { reason },
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Recall batch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to recall batch" };
  }
};

// Supply Chain
export const getSupplyChainOverview = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/supply-chain/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get supply chain error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch supply chain data" };
  }
};

export const trackBatchJourney = async (batchId) => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/supply-chain/${batchId}/journey/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Track batch error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to track batch" };
  }
};

// Stakeholders
export const getDrapDistributors = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/distributors/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get distributors error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch distributors" };
  }
};

export const getDrapWarehouses = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/warehouses/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get warehouses error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch warehouses" };
  }
};

export const getDrapWholesalers = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/wholesalers/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get wholesalers error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch wholesalers" };
  }
};



// Get all reports with optional status filter
export const getDrapReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_URL}medicine/api/drap/reports/${params ? '?' + params : ''}`;
    const res = await axios.get(url, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error("Get reports error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch reports" };
  }
};

// Get single report detail
export const getDrapReportDetail = async (reportId) => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/reports/${reportId}/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get report detail error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch report details" };
  }
};

// Update report status and notes
export const updateReportStatus = async (reportId, data) => {
  try {
    const res = await axios.post(
      `${API_URL}medicine/api/drap/reports/${reportId}/update-status/`,
      data,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Update report status error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to update report" };
  }
};

export const getDrapShopkeepers = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/shopkeepers/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get shopkeepers error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch shopkeepers" };
  }
};

// Analytics
export const getDrapAnalytics = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/analytics/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get analytics error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch analytics" };
  }
};

// Notifications
export const getDrapNotifications = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/notifications/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get notifications error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Audit Logs
export const getDrapAuditLogs = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/audit-logs/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get audit logs error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch audit logs" };
  }
};

// Search
export const searchDrapBatches = async (searchParams) => {
  try {
    const params = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}medicine/api/drap/search/${params ? '?' + params : ''}`;
    const res = await axios.get(url, getAuthHeader());
    return res.data;
  } catch (error) {
    console.error("Search batches error:", error.response?.data);
    throw error.response?.data || { detail: "Search failed" };
  }
};

// System Health
export const getSystemHealth = async () => {
  try {
    const res = await axios.get(
      `${API_URL}medicine/api/drap/health/`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Get system health error:", error.response?.data);
    throw error.response?.data || { detail: "Failed to fetch system health" };
  }
};

// CSV Exports
export const exportDrapBatchesCSV = async () => {
  return downloadCSV(
    'medicine/api/drap/export/batches/',
    `drap_batches_${new Date().toISOString().split('T')[0]}.csv`
  );
};

export const exportDrapTransfersCSV = async () => {
  return downloadCSV(
    'medicine/api/drap/export/transfers/',
    `drap_transfers_${new Date().toISOString().split('T')[0]}.csv`
  );
};


export default api;