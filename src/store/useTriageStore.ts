/**
 * Zustand Global Triage Store
 * Manages dataset state, active payment rail, alert dispositions, column mappings, and user profile.
 */

import { create } from 'zustand';
import { TriageStoreState, AlertResolution, ColumnMappingItem, UserProfile } from '../types/store';
import { PaymentRail, DataState } from '../types/rails';
import { getRailProcessor } from '../services/rails/registry';
import { loadColumnMappings, saveColumnMappings, resetColumnMappings } from '../utils/columnMapping';

const DEFAULT_USER: UserProfile = {
  id: 'usr-101',
  name: 'Leo Moncada',
  email: 'leo.moncada@bank.ca',
  role: 'Senior Investigator',
  initials: 'LM'
};

export const useTriageStore = create<TriageStoreState>((set, get) => ({
  activeRail: 'ETRANSFER',
  dataState: null,
  selectedGroupId: null,
  txResolutions: {},
  columnMappings: loadColumnMappings() as any,
  currentUser: DEFAULT_USER,

  setActiveRail: (rail: PaymentRail) => {
    set({ activeRail: rail });
  },

  setDataState: (data: DataState | null) => {
    const firstGroupId = data?.groupedEntities && data.groupedEntities.length > 0
      ? data.groupedEntities[0].id
      : null;

    set({
      dataState: data,
      selectedGroupId: firstGroupId
    });
  },

  setSelectedGroupId: (groupId: string | null) => {
    set({ selectedGroupId: groupId });
  },

  resolveAlerts: (resolutions: AlertResolution[]) => {
    set((state) => {
      const updated = { ...state.txResolutions };
      resolutions.forEach(r => {
        updated[r.txRef] = r;
      });

      // Also reflect alert resolution into dataState if present
      if (state.dataState) {
        const resolutionMap = new Map(resolutions.map(r => [r.txRef, r]));
        const updatedNormRecords = state.dataState.normalizedRecords.map(tx => {
          const res = resolutionMap.get(tx.id);
          if (res) {
            return {
              ...tx,
              alert_close_type: `${res.closeType} (${res.resolution})`,
              reviewed_by: res.resolvedBy
            };
          }
          return tx;
        });

        const updatedGroups = state.dataState.groupedEntities.map(group => {
          let hasChange = false;
          const updatedTxns = group.transactions.map(tx => {
            const res = resolutionMap.get(tx.id);
            if (res) {
              hasChange = true;
              return {
                ...tx,
                alert_close_type: `${res.closeType} (${res.resolution})`,
                reviewed_by: res.resolvedBy
              };
            }
            return tx;
          });

          if (!hasChange) return group;

          const closeTypesSet = new Set(group.alert_close_types);
          const reviewersSet = new Set(group.reviewed_by_users);
          resolutions.forEach(r => {
            closeTypesSet.add(`${r.closeType} (${r.resolution})`);
            reviewersSet.add(r.resolvedBy);
          });

          return {
            ...group,
            alert_close_types: Array.from(closeTypesSet),
            reviewed_by_users: Array.from(reviewersSet),
            transactions: updatedTxns
          };
        });

        return {
          txResolutions: updated,
          dataState: {
            ...state.dataState,
            normalizedRecords: updatedNormRecords,
            groupedEntities: updatedGroups
          }
        };
      }

      return { txResolutions: updated };
    });
  },

  updateColumnMappings: (mappings: Record<string, ColumnMappingItem>) => {
    saveColumnMappings(mappings);
    set({ columnMappings: mappings });
  },

  resetColumnMappings: () => {
    const defaults = resetColumnMappings();
    set({ columnMappings: defaults as any });
  },

  setCurrentUser: (user: UserProfile) => {
    set({ currentUser: user });
  },

  loadSampleDataForRail: (rail: PaymentRail = 'ETRANSFER', count = 250) => {
    const processor = getRailProcessor(rail);
    const sample = processor.generateSampleData(count);
    set({
      activeRail: rail,
      dataState: sample,
      selectedGroupId: sample.groupedEntities[0]?.id || null
    });
  },

  resetAllData: () => {
    set({
      dataState: null,
      selectedGroupId: null,
      txResolutions: {}
    });
  }
}));
