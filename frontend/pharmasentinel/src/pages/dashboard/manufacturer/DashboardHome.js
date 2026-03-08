import React, { useEffect, useState } from "react";
import { getManufacturerDashboard } from "../../../services/api";
import "./DashboardHome.css";

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getManufacturerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard error:", error);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getExpiryBadge = (status) => {
    switch (status) {
      case "EXPIRED":
        return <span className="badge badge-danger">Expired</span>;
      case "EXPIRING_SOON":
        return <span className="badge badge-warning">Expiring Soon</span>;
      case "SAFE":
        return <span className="badge badge-success">Safe</span>;
      default:
        return <span className="badge badge-secondary">Unknown</span>;
    }
  };

  const getBatchStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="badge badge-success">Active</span>;
      case "EXHAUSTED":
        return <span className="badge badge-warning">Exhausted</span>;
      case "EXPIRED":
        return <span className="badge badge-danger">Expired</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading Dashboard...</p>;
  }

  if (!dashboardData) {
    return <p style={{ padding: 20 }}>No data found</p>;
  }

  return (
    <div className="dashboard-home">
      <h1 className="page-title">Manufacturer Dashboard</h1>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Batches</h3>
          <p>{dashboardData.total_batches}</p>
        </div>

        <div className="stat-card">
          <h3>Total Manufactured</h3>
          <p>{dashboardData.total_manufactured}</p>
        </div>

        <div className="stat-card">
          <h3>With You</h3>
          <p>{dashboardData.remaining_with_me}</p>
        </div>

        <div className="stat-card">
          <h3>Total Distributed</h3>
          <p>{dashboardData.total_transferred}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="batches-section">
        <h3>All Batches</h3>

        {dashboardData.batches.length === 0 ? (
          <p>No batches found</p>
        ) : (
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Medicine</th>
                <th>Manufactured</th>
                <th>Remaining</th>
                <th>Distributed</th>
                <th>Expiry Date</th>
                <th>Expiry Status</th>
                <th>Batch Status</th>
                <th>QR</th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.batches.map((batch) => {
                const totalQty = batch.total_manufactured;
                const remainingQty = batch.remaining_with_me;
                const distributed = batch.total_distributed;

                const percent = totalQty
                  ? Math.round((distributed / totalQty) * 100)
                  : 0;

                return (
                  <tr key={batch.batch_id}>
                    <td>{batch.batch_id}</td>
                    <td>{batch.name}</td>
                    <td>{totalQty}</td>
                    <td>{remainingQty}</td>
                    <td>{percent}%</td>
                    <td>{batch.expiry_date}</td>
                    <td>{getExpiryBadge(batch.expiry_status)}</td>
                    <td>{getBatchStatusBadge(batch.batch_status)}</td>
                    <td>
                      {batch.qr_code_url ? (
                        <a
                          href={batch.qr_code_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
