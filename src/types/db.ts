/**
 * Data Source & Database Adapter Interfaces
 * Supports file uploads (Excel/CSV), synthetic data, direct SQL (MSSQL), and future REST/GraphQL BFFs.
 */

import { DataState, PaymentRail } from './rails';
import { AlertResolution } from './store';

export type DataSourceType = 'EXCEL' | 'MSSQL' | 'SYNTHETIC' | 'REST_API';

export interface QueryFilterParams {
  rail: PaymentRail;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  alertStatus?: 'ALL' | 'OPEN' | 'CLOSED';
  limit?: number;
  offset?: number;
}

export interface MSSQLConfig {
  server: string;
  database: string;
  port?: number;
  user?: string;
  password?: string;
  domain?: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
  tableName?: string;
  alertViewName?: string;
}

export interface IDataSourceAdapter {
  id: DataSourceType;
  name: string;
  isConfigured: boolean;
  
  // Test connection or credentials
  testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }>;
  
  // Ingest/query batch of transactions
  fetchBatch(params: QueryFilterParams): Promise<DataState>;
  
  // Persist alert resolution/disposition back to the data store
  persistDispositions(resolutions: AlertResolution[]): Promise<{ success: boolean; count: number }>;
}
