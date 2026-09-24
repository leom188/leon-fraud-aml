/**
 * Interac e-Transfer Transaction Processing & Normalization Engine
 */

import {
  TransactionRecord,
  GroupedEntity,
  DataState,
  RailValidationResult,
  CounterpartyStat,
  TransactionDirection
} from '../../../types/rails';
import { ETRANSFER_FIELD_DEFINITIONS, ETRANSFER_VALUE_DECODERS } from './fieldDefs';
import { containsHighRiskKeyword } from '../../../utils/keywordUtils';
import { parseTransactionDate } from '../../../utils/dateUtils';

export function cleanValue(val: any): string | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str) return null;
  const lower = str.toLowerCase();
  if (['n/a', 'na', 'null', 'undefined', 'none', '-'].includes(lower)) {
    return null;
  }
  return str;
}

export function cleanEmail(val: any): string | null {
  const cleaned = cleanValue(val);
  return cleaned ? cleaned.toLowerCase() : null;
}

export function cleanName(val: any): string | null {
  const cleaned = cleanValue(val);
  return cleaned ? cleaned.replace(/\s+/g, ' ') : null;
}

export function parseAmount(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function determineDirection(debCreInd: any): TransactionDirection {
  const val = cleanValue(debCreInd);
  if (!val) return 'Unknown';
  const upper = val.toUpperCase();
  if (upper === 'D' || upper.includes('INCOMING') || upper.includes('DEBIT') || upper === 'IN') {
    return 'Incoming';
  }
  if (upper === 'C' || upper.includes('OUTGOING') || upper.includes('CREDIT') || upper === 'OUT') {
    return 'Outgoing';
  }
  return 'Unknown';
}

export function determineGroupingKey(
  direction: TransactionDirection,
  recipientEmail: string | null,
  recipientName: string | null,
  senderEmail: string | null,
  operatorCode: string | null
): { key: string; source: string } {
  const recEmail = cleanEmail(recipientEmail);
  const recName = cleanName(recipientName);
  const senEmail = cleanEmail(senderEmail);
  const opCode = cleanValue(operatorCode);

  if (direction === 'Incoming') {
    if (recEmail) return { key: recEmail, source: 'RECIPIENT_EMAIL' };
    if (recName) return { key: recName, source: 'RECIPIENT_NAME' };
    return { key: 'UNKNOWN_INCOMING', source: 'RECIPIENT_NAME' };
  }

  if (direction === 'Outgoing') {
    if (senEmail) return { key: senEmail, source: 'SENDER_EMAIL' };
    if (opCode) return { key: opCode, source: 'TRX_OPERATOR_CODE' };
    return { key: 'UNKNOWN_OUTGOING', source: 'TRX_OPERATOR_CODE' };
  }

  if (senEmail) return { key: senEmail, source: 'SENDER_EMAIL' };
  if (recEmail) return { key: recEmail, source: 'RECIPIENT_EMAIL' };
  if (opCode) return { key: opCode, source: 'TRX_OPERATOR_CODE' };
  if (recName) return { key: recName, source: 'RECIPIENT_NAME' };
  return { key: 'UNGROUPED_UNKNOWN', source: 'UNKNOWN' };
}

export function getFieldValue(row: Record<string, any>, fieldKey: string): any {
  if (!row || typeof row !== 'object') return undefined;

  const def = ETRANSFER_FIELD_DEFINITIONS[fieldKey];
  const aliases = def ? def.aliases : [fieldKey];
  const rowKeys = Object.keys(row);

  for (const alias of aliases) {
    const aliasLower = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === aliasLower);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

export function validateEtransferHeaders(headers: string[]): RailValidationResult {
  if (!headers || !Array.isArray(headers)) {
    return {
      valid: false,
      missing: Object.keys(ETRANSFER_FIELD_DEFINITIONS).filter(k => ETRANSFER_FIELD_DEFINITIONS[k].required)
    };
  }

  const normalizedHeaders = headers.map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const missingFields: string[] = [];

  Object.entries(ETRANSFER_FIELD_DEFINITIONS).forEach(([fieldKey, def]) => {
    if (def.required) {
      const matchFound = def.aliases.some(alias => {
        const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedHeaders.includes(aliasNorm);
      });
      if (!matchFound) {
        missingFields.push(`${fieldKey} (${def.label})`);
      }
    }
  });

  return {
    valid: missingFields.length === 0,
    missing: missingFields
  };
}

export function normalizeEtransferRecord(row: Record<string, any>, index: number): TransactionRecord {
  const direction = determineDirection(getFieldValue(row, 'TRX_DEB_CRE_IND'));
  const recipientName = cleanName(getFieldValue(row, 'TRX_ACCT_BEN_NAME'));
  const recipientEmail = cleanEmail(getFieldValue(row, 'TRX_BEN_ACCT_NUM'));
  const senderName = cleanName(getFieldValue(row, 'TRX_FREE_TEXT_8'));
  const senderEmail = cleanEmail(getFieldValue(row, 'TRX_FREE_TEXT_3'));
  const operatorCode = cleanValue(getFieldValue(row, 'TRX_OPERATOR_CODE')) || 'N/A';

  const { key: groupingKey, source: groupingKeySource } = determineGroupingKey(
    direction,
    recipientEmail,
    recipientName,
    senderEmail,
    operatorCode
  );

  const amount = parseAmount(getFieldValue(row, 'TRX_AMT1'));
  const tranDate = parseTransactionDate(getFieldValue(row, 'TRX_TRAN_DATE'));

  const clientId = cleanValue(getFieldValue(row, 'TRX_BKM_MERC_UNIQUE_ID')) || 'UNKNOWN_CLIENT';
  const clientName = cleanName(getFieldValue(row, 'TRX_TRAN_NUM_BY_TERM_OWN')) || 'Unknown Client';
  const customerId = cleanValue(getFieldValue(row, 'TRX_CUST_NUM')) || 'UNKNOWN_CUST';
  const customerAccount = cleanValue(getFieldValue(row, 'TRX_ACCT_NUM')) || 'UNKNOWN_ACCT';

  // Rule & Alert metadata
  const ruleId = cleanValue(getFieldValue(row, 'TRX_RULE_ID'));
  const ruleNamesRaw = cleanValue(getFieldValue(row, 'RULE_NAMES'));
  const alertCloseTypeRaw = cleanValue(getFieldValue(row, 'ALERT_CLOSE_TYPE'));
  const reviewedBy = cleanValue(getFieldValue(row, 'TRX_ANALYSED_BY'));
  const corpCodeRaw = cleanValue(getFieldValue(row, 'CORPORATION_CODE'));
  const tranCodeRaw = cleanValue(getFieldValue(row, 'TRX_TRAN_CDE'));

  const ruleNamesList = ruleNamesRaw
    ? String(ruleNamesRaw).split(';').map(r => r.trim().replace(/^['"]|['"]$/g, '')).filter(r => r && !/^\d+$/.test(r))
    : [];

  return {
    id: cleanValue(getFieldValue(row, 'TRX_REF_NUM')) || `TXN-${index + 1}`,
    raw_record: row,
    transaction_direction: direction,
    client_id: clientId,
    client_name: clientName,
    customer_id: customerId,
    customer_account: customerAccount,
    recipient_name: recipientName || 'N/A',
    recipient_email: recipientEmail || 'N/A',
    sender_name: senderName || 'N/A',
    sender_email: senderEmail || 'N/A',
    grouping_key: groupingKey,
    grouping_key_source: groupingKeySource,

    // Financial
    amount,
    transaction_date: tranDate,
    transaction_type: cleanValue(getFieldValue(row, 'TRX_TRAN_TYP')) || 'E-TRANSFER',
    corporation_code: ETRANSFER_VALUE_DECODERS.CORPORATION_CODE(corpCodeRaw),
    operator_code: operatorCode,
    city: cleanValue(getFieldValue(row, 'TRX_TRAN_AREA')) || 'N/A',
    country: cleanValue(getFieldValue(row, 'TRX_TERM_COUNTRY')) || 'CAN',
    autodeposit_flag: ETRANSFER_VALUE_DECODERS.TRX_FREE_FLAG_3(getFieldValue(row, 'TRX_FREE_FLAG_3')),
    transaction_status: cleanValue(getFieldValue(row, 'TRX_MSG_TYPE')) || 'COMPLETED',
    transaction_code: ETRANSFER_VALUE_DECODERS.TRX_TRAN_CDE(tranCodeRaw),
    currency: cleanValue(getFieldValue(row, 'TRX_ORIG_CRNCY_CDE')) || 'CAD',

    // Forensic / Memo
    sec_question: cleanValue(getFieldValue(row, 'TRX_OLD_VALUE')),
    sec_answer: cleanValue(getFieldValue(row, 'TRX_NEW_VALUE')),
    memo: cleanValue(getFieldValue(row, 'TRX_SEN_MESSAGE')),
    interac_ref1: cleanValue(getFieldValue(row, 'TRX_SESSION_ID')),
    interac_ref2: cleanValue(getFieldValue(row, 'TRX_FREE_TEXT_10')),

    // Rules
    rule_ids: ruleId ? [ruleId] : [],
    rule_names: ruleNamesList,
    rule_id: ruleId || undefined,
    alert_close_type: ETRANSFER_VALUE_DECODERS.ALERT_CLOSE_TYPE(alertCloseTypeRaw),
    reviewed_by: reviewedBy,
    needs_review: direction === 'Unknown'
  };
}

/**
 * Deduplicate records by unique transaction reference and merge rule IDs/names
 */
export function deduplicateAndMergeTransactions(normalizedRecords: TransactionRecord[]): TransactionRecord[] {
  const txMap = new Map<string, TransactionRecord & { rule_ids_set: Set<string>; rule_names_set: Set<string> }>();

  for (const record of normalizedRecords) {
    const ref = record.id;
    if (!txMap.has(ref)) {
      txMap.set(ref, {
        ...record,
        rule_ids_set: new Set(record.rule_ids),
        rule_names_set: new Set(record.rule_names)
      });
    } else {
      const existing = txMap.get(ref)!;
      record.rule_ids.forEach(id => existing.rule_ids_set.add(id));
      record.rule_names.forEach(name => existing.rule_names_set.add(name));
      if (record.alert_close_type && record.alert_close_type !== 'Open Alert' && record.alert_close_type !== 'Pending Review') {
        existing.alert_close_type = record.alert_close_type;
      }
      if (record.reviewed_by) existing.reviewed_by = record.reviewed_by;
    }
  }

  return Array.from(txMap.values()).map(tx => ({
    ...tx,
    rule_ids: Array.from(tx.rule_ids_set),
    rule_names: Array.from(tx.rule_names_set),
    rule_id: Array.from(tx.rule_ids_set).join('; ')
  }));
}

/**
 * Groups deduplicated transactions at Customer / Entity Cluster level
 */
export function groupEtransferTransactions(deduplicatedRecords: TransactionRecord[]): GroupedEntity[] {
  const groupsMap = new Map<string, {
    grouping_key: string;
    grouping_key_source: string;
    transaction_direction: TransactionDirection;
    client_id: string;
    client_name: string;
    customer_id: string;
    customer_account: string;
    transaction_count: number;
    total_amount: number;
    first_transaction_date: string | null;
    last_transaction_date: string | null;
    rules_set: Set<string>;
    alert_close_types_set: Set<string>;
    reviewed_by_set: Set<string>;
    has_unknown_direction: boolean;
    transactions: TransactionRecord[];
  }>();

  for (const record of deduplicatedRecords) {
    const key = `${record.client_id}::${record.grouping_key}::${record.transaction_direction}`;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        grouping_key: record.grouping_key,
        grouping_key_source: record.grouping_key_source,
        transaction_direction: record.transaction_direction,
        client_id: record.client_id,
        client_name: record.client_name,
        customer_id: record.customer_id,
        customer_account: record.customer_account,
        transaction_count: 0,
        total_amount: 0,
        first_transaction_date: record.transaction_date,
        last_transaction_date: record.transaction_date,
        rules_set: new Set(),
        alert_close_types_set: new Set(),
        reviewed_by_set: new Set(),
        has_unknown_direction: false,
        transactions: []
      });
    }

    const group = groupsMap.get(key)!;
    group.transaction_count += 1;
    group.total_amount += record.amount;

    if (record.transaction_date) {
      if (!group.first_transaction_date || record.transaction_date < group.first_transaction_date) {
        group.first_transaction_date = record.transaction_date;
      }
      if (!group.last_transaction_date || record.transaction_date > group.last_transaction_date) {
        group.last_transaction_date = record.transaction_date;
      }
    }

    record.rule_names.forEach(r => group.rules_set.add(r));
    if (record.alert_close_type) group.alert_close_types_set.add(record.alert_close_type);
    if (record.reviewed_by) group.reviewed_by_set.add(record.reviewed_by);
    if (record.needs_review) group.has_unknown_direction = true;

    group.transactions.push(record);
  }

  const summaryArray: GroupedEntity[] = Array.from(groupsMap.values()).map((group, index) => {
    const ruleNamesArr = Array.from(group.rules_set);
    const alertCloseTypesArr = Array.from(group.alert_close_types_set);
    const reviewedByArr = Array.from(group.reviewed_by_set);

    let riskLevel: 'Normal' | 'Elevated' | 'Critical' | 'Review Required' = 'Normal';
    let riskScore = 15;

    if (group.has_unknown_direction) {
      riskLevel = 'Review Required';
      riskScore = 50;
    }

    if (ruleNamesArr.length > 0) {
      riskScore += ruleNamesArr.length * 20;
      if (riskScore > 70) riskLevel = 'Elevated';
    }

    const containsKeyword = group.transactions.some(tx => {
      const text = `${tx.memo || ''} ${tx.sec_answer || ''} ${tx.recipient_name || ''} ${tx.sender_name || ''}`;
      return containsHighRiskKeyword(text);
    });

    if (containsKeyword) {
      riskLevel = 'Critical';
      riskScore = Math.max(riskScore, 85);
    }

    const primaryCorp = group.transactions.find(t => t.corporation_code && t.corporation_code !== 'N/A')?.corporation_code || 'Unspecified Corporation';

    // Calculate Directional Macro & Dispersion Metrics
    // For Incoming: counterparties are the senders transferring funds into the cluster
    // For Outgoing: counterparties are the recipients receiving funds from the cluster
    const isIncoming = group.transaction_direction === 'Incoming';
    const emailStatsMap = new Map<string, CounterpartyStat>();

    group.transactions.forEach(tx => {
      const email = isIncoming
        ? (tx.sender_email !== 'N/A' ? tx.sender_email : tx.sender_name)
        : (tx.recipient_email !== 'N/A' ? tx.recipient_email : tx.recipient_name);

      if (!email || email === 'N/A') return;

      if (!emailStatsMap.has(email)) {
        emailStatsMap.set(email, {
          email,
          volume: 0,
          txns: 0,
          first_seen: tx.transaction_date || 'N/A',
          is_new: false
        });
      }

      const item = emailStatsMap.get(email)!;
      item.volume += tx.amount;
      item.txns += 1;
      if (tx.transaction_date && (item.first_seen === 'N/A' || tx.transaction_date < item.first_seen)) {
        item.first_seen = tx.transaction_date;
      }
    });

    const emailStatsList = Array.from(emailStatsMap.values()).sort((a, b) => b.volume - a.volume);
    const distinctEmailsCount = emailStatsList.length || 1;

    // Fan-out ratio for outgoing dispersion (distinct counterparties / total txns)
    const fanOutRatio = !isIncoming
      ? Math.min(1.0, Math.round((distinctEmailsCount / Math.max(1, group.transaction_count)) * 100) / 100)
      : 0;

    // Counterparty recency
    const newEmailsCount = emailStatsList.filter(e => e.first_seen !== 'N/A' && e.txns <= 3).length;
    const pctNewEmails = Math.round((newEmailsCount / Math.max(1, distinctEmailsCount)) * 100);

    // Dynamic Volume Spike calculation based on transaction clustering
    const recentTxns = group.transactions.filter(t => t.transaction_date && new Date(t.transaction_date).getTime() > Date.now() - 14 * 86400 * 1000).length;
    const volumeSpikePct = Math.min(100, Math.round((recentTxns / Math.max(1, group.transaction_count)) * 100));

    // Dynamic Interbank ratio estimation
    const distinctOperators = new Set(group.transactions.map(t => t.operator_code)).size;
    const interbankPct = Math.min(100, Math.round((distinctOperators / Math.max(1, group.transaction_count)) * 100));

    return {
      id: `GRP-${index + 1}`,
      grouping_key: group.grouping_key,
      grouping_key_source: group.grouping_key_source,
      transaction_direction: group.transaction_direction,
      client_id: group.client_id,
      client_name: group.client_name,
      corporation_code: primaryCorp,
      customer_id: group.customer_id,
      customer_account: group.customer_account,
      transaction_count: group.transaction_count,
      total_amount: Math.round(group.total_amount * 100) / 100,
      first_transaction_date: group.first_transaction_date || 'N/A',
      last_transaction_date: group.last_transaction_date || 'N/A',
      distinct_rule_count: ruleNamesArr.length,
      rule_names: ruleNamesArr,
      alert_close_types: alertCloseTypesArr,
      reviewed_by_users: reviewedByArr,
      has_unknown_direction: group.has_unknown_direction,
      risk_level: riskLevel,
      risk_score: riskScore,
      contains_keyword: containsKeyword,

      distinct_emails_count: distinctEmailsCount,
      fan_out_ratio: fanOutRatio,
      pct_new_emails: pctNewEmails,
      volume_spike_pct: volumeSpikePct,
      interbank_pct: interbankPct,
      top_recipient_emails: emailStatsList,
      transactions: group.transactions
    };
  });

  summaryArray.sort((a, b) => b.risk_score - a.risk_score);
  return summaryArray;
}

export function processEtransferData(rawRows: Record<string, any>[]): DataState {
  if (!rawRows || rawRows.length === 0) {
    throw new Error('The worksheet contains no data rows.');
  }

  const sampleRow = rawRows[0];
  const headers = Object.keys(sampleRow);
  const validation = validateEtransferHeaders(headers);

  if (!validation.valid) {
    throw new Error(`Missing required columns in "Full_Analysis": ${validation.missing.join(', ')}`);
  }

  const normalizedRecords = rawRows.map((row, idx) => normalizeEtransferRecord(row, idx));
  // Single deduplication! (Fixing double-deduplication bug)
  const deduplicatedRecords = deduplicateAndMergeTransactions(normalizedRecords);
  const groupedEntities = groupEtransferTransactions(deduplicatedRecords);

  return {
    totalRecords: deduplicatedRecords.length,
    groupedEntities,
    normalizedRecords: deduplicatedRecords,
    activeRail: 'ETRANSFER'
  };
}
