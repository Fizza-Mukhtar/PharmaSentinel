// ============================================
// FILE 2: src/pages/dashboard/wholesalerTransferHistory.js
// ============================================
import React, { useState, useEffect } from "react";
import WholesalerLayout from "../../../components/wholesaler/WholesalerLayout";
import { getWholesalerTransferHistory } from "../../../services/api";

export default function WholesalerTransferHistory() {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadTransferHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, typeFilter, transfers]);

  const loadTransferHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWholesalerTransferHistory();
      console.log("✅ Transfer history loaded:", data);
      setTransfers(data.history || []);
      setFilteredTransfers(data.history || []);
    } catch (err) {
      console.error("❌ Error loading transfer history:", err);
      setError(err.detail || "Failed to load transfer history");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transfers];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.from_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.to_user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";

    if (typeFilter === "INCOMING") {
      filtered = filtered.filter((t) => t.to_user === username);
    } else if (typeFilter === "OUTGOING") {
      filtered = filtered.filter((t) => t.from_user === username);
    }

    setFilteredTransfers(filtered);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: "#fbbf24", text: "⏳ Pending" },
      CONFIRMED: { bg: "#10b981", text: "✅ Confirmed" },
      REJECTED: { bg: "#ef4444", text: "❌ Rejected" },
      CANCELLED: { bg: "#6b7280", text: "🚫 Cancelled" },
    };
    
    const style = styles[status] || { bg: "#6b7280", text: status };
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: "white",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.875rem",
        fontWeight: "500"
      }}>
        {style.text}
      </span>
    );
  };

  const getTransferType = (transfer) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";
    
    if (transfer.from_user === username) {
      return (
        <span style={{
          backgroundColor: "#0b2755ff",
          color: "white",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          fontSize: "0.875rem"
        }}>
          📤 Outgoing
        </span>
      );
    } else if (transfer.to_user === username) {
      return (
        <span style={{
          backgroundColor: "#8b5cf6",
          color: "white",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          fontSize: "0.875rem"
        }}>
          📥 Incoming
        </span>
      );
    }
    return <span style={{ color: "#6b7280" }}>Unknown</span>;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const getStats = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";

    return {
      total: transfers.length,
      incoming: transfers.filter((t) => t.to_user === username).length,
      outgoing: transfers.filter((t) => t.from_user === username).length,
      pending: transfers.filter((t) => t.status === "PENDING").length,
      confirmed: transfers.filter((t) => t.status === "CONFIRMED").length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <WholesalerLayout>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #6366f1",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            margin: "0 auto",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading...</p>
        </div>
      </WholesalerLayout>
    );
  }

  return (
    <WholesalerLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.875rem", fontWeight: "600" }}>
            📜 Transfer History
          </h2>
          <p style={{ margin: 0, color: "#6b7280" }}>
            View all your transfer transactions
          </p>
        </div>
        <button
          onClick={loadTransferHistory}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "white",
            color: "#6366f1",
            border: "1px solid #6366f1",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          color: "#991b1b"
        }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "600" }}>
            {stats.total}
          </h3>
          <small style={{ color: "#6b7280" }}>Total Transfers</small>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "600", color: "#8b5cf6" }}>
            {stats.incoming}
          </h3>
          <small style={{ color: "#6b7280" }}>Incoming</small>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "600", color: "#3b82f6" }}>
            {stats.outgoing}
          </h3>
          <small style={{ color: "#6b7280" }}>Outgoing</small>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "600", color: "#fbbf24" }}>
            {stats.pending}
          </h3>
          <small style={{ color: "#6b7280" }}>Pending</small>
        </div>

        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "600", color: "#10b981" }}>
            {stats.confirmed}
          </h3>
          <small style={{ color: "#6b7280" }}>Confirmed</small>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.875rem" }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by batch ID or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.875rem" }}>
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem"
              }}
            >
              <option value="ALL">All Transfers</option>
              <option value="INCOMING">Incoming Only</option>
              <option value="OUTGOING">Outgoing Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.875rem" }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem"
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "white",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            ✖ Clear
          </button>
        </div>
      </div>

      {/* Transfer History Table */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "1rem" }}>
          <h5 style={{ margin: 0, fontWeight: "600" }}>
            Transfer Records ({filteredTransfers.length})
          </h5>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Type</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Transfer ID</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Batch ID</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>From</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>To</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Quantity</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                    No transfer history found
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr
                    key={transfer.transfer_id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      transition: "background-color 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "0.75rem" }}>{getTransferType(transfer)}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <code style={{
                        backgroundColor: "#f3f4f6",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}>
                        #{transfer.transfer_id}
                      </code>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <code style={{
                        backgroundColor: "#f3f4f6",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}>
                        {transfer.batch_id}
                      </code>
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: "500" }}>{transfer.from_user}</td>
                    <td style={{ padding: "0.75rem", fontWeight: "500" }}>{transfer.to_user}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        backgroundColor: "#e5e7eb",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}>
                        {transfer.quantity} units
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>{getStatusBadge(transfer.status)}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280" }}>
                      {formatTimestamp(transfer.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        padding: "1.5rem",
        marginTop: "2rem"
      }}>
        <h6 style={{ marginBottom: "1rem", fontWeight: "600" }}>📋 Transfer Status Guide</h6>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          <p style={{ margin: 0 }}>
            {getStatusBadge("PENDING")} - Awaiting confirmation
          </p>
          <p style={{ margin: 0 }}>
            {getStatusBadge("CONFIRMED")} - Successfully completed
          </p>
          <p style={{ margin: 0 }}>
            {getStatusBadge("REJECTED")} - Transfer declined
          </p>
          <p style={{ margin: 0 }}>
            {getStatusBadge("CANCELLED")} - Transfer cancelled
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </WholesalerLayout>
  );
}