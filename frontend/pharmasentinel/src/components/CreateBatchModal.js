import React, { useState, useContext } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function CreateBatchModal({ show, onHide, onCreated }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    batch_id: "",
    name: "",
    quantity: "",
    manufacture_date: "",
    expiry_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.batch_id.trim() || !formData.name.trim() || !formData.quantity) {
      setError("Please fill all required fields");
      return;
    }

    if (!user || !user.id) {
      setError("User not found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        batch_id: formData.batch_id.trim(),
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        manufacturer: user.id,
        manufacture_date: formData.manufacture_date || null,
        expiry_date: formData.expiry_date || null,
      };
      
      console.log("Creating batch with payload:", payload);
      console.log("User data:", user);
      
      // Direct API call to ensure correct endpoint
      const response = await api.post("medicine/api/add_batch/", payload);
      
      console.log("Batch created successfully:", response.data);
      
      // Reset form
      setFormData({
        batch_id: "",
        name: "",
        quantity: "",
        manufacture_date: "",
        expiry_date: ""
      });
      
      alert("Batch created successfully! Genesis block added to blockchain.");
      onCreated && onCreated();
      onHide();
    } catch (err) {
      console.error("Create batch error:", err);
      console.error("Error response:", err.response);
      
      let errorMsg = "Failed to create batch";
      
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data) {
        errorMsg = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      batch_id: "",
      name: "",
      quantity: "",
      manufacture_date: "",
      expiry_date: ""
    });
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Batch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        <Form onSubmit={handleCreate}>
          <Form.Group className="mb-3">
            <Form.Label>Batch ID <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              name="batch_id"
              placeholder="e.g., med013, BATCH-2024-001"
              value={formData.batch_id} 
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Form.Text className="text-muted">Unique identifier for this batch</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Medicine Name <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              name="name"
              placeholder="e.g., Paracetamol 500mg"
              value={formData.name} 
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="number" 
              name="quantity"
              placeholder="Enter quantity in units"
              value={formData.quantity} 
              onChange={handleChange}
              min="1"
              required
              disabled={loading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Manufacture Date</Form.Label>
            <Form.Control 
              type="date" 
              name="manufacture_date"
              value={formData.manufacture_date} 
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control 
              type="date" 
              name="expiry_date"
              value={formData.expiry_date} 
              onChange={handleChange}
              disabled={loading}
            />
          </Form.Group>
          
          <div className="mt-3 p-2 bg-light rounded">
            <small className="text-muted">
              <strong>User:</strong> {user?.username || "Not logged in"}<br/>
              <strong>User ID:</strong> {user?.id || "N/A"}
            </small>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Creating...
            </>
          ) : (
            "Create Batch"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}