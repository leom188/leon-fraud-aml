import React, { useState, useEffect, Component } from 'react';
import { ThemeProvider } from './utils/useTheme';
import AppLayout from './components/layout/AppLayout';
import EtransferHomeView from './EtransferHomeView';
import ClusterExplorerView from './ClusterExplorerView';
import FraudTriageDashboard from './FraudTriageDashboard';
import RuleEngineView from './RuleEngineView';
import ReportsView from './ReportsView';
import WatchlistsView from './WatchlistsView';
import SettingsView from './SettingsView';
import { generateSampleEtransferData } from './utils/excelDataLoader';
import { loadColumnMappings, saveColumnMappings, resetColumnMappings } from './utils/columnMapping';

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
  const [currentView, setCurrentView] = useState('home');
  const [dataState, setDataState] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [columnMappings, setColumnMappings] = useState(() => loadColumnMappings());

  // Auto-load sample dataset on initial load for instant interactive demo experience
  useEffect(() => {
    if (!dataState) {
      const sample = generateSampleEtransferData(300);
      setDataState(sample);
    }
  }, []);

  const handleLoadSampleData = () => {
    const sample = generateSampleEtransferData(300);
    setDataState(sample);
  };

  const handleUpdateColumnMappings = (newMappings) => {
    setColumnMappings(newMappings);
    saveColumnMappings(newMappings);
  };

  const handleResetColumnMappings = () => {
    const defaults = resetColumnMappings();
    setColumnMappings(defaults);
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppLayout
          currentView={currentView}
          onNavigate={setCurrentView}
          dataState={dataState}
          onLoadSampleData={handleLoadSampleData}
        >
          {/* 1. LEON EXECUTIVE COMMAND CENTER HOME */}
          {currentView === 'home' && (
            <EtransferHomeView
              dataState={dataState}
              onNavigate={setCurrentView}
              onDataIngested={setDataState}
              onLoadSampleData={handleLoadSampleData}
              columnMappings={columnMappings}
            />
          )}

          {/* 2. CLUSTER & ENTITY EXPLORER */}
          {currentView === 'explorer' && (
            <ClusterExplorerView
              dataState={dataState}
              onNavigate={setCurrentView}
              onSelectEntityGroup={(groupId) => {
                setSelectedGroupId(groupId);
                setCurrentView('dashboard');
              }}
              onOpenUploadModal={() => setCurrentView('home')}
              columnMappings={columnMappings}
            />
          )}

          {/* 3. ENTITY TRIAGE & INVESTIGATION VIEW */}
          {(currentView === 'dashboard' || currentView === 'investigation') && (
            <FraudTriageDashboard
              onNavigate={setCurrentView}
              externalDataState={dataState}
              setExternalDataState={setDataState}
              externalSelectedGroupId={selectedGroupId}
              setExternalSelectedGroupId={setSelectedGroupId}
              columnMappings={columnMappings}
            />
          )}

          {/* 4. RULE ENGINE & MANAGEMENT */}
          {currentView === 'rules' && (
            <RuleEngineView
              onNavigate={setCurrentView}
              dataState={dataState}
              columnMappings={columnMappings}
            />
          )}

          {/* 5. REPORTS & ANALYTICS */}
          {currentView === 'reports' && (
            <ReportsView
              onNavigate={setCurrentView}
              dataState={dataState}
              columnMappings={columnMappings}
            />
          )}

          {/* 6. WATCHLISTS & SANCTIONS */}
          {currentView === 'watchlists' && (
            <WatchlistsView
              onNavigate={setCurrentView}
              dataState={dataState}
              columnMappings={columnMappings}
            />
          )}

          {/* 7. SETTINGS & FIELD MAPPING */}
          {currentView === 'settings' && (
            <SettingsView
              columnMappings={columnMappings}
              onUpdateColumnMappings={handleUpdateColumnMappings}
              onResetColumnMappings={handleResetColumnMappings}
            />
          )}
        </AppLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
