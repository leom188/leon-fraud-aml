/**
 * Interac e-Transfer Rail Module Definition
 */

import { IRailProcessor } from '../../../types/rails';
import { ETRANSFER_FIELD_DEFINITIONS } from './fieldDefs';
import { processEtransferData, validateEtransferHeaders } from './processor';
import { generateSampleEtransferData } from './sampleData';

export const etransferRail: IRailProcessor = {
  railId: 'ETRANSFER',
  name: 'Interac e-Transfer',
  description: 'Canadian Interac e-Transfer rail with P2P, Request Money, and Auto-deposit analytics.',
  fieldDefinitions: ETRANSFER_FIELD_DEFINITIONS,
  validateHeaders: validateEtransferHeaders,
  processRecords: processEtransferData,
  generateSampleData: generateSampleEtransferData
};

export default etransferRail;
