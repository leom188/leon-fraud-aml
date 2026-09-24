/**
 * FraudTriageDashboard (Compatibility Layer)
 * Delegates to the modular, high-performance TriageView orchestrator.
 */

import React, { useEffect } from 'react';
import { TriageView } from './views/triage/TriageView';
import { useTriageStore } from './store/useTriageStore';

export const FraudTriageDashboard = ({
  externalDataState,
  setExternalDataState,
  externalSelectedGroupId,
  setExternalSelectedGroupId,
  columnMappings
}) => {
  const { dataState, setDataState, selectedGroupId, setSelectedGroupId, updateColumnMappings } = useTriageStore();

  // Synchronize incoming legacy props with Zustand store if provided
  useEffect(() => {
    if (externalDataState && externalDataState !== dataState) {
      setDataState(externalDataState);
    }
  }, [externalDataState]);

  useEffect(() => {
    if (externalSelectedGroupId && externalSelectedGroupId !== selectedGroupId) {
      setSelectedGroupId(externalSelectedGroupId);
    }
  }, [externalSelectedGroupId]);

  useEffect(() => {
    if (columnMappings) {
      updateColumnMappings(columnMappings);
    }
  }, [columnMappings]);

  return <TriageView />;
};

export default FraudTriageDashboard;
