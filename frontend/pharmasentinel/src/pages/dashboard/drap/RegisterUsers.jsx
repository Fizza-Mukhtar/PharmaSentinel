// src/pages/dashboard/drap/RegisterUsers.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
  FaUserPlus,
  FaIndustry,
  FaTruck,
  FaWarehouse,
  FaStore,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { registerUser, getAllUsers } from "../../../services/api";
import "./RegisterUsers.css";

const RegisterUsers = () => {
  // ✅ FIXED: Initialize with empty state
  const EMPTY_FORM = {
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "manufacturer",
  };

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUsers, setBulkUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [recentUsers, setRecentUsers] = useState([]);

  const roles = [
    { value: "manufacturer", label: "Manufacturer", icon: <FaIndustry />, color: "primary" },
    { value: "distributor", label: "Distributor", icon: <FaTruck />, color: "info" },
    { value: "warehouse", label: "Warehouse", icon: <FaWarehouse />, color: "success" },
    { value: "wholesaler", label: "Wholesaler", icon: <FaStore />, color: "warning" },
    { value: "shopkeeper", label: "Shopkeeper", icon: <FaShoppingCart />, color: "danger" },
  ];

  // Fetch recent users on component load
  useEffect(() => {
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      const response = await getAllUsers();
      setRecentUsers(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // ✅ FIXED: Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ FIXED: Clear form function
  const clearForm = () => {
    setFormData({ ...EMPTY_FORM });
  };

  // ✅ FIXED: Single user submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await registerUser(formData);

      setMessage({
        type: "success",
        text: `User ${formData.username} created successfully!`,
      });

      // ✅ Clear form after successful submission
      clearForm();
      
      // ✅ Refresh user list
      fetchRecentUsers();

    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.detail || 
              error.response?.data?.username?.[0] ||
              error.response?.data?.email?.[0] ||
              error.message || 
              "Failed to create user",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Bulk submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (bulkUsers.length === 0) {
      setMessage({ type: "danger", text: "No users added for bulk registration." });
      setLoading(false);
      return;
    }

    try {
      // Register users one by one
      let successCount = 0;
      let failedCount = 0;
      const errors = [];

      for (const user of bulkUsers) {
        try {
          await registerUser(user);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`${user.username}: ${error.response?.data?.detail || "Failed"}`);
        }
      }

      if (successCount > 0) {
        setMessage({
          type: successCount === bulkUsers.length ? "success" : "warning",
          text: `Successfully created ${successCount} user(s). ${failedCount > 0 ? `Failed: ${failedCount}` : ""}`,
        });

        // ✅ Clear bulk list and form on success
        setBulkUsers([]);
        clearForm();
        
        // ✅ Refresh user list
        fetchRecentUsers();
      } else {
        setMessage({
          type: "danger",
          text: `All registrations failed. ${errors[0] || "Unknown error"}`,
        });
      }

    } catch (error) {
      console.error("Bulk registration error:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.detail || "Failed to create users",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Add user to bulk list
  const addBulkUser = () => {
    if (formData.username && formData.email && formData.password) {
      // Check for duplicates in bulk list
      const isDuplicate = bulkUsers.some(
        user => user.username === formData.username || user.email === formData.email
      );

      if (isDuplicate) {
        setMessage({
          type: "warning",
          text: "User with same username or email already in the list",
        });
        return;
      }

      setBulkUsers([...bulkUsers, { ...formData }]);
      
      // ✅ Clear form after adding to bulk list
      clearForm();
      
      setMessage({
        type: "info",
        text: `Added ${formData.username} to bulk list`,
      });
    } else {
      setMessage({
        type: "warning",
        text: "Please fill all required fields",
      });
    }
  };

  // Remove user from bulk list
  const removeBulkUser = (index) => {
    setBulkUsers(bulkUsers.filter((_, i) => i !== index));
  };

  // Get role icon for display
  const getRoleIcon = (role) => {
    const roleData = roles.find((r) => r.value === role);
    return roleData ? roleData.icon : null;
  };

  // Get badge color for role
  const getRoleColor = (role) => {
    const roleData = roles.find((r) => r.value === role);
    return roleData ? roleData.color : "secondary";
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <h2 className="mb-1">
                <FaUserPlus className="me-2" /> Register Users
              </h2>
              <p className="text-muted mb-0">Create new users for the supply chain system</p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setBulkMode(!bulkMode);
                setBulkUsers([]);
                clearForm(); // ✅ Clear form on mode switch
                setMessage({ type: "", text: "" }); // ✅ Clear messages
              }}
            >
              {bulkMode ? "Single Mode" : "Bulk Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className="row mb-3">
          <div className="col">
            <div
              className={`alert alert-${message.type} alert-dismissible fade show`}
              role="alert"
            >
              {message.type === "success" ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" />}
              {message.text}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setMessage({ type: "", text: "" })}
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Registration Form */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="mb-4">{bulkMode ? "Bulk User Registration" : "Single User Registration"}</h5>

              <form onSubmit={bulkMode ? handleBulkSubmit : handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Role *</label>
                    <div className="d-flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          className={`btn ${formData.role === role.value ? `btn-${role.color}` : `btn-outline-${role.color}`} d-flex align-items-center`}
                          onClick={() => setFormData({ ...formData, role: role.value })}
                        >
                          <span className="me-2">{role.icon}</span>
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  {bulkMode ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={addBulkUser}
                        disabled={!formData.username || !formData.email || !formData.password}
                      >
                        Add to List
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading || bulkUsers.length === 0}
                      >
                        {loading ? "Creating..." : `Create ${bulkUsers.length} Users`}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create User"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={clearForm}
                      >
                        Clear Form
                      </button>
                    </>
                  )}
                </div>
              </form>

              {/* Bulk Users List */}
              {bulkMode && bulkUsers.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-3">Users to Create ({bulkUsers.length})</h6>
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover table-sm">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUsers.map((user, index) => (
                          <tr key={index}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge bg-${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => removeBulkUser(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recently Created Users */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Recently Created Users</h6>
              {recentUsers.length === 0 ? (
                <p className="text-muted text-center py-4">No users created yet</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="d-flex align-items-center justify-content-between p-2 border rounded">
                      <div className="d-flex align-items-center">
                        <div className="me-2">{getRoleIcon(user.role)}</div>
                        <div>
                          <div className="fw-bold">{user.username}</div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                      <span className={`badge bg-${getRoleColor(user.role)}`}>{user.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Legend */}
          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h6 className="mb-3">Role Information</h6>
              <div className="d-flex flex-column gap-2">
                {roles.map((role) => (
                  <div key={role.value} className="d-flex align-items-center">
                    <span className={`badge bg-${role.color} me-2`}>{role.icon}</span>
                    <span>{role.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUsers;