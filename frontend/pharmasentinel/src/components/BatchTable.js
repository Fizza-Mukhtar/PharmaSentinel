import React from "react";
import { Table, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

const BatchTable = ({ batches }) => {
  const getExpiryBadge = (status) => {
    switch (status) {
      case "EXPIRED":
        return <Badge bg="danger">EXPIRED</Badge>;
      case "EXPIRING_SOON":
        return <Badge bg="warning" text="dark">EXPIRING SOON</Badge>;
      case "SAFE":
        return <Badge bg="success">SAFE</Badge>;
      default:
        return <Badge bg="secondary">UNKNOWN</Badge>;
    }
  };

  return (
    <div
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "15px",
        padding: "1rem",
        color: "white",
      }}
    >
      <h6 className="mb-3">Batches Overview</h6>
      <Table responsive bordered hover variant="dark">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Remaining</th>
            <th>Expiry Status</th>
            <th>QR</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">
                No batches found
              </td>
            </tr>
          )}
          {batches.map((batch) => (
            <tr
              key={batch.batch_id}
              style={{
                backgroundColor:
                  batch.low_stock ? "rgba(255, 76, 76, 0.2)" : "transparent",
              }}
            >
              <td>{batch.batch_id}</td>
              <td>{batch.name}</td>
              <td>{batch.quantity}</td>
              <td>{batch.remaining_quantity}</td>
              <td>{getExpiryBadge(batch.expiry_status)}</td>
              <td>
                {batch.qr_code_url ? (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>QR Code</Tooltip>}
                  >
                    <img
                      src={batch.qr_code_url}
                      alt="QR"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </OverlayTrigger>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BatchTable;
