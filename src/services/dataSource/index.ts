/**
 * Data Source Manager
 * Coordinates Excel uploads, MSSQL database queries, and synthetic datasets.
 */

import { IDataSourceAdapter, DataSourceType } from '../../types/db';
import { excelAdapter } from './excelAdapter';
import { mssqlAdapter } from './mssqlAdapter';

const ADAPTERS: Record<DataSourceType, IDataSourceAdapter> = {
  EXCEL: excelAdapter,
  MSSQL: mssqlAdapter,
  SYNTHETIC: excelAdapter,
  REST_API: mssqlAdapter
};

export function getDataSourceAdapter(type: DataSourceType = 'EXCEL'): IDataSourceAdapter {
  return ADAPTERS[type] || excelAdapter;
}

export { excelAdapter, mssqlAdapter };
