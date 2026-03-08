import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

export default function CreateBatch() {
  const [form, setForm] = useState({
    batch_id: "",
    name: "",
    manufacture_date: "",
    expiry_date: "",
    quantity: 0,
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8000/api/add_batch/", form, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((res) => setMsg({ type: "success", text: "Batch created successfully!" }))
      .catch((err) =>
        setMsg({ type: "danger", text: err.response?.data?.detail || "Error creating batch!" })
      );
  };

  return (
    <div className="glass-card">
      <h4>Create Batch</h4>
      {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Batch ID</Form.Label>
          <Form.Control name="batch_id" value={form.batch_id} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Medicine Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Manufacture Date</Form.Label>
          <Form.Control type="date" name="manufacture_date" value={form.manufacture_date} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Expiry Date</Form.Label>
          <Form.Control type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control type="number" name="quantity" value={form.quantity} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit" variant="primary">Create Batch</Button>
      </Form>
    </div>
  );
}