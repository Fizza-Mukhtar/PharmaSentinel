import React, { useState } from "react";
import axios from "axios";

export default function CreateBatch() {
  const [form, setForm] = useState({
    medicine_name: "",
    batch_number: "",
    expiry_date: "",
    manufacture_date: "",
    quantity: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/add_batch/", form);
      alert("Batch Created!");
    } catch (error) {
      alert("Error creating batch");
    }
  };

  return (
    <div>
      <h2>Create New Batch</h2>

      <input name="medicine_name" onChange={handleChange} placeholder="Medicine Name" />
      <input name="batch_number" onChange={handleChange} placeholder="Batch Number" />
      <input type="date" name="manufacture_date" onChange={handleChange} />
      <input type="date" name="expiry_date" onChange={handleChange} />
      <input type="number" name="quantity" onChange={handleChange} placeholder="Quantity" />

      <button className="btn btn-primary mt-3" onClick={handleSubmit}>
        Create Batch
      </button>
    </div>
  );
}