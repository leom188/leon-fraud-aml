/**
 * Excel / File Data Source Adapter
 */

import * as XLSX from 'xlsx';
import { IDataSourceAdapter, QueryFilterParams } from '../../types/db';
import { DataState, PaymentRail } from '../../types/rails';
import { AlertResolution } from '../../types/store';
import { getRailProcessor } from '../rails/registry';

export class ExcelDataSourceAdapter implements IDataSourceAdapter {
  id = 'EXCEL' as const;
  name = 'Excel Spreadsheet (XLSX / XLS)';
  isConfigured = true;

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Browser in-memory XLSX parser is active and operational.' };
  }

  async parseArrayBuffer(
    buffer: ArrayBuffer,
    rail: PaymentRail = 'ETRANSFER',
    onProgress?: (info: { stage: string; progress: number }) => void
  ): Promise<DataState> {
    onProgress?.({ stage: 'Reading Excel workbook structure...', progress: 15 });
    await new Promise(r => setTimeout(r, 20));

    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, dense: true });
    
    let targetSheetName = 'Full_Analysis';
    if (!workbook.SheetNames.includes(targetSheetName)) {
      if (workbook.SheetNames.length > 0) {
        targetSheetName = workbook.SheetNames[0];
      } else {
        throw new Error('No worksheets found in uploaded Excel file.');
      }
    }

    onProgress?.({ stage: `Extracting "${targetSheetName}" rows...`, progress: 35 });
    await new Promise(r => setTimeout(r, 20));

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });

    if (!rawRows || rawRows.length === 0) {
      throw new Error(`Worksheet "${targetSheetName}" contains no data rows.`);
    }

    onProgress?.({ stage: `Validating schema for ${rail} rail...`, progress: 55 });
    const processor = getRailProcessor(rail);
    const headers = Object.keys(rawRows[0] || {});
    const validation = processor.validateHeaders(headers);

    if (!validation.valid) {
      throw new Error(`Missing required columns for ${rail}: ${validation.missing.join(', ')}`);
    }

    onProgress?.({ stage: `Normalizing & Grouping ${rawRows.length.toLocaleString()} records...`, progress: 80 });
    await new Promise(r => setTimeout(r, 20));

    const result = processor.processRecords(rawRows);
    onProgress?.({ stage: 'Finalizing datasets...', progress: 100 });

    return result;
  }

  async fetchBatch(params: QueryFilterParams): Promise<DataState> {
    const processor = getRailProcessor(params.rail);
    return processor.generateSampleData(params.limit || 250);
  }

  async persistDispositions(resolutions: AlertResolution[]): Promise<{ success: boolean; count: number }> {
    // In-memory or client-side persistence handled by Zustand
    return { success: true, count: resolutions.length };
  }
}

export const excelAdapter = new ExcelDataSourceAdapter();
