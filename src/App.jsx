import React, { useEffect, Component } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './utils/useTheme';
import AppLayout from './components/layout/AppLayout';
import EtransferHomeView from './EtransferHomeView';
import ClusterExplorerView from './ClusterExplorerView';
import { TriageView } from './views/triage/TriageView';
import RuleEngineView from './RuleEngineView';
import ReportsView from './ReportsView';
import WatchlistsView from './WatchlistsView';
import SettingsView from './SettingsView';
import { useTriageStore } from './store/useTriageStore';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL REACT RENDER ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0B0E14] text-slate-900 dark:text-white p-8 flex flex-col items-center justify-center font-mono">
          <div className="max-w-2xl w-full bg-rose-50 dark:bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-300">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-bold">Runtime Error in View Component</h2>
            </div>
            <div className="bg-white dark:bg-black/80 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 overflow-auto max-h-60 whitespace-pre-wrap">
              <b>Error:</b> {this.state.error?.toString()}
            </div>
            {this.state.errorInfo && (
              <div className="bg-slate-50 dark:bg-black/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 overflow-auto max-h-40 whitespace-pre-wrap">
                <b>Component Stack:</b> {this.state.errorInfo.componentStack}
              </div>
            )}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const navigate = useNavigate();

  // Zustand Store
  const {
    dataState,
    setDataState,
    columnMappings,
    updateColumnMappings,
    resetColumnMappings,
    loadSampleDataForRail,
    activeRail
  } = useTriageStore();

  // Auto-load sample dataset on initial load for instant interactive demo experience
  useEffect(() => {
    if (!dataState) {
      loadSampleDataForRail(activeRail, 250);
    }
  }, []);

  const handleLegacyNavigate = (viewKey) => {
    const routeMap = {
      home: '/',
      explorer: '/explorer',
      dashboard: '/triage',
      investigation: '/triage',
      rules: '/rules',
      reports: '/reports',
      watchlists: '/watchlists',
      settings: '/settings'
    };
    navigate(routeMap[viewKey] || '/');
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppLayout>
          <Routes>
            {/* 1. LEON EXECUTIVE COMMAND CENTER HOME */}
            <Route
              path="/"
              element={
                <EtransferHomeView
                  dataState={dataState}
                  onNavigate={handleLegacyNavigate}
                  onDataIngested={setDataState}
                  onLoadSampleData={() => loadSampleDataForRail(activeRail, 250)}
                  columnMappings={columnMappings}
                />
              }
            />

            {/* 2. CLUSTER & ENTITY EXPLORER */}
            <Route
              path="/explorer"
              element={
                <ClusterExplorerView
                  dataState={dataState}
                  onNavigate={handleLegacyNavigate}
                  onSelectEntityGroup={(groupId) => {
                    useTriageStore.getState().setSelectedGroupId(groupId);
                    navigate(`/triage/${groupId}`);
                  }}
                  onOpenUploadModal={() => navigate('/')}
                  columnMappings={columnMappings}
                />
              }
            />

            {/* 3. ENTITY TRIAGE & INVESTIGATION VIEW (Supports deep link to cluster!) */}
            <Route path="/triage/:groupId?" element={<TriageView />} />
            <Route path="/dashboard" element={<Navigate to="/triage" replace />} />
            <Route path="/investigation" element={<Navigate to="/triage" replace />} />

            {/* 4. RULE ENGINE & MANAGEMENT */}
            <Route
              path="/rules"
              element={
                <RuleEngineView
                  onNavigate={handleLegacyNavigate}
                  dataState={dataState}
                  columnMappings={columnMappings}
                />
              }
            />

            {/* 5. REPORTS & ANALYTICS */}
            <Route
              path="/reports"
              element={
                <ReportsView
                  onNavigate={handleLegacyNavigate}
                  dataState={dataState}
                  columnMappings={columnMappings}
                />
              }
            />

            {/* 6. WATCHLISTS & SANCTIONS */}
            <Route
              path="/watchlists"
              element={
                <WatchlistsView
                  onNavigate={handleLegacyNavigate}
                  dataState={dataState}
                  columnMappings={columnMappings}
                />
              }
            />

            {/* 7. SETTINGS & FIELD MAPPING */}
            <Route
              path="/settings"
              element={
                <SettingsView
                  columnMappings={columnMappings}
                  onUpdateColumnMappings={updateColumnMappings}
                  onResetColumnMappings={resetColumnMappings}
                />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
