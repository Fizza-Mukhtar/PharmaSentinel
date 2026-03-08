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


export default api;