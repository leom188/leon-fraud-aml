/**
 * Card Payments Rail Module (Visa / Mastercard / Amex)
 * Ready for future card authorization, settlement, merchant terminal, and chargeback schemas.
 */

import { IRailProcessor, DataState, RailFieldDefinition, RailValidationResult } from '../../../types/rails';

export const CARD_FIELD_DEFINITIONS: Record<string, RailFieldDefinition> = {
  TRX_TRAN_DATE: { label: 'Settlement Date', required: false, aliases: ['SETTLEMENT_DATE', 'TRAN_DATE', 'DATE'] },
  TRX_DEB_CRE_IND: { label: 'Purchase / Refund (D/C)', required: true, aliases: ['TRAN_TYPE', 'DEB_CRE_IND', 'DIRECTION'] },
  TRX_AMT1: { label: 'Auth Amount', required: true, aliases: ['AUTH_AMT', 'AMOUNT', 'TRX_AMT1'] },
  TRX_BEN_ACCT_NUM: { label: 'Merchant ID / Terminal ID', required: true, aliases: ['MID', 'TID', 'MERCHANT_ID'] },
  TRX_ACCT_BEN_NAME: { label: 'Merchant Trade Name (DBA)', required: true, aliases: ['DBA_NAME', 'MERCHANT_NAME'] },
  TRX_FREE_TEXT_3: { label: 'Cardholder Name / Masked PAN', required: true, aliases: ['MASKED_PAN', 'CARDHOLDER'] },
  TRX_REF_NUM: { label: 'Card Network Auth Code', required: false, aliases: ['AUTH_CODE', 'NETWORK_REF'] },
  TRX_OPERATOR_CODE: { label: 'POS Entry Mode', required: true, aliases: ['ENTRY_MODE', 'POS_CODE'] }
};

export const cardRail: IRailProcessor = {
  railId: 'CARD',
  name: 'Credit & Debit Card Rails',
  description: 'Card Acquiring and Issuing transactions (Visa, Mastercard, Interac Flash, POS/E-comm).',
  fieldDefinitions: CARD_FIELD_DEFINITIONS,
  validateHeaders: (headers: string[]): RailValidationResult => {
    return { valid: true, missing: [] };
  },
  processRecords: (rawRows: Record<string, any>[]): DataState => {
    return {
      totalRecords: 0,
      groupedEntities: [],
      normalizedRecords: [],
      activeRail: 'CARD'
    };
  },
  generateSampleData: (count = 100): DataState => {
    // Generate realistic Card acquiring sample records
    const sampleMerchants = [
      { id: 'MID-9921', name: 'Apex Electronics Online', dba: 'Apex Goods' },
      { id: 'MID-4011', name: 'Vortex Cloud Services', dba: 'Vortex Hosting' },
      { id: 'MID-7723', name: 'Metro QuickMart #42', dba: 'Metro Express' }
    ];

    const records = [];
    for (let i = 0; i < count; i++) {
      const m = sampleMerchants[i % sampleMerchants.length];
      records.push({
        id: `AUTH-${900000 + i}`,
        raw_record: {},
        transaction_direction: (i % 8 === 0 ? 'Outgoing' : 'Incoming') as any,
        client_id: m.id,
        client_name: m.name,
        customer_id: `CUST-CARD-${100 + (i % 20)}`,
        customer_account: `4500-XXXX-XXXX-${1000 + (i % 900)}`,
        recipient_name: m.dba,
        recipient_email: `${m.id}@merchant-network.ca`,
        sender_name: `Cardholder ${i + 1}`,
        sender_email: `cardholder.${i}@sample.com`,
        grouping_key: m.dba,
        grouping_key_source: 'MERCHANT_DBA',
        amount: 35 + ((i * 17) % 350),
        transaction_date: new Date(Date.now() - (i % 10) * 86400 * 1000).toISOString().split('T')[0],
        transaction_type: 'CARD_PURCHASE',
        corporation_code: '5002 (DCPayments)',
        operator_code: 'POS_CHIP_05',
        city: 'Vancouver',
        country: 'CAN',
        autodeposit_flag: '0 (No)',
        transaction_status: 'SETTLED',
        transaction_code: '01 (Purchase)',
        currency: 'CAD',
        memo: `AuthCode: ${100000 + i}`,
        rule_ids: i % 6 === 0 ? ['CR-101'] : [],
        rule_names: i % 6 === 0 ? ['Rapid Velocity Card Spikes'] : [],
        alert_close_type: 'Open Alert',
        reviewed_by: null,
        needs_review: false
      });
    }

    return {
      totalRecords: records.length,
      groupedEntities: [
        {
          id: 'GRP-CARD-1',
          grouping_key: 'Apex Goods',
          grouping_key_source: 'MERCHANT_DBA',
          transaction_direction: 'Incoming',
          client_id: 'MID-9921',
          client_name: 'Apex Electronics Online',
          corporation_code: '5002 (DCPayments)',
          customer_id: 'CUST-CARD-101',
          customer_account: '4500-XXXX-XXXX-1200',
          transaction_count: records.length,
          total_amount: records.reduce((acc, r) => acc + r.amount, 0),
          first_transaction_date: records[records.length - 1].transaction_date || 'N/A',
          last_transaction_date: records[0].transaction_date || 'N/A',
          distinct_rule_count: 1,
          rule_names: ['Rapid Velocity Card Spikes'],
          alert_close_types: [],
          reviewed_by_users: [],
          has_unknown_direction: false,
          risk_level: 'Elevated',
          risk_score: 72,
          contains_keyword: false,
          distinct_emails_count: 15,
          fan_out_ratio: 0.15,
          pct_new_emails: 80,
          volume_spike_pct: 45,
          interbank_pct: 95,
          top_recipient_emails: [],
          transactions: records
        }
      ],
      normalizedRecords: records,
      activeRail: 'CARD'
    };
  }
};

export default cardRail;
