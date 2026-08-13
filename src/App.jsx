import React, { useState } from 'react';
import FraudTriageDashboard from './FraudTriageDashboard';
import ClusterExplorerView from './ClusterExplorerView';
import FraudInvestigationView from './FraudInvestigationView';
import RuleEngineView from './RuleEngineView';
import { generateSampleEtransferData } from './utils/excelDataLoader';

function App() {
  const [currentView, setCurrentView] = useState('explorer');
  const [dataState, setDataState] = useState(() => generateSampleEtransferData(200));
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <>
      {currentView === 'explorer' && (
        <ClusterExplorerView
          dataState={dataState}
          onNavigate={setCurrentView}
          onSelectEntityGroup={(groupId) => {
            setSelectedGroupId(groupId);
            setCurrentView('dashboard');
          }}
          onOpenUploadModal={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'dashboard' && (
        <FraudTriageDashboard
          onNavigate={setCurrentView}
          externalDataState={dataState}
          setExternalDataState={setDataState}
          externalSelectedGroupId={selectedGroupId}
          setExternalSelectedGroupId={setSelectedGroupId}
        />
      )}

      {currentView === 'investigation' && (
        <FraudInvestigationView onNavigate={setCurrentView} />
      )}

      {currentView === 'rules' && (
        <RuleEngineView onNavigate={setCurrentView} />
      )}
    </>
  );
}

export default App;
