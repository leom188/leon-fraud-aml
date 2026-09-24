/**
 * Payment Rail and Transaction Domain Model
 * Designed for multi-rail expansion: Interac e-Transfer, Card Payments, and ACH/EFT
 */

export type PaymentRail = 'ETRANSFER' | 'CARD' | 'ACH_EFT';

export type TransactionDirection = 'Incoming' | 'Outgoing' | 'Unknown';

export type RiskLevel = 'Normal' | 'Elevated' | 'Critical' | 'Review Required';

export interface CounterpartyStat {
  email: string;
  volume: number;
  txns: number;
  first_seen: string;
  is_new: boolean;
}

export interface TransactionRecord {
  id: string;
  raw_record: Record<string, any>;
  transaction_direction: TransactionDirection;
  client_id: string;
  client_name: string;
  customer_id: string;
  customer_account: string;
  recipient_name: string;
  recipient_email: string;
  sender_name: string;
  sender_email: string;
  grouping_key: string;
  grouping_key_source: string;

  // Decoded Financial & Business Details
  amount: number;
  transaction_date: string | null;
  transaction_type: string;
  corporation_code: string;
  operator_code: string;
  city: string;
  country: string;
  autodeposit_flag: string;
  transaction_status: string;
  transaction_code: string;
  currency: string;

  // Rail Specific / Forensic Fields
  sec_question?: string | null;
  sec_answer?: string | null;
  memo?: string | null;
  interac_ref1?: string | null;
  interac_ref2?: string | null;

  // Card Rail Specific (Optional)
  card_pan_masked?: string;
  card_mcc?: string;
  card_auth_code?: string;
  card_terminal_id?: string;

  // Rules & Audit
  rule_ids: string[];
  rule_names: string[];
  rule_id?: string;
  alert_close_type: string;
  reviewed_by: string | null;
  needs_review: boolean;
  transAlert?: string;
}

export interface GroupedEntity {
  id: string;
  grouping_key: string;
  grouping_key_source: string;
  transaction_direction: TransactionDirection;
  client_id: string;
  client_name: string;
  corporation_code: string;
  customer_id: string;
  customer_account: string;
  transaction_count: number;
  total_amount: number;
  first_transaction_date: string;
  last_transaction_date: string;
  distinct_rule_count: number;
  rule_names: string[];
  alert_close_types: string[];
  reviewed_by_users: string[];
  has_unknown_direction: boolean;
  risk_level: RiskLevel;
  risk_score: number;
  contains_keyword: boolean;

  // Behavioral & Counterparty Analytics
  distinct_emails_count: number;
  fan_out_ratio: number;
  pct_new_emails: number;
  volume_spike_pct: number;
  interbank_pct: number;
  top_recipient_emails: CounterpartyStat[];
  transactions: TransactionRecord[];
}

export interface DataState {
  totalRecords: number;
  groupedEntities: GroupedEntity[];
  normalizedRecords: TransactionRecord[];
  activeRail?: PaymentRail;
  ingestionTimestamp?: string;
  sourceFile?: string;
}

export interface RailFieldDefinition {
  label: string;
  required: boolean;
  aliases: string[];
  description?: string;
}

export interface RailValidationResult {
  valid: boolean;
  missing: string[];
}

export interface IRailProcessor {
  railId: PaymentRail;
  name: string;
  description: string;
  fieldDefinitions: Record<string, RailFieldDefinition>;
  validateHeaders(headers: string[]): RailValidationResult;
  processRecords(rawRows: Record<string, any>[]): DataState;
  generateSampleData(count?: number): DataState;
}
