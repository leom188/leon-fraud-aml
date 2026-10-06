import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTriageStore } from '../../store/useTriageStore';
import { TransactionRecord } from '../../types/rails';
import { resolveColumnLabel } from '../../utils/columnMapping';
import { hasAlert, isOpenAlert } from '../../utils/alertUtils';

// Modular Sub-components
import { EntitySidebar } from './EntitySidebar';
import { EntityHeader } from './EntityHeader';
import { TransactionTable } from './TransactionTable';
import { SenderDrilldownView } from './SenderDrilldownView';
import { TransactionDetailDrawer } from './TransactionDetailDrawer';
import { AiAnalysisModal } from './AiAnalysisModal';
import { RawDataModal } from './RawDataModal';
import { UploadModal } from './UploadModal';
import { CompletionToast, CompletionToastAction } from './CompletionToast';
import { Button } from '../../components/ui/button';
import { Sparkles, Upload } from 'lucide-react';

export const TriageView: React.FC = () => {
  const { groupId } = useParams<{ groupId?: string }>();
  const navigate = useNavigate();

  // Zustand Store
  const {
    dataState,
    selectedGroupId,
    activeRail,
    columnMappings,
    currentUser,
    setSelectedGroupId,
    setDataState,
    resolveAlerts,
    loadSampleDataForRail
  } = useTriageStore();

  // Local UI State
  const [selectedTxRecord, setSelectedTxRecord] = useState<TransactionRecord | null>(null);
  const [selectedTxRefs, setSelectedTxRefs] = useState<Set<string>>(new Set());
  const [selectedSenderFilter, setSelectedSenderFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Completion Toast state
  interface CompletionToastState {
    key: number;
    title: string;
    subtitle: string;
    actions: CompletionToastAction[];
    onAutoAdvance?: () => void;
    onUndo?: () => void;
  }
  const [completionToast, setCompletionToast] = useState<CompletionToastState | null>(null);
  const toastKeyRef = useRef(0);

  // Snapshot for undo: store pre-resolution alert_close_types keyed by tx.id
  const pendingUndoRef = useRef<Map<string, string>>(new Map());

  // Effective cluster ID from route param or store
  const effectiveGroupId = groupId || selectedGroupId;

  // Sync route param with store selectedGroupId
  useEffect(() => {
    if (groupId && groupId !== selectedGroupId) {
      setSelectedGroupId(groupId);
    }
  }, [groupId, selectedGroupId, setSelectedGroupId]);

  const groups = dataState?.groupedEntities || [];

  // Determine active cluster based directly on effectiveGroupId or fallback to first
  const currentEntity = (effectiveGroupId ? groups.find(g => g.id === effectiveGroupId) : null) || groups[0] || null;

  // Reset drill-down filters and active detail drawer whenever cluster changes
  useEffect(() => {
    setSelectedTxRefs(new Set());
    setSelectedSenderFilter(null);
    setSelectedTxRecord(null);
    setViewMode('grouped');
  }, [currentEntity?.id]);

  // Handle entity selection & update URL
  const handleSelectEntity = (id: string) => {
    setSelectedGroupId(id);
    setSelectedTxRefs(new Set());
    setSelectedSenderFilter(null);
    setSelectedTxRecord(null);
    navigate(`/triage/${id}`);
  };

  // Resolve column label helper
  const getColLabel = (key: string, fallback: string) => {
    return resolveColumnLabel(columnMappings, key, activeRail, fallback);
  };

  // Navigate to the next open entity in the sidebar
  const goToNextEntity = useCallback(() => {
    if (!currentEntity) return;
    const groups = dataState?.groupedEntities || [];
    const currentIdx = groups.findIndex(g => g.id === currentEntity.id);
    // Find next entity that still has open alerts
    for (let i = currentIdx + 1; i < groups.length; i++) {
      if (groups[i].transactions.some(isOpenAlert)) {
        handleSelectEntity(groups[i].id);
        return;
      }
    }
    // Wrap to beginning
    for (let i = 0; i < currentIdx; i++) {
      if (groups[i].transactions.some(isOpenAlert)) {
        handleSelectEntity(groups[i].id);
        return;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity, dataState]);

  // Navigate to next open counterparty within this entity
  const goToNextCounterparty = useCallback(() => {
    if (!currentEntity || !selectedSenderFilter) return;
    const cps = currentEntity.top_recipient_emails;
    const currentIdx = cps.findIndex(cp => cp.email === selectedSenderFilter);
    for (let i = currentIdx + 1; i < cps.length; i++) {
      const cpKey = cps[i].email.toLowerCase().trim();
      const hasOpen = currentEntity.transactions.some(
        tx => isOpenAlert(tx) && (
          tx.sender_email?.toLowerCase().trim() === cpKey ||
          tx.sender_name?.toLowerCase().trim() === cpKey ||
          tx.recipient_email?.toLowerCase().trim() === cpKey ||
          tx.recipient_name?.toLowerCase().trim() === cpKey
        )
      );
      if (hasOpen) { setSelectedSenderFilter(cps[i].email); return; }
    }
    // No next counterparty → go back to dispersion view
    setSelectedSenderFilter(null);
    setViewMode('grouped');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity, selectedSenderFilter]);

  // Core resolve + completion detection
  const doResolve = useCallback((refs: string[], closeCode: number, label: string) => {
    if (!currentEntity) return;

    // Only resolve transactions that actually have triggered alert rules (no action for No Alert)
    const validRefs = refs.filter(ref => {
      const tx = currentEntity.transactions.find(t => t.id === ref);
      return tx && hasAlert(tx);
    });

    if (validRefs.length === 0) return;

    // Snapshot pre-resolution close types for undo
    const snapshot = new Map<string, string>();
    currentEntity.transactions.forEach(tx => {
      if (validRefs.includes(tx.id)) snapshot.set(tx.id, tx.alert_close_type || '');
    });
    pendingUndoRef.current = snapshot;

    const resolutions = validRefs.map(txRef => ({
      txRef,
      closeType: closeCode,
      closeTypeLabel: label,
      resolution: label,
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser.name,
      analystId: currentUser.id
    }));
    resolveAlerts(resolutions);

    // After resolution, check completion — use the UPDATED tx state
    // (resolveAlerts is synchronous in Zustand, so dataState is stale here;
    //  we simulate the post-resolution state for detection purposes)
    const closedSet = new Set(validRefs);
    const txAfter = currentEntity.transactions.map(tx =>
      closedSet.has(tx.id)
        ? { ...tx, alert_close_type: `${closeCode} (${label})` }
        : tx
    );

    const undoFn = () => {
      // Revert by re-resolving with the original close types
      const revertResolutions = Array.from(snapshot.entries()).map(([txRef, origClose]) => ({
        txRef,
        closeType: origClose ? parseInt(origClose.split(' ')[0]) || 0 : 0,
        closeTypeLabel: origClose || 'Open Alert',
        resolution: origClose || 'Open Alert',
        resolvedAt: new Date().toISOString(),
        resolvedBy: currentUser.name,
        analystId: currentUser.id
      }));
      resolveAlerts(revertResolutions);
      setToastMessage(`Undid ${refs.length} close(s)`);
      setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Counterparty-level completion check ---
    if (selectedSenderFilter) {
      const target = selectedSenderFilter.toLowerCase().trim();
      const cpOpenAfter = txAfter.filter(tx =>
        isOpenAlert(tx) && (
          tx.sender_email?.toLowerCase().trim() === target ||
          tx.sender_name?.toLowerCase().trim() === target ||
          tx.recipient_email?.toLowerCase().trim() === target ||
          tx.recipient_name?.toLowerCase().trim() === target
        )
      );

      if (cpOpenAfter.length === 0) {
        // Find next open counterparty for the action label
        const cps = currentEntity.top_recipient_emails;
        const currentCpIdx = cps.findIndex(cp => cp.email === selectedSenderFilter);
        let hasNextCp = false;
        for (let i = currentCpIdx + 1; i < cps.length; i++) {
          const nextKey = cps[i].email.toLowerCase().trim();
          const nextHasOpen = txAfter.some(
            tx => isOpenAlert(tx) && (
              tx.sender_email?.toLowerCase().trim() === nextKey ||
              tx.sender_name?.toLowerCase().trim() === nextKey ||
              tx.recipient_email?.toLowerCase().trim() === nextKey ||
              tx.recipient_name?.toLowerCase().trim() === nextKey
            )
          );
          if (nextHasOpen) { hasNextCp = true; break; }
        }

        // Check if entity is also fully resolved
        const entityFullyResolved = txAfter.every(tx => !isOpenAlert(tx));

        toastKeyRef.current += 1;
        setCompletionToast({
          key: toastKeyRef.current,
          title: entityFullyResolved
            ? 'Entity fully resolved'
            : `All alerts resolved for ${selectedSenderFilter}`,
          subtitle: entityFullyResolved
            ? `All transactions across this entity have been triaged — ${refs.length} closed as ${label}.`
            : `${refs.length} alert(s) closed as ${label}. No open alerts remain for this counterparty.`,
          onUndo: undoFn,
          onAutoAdvance: entityFullyResolved ? goToNextEntity : goToNextCounterparty,
          actions: entityFullyResolved
            ? [
                { label: 'Next Entity', onClick: goToNextEntity, primary: true },
                { label: 'Stay here', onClick: () => {} }
              ]
            : hasNextCp
            ? [
                { label: 'Next Counterparty', onClick: goToNextCounterparty, primary: true },
                { label: 'Back to Counterparties', onClick: () => { setSelectedSenderFilter(null); setViewMode('grouped'); } }
              ]
            : [
                { label: 'Back to Counterparties', onClick: () => { setSelectedSenderFilter(null); setViewMode('grouped'); }, primary: true }
              ]
        });
        return;
      }
    }

    // --- Entity-level completion check (no counterparty filter active) ---
    const entityOpenAfter = txAfter.filter(isOpenAlert);
    if (entityOpenAfter.length === 0 && !selectedSenderFilter) {
      toastKeyRef.current += 1;
      setCompletionToast({
        key: toastKeyRef.current,
        title: 'Entity fully resolved',
        subtitle: `All ${currentEntity.transactions.length} transactions have been triaged. Moving to the next entity.`,
        onUndo: undoFn,
        onAutoAdvance: goToNextEntity,
        actions: [
          { label: 'Next Entity', onClick: goToNextEntity, primary: true },
          { label: 'Stay here', onClick: () => {} }
        ]
      });
      return;
    }

    // Default: simple toast for partial close
    setToastMessage(`Closed ${refs.length} alert(s) as ${label} (${closeCode})`);
    setTimeout(() => setToastMessage(null), 3500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity, selectedSenderFilter, goToNextEntity, goToNextCounterparty, currentUser, resolveAlerts]);

  // Handle Single Alert Resolution
  const handleSingleResolve = (txRef: string, closeCode: number, label: string) => {
    doResolve([txRef], closeCode, label);
  };

  // Handle Bulk Alert Resolution
  const handleBulkResolve = (closeCode: number, label: string) => {
    const refs = Array.from(selectedTxRefs);
    if (refs.length === 0) return;
    setSelectedTxRefs(new Set());
    doResolve(refs, closeCode, label);
  };

  // Filter transactions by counterparty if in counterparty drilldown mode
  const activeTransactions = currentEntity
    ? currentEntity.transactions.filter(t => {
        if (!selectedSenderFilter) return true;
        const target = selectedSenderFilter.toLowerCase().trim();
        return (
          t.sender_email?.toLowerCase().trim() === target ||
          t.sender_name?.toLowerCase().trim() === target ||
          t.recipient_email?.toLowerCase().trim() === target ||
          t.recipient_name?.toLowerCase().trim() === target
        );
      })
    : [];

  return (
    <div className="flex h-full w-full overflow-hidden bg-background relative">
      {/* Completion Toast (counterparty / entity fully resolved) */}
      {completionToast && (
        <CompletionToast
          key={completionToast.key}
          title={completionToast.title}
          subtitle={completionToast.subtitle}
          actions={completionToast.actions}
          onAutoAdvance={completionToast.onAutoAdvance}
          onUndo={completionToast.onUndo}
          onDismiss={() => setCompletionToast(null)}
          autoAdvanceSeconds={4}
          undoWindowSeconds={8}
        />
      )}

      {/* Simple Toast Notification (partial closes) */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {groups.length === 0 ? (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 border border-sky-200 dark:border-sky-800">
            <Sparkles size={32} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              No Active Ingestion Batch
            </h2>
            <p className="text-xs text-slate-500">
              Upload an Excel transaction ledger or load a demonstration dataset to begin forensic alert triage.
            </p>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs"
            >
              <Upload size={14} className="mr-1.5" />
              Upload Excel
            </Button>
            <Button
              size="sm"
              onClick={() => loadSampleDataForRail(activeRail, 250)}
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white"
            >
              <Sparkles size={14} className="mr-1.5" />
              Load Demo Dataset
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Left Cluster / Entity Navigation Sidebar */}
          <EntitySidebar
            entities={groups}
            selectedId={currentEntity?.id || null}
            onSelect={handleSelectEntity}
            getColLabel={getColLabel}
          />

          {/* 2. Main Investigation Workspace */}
          {currentEntity && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Entity Header Telemetry */}
              <EntityHeader
                entity={currentEntity}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenRawModal={() => setIsRawModalOpen(true)}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
              />

              {/* View Switch: Counterparty Dispersion Drilldown vs Flat Transaction Table */}
              {viewMode === 'grouped' ? (
                <SenderDrilldownView
                  counterparties={currentEntity.top_recipient_emails}
                  transactions={currentEntity.transactions}
                  totalClusterVolume={currentEntity.total_amount}
                  totalClusterTxns={currentEntity.transaction_count}
                  selectedSenderEmail={selectedSenderFilter}
                  direction={currentEntity.transaction_direction}
                  onSelectSender={(email) => {
                    setSelectedSenderFilter(email);
                    if (email) setViewMode('flat'); // Switch to filtered table
                  }}
                />
              ) : (
                <TransactionTable
                  transactions={activeTransactions}
                  selectedRefs={selectedTxRefs}
                  onToggleSelect={(ref) => {
                    const next = new Set(selectedTxRefs);
                    if (next.has(ref)) next.delete(ref);
                    else next.add(ref);
                    setSelectedTxRefs(next);
                  }}
                  onSelectAll={(refs) => setSelectedTxRefs(new Set(refs))}
                  onClearSelection={() => setSelectedTxRefs(new Set())}
                  onRowClick={(tx) => setSelectedTxRecord(tx)}
                  onBulkResolve={handleBulkResolve}
                  getColLabel={getColLabel}
                  selectedSenderFilter={selectedSenderFilter}
                  onClearSenderFilter={() => {
                    setSelectedSenderFilter(null);
                    setViewMode('grouped');
                  }}
                />
              )}
            </div>
          )}

          {/* 3. Forensic Detail Slide-Over Drawer */}
          <TransactionDetailDrawer
            transaction={selectedTxRecord}
            onClose={() => setSelectedTxRecord(null)}
            onResolve={(ref, code, label) => handleSingleResolve(ref, code, label)}
            getColLabel={getColLabel}
          />

          {/* 4. Modals */}
          <AiAnalysisModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            entity={currentEntity}
          />

          <RawDataModal
            isOpen={isRawModalOpen}
            onClose={() => setIsRawModalOpen(false)}
            entity={currentEntity}
          />
        </>
      )}

      {/* Global Ingest Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        activeRail={activeRail}
        onDataLoaded={(data) => setDataState(data)}
      />
    </div>
  );
};

export default TriageView;
