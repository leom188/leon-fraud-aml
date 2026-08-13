import React, { useState } from 'react';
import {
  Zap, Inbox, Briefcase, List as ListIcon, Settings, FileBarChart,
  Search, Plus, Filter, Edit2, Play, Pause, Trash2, Clock, 
  ChevronRight, AlertTriangle, CheckCircle, ShieldAlert, MoreVertical,
  Save, X, CornerDownRight, Database
} from 'lucide-react';

const RuleEngineView = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock Rules Data
  const [rules] = useState([
    { id: 'R-1285', name: 'High Volume Keyword Velocity', type: 'Near Real-Time', status: 'Active', target: 'e-Transfer', lastEdited: '2 days ago' },
    { id: 'R-0412', name: 'Fan-out / Velocity Spike', type: 'Near Real-Time', status: 'Active', target: 'EFT', lastEdited: '1 week ago' },
    { id: 'R-0099', name: 'Platform-Level Anomaly', type: 'Real-Time', status: 'Paused', target: 'All Rails', lastEdited: '1 month ago' },
  ]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      
      {/* 1. GLOBAL LEFT NAVIGATION (Consistent with Investigation View) */}
      <nav className="w-16 bg-[#121212] border-r border-gray-800 flex flex-col items-center py-4 shrink-0 z-20 shadow-xl">
        <button onClick={() => onNavigate('dashboard')} className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-colors cursor-pointer">
          T
        </button>
        <div className="flex flex-col space-y-6 w-full">
          <button onClick={() => onNavigate('investigation')} className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors">
            <Inbox size={20} />
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
          <button onClick={() => onNavigate('rules')} className="flex justify-center w-full group relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r"></div>
            <Zap size={20} className="text-amber-400" />
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

      {/* 2. RULE LIBRARY LIST (Left Panel) */}
      <aside className="w-80 bg-[#121212] border-r border-gray-800 flex flex-col shrink-0 z-10 shadow-[4px_0_15px_rgba(0,0,0,0.3)]">
        <div className="p-4 border-b border-gray-800 bg-[#18181b]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white flex items-center">
              Rule Library
            </h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded transition-colors shadow-lg shadow-indigo-900/20"
              title="Create New Rule"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
            <input type="text" placeholder="Search rules..." className="w-full bg-[#121212] border border-gray-700 text-sm text-gray-300 rounded pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] uppercase font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-600 cursor-pointer whitespace-nowrap">Active (42)</span>
            <span className="text-[10px] uppercase font-bold bg-[#121212] text-gray-500 px-2 py-1 rounded border border-gray-800 cursor-pointer hover:bg-gray-800 whitespace-nowrap transition-colors">Drafts (3)</span>
            <span className="text-[10px] uppercase font-bold bg-[#121212] text-gray-500 px-2 py-1 rounded border border-gray-800 cursor-pointer hover:bg-gray-800 whitespace-nowrap transition-colors">Archived (15)</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rules.map((rule, idx) => (
            <div key={idx} className={`p-4 border-b border-gray-800 cursor-pointer transition-all ${idx === 0 && !isEditing ? 'bg-[#18181b] border-l-2 border-l-amber-500 shadow-inner' : 'hover:bg-[#1A1A1A] border-l-2 border-l-transparent opacity-70 hover:opacity-100'}`} onClick={() => setIsEditing(false)}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-mono text-amber-500 font-bold">{rule.id}</span>
                {rule.status === 'Active' ? (
                  <span className="text-[10px] text-green-500 flex items-center bg-green-950/30 px-1.5 py-0.5 rounded border border-green-900/50"><Play size={8} className="mr-1" /> Active</span>
                ) : (
                  <span className="text-[10px] text-gray-500 flex items-center bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700"><Pause size={8} className="mr-1" /> Paused</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-white mb-1 leading-tight">{rule.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">{rule.type}</span>
                <span className="text-[10px] text-gray-500 flex items-center"><Clock size={10} className="mr-1" /> {rule.lastEdited}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE (Rule Builder) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] overflow-y-auto">
        
        {/* Header */}
        <header className="p-6 border-b border-gray-800 bg-[#18181b] shrink-0 sticky top-0 z-10 shadow-sm flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono text-amber-500 bg-amber-950/20 border border-amber-900/50 px-2 py-0.5 rounded">
                {isEditing ? 'DRAFT-NEW' : 'R-1285'}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">e-Transfer Rail</span>
            </div>
            {isEditing ? (
              <input type="text" defaultValue="New Illicit Substance Rule" className="text-2xl font-light text-white bg-transparent border-b border-gray-600 focus:border-indigo-500 focus:outline-none w-96 pb-1 transition-colors" />
            ) : (
              <h1 className="text-2xl font-light text-white">High Volume Keyword Velocity</h1>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-[#121212] border border-gray-700 text-gray-300 px-4 py-2 rounded text-sm hover:text-white hover:border-gray-500 transition-colors flex items-center">
              <Database size={16} className="mr-2 text-gray-500" /> Test vs Historical
            </button>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="bg-[#121212] border border-gray-700 text-gray-300 px-4 py-2 rounded text-sm hover:text-white hover:border-gray-500 transition-colors">
                  Cancel
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center">
                  <Save size={16} className="mr-2" /> Save Rule
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20 flex items-center">
                <Edit2 size={16} className="mr-2" /> Edit Rule
              </button>
            )}
          </div>
        </header>

        {/* Builder Content */}
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          
          {/* Settings Section */}
          <section className="bg-[#121212] border border-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center">
              <Settings size={16} className="mr-2" /> Rule Configuration
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Description / Analyst Instructions</label>
                <textarea 
                  disabled={!isEditing}
                  defaultValue="Triggers when a sub-merchant receives multiple small e-transfers containing drug-related keywords in the memo or security question. Indicates potential unlicensed dispensary."
                  className="w-full h-24 bg-[#1A1A1A] border border-gray-800 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Payment Rail Selector</label>
                  <select disabled={!isEditing} className="w-full bg-[#1A1A1A] border border-gray-800 rounded p-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                    <option>E-Transfer (Interac)</option>
                    <option>CARD (Visa/Mastercard)</option>
                    <option>EFT / ACH</option>
                    <option>Wire Transfer</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">* Condition fields below dynamically adapt to the selected rail.</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">Execution Schedule</label>
                  <div className="flex flex-col space-y-2">
                    <label className={`flex items-center space-x-2 cursor-pointer ${!isEditing && 'opacity-50 pointer-events-none'}`}>
                      <input type="radio" name="schedule" defaultChecked className="accent-indigo-500" />
                      <span className="text-sm text-gray-300">Per Transaction (Real-Time / Near Real-Time)</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className={`flex items-center space-x-2 cursor-pointer ${!isEditing && 'opacity-50 pointer-events-none'}`}>
                        <input type="radio" name="schedule" className="accent-indigo-500" />
                        <span className="text-sm text-gray-300">Batch / Aggregation:</span>
                      </label>
                      <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none disabled:opacity-70">
                        <option>Daily (End of Day)</option>
                        <option>Hourly</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">Target Entity Level</label>
                  <select disabled={!isEditing} className="w-full bg-[#1A1A1A] border border-gray-800 rounded p-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                    <option>Sub-Merchant Cluster</option>
                    <option>Individual Transaction</option>
                    <option>Platform (Tier 2)</option>
                    <option>End-User (Tier 4)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Logic Builder Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center">
              <Zap size={16} className="mr-2" /> Base Conditions
            </h3>
            <p className="text-xs text-gray-500 mb-4">If ALL of these conditions are met, the rule will trigger.</p>
            
            <div className="space-y-3">
              {/* Condition 1 */}
              <div className="flex items-center space-x-3 bg-[#121212] border border-gray-800 rounded-lg p-3 group">
                <div className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">IF</div>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-white w-48 disabled:opacity-70">
                  <option>Transaction Amount</option>
                  <option>Sender Name</option>
                  <option>Memo Field</option>
                </select>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-amber-400 w-32 disabled:opacity-70">
                  <option>is between</option>
                  <option>is greater than</option>
                </select>
                <input disabled={!isEditing} type="text" defaultValue="$50 and $200" className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-white flex-1 disabled:opacity-70" />
                {isEditing && <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
              </div>

              {/* Condition 2 */}
              <div className="flex items-center space-x-3 bg-[#121212] border border-gray-800 rounded-lg p-3 group">
                <div className="bg-indigo-900/30 text-indigo-400 border border-indigo-900/50 text-[10px] font-bold px-2 py-1 rounded">AND</div>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-white w-48 disabled:opacity-70">
                  <option>Velocity (24h count)</option>
                </select>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-amber-400 w-32 disabled:opacity-70">
                  <option>is greater than</option>
                </select>
                <input disabled={!isEditing} type="text" defaultValue="50 transactions" className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-white flex-1 disabled:opacity-70" />
                {isEditing && <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
              </div>

              {/* Condition 3 */}
              <div className="flex items-center space-x-3 bg-[#121212] border border-gray-800 rounded-lg p-3 group relative">
                <div className="absolute -left-1.5 top-1/2 w-3 h-px bg-gray-700"></div>
                <div className="absolute -left-1.5 top-0 w-px h-1/2 bg-gray-700"></div>
                <div className="bg-indigo-900/30 text-indigo-400 border border-indigo-900/50 text-[10px] font-bold px-2 py-1 rounded">AND</div>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-white w-48 disabled:opacity-70">
                  <option>Memo OR Security Answer</option>
                </select>
                <select disabled={!isEditing} className="bg-[#1A1A1A] border border-gray-700 rounded p-1.5 text-sm text-amber-400 w-32 disabled:opacity-70">
                  <option>contains any from list</option>
                </select>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="bg-purple-900/20 border border-purple-900/50 text-purple-300 rounded px-3 py-1.5 text-sm flex items-center cursor-pointer hover:bg-purple-900/40 transition-colors">
                    <ListIcon size={14} className="mr-2" /> Global: Drug Keywords V2
                  </div>
                </div>
                {isEditing && <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
              </div>

              {isEditing && (
                <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center mt-2 px-2 transition-colors">
                  <Plus size={14} className="mr-1" /> Add Condition
                </button>
              )}
            </div>
          </section>

          {/* Sub-Rules / Modifiers Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center">
              <CornerDownRight size={16} className="mr-2" /> Sub-Rules (Score Modifiers)
            </h3>
            <p className="text-xs text-gray-500 mb-4">Adjust the final risk score based on mitigating or exacerbating factors to reduce false positives.</p>
            
            <div className="space-y-3">
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">IF</div>
                  <span className="text-sm text-white">Sender Name</span>
                  <span className="text-sm text-amber-400">contains any from list</span>
                  <div className="bg-purple-900/20 border border-purple-900/50 text-purple-300 rounded px-2 py-1 text-xs flex items-center">
                    <ListIcon size={12} className="mr-1" /> Global: Drug Keywords V2
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-12">
                  <CornerDownRight size={14} className="text-gray-600" />
                  <div className="bg-green-950/30 text-green-500 border border-green-900/50 text-[10px] font-bold px-2 py-1 rounded">THEN</div>
                  <span className="text-sm text-white">Reduce Final Score by</span>
                  <span className="text-sm font-bold text-green-400">50 points</span>
                  <span className="text-xs text-gray-500 italic ml-2">(Reason: Person's actual name might be "Weed" or "Green")</span>
                </div>
              </div>

              {isEditing && (
                <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center mt-2 px-2 transition-colors">
                  <Plus size={14} className="mr-1" /> Add Sub-Rule
                </button>
              )}
            </div>
          </section>

          {/* Action Outcome Section */}
          <section className="bg-[#1A1A1A] border-t border-b border-indigo-900/30 p-6 -mx-8 px-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-6 flex items-center">
              <ShieldAlert size={16} className="mr-2" /> Outcome & Actions
            </h3>
            
            <div className="flex items-center space-x-8">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Base Risk Score Applied</label>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-red-400 mr-2">80</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
              </div>
              <div className="h-12 w-px bg-gray-800"></div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Alert Severity</label>
                <select disabled={!isEditing} className="bg-[#121212] border border-red-900/50 rounded p-2 text-sm text-red-400 font-bold focus:outline-none disabled:opacity-100">
                  <option>Critical (SLA: 2h)</option>
                  <option>Warning (SLA: 24h)</option>
                  <option>Review (SLA: 72h)</option>
                </select>
              </div>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
};

export default RuleEngineView;
