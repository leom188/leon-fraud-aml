import React from 'react';
import { FileBarChart, Download, FileSpreadsheet, Activity, ChevronRight, Network, Zap, List as ListIcon } from 'lucide-react';

const ReportsView = ({ onNavigate }) => {
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
          <button onClick={() => onNavigate('reports')} className="flex justify-center w-full group relative cursor-pointer">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <div className="p-2.5 rounded-xl bg-indigo-900/40 text-indigo-400 border border-indigo-700/50"><FileBarChart size={20} /></div>
          </button>
          <button onClick={() => onNavigate('watchlists')} className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer">
            <div className="p-2.5 rounded-xl hover:bg-gray-800"><ListIcon size={20} /></div>
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
            <div className="p-2.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl">
              <FileBarChart size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LEON • Reports & Analytics</h1>
              <p className="text-xs text-gray-400">Executive AML Audit Logs & Suspicious Transaction Report (STR) Export Hub</p>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1400px] mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#12141c] border border-gray-800 p-5 rounded-2xl">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Generated Reports</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">24 Packages</span>
            </div>
            <div className="bg-[#12141c] border border-gray-800 p-5 rounded-2xl">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">STR Filings Logged</span>
              <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">12 Reports</span>
            </div>
            <div className="bg-[#12141c] border border-gray-800 p-5 rounded-2xl">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">False Positive Audits</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">88 Cleared</span>
            </div>
          </div>

          <div className="bg-[#12141c] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Available Compliance Export Packages</h2>
            <div className="space-y-3">
              <div className="p-4 bg-[#181b24] border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Monthly ETRANSFER High-Risk Cluster Summary</div>
                  <div className="text-xs text-gray-400">Aggregated customer entities with Critical risk scores across DCBANK, Pateno, and DCPayments</div>
                </div>
                <button onClick={() => alert('Exporting PDF/Excel report package...')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center cursor-pointer">
                  <Download size={14} className="mr-1.5" /> Export Excel
                </button>
              </div>

              <div className="p-4 bg-[#181b24] border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Illicit Merchant Keyword Breaches ("weed", "canna", "crypto")</div>
                  <div className="text-xs text-gray-400">Detailed transaction audit log matching illicit dispensary & crypto keywords</div>
                </div>
                <button onClick={() => alert('Exporting Keyword Audit Package...')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center cursor-pointer">
                  <Download size={14} className="mr-1.5" /> Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
