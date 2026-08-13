import React, { useState } from 'react';
import EtransferHomeView from './EtransferHomeView';
import ClusterExplorerView from './ClusterExplorerView';
import FraudTriageDashboard from './FraudTriageDashboard';
import RuleEngineView from './RuleEngineView';
import ReportsView from './ReportsView';
import WatchlistsView from './WatchlistsView';
import { generateSampleEtransferData } from './utils/excelDataLoader';

function App() {
  // Default View: LEON Executive Command Center Home ('home')
  const [currentView, setCurrentView] = useState('home');
  const [dataState, setDataState] = useState(() => generateSampleEtransferData(200));
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleLoadSampleData = () => {
    const sample = generateSampleEtransferData(250);
    setDataState(sample);
    if (sample.groupedEntities.length > 0) {
      setSelectedGroupId(sample.groupedEntities[0].id);
    }
  };

  return (
    <>
      {/* 1. LEON EXECUTIVE COMMAND CENTER HOME */}
      {currentView === 'home' && (
        <EtransferHomeView
          dataState={dataState}
          onNavigate={setCurrentView}
          onLoadSampleData={handleLoadSampleData}
          onDataIngested={setDataState}
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
        />
      )}

      {/* 4. RULE ENGINE & MANAGEMENT */}
      {currentView === 'rules' && (
        <RuleEngineView onNavigate={setCurrentView} />
      )}

      {/* 5. REPORTS & ANALYTICS */}
      {currentView === 'reports' && (
        <ReportsView onNavigate={setCurrentView} />
      )}

      {/* 6. WATCHLISTS & SANCTIONS */}
      {currentView === 'watchlists' && (
        <WatchlistsView onNavigate={setCurrentView} />
      )}
    </>
  );
}

export default App;
