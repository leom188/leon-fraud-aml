/**
 * ETRANSFER Transaction Processing Engine
 * Flexible schema resolution supporting both technical SQL field names
 * and business-friendly column names with full value decoding, rule ID merging,
 * and exact raw record preservation.
 */

// Field Definitions with Technical Names, Business Labels, and Column Aliases
export const FIELD_DEFINITIONS = {
  TRX_TRAN_DATE: {
    label: 'Transaction Date',
    required: false,
    aliases: ['TRX_TRAN_DATE', 'TRANSACTION DATE', 'TRAN_DATE', 'DATE', 'TX_DATE', 'SENT DATE_EDT', 'SENT DATE']
  },
  TRX_TRAN_TYP: {
    label: 'Transaction Type',
    required: false,
    aliases: ['TRX_TRAN_TYP', 'TRANSACTION TYPE', 'TRAN_TYP', 'TYPE']
  },
  TRX_DEB_CRE_IND: {
    label: 'Direction Indicator (D=Incoming, C=Outgoing)',
    required: true,
    aliases: ['TRX_DEB_CRE_IND', 'DIRECTION', 'DEB_CRE_IND', 'DEBIT_CREDIT_INDICATOR', 'DEB_CRE', 'IND']
  },
  CORPORATION_CODE: {
    label: 'Corporation Code (5000=DCBANK, 5001=Pateno, 5002=DCPayments)',
    required: false,
    aliases: ['CORPORATION_CODE', 'CORPORATION CODE', 'CORPORATION', 'CORP_CODE', 'CORP']
  },
  TRX_RULE_ID: {
    label: 'Rule ID / Alert ID',
    required: false,
    aliases: ['TRX_RULE_ID', 'RULE ID', 'ALERT ID', 'RULE_ID', 'ALERT_ID', 'RULEID']
  },
  RULE_NAMES: {
    label: 'Rule Name(s)',
    required: false,
    aliases: ['RULE_NAMES', 'RULE NAME', 'RULE_NAME', 'NAME', 'STRING_AGG', 'RULES', 'RULE_NAME_AGG', '(NO COLUMN NAME)', 'NO COLUMN NAME']
  },
  TRX_REF_NUM: {
    label: 'Transaction Ref Number',
    required: false,
    aliases: ['TRX_REF_NUM', 'REF NUM', 'REFERENCE NUMBER', 'REF_NUM', 'TRX_REF', 'REFERENCE', 'REFERENCENUMBER']
  },
  TRX_SESSION_ID: {
    label: 'Interac Ref 1 (Session ID)',
    required: false,
    aliases: ['TRX_SESSION_ID', 'INTERAC REF 1', 'SESSION ID', 'INTERAC_REF_1', 'SESSION_ID', 'INTERAC PAYMENT REFERENCE']
  },
  TRX_FREE_TEXT_10: {
    label: 'Interac Ref 2',
    required: false,
    aliases: ['TRX_FREE_TEXT_10', 'INTERAC REF 2', 'FREE_TEXT_10', 'INTERAC_REF_2']
  },
  TRX_TRAN_NUM_BY_TERM_OWN: {
    label: 'Client Name',
    required: true,
    aliases: ['TRX_TRAN_NUM_BY_TERM_OWN', 'CLIENT NAME', 'TRAN_NUM_BY_TERM_OWN', 'CLIENT_NAME', 'TERM_OWN']
  },
  TRX_BKM_MERC_UNIQUE_ID: {
    label: 'Client ID',
    required: true,
    aliases: ['TRX_BKM_MERC_UNIQUE_ID', 'CLIENT ID', 'BKM_MERC_UNIQUE_ID', 'CLIENT_ID', 'MERCHANT ID', 'UNIQUE_ID']
  },
  TRX_CUST_NUM: {
    label: 'Customer ID',
    required: true,
    aliases: ['TRX_CUST_NUM', 'CUSTOMER ID', 'CUST_NUM', 'CUSTOMER_ID', 'CUST NUM']
  },
  TRX_ACCT_NUM: {
    label: 'Customer Account Number',
    required: true,
    aliases: ['TRX_ACCT_NUM', 'CUSTOMER ACCOUNT', 'ACCT_NUM', 'CUSTOMER_ACCOUNT', 'ACCOUNT NUMBER', 'ACCOUNT']
  },
  TRX_ORIG_CRNCY_CDE: {
    label: 'Currency',
    required: false,
    aliases: ['TRX_ORIG_CRNCY_CDE', 'CURRENCY', 'ORIG_CRNCY_CDE', 'CRNCY']
  },
  TRX_AMT1: {
    label: 'Transaction Amount',
    required: true,
    aliases: ['TRX_AMT1', 'AMOUNT', 'AMT1', 'AMT', 'TRANSACTION AMOUNT']
  },
  TRX_ACCT_BEN_NAME: {
    label: 'Recipient Name',
    required: true,
    aliases: ['TRX_ACCT_BEN_NAME', 'RECIPIENT_NAME', 'RECIPIENT NAME', 'BEN_NAME', 'ACCT_BEN_NAME', 'SENT TO NAME']
  },
  TRX_BEN_ACCT_NUM: {
    label: 'Recipient Email',
    required: true,
    aliases: ['TRX_BEN_ACCT_NUM', 'RECIPIENT_EMAIL', 'RECIPIENT EMAIL', 'BEN_ACCT_NUM', 'RECIPIENT', 'SENT TO EMAIL']
  },
  TRX_FREE_TEXT_8: {
    label: 'Sender Name',
    required: true,
    aliases: ['TRX_FREE_TEXT_8', 'SENDER_NAME', 'SENDER NAME', 'FREE_TEXT_8']
  },
  TRX_FREE_TEXT_3: {
    label: 'Sender Email',
    required: true,
    aliases: ['TRX_FREE_TEXT_3', 'SENDER_EMAIL', 'SENDER EMAIL', 'FREE_TEXT_3', 'SENDER']
  },
  TRX_OLD_VALUE: {
    label: 'Security Question',
    required: false,
    aliases: ['TRX_OLD_VALUE', 'QUESTION', 'SECURITY QUESTION', 'OLD_VALUE', 'OLD VALUE']
  },
  TRX_NEW_VALUE: {
    label: 'Security Answer',
    required: false,
    aliases: ['TRX_NEW_VALUE', 'ANSWER', 'SECURITY ANSWER', 'NEW_VALUE', 'NEW VALUE', 'SECURITY QUESTION ANSWER']
  },
  TRX_SEN_MESSAGE: {
    label: 'Message / Memo',
    required: false,
    aliases: ['TRX_SEN_MESSAGE', 'MESSAGE', 'MEMO', 'SEN_MESSAGE', 'SEN MESSAGE']
  },
  TRX_OPERATOR_CODE: {
    label: 'Operator Code',
    required: true,
    aliases: ['TRX_OPERATOR_CODE', 'OPERATOR', 'OPERATOR CODE', 'OPERATOR_CODE']
  },
  TRX_TRAN_AREA: {
    label: 'City (Outgoing)',
    required: false,
    aliases: ['TRX_TRAN_AREA', 'CITY', 'TRAN_AREA', 'AREA']
  },
  TRX_TERM_COUNTRY: {
    label: 'Country',
    required: false,
    aliases: ['TRX_TERM_COUNTRY', 'COUNTRY', 'TERM_COUNTRY']
  },
  TRX_FREE_FLAG_3: {
    label: 'Autodeposit Flag (1=Yes, 0=No)',
    required: false,
    aliases: ['TRX_FREE_FLAG_3', 'AUTODEPOSIT', 'FREE_FLAG_3', 'AUTO DEPOSIT']
  },
  TRX_MSG_TYPE: {
    label: 'Transaction Status',
    required: false,
    aliases: ['TRX_MSG_TYPE', 'STATUS', 'MSG_TYPE', 'MESSAGE TYPE']
  },
  TRX_TRAN_CDE: {
    label: 'Transaction Code (4=Received, 9=Sent, 10=Request)',
    required: false,
    aliases: ['TRX_TRAN_CDE', 'TRANSACTION CODE', 'TRAN_CDE', 'TRX_CDE']
  },
  ALERT_CLOSE_TYPE: {
    label: 'Alert Close Type (109=False Positive, 110=UTR, 111=RFI)',
    required: false,
    aliases: ['ALERT_CLOSE_TYPE', 'ALERT CLOSE TYPE', 'CLOSE TYPE', 'CLOSE_TYPE']
  },
  TRX_ANALYSED_BY: {
    label: 'Analysed By User ID',
    required: false,
    aliases: ['TRX_ANALYSED_BY', 'ANALYSED BY', 'ANALYST', 'ANALYSED_BY', 'REVIEWED BY']
  }
};

export const REQUIRED_COLUMNS = Object.keys(FIELD_DEFINITIONS).filter(k => FIELD_DEFINITIONS[k].required);

/**
 * Value Decoding Mappings
 */
export const VALUE_DECODERS = {
  CORPORATION_CODE: (val) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '5000') return '5000 (DCBANK)';
    if (s === '5001') return '5001 (Pateno)';
    if (s === '5002') return '5002 (DCPayments)';
    return s;
  },
  TRX_TRAN_CDE: (val) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '4') return '4 (Money Received)';
    if (s === '9') return '9 (Money Sent)';
    if (s === '10') return '10 (Money Request)';
    return s;
  },
  ALERT_CLOSE_TYPE: (val) => {
    if (!val) return 'Pending Review';
    const s = String(val).trim();
    if (s === '109') return '109 (False Positive)';
    if (s === '110') return '110 (UTR)';
    if (s === '111') return '111 (RFI)';
    return s;
  },
  TRX_FREE_FLAG_3: (val) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '1' || s.toLowerCase() === 'yes' || s.toLowerCase() === 'true') return '1 (Yes)';
    if (s === '0' || s.toLowerCase() === 'no' || s.toLowerCase() === 'false') return '0 (No)';
    return s;
  }
};

/**
 * Clean & normalize string values.
 * Treats "", null, undefined, "N/A", "NA", "null", "NULL", whitespace as missing.
 */
export function cleanValue(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str) return null;
  const lower = str.toLowerCase();
  if (['n/a', 'na', 'null', 'undefined', 'none', '-'].includes(lower)) {
    return null;
  }
  return str;
}

export function cleanEmail(val) {
  const cleaned = cleanValue(val);
  return cleaned ? cleaned.toLowerCase() : null;
}

export function cleanName(val) {
  const cleaned = cleanValue(val);
  return cleaned ? cleaned.replace(/\s+/g, ' ') : null;
}

export function parseAmount(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[\$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return date.toISOString().split('T')[0];
}

export function determineDirection(debCreInd) {
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

/**
 * Determine Grouping Key & Source:
 * 1. Incoming:
   - RECIPIENT_EMAIL (TRX_BEN_ACCT_NUM)
   - Fallback: RECIPIENT_NAME (TRX_ACCT_BEN_NAME)
 * 2. Outgoing:
   - SENDER_EMAIL (TRX_FREE_TEXT_3)
   - Fallback: TRX_OPERATOR_CODE
 */
export function determineGroupingKey(direction, recipientEmail, recipientName, senderEmail, operatorCode) {
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

/**
 * Resolve a field value from a raw row object using all known aliases.
 */
export function getFieldValue(row, fieldKey) {
  if (!row || typeof row !== 'object') return undefined;

  const def = FIELD_DEFINITIONS[fieldKey];
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

/**
 * Validate that required fields exist in raw header list (checking all aliases).
 */
export function validateWorksheetColumns(headers) {
  if (!headers || !Array.isArray(headers)) {
    return { valid: false, missing: Object.keys(FIELD_DEFINITIONS).filter(k => FIELD_DEFINITIONS[k].required) };
  }

  const normalizedHeaders = headers.map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const missingFields = [];

  Object.entries(FIELD_DEFINITIONS).forEach(([fieldKey, def]) => {
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

/**
 * Normalize a single transaction row into standard record schema using alias mapping.
 */
export function normalizeTransactionRecord(row, index) {
  const direction = determineDirection(getFieldValue(row, 'TRX_DEB_CRE_IND'));
  const recipientName = cleanName(getFieldValue(row, 'TRX_ACCT_BEN_NAME'));
  const recipientEmail = cleanEmail(getFieldValue(row, 'TRX_BEN_ACCT_NUM'));
  const senderName = cleanName(getFieldValue(row, 'TRX_FREE_TEXT_8'));
  const senderEmail = cleanEmail(getFieldValue(row, 'TRX_FREE_TEXT_3'));
  const operatorCode = cleanValue(getFieldValue(row, 'TRX_OPERATOR_CODE'));

  const { key: groupingKey, source: groupingKeySource } = determineGroupingKey(
    direction,
    recipientEmail,
    recipientName,
    senderEmail,
    operatorCode
  );

  const amount = parseAmount(getFieldValue(row, 'TRX_AMT1'));
  const tranDate = parseDate(getFieldValue(row, 'TRX_TRAN_DATE'));

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
    raw_record: row, // Preserves 100% exact raw row values from the Excel file

    // Normalized calculated fields
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

    // Decoded Financial & Business Details
    amount,
    transaction_date: tranDate,
    transaction_type: cleanValue(getFieldValue(row, 'TRX_TRAN_TYP')) || 'E-TRANSFER',
    corporation_code: VALUE_DECODERS.CORPORATION_CODE(corpCodeRaw),
    operator_code: operatorCode || 'N/A',
    city: cleanValue(getFieldValue(row, 'TRX_TRAN_AREA')) || 'N/A',
    country: cleanValue(getFieldValue(row, 'TRX_TERM_COUNTRY')) || 'CAN',
    autodeposit_flag: VALUE_DECODERS.TRX_FREE_FLAG_3(getFieldValue(row, 'TRX_FREE_FLAG_3')),
    transaction_status: cleanValue(getFieldValue(row, 'TRX_MSG_TYPE')) || 'COMPLETED',
    transaction_code: VALUE_DECODERS.TRX_TRAN_CDE(tranCodeRaw),
    currency: cleanValue(getFieldValue(row, 'TRX_ORIG_CRNCY_CDE')) || 'CAD',

    // Security & Messages
    sec_question: cleanValue(getFieldValue(row, 'TRX_OLD_VALUE')),
    sec_answer: cleanValue(getFieldValue(row, 'TRX_NEW_VALUE')),
    memo: cleanValue(getFieldValue(row, 'TRX_SEN_MESSAGE')),
    interac_ref1: cleanValue(getFieldValue(row, 'TRX_SESSION_ID')),
    interac_ref2: cleanValue(getFieldValue(row, 'TRX_FREE_TEXT_10')),

    // Audit / Rules
    rule_ids: ruleId ? [ruleId] : [],
    rule_names: ruleNamesList,
    alert_close_type: VALUE_DECODERS.ALERT_CLOSE_TYPE(alertCloseTypeRaw),
    reviewed_by: reviewedBy,
    needs_review: direction === 'Unknown'
  };
}

/**
 * Deduplicate transactions by TRX_REF_NUM if the Excel file contains multiple rows
 * for the same transaction (e.g. 1 row per triggered Rule ID).
 * Merges rule IDs and rule names together so total amount & transaction count are exact!
 */
export function deduplicateAndMergeTransactions(normalizedRecords) {
  const txMap = new Map();

  for (const record of normalizedRecords) {
    const ref = record.id;
    if (!txMap.has(ref)) {
      txMap.set(ref, { ...record, rule_ids_set: new Set(record.rule_ids), rule_names_set: new Set(record.rule_names) });
    } else {
      const existing = txMap.get(ref);
      record.rule_ids.forEach(id => existing.rule_ids_set.add(id));
      record.rule_names.forEach(name => existing.rule_names_set.add(name));
      if (record.alert_close_type && record.alert_close_type !== 'Pending Review') {
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
 * Group normalized transactions at Customer/Entity level.
 */
export function groupTransactions(normalizedRecords) {
  const mergedRecords = deduplicateAndMergeTransactions(normalizedRecords);
  const groupsMap = new Map();

  for (const record of mergedRecords) {
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

    const group = groupsMap.get(key);
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

  const summaryArray = Array.from(groupsMap.values()).map((group, index) => {
    const ruleNamesArr = Array.from(group.rules_set);
    const alertCloseTypesArr = Array.from(group.alert_close_types_set);
    const reviewedByArr = Array.from(group.reviewed_by_set);

    let riskLevel = 'Normal';
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
      const text = `${tx.memo || ''} ${tx.sec_answer || ''} ${tx.recipient_name || ''} ${tx.sender_name || ''}`.toLowerCase();
      return text.includes('weed') || text.includes('canna') || text.includes('crypto') || text.includes('wire');
    });

    if (containsKeyword) {
      riskLevel = 'Critical';
      riskScore = Math.max(riskScore, 85);
    }

    const primaryCorp = group.transactions.find(t => t.corporation_code && t.corporation_code !== 'N/A')?.corporation_code || 'Unspecified Corporation';

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
      transactions: group.transactions
    };
  });

  summaryArray.sort((a, b) => b.risk_score - a.risk_score);
  return summaryArray;
}

/**
 * Main ingestion processor function.
 */
export function processEtransferData(rawRows) {
  if (!rawRows || rawRows.length === 0) {
    throw new Error('The worksheet contains no data rows.');
  }

  const sampleRow = rawRows[0];
  const headers = Object.keys(sampleRow);
  const validation = validateWorksheetColumns(headers);

  if (!validation.valid) {
    throw new Error(`Missing required columns in "Full_Analysis": ${validation.missing.join(', ')}`);
  }

  const normalizedRecords = rawRows.map((row, idx) => normalizeTransactionRecord(row, idx));
  const deduplicatedRecords = deduplicateAndMergeTransactions(normalizedRecords);
  const groupedEntities = groupTransactions(deduplicatedRecords);

  return {
    totalRecords: deduplicatedRecords.length,
    groupedEntities,
    normalizedRecords: deduplicatedRecords
  };
}
