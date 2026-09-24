/**
 * Store & Multi-User Types
 * Prepares the application for multi-analyst workflows, user sessions, and unified state.
 */

import { PaymentRail, DataState, GroupedEntity } from './rails';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Analyst' | 'Senior Investigator' | 'Compliance Officer' | 'Admin';
  initials: string;
  avatarUrl?: string;
}

export interface AlertResolution {
  txRef: string;
  closeType: number; // 109 (False Positive), 110 (UTR), 111 (RFI), etc.
  closeTypeLabel: string;
  resolution: string;
  notes?: string;
  resolvedAt: string;
  resolvedBy: string;
  analystId?: string;
}

export interface ColumnMappingItem {
  id: string;
  key: string;
  rail: PaymentRail | string;
  defaultLabel: string;
  customLabel: string;
}

export interface TriageStoreState {
  // Rail & Ingestion
  activeRail: PaymentRail;
  dataState: DataState | null;
  selectedGroupId: string | null;
  
  // Alert Disposition & Investigation
  txResolutions: Record<string, AlertResolution>;
  
  // Custom Column Mapping
  columnMappings: Record<string, ColumnMappingItem>;
  
  // Active User / Session (Multi-user readiness)
  currentUser: UserProfile;

  // Actions
  setActiveRail: (rail: PaymentRail) => void;
  setDataState: (data: DataState | null) => void;
  setSelectedGroupId: (groupId: string | null) => void;
  resolveAlerts: (resolutions: AlertResolution[]) => void;
  updateColumnMappings: (mappings: Record<string, ColumnMappingItem>) => void;
  resetColumnMappings: () => void;
  setCurrentUser: (user: UserProfile) => void;
  loadSampleDataForRail: (rail?: PaymentRail, count?: number) => void;
  resetAllData: () => void;
}
