// src/components/BatchCard.jsx
import React, { useState } from "react";
import { Card, Button, Badge, Modal, Spinner } from "react-bootstrap";
import { verifyBatchApi, downloadQrUrl } from "../services/api";

export default function BatchCard({ batch, onRefresh }) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyBatchApi(batch.batch_id);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ valid: false, message: "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadQR = () => {
    // opens QR image (api returns url)
    window.open(downloadQrUrl(batch.batch_id), "_blank");
  };

  return (
    <>
      <Card className="h-100 batch-card">
        <Card.Body>
          <div className="d-flex justify-content-between">
            <div>
              <h6 className="mb-1">{batch.name}</h6>
              <div className="text-muted small">{batch.batch_id}</div>
            </div>
            <div className="text-end">
              <Badge bg="secondary">{batch.remaining_quantity} pcs</Badge>
            </div>
          </div>

          <div className="mt-3">
            <div className="small text-muted">Manufactured on: {batch.manufacture_date || "-"}</div>
            <div className="small text-muted">Expiry: {batch.expiry_date || "-"}</div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={() => setShowDetail(true)}>
              View
            </Button>
            <Button variant="success" size="sm" onClick={handleVerify} disabled={verifying}>
              {verifying ? <Spinner animation="border" size="sm" /> : "Verify"}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={handleDownloadQR}>
              QR
            </Button>
          </div>

          {verifyResult && (
            <div className={`mt-3 verify-result p-2 ${verifyResult.valid ? "valid" : "invalid"}`}>
              <strong>{verifyResult.valid ? "Authentic" : "Tampered / Error"}</strong>
              <div className="small">{verifyResult.message}</div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Batch Details - {batch.batch_id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(batch, null, 2)}</pre>
        </Modal.Body>
      </Modal>
    </>
  );
}
