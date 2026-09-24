/**
 * Interac e-Transfer Rail Field Definitions, Aliases, and Decoders
 */

import { RailFieldDefinition } from '../../../types/rails';

export const ETRANSFER_FIELD_DEFINITIONS: Record<string, RailFieldDefinition> = {
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
    aliases: ['ALERT_CLOSE_TYPE', 'TRX_ALERT_TYPE', 'ALERT_TYPE', 'TRX_ALERT_CLOSE_TYPE', 'ALERT CLOSE TYPE', 'CLOSE TYPE', 'CLOSE_TYPE', 'ALERT TYPE', 'TRX ALERT TYPE']
  },
  TRX_ANALYSED_BY: {
    label: 'Analysed By User ID',
    required: false,
    aliases: ['TRX_ANALYSED_BY', 'ANALYSED BY', 'ANALYST', 'ANALYSED_BY', 'REVIEWED BY']
  }
};

export const ETRANSFER_VALUE_DECODERS = {
  CORPORATION_CODE: (val: any) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '5000') return '5000 (DCBANK)';
    if (s === '5001') return '5001 (Pateno)';
    if (s === '5002') return '5002 (DCPayments)';
    return s;
  },
  TRX_TRAN_CDE: (val: any) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '4') return '4 (Money Received)';
    if (s === '9') return '9 (Money Sent)';
    if (s === '10') return '10 (Money Request)';
    return s;
  },
  ALERT_CLOSE_TYPE: (val: any) => {
    if (val === undefined || val === null) return 'Open Alert';
    const s = String(val).trim();
    if (!s || s.toUpperCase() === 'NULL' || s === '0') return 'Open Alert';
    if (s === '109') return '109 (False Positive)';
    if (s === '110') return '110 (UTR)';
    if (s === '111') return '111 (RFI)';
    return s;
  },
  TRX_FREE_FLAG_3: (val: any) => {
    if (!val) return 'N/A';
    const s = String(val).trim();
    if (s === '1' || s.toLowerCase() === 'yes' || s.toLowerCase() === 'true') return '1 (Yes)';
    if (s === '0' || s.toLowerCase() === 'no' || s.toLowerCase() === 'false') return '0 (No)';
    return s;
  }
};
