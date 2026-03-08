// src/components/QRModal.js
import React from "react";
import "./Modal.css";

export default function QRModal({ show, onClose, qrUrl }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>QR Code</h2>
        <img src={qrUrl} alt="QR Code" style={{ width: "250px" }} />
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
