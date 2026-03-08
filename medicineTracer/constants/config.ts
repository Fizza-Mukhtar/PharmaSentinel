// constants/config.ts
export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.100:8000',
  ENDPOINTS: {
    LOGIN: '/api/login/',
    VERIFY_BATCH: '/api/verify_batch/',
    BATCH_DETAIL: '/api/batches/',
    
    // Distributor
    DISTRIBUTOR_INCOMING: '/api/distributor/incoming/',
    DISTRIBUTOR_CONFIRM: '/api/distributor/confirm-receive/',
    DISTRIBUTOR_INVENTORY: '/api/distributor/inventory/',
    DISTRIBUTOR_NOTIFICATIONS: '/api/distributor/notifications/',
    
    // Warehouse
    WAREHOUSE_INCOMING: '/api/warehouse/incoming/',
    WAREHOUSE_CONFIRM: '/api/warehouse/confirm-receive/',
    WAREHOUSE_INVENTORY: '/api/warehouse/inventory/',
    
    // Wholesaler
    WHOLESALER_INCOMING: '/api/wholesaler/incoming/',
    WHOLESALER_ACCEPT: '/api/wholesaler/accept-transfer/',
    WHOLESALER_INVENTORY: '/api/wholesaler/inventory/',
    
    // Shopkeeper
    SHOPKEEPER_INCOMING: '/api/shopkeeper/incoming/',
    SHOPKEEPER_ACCEPT: '/api/shopkeeper/accept-transfer/',
    SHOPKEEPER_INVENTORY: '/api/shopkeeper/inventory/',
  }
};

export const COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

export const ROLE_COLORS = {
  MANUFACTURER: '#8b5cf6',
  DISTRIBUTOR: '#3b82f6',
  WAREHOUSE: '#06b6d4',
  WHOLESALER: '#10b981',
  SHOPKEEPER: '#f59e0b',
  CUSTOMER: '#64748b',
};