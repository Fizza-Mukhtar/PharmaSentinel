// src/components/BatchList.js
import React, { useState } from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { FaQrcode, FaEye } from "react-icons/fa";
import { verifyBatch } from "../services/api";

export default function BatchList({ batches, loading }) {
  const [verifying, setVerifying] = useState({});
  const [batchStatuses, setBatchStatuses] = useState({});

  const handleVerify = async (batchId) => {
    setVerifying(prev => ({ ...prev, [batchId]: true }));
    try {
      const result = await verifyBatch(batchId);
      setBatchStatuses(prev => ({
        ...prev,
        [batchId]: result.status === "authentic" ? "Verified" : "Tampered"
      }));
    } catch (error) {
      console.error("Verification failed:", error);
      setBatchStatuses(prev => ({ ...prev, [batchId]: "Error" }));
    } finally {
      setVerifying(prev => ({ ...prev, [batchId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading batches...</p>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="text-center py-5">
        <p>No batches found. Create your first batch!</p>
      </div>
    );
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Batch ID</th>
          <th>Medicine</th>
          <th>Quantity</th>
          <th>Holder</th>
          <th>Created On</th>
          <th>Status</th>
          <th>QR</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((batch) => {
          const status = batchStatuses[batch.batch_id] || "Unknown";
          const isVerifying = verifying[batch.batch_id];

          return (
            <tr key={batch.id}>
              <td>{batch.batch_id}</td>
              <td>{batch.name || "N/A"}</td>
              <td>{batch.remaining_quantity || 0}</td>
              <td>{batch.current_holder_name || "N/A"}</td>
              <td>
                {batch.created_at 
                  ? new Date(batch.created_at).toLocaleDateString()
                  : "Invalid Date"}
              </td>
              <td>
                <Badge 
                  bg={
                    status === "Verified" ? "success" :
                    status === "Tampered" ? "danger" :
                    status === "Error" ? "warning" :
                    "secondary"
                  }
                >
                  {status}
                </Badge>
              </td>
              <td>
                <Button size="sm" variant="outline-primary">
                  <FaQrcode />
                </Button>
              </td>
              <td>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  onClick={() => handleVerify(batch.batch_id)}
                  disabled={isVerifying}
                >
                  {isVerifying ? <Spinner size="sm" animation="border" /> : <FaEye />}
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
