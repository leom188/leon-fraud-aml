import { TransactionRecord } from '../types/rails';

/**
 * Checks if a transaction has triggered an alert rule.
 * A transaction without rule_names, rule_ids, or rule_id is a standard ledger transaction (No Alert).
 */
export function hasAlert(tx: TransactionRecord | null | undefined): boolean {
  if (!tx) return false;
  const hasNames = Array.isArray(tx.rule_names) && tx.rule_names.filter(Boolean).length > 0;
  const hasIds = Array.isArray(tx.rule_ids) && tx.rule_ids.filter(Boolean).length > 0;
  const hasSingleId = Boolean(tx.rule_id && tx.rule_id.trim() !== '');
  return hasNames || hasIds || hasSingleId;
}

/**
 * Checks if a transaction has an active open alert that requires analyst triage.
 * Returns false if the transaction has no alerts at all.
 */
export function isOpenAlert(tx: TransactionRecord | null | undefined): boolean {
  if (!hasAlert(tx)) return false;
  const s = (tx?.alert_close_type || '').trim();
  return !s || s === 'Open Alert' || s === '0' || s === 'Pending Review';
}

/**
 * Checks if an alerted transaction has been resolved/closed (e.g. 109 FP, 110 UTR, 111 RFI).
 * Returns false if the transaction has no alerts at all.
 */
export function isClosedAlert(tx: TransactionRecord | null | undefined): boolean {
  if (!hasAlert(tx)) return false;
  return !isOpenAlert(tx);
}
