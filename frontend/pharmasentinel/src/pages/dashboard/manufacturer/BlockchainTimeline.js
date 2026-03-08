// src/components/BlockchainTimeline.js
import React, { useState } from "react";
import { Card, Badge, Button, Collapse } from "react-bootstrap";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaCube, 
  FaLink,
  FaUser,
  FaClock,
  FaFingerprint
} from "react-icons/fa";

export default function BlockchainTimeline({ blocks, isValid }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⛓️</div>
        <div className="empty-state-title">No Blocks Found</div>
        <div className="empty-state-text">
          The blockchain trail will appear here once transactions are recorded
        </div>
      </div>
    );
  }

  return (
    <div className="blockchain-timeline">
      {blocks.map((block, index) => (
        <BlockItem 
          key={block.index || index} 
          block={block} 
          isGenesis={index === 0}
          isValid={isValid}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
}

function BlockItem({ block, isGenesis, isValid, animationDelay }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateHash = (hash) => {
    if (!hash) return "N/A";
    if (hash === "0") return "Genesis Block";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const getBlockTypeLabel = () => {
    if (isGenesis) return "Genesis Block";
    if (block.transaction_data?.sender_id && block.transaction_data?.receiver_id) {
      return "Transfer Block";
    }
    return "Transaction Block";
  };

  const getBlockTypeColor = () => {
    if (isGenesis) return "badge-success-modern";
    return "badge-info-modern";
  };

  return (
    <div 
      className={`timeline-block ${isGenesis ? "genesis" : ""} ${!isValid ? "tampered" : ""} fade-in`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'both'
      }}
    >
      {/* Block Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <FaCube className="text-primary" size={20} />
            <h6 className="mb-0" style={{ fontWeight: 600 }}>
              Block #{block.index}
            </h6>
            <Badge className={`badge-modern ${getBlockTypeColor()}`}>
              {getBlockTypeLabel()}
            </Badge>
          </div>
          <div className="d-flex align-items-center text-muted">
            <FaClock className="me-2" size={14} />
            <small>{formatDate(block.timestamp)}</small>
          </div>
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-primary p-0"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </Button>
      </div>

      {/* Block Summary (Always Visible) */}
      <div className="mb-3">
        <div className="d-flex align-items-center mb-2">
          <FaFingerprint className="text-primary me-2" size={16} />
          <small className="text-muted text-uppercase">Block Hash</small>
        </div>
        <code className="d-block p-2 bg-light rounded" style={{ fontSize: "0.85rem" }}>
          {truncateHash(block.hash)}
        </code>
      </div>

      {/* Transaction Data Preview */}
      {block.transaction_data && (
        <div className="mb-3">
          <small className="text-muted text-uppercase d-block mb-2">
            Transaction Summary
          </small>
          <div className="p-2 bg-light rounded">
            {block.transaction_data.sender_id && (
              <div className="mb-1">
                <small>
                  <strong>From:</strong> User #{block.transaction_data.sender_id}
                </small>
              </div>
            )}
            {block.transaction_data.receiver_id && (
              <div className="mb-1">
                <small>
                  <strong>To:</strong> User #{block.transaction_data.receiver_id}
                </small>
              </div>
            )}
            {block.transaction_data.quantity_transferred && (
              <div>
                <small>
                  <strong>Quantity:</strong> {block.transaction_data.quantity_transferred} units
                </small>
              </div>
            )}
            {block.transaction_data.batch_id && (
              <div>
                <small>
                  <strong>Batch:</strong> {block.transaction_data.batch_id}
                </small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <div>
          <hr />
          
          {/* Previous Hash */}
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <FaLink className="text-primary me-2" size={16} />
              <small className="text-muted text-uppercase">Previous Hash</small>
            </div>
            <code className="d-block p-2 bg-light rounded" style={{ fontSize: "0.85rem" }}>
              {block.previous_hash === "0" ? "Genesis Block (No Previous)" : truncateHash(block.previous_hash)}
            </code>
          </div>

          {/* Created By */}
          {block.created_by && (
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <FaUser className="text-primary me-2" size={16} />
                <small className="text-muted text-uppercase">Created By</small>
              </div>
              <div>{block.created_by}</div>
            </div>
          )}

          {/* Full Transaction Data */}
          {block.transaction_data && (
            <div className="mb-3">
              <small className="text-muted text-uppercase d-block mb-2">
                Complete Transaction Data
              </small>
              <pre 
                className="p-2 bg-light rounded" 
                style={{ 
                  fontSize: "0.75rem", 
                  maxHeight: "200px", 
                  overflow: "auto",
                  margin: 0
                }}
              >
                {JSON.stringify(block.transaction_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Full Hashes */}
          <div>
            <small className="text-muted text-uppercase d-block mb-2">
              Complete Block Hash
            </small>
            <code 
              className="d-block p-2 bg-light rounded" 
              style={{ 
                fontSize: "0.7rem", 
                wordBreak: "break-all" 
              }}
            >
              {block.hash}
            </code>
          </div>

          {block.previous_hash && block.previous_hash !== "0" && (
            <div className="mt-2">
              <small className="text-muted text-uppercase d-block mb-2">
                Complete Previous Hash
              </small>
              <code 
                className="d-block p-2 bg-light rounded" 
                style={{ 
                  fontSize: "0.7rem", 
                  wordBreak: "break-all" 
                }}
              >
                {block.previous_hash}
              </code>
            </div>
          )}
        </div>
      </Collapse>

      {/* Expand/Collapse Button */}
      <div className="text-center mt-3">
        <Button
          variant="link"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-primary"
        >
          {expanded ? (
            <>
              <FaChevronUp className="me-1" />
              Show Less
            </>
          ) : (
            <>
              <FaChevronDown className="me-1" />
              Show More Details
            </>
          )}
        </Button>
      </div>
    </div>
  );
}