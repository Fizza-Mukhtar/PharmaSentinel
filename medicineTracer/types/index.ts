// types/index.ts
export interface User {
  id: number;
  username: string;
  role: string;
  token: string;
}

export interface Batch {
  batch_id: string;
  name: string;
  manufacturer: {
    username: string;
    role: string;
  };
  current_holder?: {
    username: string;
    role: string;
  };
  manufacture_date: string;
  expiry_date: string;
  quantity: number;
  remaining_quantity: number;
  qr_code_url?: string;
}

export interface Transfer {
  transfer_id: number;
  batch_id: string;
  medicine_name: string;
  quantity: number;
  from_user: string;
  from_role: string;
  to_user?: string;
  to_role?: string;
  status: string;
  timestamp: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  hash: string;
  previous_hash: string;
  transaction_data: any;
  created_by: string;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  batch: Batch;
  blockchain: {
    is_valid: boolean;
    total_blocks: number;
    trail: BlockchainBlock[];
  };
  supply_chain_trail: Transfer[];
}