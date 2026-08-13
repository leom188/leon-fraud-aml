import React, { useState } from 'react';
import {
  ShieldAlert, Clock, AlertTriangle, UserCheck, UserMinus, Activity, Network,
  MessageSquare, FileText, Lock, CheckCircle, FileDigit, Maximize2, Minimize2, ChevronDown, ChevronRight,
  Filter, Search, Inbox, Briefcase, List as ListIcon, Settings, FileBarChart, MoreVertical,
  ArrowRight, Share2, CornerDownRight, Zap, Database
} from 'lucide-react';

const MOCK_ALERTS = {
  1: {
    id: "AL-892-ALPHA",
    ruleId: "Rule #1285141 Triggered:",
    ruleName: "High Volume Keyword Velocity",
    rail: "E-Transfer",
    flaggedAt: "Oct 24, 2026, 09:14 AM",
    score: "89.3 Critical",
    scoreColor: "text-red-400 bg-red-950/30",
    items: "480 transactions, 1 entity",
    status: "Open",
    entity: {
      id: "send@bytex.ca",
      tier: "Tier 3 Sub-Merchant • Registered May 2024",
      parent: "Apaylo Finance Tech",
      kyb: "Verified",
      kybColor: "text-green-500",
      volume: "+450% Spike",
      volumeColor: "text-red-400"
    },
    aiSummary: {
      text: (
        <>
          System detected a sudden spike in <span className="text-white font-medium">$100-$150 e-transfers</span> to this merchant over the last 48 hours.
          Natural language processing detected restricted drug-related keywords (<span className="text-red-400 bg-red-950/50 px-1 rounded border border-red-900/50">weed</span>, <span className="text-red-400 bg-red-950/50 px-1 rounded border border-red-900/50">canna</span>)
          in 68% of security answers and memo fields from 400+ unique Tier 4 senders.
        </>
      ),
      typology: (
        <>
          <strong className="text-white">Typology Match:</strong> High probability of an <span className="text-amber-400">Unlicensed Dispensary</span> operating under a generic DBA ("Bytex"). Transaction amounts are suspiciously rounded, typical of illicit e-commerce catalogs.
        </>
      )
    }
  },
  2: {
    id: "AL-893-BETA",
    ruleId: "Rule #412 Triggered:",
    ruleName: "Velocity spike / Fan-out",
    rail: "E-Transfer",
    flaggedAt: "Oct 24, 2026, 12:05 PM",
    score: "74.1 Warning",
    scoreColor: "text-amber-500 bg-amber-950/30",
    items: "15 transactions, 8 entities",
    status: "Open",
    entity: {
      id: "M. Chen",
      tier: "Tier 4 End-User • Active since Jan 2023",
      parent: "N/A (Direct User)",
      kyb: "Not Required",
      kybColor: "text-gray-500",
      volume: "15 Txns in 1hr",
      volumeColor: "text-amber-500"
    },
    aiSummary: {
      text: (
        <>
          User M. Chen received 15 e-transfers in under an hour from 8 different unknown senders. Funds were immediately moved out. This rapid fan-in/fan-out pattern is highly indicative of a mule account or rapid aggregation before external transfer.
        </>
      ),
      typology: (
        <>
          <strong className="text-white">Typology Match:</strong> High probability of a <span className="text-amber-400">Money Mule / Account Takeover</span>.
        </>
      )
    }
  },
  3: {
    id: "AL-894-GAMMA",
    ruleId: "Rule #99 Triggered:",
    ruleName: "Platform-level anomaly detected",
    rail: "EFT / ACH",
    flaggedAt: "Oct 23, 2026, 05:30 PM",
    score: "55.0 Review",
    scoreColor: "text-gray-300 bg-gray-800/50",
    items: "12,040 transactions, 54 merchants",
    status: "Open",
    entity: {
      id: "Apaylo Finance Tech",
      tier: "Tier 2 Platform • Registered Aug 2020",
      parent: "Master Bank API",
      kyb: "Annual Review Pending",
      kybColor: "text-amber-500",
      volume: "$5.2M (24h)",
      volumeColor: "text-indigo-400"
    },
    aiSummary: {
      text: (
        <>
          Aggregate volume across 54 sub-merchants under Apaylo Finance Tech has deviated significantly from the 90-day moving average. Specifically, EFT/ACH return rates have spiked to 3.2% (above the 1% threshold).
        </>
      ),
      typology: (
        <>
          <strong className="text-white">Typology Match:</strong> High probability of <span className="text-amber-400">Platform Risk / High Return Rate</span>.
        </>
      )
    }
  }
};

const FraudInvestigationView = ({ onNavigate }) => {
  const [activeAlert, setActiveAlert] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [isAiSummaryExpanded, setIsAiSummaryExpanded] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('action'); // 'action' or 'audit'

  const currentAlert = MOCK_ALERTS[activeAlert];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTransactions([1, 2, 3, 4]); // Mock IDs
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(tId => tId !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">

      {/* 1. GLOBAL LEFT NAVIGATION (Inspired by Unit21 Screenshot) */}
      <nav className="w-16 bg-[#121212] border-r border-gray-800 flex flex-col items-center py-4 shrink-0 z-20 shadow-xl">
        <button onClick={() => onNavigate('dashboard')} className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-colors cursor-pointer">
          T
        </button>
        <div className="flex flex-col space-y-6 w-full">
          <button onClick={() => onNavigate('investigation')} className="flex justify-center w-full group relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <Inbox size={20} className="text-indigo-400" />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Alerts Queue</span>
          </button>
          <button className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <Briefcase size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Cases</span>
          </button>
          <button className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <ListIcon size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Watchlists</span>
          </button>
          <button onClick={() => onNavigate('rules')} className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <Zap size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Rule Engine</span>
          </button>
          <button className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <FileBarChart size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Reports</span>
          </button>
        </div>
        <div className="mt-auto mb-4">
          <button className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
          LM
        </div>
      </nav>

      {/* 2. TRIAGE QUEUE INBOX */}
      <aside className="w-80 bg-[#121212] border-r border-gray-800 flex flex-col shrink-0 z-10 shadow-[4px_0_15px_rgba(0,0,0,0.3)] relative">
        <div className="p-4 border-b border-gray-800 bg-[#18181b]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-white flex items-center">
              Triage Queue <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">124</span>
            </h2>
            <button className="text-gray-400 hover:text-white transition-colors"><Filter size={16} /></button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input type="text" placeholder="Search alerts by ID, entity..." className="w-full bg-[#121212] border border-gray-700 text-sm text-gray-300 rounded pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] uppercase font-bold bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded border border-indigo-900/50 cursor-pointer whitespace-nowrap">My Queue (12)</span>
            <span className="text-[10px] uppercase font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 whitespace-nowrap transition-colors">Unassigned (45)</span>
            <span className="text-[10px] uppercase font-bold bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 whitespace-nowrap transition-colors">SLA Breach Risk (3)</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Alert Card 1 */}
          <div className={`p-4 border-b border-gray-800 cursor-pointer transition-all ${activeAlert === 1 ? 'bg-[#18181b] border-l-2 border-l-indigo-500 shadow-inner' : 'hover:bg-[#1A1A1A] border-l-2 border-l-transparent opacity-70 hover:opacity-100'}`} onClick={() => setActiveAlert(1)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-mono text-red-400 font-bold">AL-892-ALPHA</span>
              <span className="text-[10px] text-red-500 font-mono flex items-center"><Clock size={10} className="mr-1" /> 01h 45m</span>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">send@bytex.ca</h3>
            <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">Rule #1285: High volume keyword triggers</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded border border-red-900/50">Critical Score: 89</span>
              <span className="text-[10px] text-gray-500">Tier 3 Merchant</span>
            </div>
          </div>

          {/* Alert Card 2 */}
          <div className={`p-4 border-b border-gray-800 cursor-pointer transition-all ${activeAlert === 2 ? 'bg-[#18181b] border-l-2 border-l-indigo-500 shadow-inner' : 'hover:bg-[#1A1A1A] border-l-2 border-l-transparent opacity-70 hover:opacity-100'}`} onClick={() => setActiveAlert(2)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-mono text-amber-500 font-bold">AL-893-BETA</span>
              <span className="text-[10px] text-gray-500 font-mono">04h 12m</span>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">M. Chen</h3>
            <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">Rule #412: Velocity spike / Fan-out</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-amber-950/50 text-amber-500 px-1.5 py-0.5 rounded border border-amber-900/50">Warning Score: 74</span>
              <span className="text-[10px] text-gray-500">Tier 4 End-User</span>
            </div>
          </div>

          {/* Alert Card 3 */}
          <div className={`p-4 border-b border-gray-800 cursor-pointer transition-all ${activeAlert === 3 ? 'bg-[#18181b] border-l-2 border-l-indigo-500 shadow-inner' : 'hover:bg-[#1A1A1A] border-l-2 border-l-transparent opacity-70 hover:opacity-100'}`} onClick={() => setActiveAlert(3)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-mono text-gray-400 font-bold">AL-894-GAMMA</span>
              <span className="text-[10px] text-gray-500 font-mono">22h 00m</span>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Apaylo Finance Tech</h3>
            <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">Rule #99: Platform-level anomaly detected</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">Review Score: 55</span>
              <span className="text-[10px] text-gray-500">Tier 2 Platform</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. MAIN INVESTIGATION CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">

        {/* HEADER SECTION (Like Unit21 top section but cleaner) */}
        <header className="p-5 border-b border-gray-800 bg-[#18181b] shrink-0 z-10 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-gray-500"><CornerDownRight size={14} className="inline mr-1 text-gray-600" />{currentAlert.id}</span>
              <h1 className="text-xl font-light text-white flex items-center">
                {currentAlert.ruleId} <span className="font-medium ml-2">{currentAlert.ruleName}</span>
                <span className="ml-4 text-[10px] font-bold uppercase bg-blue-900/30 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded tracking-wider shadow-sm">Rail: {currentAlert.rail}</span>
              </h1>
            </div>
            <div className="flex space-x-2">
              <button className="bg-[#121212] border border-gray-700 text-gray-300 px-3 py-1.5 rounded text-sm hover:text-white hover:border-gray-500 transition-colors flex items-center">
                <Share2 size={14} className="mr-2" /> Share
              </button>
              <button className="bg-[#121212] border border-gray-700 text-gray-300 p-1.5 rounded text-sm hover:text-white hover:border-gray-500 transition-colors flex items-center">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs mt-4">
            <div className="flex items-center text-gray-400"><span className="text-gray-500 mr-2 w-16">Flagged At:</span> <span className="text-gray-200">{currentAlert.flaggedAt}</span></div>
            <div className="flex items-center text-gray-400"><span className="text-gray-500 mr-2 w-16">Risk Score:</span> <span className={`${currentAlert.scoreColor} font-bold px-1.5 rounded`}>{currentAlert.score}</span></div>
            <div className="flex items-center text-gray-400"><span className="text-gray-500 mr-2 w-16">Items:</span> <span className="text-gray-200">{currentAlert.items}</span></div>
            <div className="flex items-center text-gray-400"><span className="text-gray-500 mr-2 w-16">Status:</span> <span className="text-indigo-400 bg-indigo-900/30 border border-indigo-900/50 px-1.5 rounded uppercase font-bold">{currentAlert.status}</span></div>
          </div>
        </header>

        {/* INNER 2-COLUMN LAYOUT */}
        <div className="flex flex-1 overflow-hidden">

          {/* CENTER SCROLLABLE VIEW */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">

            {!isTableExpanded && (
              <>
                {/* Section 1: Flagged Entity Profile */}
            <section className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#18181b] px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center">
                  <UserCheck size={16} className="mr-2" /> Flagged Entity Profile
                </h2>
                <button className="text-[10px] text-gray-500 hover:text-white flex items-center">Full Profile <ArrowRight size={10} className="ml-1" /></button>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-y-5 gap-x-10 items-center">
                  <div>
                    <div className="text-xl font-medium text-white mb-1">{currentAlert.entity.id}</div>
                    <div className="text-xs text-gray-500">{currentAlert.entity.tier}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Parent Platform</div>
                    <div className="text-sm text-gray-300">{currentAlert.entity.parent}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">KYB Status</div>
                    <div className={`text-sm ${currentAlert.entity.kybColor} font-bold`}>{currentAlert.entity.kyb}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Volume Metric</div>
                    <div className={`text-sm ${currentAlert.entity.volumeColor} font-bold flex items-center`}><Activity size={12} className="mr-1" /> {currentAlert.entity.volume}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: AI Investigation Narrative */}
            <section className="bg-gradient-to-br from-[#18181b] to-[#121212] border border-gray-800 rounded-lg shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1A1A1A] transition-colors"
                onClick={() => setIsAiSummaryExpanded(!isAiSummaryExpanded)}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                  Why did this flag? (AI Summary)
                </h2>
                <div className="text-gray-500">
                  {isAiSummaryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
              
              {isAiSummaryExpanded && (
                <div className="p-5 pt-0 border-t border-gray-800/50 mt-1">
                  <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
                    {currentAlert.aiSummary.text}
                    <br /><br />
                    {currentAlert.aiSummary.typology}
                  </p>
                </div>
              )}
            </section>

            {/* Section 2.5: Historical Data On-Demand */}
            <section className="bg-[#121212] border border-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-300 flex items-center mb-1">
                  <Database size={16} className="mr-2 text-indigo-400" /> Compare Historical Baseline
                </h3>
                <p className="text-xs text-gray-500">Query historical data on demand to compare previous behavior with the current alerted transactions.</p>
              </div>
              <div className="flex items-center space-x-3">
                <select className="bg-[#1A1A1A] border border-gray-700 text-xs text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500">
                  <option>Past 30 Days</option>
                  <option>Past 90 Days</option>
                  <option>Past 6 Months</option>
                  <option>All Time</option>
                </select>
                <button className="bg-[#1A1A1A] hover:bg-[#252525] border border-gray-700 text-gray-300 text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm flex items-center">
                  <Search size={14} className="mr-2" /> Fetch History
                </button>
              </div>
            </section>
            </>
            )}

            {/* Section 3: Flagged Transactions Table */}
            <section className={`bg-[#121212] border border-gray-800 rounded-lg flex flex-col shadow-sm transition-all ${isTableExpanded ? 'flex-1 min-h-[400px]' : 'h-[400px]'}`}>
              <div className="bg-[#18181b] px-4 py-3 border-b border-gray-800 flex justify-between items-center shrink-0">
                <h3 className="text-sm font-bold text-gray-300 flex items-center">
                  Transaction Analysis (480 hits)
                </h3>
                <div className="flex space-x-2 items-center">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1.5 text-gray-500" />
                    <input type="text" placeholder="Search rows..." className="bg-[#121212] border border-gray-700 rounded px-8 py-1 text-xs text-gray-300 focus:outline-none w-48" />
                  </div>
                  <button className="p-1 border border-gray-700 rounded bg-[#121212] text-gray-400 hover:text-white transition-colors" title="Filter Rows"><Filter size={14} /></button>
                  <button 
                    onClick={() => setIsTableExpanded(!isTableExpanded)}
                    className="p-1 border border-gray-700 rounded bg-[#121212] text-gray-400 hover:text-white transition-colors ml-2 flex items-center bg-indigo-900/20 text-indigo-400 border-indigo-900/50" 
                    title={isTableExpanded ? "Collapse Table" : "Expand Table"}
                  >
                    {isTableExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {/* Dense Data Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead className="bg-[#121212] text-gray-500 sticky top-0 border-b border-gray-800 z-10 shadow-sm">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input type="checkbox" onChange={handleSelectAll} className="accent-indigo-500 cursor-pointer" />
                      </th>
                      <th className="p-3 font-medium">Time (UTC)</th>
                      <th className="p-3 font-medium">Ref Number</th>
                      <th className="p-3 font-medium">Sender</th>
                      <th className="p-3 font-medium">Recipient Name / Email</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                      <th className="p-3 font-medium">Sec Question</th>
                      <th className="p-3 font-medium">Sec Answer / Memo</th>
                      <th className="p-3 font-medium text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 font-mono text-[12px]">
                    {/* Row 1 */}
                    <tr className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${selectedTransactions.includes(1) ? 'bg-indigo-900/10' : ''}`} onClick={() => handleSelect(1)}>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedTransactions.includes(1)} onChange={() => handleSelect(1)} className="accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="p-3 text-gray-400">14:22:05</td>
                      <td className="p-3 text-gray-500 font-mono">REF-892-001</td>
                      <td className="p-3 text-gray-300 font-sans">K. BUCKNER<br/><span className="text-[10px] text-gray-500">k.buckner@gmail.com</span></td>
                      <td className="p-3 text-gray-300 font-sans">BYTEX CA<br/><span className="text-[10px] text-gray-500">send@bytex.ca</span></td>
                      <td className="p-3 text-right text-white">$125.00</td>
                      <td className="p-3 text-gray-400 max-w-[120px] truncate" title="What is the secret?">What is the secret?</td>
                      <td className="p-3">
                        <span className="bg-red-900/40 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded mr-2">weed</span>
                        <span className="text-gray-500">Buckner1769</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mx-auto shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                      </td>
                    </tr>
                    {/* Row 2 */}
                    <tr className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${selectedTransactions.includes(2) ? 'bg-indigo-900/10' : ''}`} onClick={() => handleSelect(2)}>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedTransactions.includes(2)} onChange={() => handleSelect(2)} className="accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="p-3 text-gray-400">14:15:30</td>
                      <td className="p-3 text-gray-500 font-mono">REF-892-002</td>
                      <td className="p-3 text-gray-300 font-sans">C. PII<br/><span className="text-[10px] text-gray-500">c.pii@yahoo.ca</span></td>
                      <td className="p-3 text-gray-300 font-sans">BYTEX CA<br/><span className="text-[10px] text-gray-500">send@bytex.ca</span></td>
                      <td className="p-3 text-right text-white">$104.00</td>
                      <td className="p-3 text-gray-400 max-w-[120px] truncate" title="Password">Password</td>
                      <td className="p-3 text-gray-400">
                        NULL / pii176980
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mx-auto"></div>
                      </td>
                    </tr>
                    {/* Row 3 */}
                    <tr className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${selectedTransactions.includes(3) ? 'bg-indigo-900/10' : ''}`} onClick={() => handleSelect(3)}>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedTransactions.includes(3)} onChange={() => handleSelect(3)} className="accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="p-3 text-gray-400">13:58:12</td>
                      <td className="p-3 text-gray-500 font-mono">REF-892-003</td>
                      <td className="p-3 text-gray-300 font-sans">J. LAUZON<br/><span className="text-[10px] text-gray-500">jlauzon99@hotmail.com</span></td>
                      <td className="p-3 text-gray-300 font-sans">BYTEX CA<br/><span className="text-[10px] text-gray-500">send@bytex.ca</span></td>
                      <td className="p-3 text-right text-white">$255.36</td>
                      <td className="p-3 text-gray-400 max-w-[120px] truncate" title="Fav plant">Fav plant</td>
                      <td className="p-3">
                        <span className="bg-red-900/40 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded mr-2">canna</span>
                        <span className="text-gray-500">Lauzon1769</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mx-auto shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                      </td>
                    </tr>
                    {/* Row 4 */}
                    <tr className={`hover:bg-gray-800/30 transition-colors cursor-pointer ${selectedTransactions.includes(4) ? 'bg-indigo-900/10' : ''}`} onClick={() => handleSelect(4)}>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedTransactions.includes(4)} onChange={() => handleSelect(4)} className="accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="p-3 text-gray-400">13:40:01</td>
                      <td className="p-3 text-gray-500 font-mono">REF-892-004</td>
                      <td className="p-3 text-gray-300 font-sans">M. SMITH<br/><span className="text-[10px] text-gray-500">smith.m@gmail.com</span></td>
                      <td className="p-3 text-gray-300 font-sans">BYTEX CA<br/><span className="text-[10px] text-gray-500">send@bytex.ca</span></td>
                      <td className="p-3 text-right text-white">$50.00</td>
                      <td className="p-3 text-gray-400 max-w-[120px] truncate" title="Why">Why</td>
                      <td className="p-3 text-gray-400">
                        Happy Bday / null
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mx-auto opacity-50"></div>
                      </td>
                    </tr>
                    {/* Mock empty rows to show scroll */}
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="hover:bg-gray-800/30 transition-colors opacity-50">
                        <td className="p-3 text-center"><input type="checkbox" disabled className="accent-gray-500" /></td>
                        <td className="p-3 text-gray-600">--:--:--</td>
                        <td className="p-3 text-gray-600 font-sans">---</td>
                        <td className="p-3 text-gray-600 font-sans">---</td>
                        <td className="p-3 text-gray-600 font-sans">---</td>
                        <td className="p-3 text-right text-gray-600">---</td>
                        <td className="p-3 text-gray-600 font-sans">---</td>
                        <td className="p-3 text-gray-600">---</td>
                        <td className="p-3 text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Sticky Bulk Action Bar */}
              {selectedTransactions.length > 0 && (
                <div className="bg-indigo-900/90 border-t border-indigo-700 p-2.5 flex justify-between items-center backdrop-blur-md shrink-0">
                  <span className="text-xs text-indigo-200 font-medium ml-2">{selectedTransactions.length} transactions selected</span>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs rounded text-white transition-colors border border-gray-600 shadow-sm">Mark False Positive</button>
                    <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-xs rounded text-white transition-colors font-medium shadow-sm">Flag Items</button>
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT WORKSPACE (Notes & Resolution) */}
          <aside className="w-72 bg-[#18181b] border-l border-gray-800 flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.1)]">

            {/* Tabs */}
            <div className="flex text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 shrink-0 bg-[#121212]">
              <button 
                onClick={() => setRightPanelTab('action')}
                className={`flex-1 py-4 text-center border-b-2 transition-colors ${rightPanelTab === 'action' ? 'border-indigo-500 text-indigo-400 bg-[#1A1A1A]' : 'border-transparent hover:bg-[#1A1A1A] hover:text-gray-400'}`}
              >
                Action Pad
              </button>
              <button 
                onClick={() => setRightPanelTab('audit')}
                className={`flex-1 py-4 text-center border-b-2 transition-colors ${rightPanelTab === 'audit' ? 'border-indigo-500 text-indigo-400 bg-[#1A1A1A]' : 'border-transparent hover:bg-[#1A1A1A] hover:text-gray-400'}`}
              >
                Audit Trail
              </button>
            </div>

            {rightPanelTab === 'action' ? (
              <>
                {/* Action Pad */}
                <div className="p-5 border-b border-gray-800 shrink-0">
                  <div className="space-y-2.5">
                    <button className="w-full p-2.5 bg-[#1A1A1A] border border-gray-700 hover:border-gray-500 rounded flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white transition-all group">
                      <CheckCircle size={16} className="mr-2 text-gray-500 group-hover:text-green-500 transition-colors" />
                      Close Alert (False Pos)
                    </button>
                    
                    <div className="text-[10px] text-center text-gray-500 my-3 font-bold uppercase tracking-wider relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                      <span className="relative bg-[#18181b] px-2">Escalate to Case</span>
                    </div>

                    <button className="w-full p-2.5 bg-blue-950/20 border border-blue-900/50 hover:bg-blue-900/30 rounded flex items-center justify-center text-sm font-medium text-blue-400 transition-all">
                      <MessageSquare size={16} className="mr-2" />
                      RFI (Request Info)
                    </button>

                    <button className="w-full p-2.5 bg-amber-950/20 border border-amber-900/50 hover:bg-amber-900/30 rounded flex items-center justify-center text-sm font-medium text-amber-500 transition-all">
                      <ShieldAlert size={16} className="mr-2" />
                      UTR (Under Review)
                    </button>

                    <button className="w-full p-2.5 bg-purple-950/20 border border-purple-900/50 hover:bg-purple-900/30 rounded flex items-center justify-center text-sm font-medium text-purple-400 transition-all">
                      <FileText size={16} className="mr-2" />
                      File STR
                    </button>

                    <button className="w-full p-2.5 bg-red-900 hover:bg-red-800 rounded flex items-center justify-center text-sm font-medium text-white transition-all shadow-lg shadow-red-900/20 mt-4">
                      <Lock size={16} className="mr-2" />
                      Lock Sub-Merchant
                    </button>
                  </div>
                </div>

                {/* Case Notes */}
                <div className="flex-1 p-4 flex flex-col min-h-0 bg-[#18181b]">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center">
                      <MessageSquare size={14} className="mr-2" /> Analyst Notes
                    </h3>
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 rounded">Auto-saving</span>
                  </div>

                  <div className="flex-1 bg-[#121212] border border-gray-800 rounded-lg p-3 overflow-y-auto mb-3 space-y-4 shadow-inner">
                    <div className="flex space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold text-white">
                        LM
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 mb-0.5">Leo M. • 10:22 AM</div>
                        <div className="text-xs text-gray-300">Confirmed keywords match. Checking if they have a dispensary license uploaded in KYB docs.</div>
                      </div>
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="shrink-0 relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add note (@mention enabled)..."
                      className="w-full h-20 bg-[#121212] border border-gray-700 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none shadow-inner"
                    />
                    <button className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-colors shadow-md">
                      Add Note
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Audit Trail Tab */
              <div className="flex-1 p-5 overflow-y-auto bg-[#18181b]">
                <div className="space-y-6">
                  {/* Log 1 */}
                  <div className="relative pl-6 border-l-2 border-gray-800">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#18181b]"></div>
                    <div className="text-[10px] text-gray-500 mb-0.5">09:14 AM • System</div>
                    <div className="text-xs text-gray-300">Alert generated and assigned to <span className="text-white font-medium">Leo M.</span></div>
                  </div>
                  {/* Log 2 */}
                  <div className="relative pl-6 border-l-2 border-gray-800">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-gray-600 ring-4 ring-[#18181b]"></div>
                    <div className="text-[10px] text-gray-500 mb-0.5">09:16 AM • Leo M.</div>
                    <div className="text-xs text-gray-300">Queried historical data for Past 90 Days</div>
                  </div>
                  {/* Log 3 */}
                  <div className="relative pl-6 border-l-2 border-gray-800">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-gray-600 ring-4 ring-[#18181b]"></div>
                    <div className="text-[10px] text-gray-500 mb-0.5">10:22 AM • Leo M.</div>
                    <div className="text-xs text-gray-300">Added Analyst Note</div>
                  </div>
                  {/* Log 4 */}
                  <div className="relative pl-6 border-l-2 border-transparent">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-gray-600 ring-4 ring-[#18181b]"></div>
                    <div className="text-[10px] text-gray-500 mb-0.5">10:45 AM • Leo M.</div>
                    <div className="text-xs text-gray-300">Viewed sub-merchant KYB document <span className="text-indigo-400 hover:underline cursor-pointer">biz_reg.pdf</span></div>
                  </div>
                </div>
              </div>
            )}

          </aside>

        </div>
      </main>
    </div>
  );
};

export default FraudInvestigationView;
