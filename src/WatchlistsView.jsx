import React from 'react';
import { List as ListIcon, Plus, Trash2, Search, Activity, Network, Zap, FileBarChart } from 'lucide-react';

const WatchlistsView = ({ onNavigate }) => {
  const sampleWatchlists = [
    { email: 'send@bytex.ca', type: 'Illicit Merchant', addedBy: 'LEON AML System', date: '2026-08-10', risk: 'Critical' },
    { email: 'transact@bytex.ca', type: 'Illicit Merchant Cluster', addedBy: 'Leo.moncada', date: '2026-08-11', risk: 'Critical' },
    { email: 'orders@vapegoods.ca', type: 'High Velocity Recipient', addedBy: 'Leo.moncada', date: '2026-08-12', risk: 'Elevated' }
  ];

  return (
    <div className="flex h-screen bg-[#0d0f14] text-gray-200 font-sans overflow-hidden">
      
      {/* GLOBAL LEFT NAVIGATION RAIL WITH LEON BRANDING */}
      <nav className="w-20 bg-[#12141c] border-r border-gray-800/80 flex flex-col items-center py-4 shrink-0 z-30 shadow-2xl">
        <button
          onClick={() => onNavigate('home')}
          className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-xl flex flex-col items-center justify-center text-white font-extrabold mb-8 shadow-lg shadow-indigo-900/50 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30 group"
          title="LEON - Fraud Prevention & AML Home"
        >
          <span className="text-[11px] tracking-tighter leading-none text-indigo-200 font-black group-hover:text-white">LEON</span>
          <span className="text-[7px] tracking-widest text-indigo-300 uppercase font-mono mt-0.5">AML</span>
        </button>

        <div className="flex flex-col space-y-6 w-full items-center">
          <button onClick={() => onNavigate('home')} className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer">
            <div className="p-2.5 rounded-xl hover:bg-gray-800"><Activity size={20} /></div>
          </button>
          <button onClick={() => onNavigate('explorer')} className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer">
            <div className="p-2.5 rounded-xl hover:bg-gray-800"><Network size={20} /></div>
          </button>
          <button onClick={() => onNavigate('rules')} className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer">
            <div className="p-2.5 rounded-xl hover:bg-gray-800"><Zap size={20} /></div>
          </button>
          <button onClick={() => onNavigate('reports')} className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer">
            <div className="p-2.5 rounded-xl hover:bg-gray-800"><FileBarChart size={20} /></div>
          </button>
          <button onClick={() => onNavigate('watchlists')} className="flex justify-center w-full group relative cursor-pointer">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <div className="p-2.5 rounded-xl bg-indigo-900/40 text-indigo-400 border border-indigo-700/50"><ListIcon size={20} /></div>
          </button>
        </div>

        <div className="mt-auto mb-4">
          <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300 shadow">LM</div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0d0f14]">
        <header className="bg-[#14171e] border-b border-gray-800 p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-950 text-purple-400 border border-purple-800 rounded-xl">
              <ListIcon size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LEON • Watchlists & Sanctions</h1>
              <p className="text-xs text-gray-400">High-Risk Recipient Email & Entity Blacklist Registry</p>
            </div>
          </div>

          <button onClick={() => alert('Add to Watchlist modal')} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center shadow-lg shadow-indigo-600/30">
            <Plus size={15} className="mr-1.5" /> Add New Watchlist Entry
          </button>
        </header>

        <div className="p-6 max-w-[1400px] mx-auto w-full space-y-6">
          <div className="bg-[#12141c] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Flagged ETRANSFER Watchlist Entities</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#181b24] text-[10px] uppercase text-gray-400 border-b border-gray-800 font-bold">
                  <tr>
                    <th className="p-3.5">Identifier / Email</th>
                    <th className="p-3.5">Watchlist Category</th>
                    <th className="p-3.5">Added By</th>
                    <th className="p-3.5">Date Added</th>
                    <th className="p-3.5">Risk Level</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {sampleWatchlists.map((w, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/40">
                      <td className="p-3.5 font-mono text-white font-semibold">{w.email}</td>
                      <td className="p-3.5 text-gray-300">{w.type}</td>
                      <td className="p-3.5 text-gray-400">{w.addedBy}</td>
                      <td className="p-3.5 font-mono text-gray-500">{w.date}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${w.risk === 'Critical' ? 'bg-red-950 text-red-400 border-red-900' : 'bg-amber-950 text-amber-400 border-amber-900'}`}>
                          {w.risk}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button onClick={() => alert('Entry removed')} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistsView;
