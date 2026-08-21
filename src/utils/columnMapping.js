/**
 * LEON Column & Field Mapping Registry
 * Supports payment rail differentiation (ETRANSFER, CARD, ACH/EFT)
 * and dynamic schema renaming with localStorage persistence.
 * Contains 100% of all standard SQL/Excel ingestion columns.
 */

export const DEFAULT_COLUMN_MAPPINGS = {
  // ==========================================
  // ETRANSFER RAIL (Interac e-Transfer Schema)
  // ==========================================
  'ETRANSFER:TRX_BEN_ACCT_NUM': {
    id: 'ETRANSFER:TRX_BEN_ACCT_NUM',
    key: 'TRX_BEN_ACCT_NUM',
    rail: 'ETRANSFER',
    defaultLabel: 'Payee Email',
    customLabel: 'Payee Email'
  },
  'ETRANSFER:TRX_ACCT_BEN_NAME': {
    id: 'ETRANSFER:TRX_ACCT_BEN_NAME',
    key: 'TRX_ACCT_BEN_NAME',
    rail: 'ETRANSFER',
    defaultLabel: 'Payee Name',
    customLabel: 'Payee Name'
  },
  'ETRANSFER:TRX_FREE_TEXT_3': {
    id: 'ETRANSFER:TRX_FREE_TEXT_3',
    key: 'TRX_FREE_TEXT_3',
    rail: 'ETRANSFER',
    defaultLabel: 'Sender Email',
    customLabel: 'Sender Email'
  },
  'ETRANSFER:TRX_FREE_TEXT_8': {
    id: 'ETRANSFER:TRX_FREE_TEXT_8',
    key: 'TRX_FREE_TEXT_8',
    rail: 'ETRANSFER',
    defaultLabel: 'Sender Name',
    customLabel: 'Sender Name'
  },
  'ETRANSFER:TRX_AMT1': {
    id: 'ETRANSFER:TRX_AMT1',
    key: 'TRX_AMT1',
    rail: 'ETRANSFER',
    defaultLabel: 'Amount',
    customLabel: 'Amount'
  },
  'ETRANSFER:TRX_SEN_MESSAGE': {
    id: 'ETRANSFER:TRX_SEN_MESSAGE',
    key: 'TRX_SEN_MESSAGE',
    rail: 'ETRANSFER',
    defaultLabel: 'Message',
    customLabel: 'Message'
  },
  'ETRANSFER:TRX_OPERATOR_CODE': {
    id: 'ETRANSFER:TRX_OPERATOR_CODE',
    key: 'TRX_OPERATOR_CODE',
    rail: 'ETRANSFER',
    defaultLabel: 'Interac ID',
    customLabel: 'Interac ID'
  },
  'ETRANSFER:TRX_SESSION_ID': {
    id: 'ETRANSFER:TRX_SESSION_ID',
    key: 'TRX_SESSION_ID',
    rail: 'ETRANSFER',
    defaultLabel: 'Interac Ref',
    customLabel: 'Interac Ref'
  },
  'ETRANSFER:TRX_FREE_TEXT_10': {
    id: 'ETRANSFER:TRX_FREE_TEXT_10',
    key: 'TRX_FREE_TEXT_10',
    rail: 'ETRANSFER',
    defaultLabel: 'Interac Ref (2)',
    customLabel: 'Interac Ref (2)'
  },
  'ETRANSFER:TRX_REF_NUM': {
    id: 'ETRANSFER:TRX_REF_NUM',
    key: 'TRX_REF_NUM',
    rail: 'ETRANSFER',
    defaultLabel: 'Ref Number',
    customLabel: 'Ref Number'
  },
  'ETRANSFER:TRX_TRAN_DATE': {
    id: 'ETRANSFER:TRX_TRAN_DATE',
    key: 'TRX_TRAN_DATE',
    rail: 'ETRANSFER',
    defaultLabel: 'Transaction Date',
    customLabel: 'Transaction Date'
  },
  'ETRANSFER:TRX_DEB_CRE_IND': {
    id: 'ETRANSFER:TRX_DEB_CRE_IND',
    key: 'TRX_DEB_CRE_IND',
    rail: 'ETRANSFER',
    defaultLabel: 'Direction',
    customLabel: 'Direction'
  },
  'ETRANSFER:TRX_OLD_VALUE': {
    id: 'ETRANSFER:TRX_OLD_VALUE',
    key: 'TRX_OLD_VALUE',
    rail: 'ETRANSFER',
    defaultLabel: 'Security Question',
    customLabel: 'Security Question'
  },
  'ETRANSFER:TRX_NEW_VALUE': {
    id: 'ETRANSFER:TRX_NEW_VALUE',
    key: 'TRX_NEW_VALUE',
    rail: 'ETRANSFER',
    defaultLabel: 'Security Answer',
    customLabel: 'Security Answer'
  },
  'ETRANSFER:RULE_NAMES': {
    id: 'ETRANSFER:RULE_NAMES',
    key: 'RULE_NAMES',
    rail: 'ETRANSFER',
    defaultLabel: 'Rule Name',
    customLabel: 'Rule Name'
  },
  'ETRANSFER:TRX_RULE_ID': {
    id: 'ETRANSFER:TRX_RULE_ID',
    key: 'TRX_RULE_ID',
    rail: 'ETRANSFER',
    defaultLabel: 'Rule ID',
    customLabel: 'Rule ID'
  },
  'ETRANSFER:TRX_TRAN_NUM_BY_TERM_OWN': {
    id: 'ETRANSFER:TRX_TRAN_NUM_BY_TERM_OWN',
    key: 'TRX_TRAN_NUM_BY_TERM_OWN',
    rail: 'ETRANSFER',
    defaultLabel: 'Client Name',
    customLabel: 'Client Name'
  },
  'ETRANSFER:TRX_BKM_MERC_UNIQUE_ID': {
    id: 'ETRANSFER:TRX_BKM_MERC_UNIQUE_ID',
    key: 'TRX_BKM_MERC_UNIQUE_ID',
    rail: 'ETRANSFER',
    defaultLabel: 'Client ID',
    customLabel: 'Client ID'
  },
  'ETRANSFER:TRX_CUST_NUM': {
    id: 'ETRANSFER:TRX_CUST_NUM',
    key: 'TRX_CUST_NUM',
    rail: 'ETRANSFER',
    defaultLabel: 'Customer ID',
    customLabel: 'Customer ID'
  },
  'ETRANSFER:TRX_ACCT_NUM': {
    id: 'ETRANSFER:TRX_ACCT_NUM',
    key: 'TRX_ACCT_NUM',
    rail: 'ETRANSFER',
    defaultLabel: 'Customer Account',
    customLabel: 'Customer Account'
  },
  'ETRANSFER:CORPORATION_CODE': {
    id: 'ETRANSFER:CORPORATION_CODE',
    key: 'CORPORATION_CODE',
    rail: 'ETRANSFER',
    defaultLabel: 'Corporation Code',
    customLabel: 'Corporation Code'
  },
  'ETRANSFER:TRX_ORIG_CRNCY_CDE': {
    id: 'ETRANSFER:TRX_ORIG_CRNCY_CDE',
    key: 'TRX_ORIG_CRNCY_CDE',
    rail: 'ETRANSFER',
    defaultLabel: 'Currency',
    customLabel: 'Currency'
  },
  'ETRANSFER:TRX_TRAN_AREA': {
    id: 'ETRANSFER:TRX_TRAN_AREA',
    key: 'TRX_TRAN_AREA',
    rail: 'ETRANSFER',
    defaultLabel: 'City (Outgoing)',
    customLabel: 'City (Outgoing)'
  },
  'ETRANSFER:TRX_TERM_COUNTRY': {
    id: 'ETRANSFER:TRX_TERM_COUNTRY',
    key: 'TRX_TERM_COUNTRY',
    rail: 'ETRANSFER',
    defaultLabel: 'Country Code',
    customLabel: 'Country Code'
  },
  'ETRANSFER:TRX_FREE_FLAG_3': {
    id: 'ETRANSFER:TRX_FREE_FLAG_3',
    key: 'TRX_FREE_FLAG_3',
    rail: 'ETRANSFER',
    defaultLabel: 'Autodeposit Flag (1=Yes, 0=No)',
    customLabel: 'Autodeposit Flag (1=Yes, 0=No)'
  },
  'ETRANSFER:TRX_MSG_TYPE': {
    id: 'ETRANSFER:TRX_MSG_TYPE',
    key: 'TRX_MSG_TYPE',
    rail: 'ETRANSFER',
    defaultLabel: 'Transaction Status',
    customLabel: 'Transaction Status'
  },
  'ETRANSFER:TRX_TRAN_CDE': {
    id: 'ETRANSFER:TRX_TRAN_CDE',
    key: 'TRX_TRAN_CDE',
    rail: 'ETRANSFER',
    defaultLabel: 'Transaction Code (4=Recv, 9=Sent)',
    customLabel: 'Transaction Code (4=Recv, 9=Sent)'
  },
  'ETRANSFER:ALERT_CLOSE_TYPE': {
    id: 'ETRANSFER:ALERT_CLOSE_TYPE',
    key: 'ALERT_CLOSE_TYPE',
    rail: 'ETRANSFER',
    defaultLabel: 'Alert Close Type',
    customLabel: 'Alert Close Type'
  },
  'ETRANSFER:TRX_ANALYSED_BY': {
    id: 'ETRANSFER:TRX_ANALYSED_BY',
    key: 'TRX_ANALYSED_BY',
    rail: 'ETRANSFER',
    defaultLabel: 'Analysed By',
    customLabel: 'Analysed By'
  },

  // ==========================================
  // CARD RAIL (Future Card Payments Rail)
  // ==========================================
  'CARD:TRX_BEN_ACCT_NUM': {
    id: 'CARD:TRX_BEN_ACCT_NUM',
    key: 'TRX_BEN_ACCT_NUM',
    rail: 'CARD',
    defaultLabel: 'Merchant ID / Terminal ID',
    customLabel: 'Merchant ID / Terminal ID'
  },
  'CARD:TRX_ACCT_BEN_NAME': {
    id: 'CARD:TRX_ACCT_BEN_NAME',
    key: 'TRX_ACCT_BEN_NAME',
    rail: 'CARD',
    defaultLabel: 'Merchant Trade Name (DBA)',
    customLabel: 'Merchant Trade Name (DBA)'
  },
  'CARD:TRX_FREE_TEXT_3': {
    id: 'CARD:TRX_FREE_TEXT_3',
    key: 'TRX_FREE_TEXT_3',
    rail: 'CARD',
    defaultLabel: 'Cardholder Name / Masked PAN',
    customLabel: 'Cardholder Name / Masked PAN'
  },
  'CARD:TRX_FREE_TEXT_8': {
    id: 'CARD:TRX_FREE_TEXT_8',
    key: 'TRX_FREE_TEXT_8',
    rail: 'CARD',
    defaultLabel: 'Cardholder Billing Name',
    customLabel: 'Cardholder Billing Name'
  },
  'CARD:TRX_AMT1': {
    id: 'CARD:TRX_AMT1',
    key: 'TRX_AMT1',
    rail: 'CARD',
    defaultLabel: 'Auth Amount',
    customLabel: 'Auth Amount'
  },
  'CARD:TRX_SEN_MESSAGE': {
    id: 'CARD:TRX_SEN_MESSAGE',
    key: 'TRX_SEN_MESSAGE',
    rail: 'CARD',
    defaultLabel: 'MCC / Auth Response Text',
    customLabel: 'MCC / Auth Response Text'
  },
  'CARD:TRX_OPERATOR_CODE': {
    id: 'CARD:TRX_OPERATOR_CODE',
    key: 'TRX_OPERATOR_CODE',
    rail: 'CARD',
    defaultLabel: 'POS Entry Mode / Terminal Type',
    customLabel: 'POS Entry Mode / Terminal Type'
  },
  'CARD:TRX_SESSION_ID': {
    id: 'CARD:TRX_SESSION_ID',
    key: 'TRX_SESSION_ID',
    rail: 'CARD',
    defaultLabel: 'Acquirer Ref Number (ARN)',
    customLabel: 'Acquirer Ref Number (ARN)'
  },
  'CARD:TRX_REF_NUM': {
    id: 'CARD:TRX_REF_NUM',
    key: 'TRX_REF_NUM',
    rail: 'CARD',
    defaultLabel: 'Card Network Auth Code',
    customLabel: 'Card Network Auth Code'
  },
  'CARD:TRX_TRAN_DATE': {
    id: 'CARD:TRX_TRAN_DATE',
    key: 'TRX_TRAN_DATE',
    rail: 'CARD',
    defaultLabel: 'Settlement Date',
    customLabel: 'Settlement Date'
  },
  'CARD:TRX_DEB_CRE_IND': {
    id: 'CARD:TRX_DEB_CRE_IND',
    key: 'TRX_DEB_CRE_IND',
    rail: 'CARD',
    defaultLabel: 'Purchase / Refund Indicator',
    customLabel: 'Purchase / Refund Indicator'
  }
};

const STORAGE_KEY = 'leon_aml_column_mappings_v2';

export function loadColumnMappings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with DEFAULT_COLUMN_MAPPINGS so newly registered schema columns always appear
      const merged = { ...DEFAULT_COLUMN_MAPPINGS };
      Object.keys(parsed).forEach(key => {
        if (merged[key]) {
          merged[key] = { ...merged[key], customLabel: parsed[key].customLabel || merged[key].defaultLabel };
        } else {
          merged[key] = parsed[key];
        }
      });
      return merged;
    }
  } catch (e) {
    console.error('Failed to load column mappings from storage', e);
  }
  return { ...DEFAULT_COLUMN_MAPPINGS };
}

export function saveColumnMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (e) {
    console.error('Failed to save column mappings to storage', e);
  }
}

export function resetColumnMappings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset column mappings in storage', e);
  }
  return { ...DEFAULT_COLUMN_MAPPINGS };
}

/**
 * Universal helper to resolve display label by key and optional payment rail.
 * Falls back across `RAIL:KEY`, bare `KEY`, or fallback default string.
 */
export function resolveColumnLabel(mappings, key, rail = 'ETRANSFER', fallback = '') {
  if (!mappings) return fallback;
  const railKey = `${rail}:${key}`;
  if (mappings[railKey]?.customLabel) return mappings[railKey].customLabel;
  if (mappings[railKey]?.defaultLabel) return mappings[railKey].defaultLabel;
  if (mappings[key]?.customLabel) return mappings[key].customLabel;
  if (mappings[key]?.defaultLabel) return mappings[key].defaultLabel;
  return fallback;
}
