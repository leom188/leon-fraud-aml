import * as XLSX from 'xlsx';
import { processEtransferData, validateWorksheetColumns } from './etransferProcessor';

/**
 * Reads an Excel File ArrayBuffer asynchronously and parses the "Full_Analysis" worksheet.
 * Provides progress updates during chunk processing.
 */
export async function parseExcelFile(arrayBuffer, onProgress = () => {}) {
  onProgress({ stage: 'Reading Excel workbook structure...', progress: 10 });
  
  await new Promise(r => setTimeout(r, 20));

  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, dense: true });
  
  // Find worksheet (prefer Full_Analysis, fallback to first sheet)
  let targetSheetName = 'Full_Analysis';
  if (!workbook.SheetNames.includes(targetSheetName)) {
    if (workbook.SheetNames.length > 0) {
      targetSheetName = workbook.SheetNames[0];
    } else {
      throw new Error(`Worksheet "Full_Analysis" not found in file.`);
    }
  }

  onProgress({ stage: `Extracting "${targetSheetName}" worksheet rows...`, progress: 30 });
  await new Promise(r => setTimeout(r, 20));

  const worksheet = workbook.Sheets[targetSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`Worksheet "${targetSheetName}" contains no data rows.`);
  }

  // Validate headers
  onProgress({ stage: 'Validating column schema...', progress: 45 });
  const headers = Object.keys(rawRows[0] || {});
  const validation = validateWorksheetColumns(headers);

  if (!validation.valid) {
    throw new Error(`Missing required columns in "${targetSheetName}": ${validation.missing.join(', ')}`);
  }

  onProgress({ stage: `Processing & Grouping ${rawRows.length.toLocaleString()} records...`, progress: 65 });
  await new Promise(r => setTimeout(r, 20));

  const result = processEtransferData(rawRows);

  onProgress({ stage: 'Finalizing summary datasets...', progress: 100 });
  await new Promise(r => setTimeout(r, 20));

  return result;
}

/**
 * Generate realistic sample dataset matching real SQL export schema for instant demo testing
 */
export function generateSampleEtransferData(recordCount = 250) {
  const sampleClients = [
    { id: '500359', name: '2337736 Alberta Inc. (DCBANK)' },
    { id: '5001', name: 'Pateno Global' },
    { id: '5002', name: 'DCPayments Solutions' },
    { id: '5000', name: 'Apaylo Finance Technology Inc.' }
  ];

  const sampleSenders = [
    { name: 'CARRIE J GREEN', email: 'carrgreen11@gmail.com' },
    { name: 'KERI-ANNE BUCKNER', email: 'keri.b@gmail.com' },
    { name: 'CATHERINE L PII', email: 'catherine.pii@yahoo.com' },
    { name: 'JO-ANNE LAUZON', email: 'jlauzon@hotmail.com' },
    { name: 'COBY MATALSKI', email: 'coby.m@outlook.com' },
    { name: 'MICHAEL CHEN', email: 'mchen.tech@gmail.com' },
    { name: 'SARAH CONNOR', email: 's.connor@sky.net' }
  ];

  const sampleRecipients = [
    { name: 'Loonio.ca', email: 'debit@interac.loonio.ca' },
    { name: 'weed', email: 'send@bytex.ca' },
    { name: 'Bytex Payments', email: 'send@bytex.ca' },
    { name: 'Bytex Services', email: 'transact@bytex.ca' },
    { name: 'PVPay Sales', email: 'sales@pvpay.ca' },
    { name: 'Vape & Goods', email: 'orders@vapegoods.ca' }
  ];

  const operatorCodes = ['DCBPID4497329', 'OP-1002', 'OP-4491', 'OP-8821', 'OP-9912'];

  const rulesList = [
    { id: '217', name: "'Green' - etransfer keyword" },
    { id: '412', name: "Velocity spike / Fan-out" },
    { id: '1082', name: "High Velocity Keyword Velocity" },
    { id: '99', name: "Platform-level anomaly" }
  ];

  const rows = [];
  const now = new Date();

  for (let i = 0; i < recordCount; i++) {
    const isIncoming = i % 3 !== 0; // 2/3 Incoming (D), 1/3 Outgoing (C)
    const client = sampleClients[i % sampleClients.length];
    const sender = sampleSenders[i % sampleSenders.length];
    const recipient = sampleRecipients[i % sampleRecipients.length];
    const opCode = operatorCodes[i % operatorCodes.length];

    const daysAgo = Math.floor(Math.random() * 14);
    const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const isSuspicious = i % 5 === 0 || recipient.name === 'weed';
    const ruleObj = isSuspicious ? rulesList[i % rulesList.length] : { id: '', name: '' };
    const amount = isSuspicious ? (60 + (i * 5) % 200) : (25 + Math.floor(Math.random() * 400));

    rows.push({
      TRX_DEB_CRE_IND: isIncoming ? 'D' : 'C',
      TRX_TRAN_DATE: txDate,
      TRX_TRAN_TYP: 'ETRANSFER',
      CORPORATION_CODE: client.id,
      TRX_RULE_ID: ruleObj.id,
      RULE_NAMES: ruleObj.name,
      TRX_REF_NUM: `100000000${926488000 + i}`,
      TRX_SESSION_ID: `CAKvH3C${i}`,
      TRX_FREE_TEXT_10: `CAKvH3C${i}`,
      TRX_TRAN_NUM_BY_TERM_OWN: client.name,
      TRX_BKM_MERC_UNIQUE_ID: client.id,
      TRX_CUST_NUM: `${(i * 1082) % 500}`,
      TRX_ACCT_NUM: `${324029000 + (i % 50)}`,
      TRX_ORIG_CRNCY_CDE: 'CAD',
      TRX_AMT1: amount,
      TRX_ACCT_BEN_NAME: recipient.name,
      TRX_BEN_ACCT_NUM: recipient.email,
      TRX_FREE_TEXT_8: sender.name,
      TRX_FREE_TEXT_3: sender.email,
      TRX_OLD_VALUE: isIncoming ? 'Auto-deposit' : 'What city?',
      TRX_NEW_VALUE: isIncoming ? 'NULL' : (isSuspicious ? 'canna' : 'toronto'),
      TRX_SEN_MESSAGE: isSuspicious ? 'Order #4421 weed' : 'Invoice payment',
      TRX_OPERATOR_CODE: opCode,
      TRX_TRAN_AREA: 'Toronto',
      TRX_TERM_COUNTRY: 'CA',
      TRX_FREE_FLAG_3: isIncoming ? '1' : '0',
      TRX_MSG_TYPE: 'COMPLETED',
      TRX_TRAN_CDE: isIncoming ? '4' : '9',
      TRX_ALERT_TYPE: (i % 8 === 0) ? '110' : '',
      ALERT_CLOSE_TYPE: (i % 8 === 0) ? '110' : '',
      TRX_ANALYSED_BY: 'Leo.moncada'
    });
  }

  return processEtransferData(rows);
}
