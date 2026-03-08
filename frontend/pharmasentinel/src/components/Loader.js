// src/components/Loader.js
import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = ({ message = "Loading..." }) => (
  <div className="text-center my-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-2">{message}</p>
  </div>
);

export default Loader;
