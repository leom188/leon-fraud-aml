import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Lock,
  ShieldAlert,
  Users,
  Activity,
  Network,
  Mail,
  FileText,
  Upload,
  FileSpreadsheet,
  MoreVertical,
  Search,
  X,
  RefreshCw,
  Download,
  Check,
  Eye,
  HelpCircle,
  Database,
  Inbox,
  Briefcase,
  List as ListIcon,
  Zap,
  FileBarChart,
  Settings,
  ExternalLink
} from 'lucide-react';
import { parseExcelFile, generateSampleEtransferData } from './utils/excelDataLoader';
import { REQUIRED_COLUMNS } from './utils/etransferProcessor';

const DEFAULT_CLUSTERS = [
  {
    id: 'bytex1',
    name: 'send@bytex.ca',
    type: 'Merchant',
    parent: 'Apaylo Finance Tech',
    tier: 'Tier 3 Sub-Merchant',
    riskLevel: 'Critical',
    riskLabel: 'Critical (Illicit Sales)',
    riskBadge: '🔴 High Risk Cluster',
    triggerTitle: 'Suspicious Drug/Restricted Substance Sales Detected.',
    aiAnalysis: 'System identified transactions with "Sent To" names matching drug keywords ("canna", "Weed"). Transactional patterns show rounded amounts ($104.00, $125.00) and invoice/order numbers in the Memo field, highly consistent with illicit substance merchants.',
    typology: 'Unlicensed Dispensary',
    typologyDesc: 'Transactions masquerade as generic businesses ("Bytex") but slip-ups reveal actual purpose ("weed"). Volumes and memo patterns perfectly match illicit e-commerce sales.',
    linkAnalysisText: 'send@bytex.ca and transact@bytex.ca share the same physical address and phone number.',
    transactions: [
      { ref: '100000000755284517', interacRef1: 'C1AtwCsAFQs5', sender: 'KERI-ANNE BUCKNER', senderEmail: 'keri.b@gmail.com', recipientName: 'weed', recipientEmail: 'send@bytex.ca', amount: 125.00, secQ: 'N/A (Auto-deposit)', secA: 'NULL', memo: 'Buckner1769810154189', transAlert: '🔴 YES (Keyword "weed")', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755284152', interacRef1: 'C1AtwCsAFQs6', sender: 'CATHERINE L PII', senderEmail: 'catherine.pii@yahoo.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 104.00, secQ: 'N/A (Auto-deposit)', secA: 'NULL', memo: 'pii1769809869300', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755277363', interacRef1: 'C1AtwCsAFQs7', sender: 'JO-ANNE LAUZON', senderEmail: 'jlauzon@hotmail.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 255.36, secQ: 'N/A (Auto-deposit)', secA: 'NULL', memo: 'Lauzon1769809350507', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755285402', interacRef1: 'C1AtwCsAFQs8', sender: 'COBY MATALSKI', senderEmail: 'coby.m@outlook.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 105.00, secQ: 'N/A (Auto-deposit)', secA: 'NULL', memo: 'Matalski1769810187493', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
    ]
  },
  {
    id: 'bytex2',
    name: 'transact@bytex.ca',
    type: 'Merchant',
    parent: 'Apaylo Finance Tech',
    tier: 'Tier 3 Sub-Merchant',
    riskLevel: 'Critical',
    riskLabel: 'Critical (Linked Entity)',
    riskBadge: '🔴 High Risk Cluster',
    triggerTitle: 'Entity Overlap & Shared Contact Information.',
    aiAnalysis: 'Associated with high-risk merchant send@bytex.ca through shared IP addresses and bank routing headers.',
    typology: 'Linked Shell Account',
    typologyDesc: 'Secondary gateway used for splitting volumes to avoid single-account velocity triggers.',
    linkAnalysisText: 'Shares corporate ownership records with send@bytex.ca.',
    transactions: [
      { ref: '100000000755299101', sender: 'MICHAEL CHEN', recipientName: 'Bytex Transact', recipientEmail: 'transact@bytex.ca', amount: 310.00, secQ: 'Auto-deposit', secA: 'NULL', memo: 'Tx10992', transAlert: '🟡 Warning (Velocity)', clusterAlert: '🔴 YES (Linked Entity)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
    ]
  },
  {
    id: 'pvpay',
    name: 'sales@pvpay.ca',
    type: 'Merchant',
    parent: 'Apaylo Finance Tech',
    tier: 'Tier 3 Sub-Merchant',
    riskLevel: 'Critical',
    riskLabel: 'Critical (Illicit Sales)',
    riskBadge: '🔴 High Risk Cluster',
    triggerTitle: 'Unregistered Payment Aggregation',
    aiAnalysis: 'Multiple small incoming transfers from retail accounts with vape/cannabis order references.',
    typology: 'Illicit Merchant',
    typologyDesc: 'Unlicensed retail sales via Interac e-Transfer.',
    linkAnalysisText: 'Potential proxy merchant.',
    transactions: [
      { ref: '100000000755301882', sender: 'SARAH CONNOR', recipientName: 'PVPay', recipientEmail: 'sales@pvpay.ca', amount: 89.50, secQ: 'Auto-deposit', secA: 'NULL', memo: 'PV-8812', transAlert: '🟢 NO', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
    ]
  }
];

const FraudTriageDashboard = ({
  onNavigate,
  externalDataState,
  setExternalDataState,
  externalSelectedGroupId,
  setExternalSelectedGroupId
}) => {
  // Sidebar node expansion state
  const [expandedNodes, setExpandedNodes] = useState({
    'apaylo': true,
    'airwallex': false,
    'bytex1': true
  });
  
  const [internalSelectedSubMerchant, setInternalSelectedSubMerchant] = useState('bytex1');
  const selectedSubMerchant = externalSelectedGroupId || internalSelectedSubMerchant;

  const setSelectedSubMerchant = (id) => {
    setInternalSelectedSubMerchant(id);
    if (setExternalSelectedGroupId) setExternalSelectedGroupId(id);
  };

  // Dataset State
  const [internalIngestedDataset, setInternalIngestedDataset] = useState(null);
  const ingestedDataset = externalDataState !== undefined ? externalDataState : internalIngestedDataset;

  const setIngestedDataset = (data) => {
    setInternalIngestedDataset(data);
    if (setExternalDataState) setExternalDataState(data);
  };

  const [selectedTxRecord, setSelectedTxRecord] = useState(null);

  // Top Menu & Modal State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ stage: '', progress: 0 });
  const [validationError, setValidationError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState('ALL');

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const toggleNode = (node) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  // Close top menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Excel Upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setValidationError({
        title: 'Invalid File Extension',
        message: 'Please upload a valid Excel spreadsheet file (.xlsx or .xls).'
      });
      return;
    }

    setIsProcessing(true);
    setValidationError(null);
    setProgressInfo({ stage: 'Reading uploaded Excel file...', progress: 10 });

    try {
      const buffer = await file.arrayBuffer();
      const result = await parseExcelFile(buffer, (status) => setProgressInfo(status));

      setIngestedDataset(result);
      if (result.groupedEntities.length > 0) {
        setSelectedSubMerchant(result.groupedEntities[0].id);
      }
      setIsUploadModalOpen(false);
      setIsProcessing(false);
    } catch (err) {
      console.error('Data ingestion error:', err);
      setIsProcessing(false);
      setValidationError({
        title: 'Worksheet / Column Validation Error',
        message: err.message || 'Failed to process Excel file.'
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleData = () => {
    setIsProcessing(true);
    setProgressInfo({ stage: 'Generating synthetic ETRANSFER dataset...', progress: 50 });
    setTimeout(() => {
      const sample = generateSampleEtransferData(200);
      setIngestedDataset(sample);
      if (sample.groupedEntities.length > 0) {
        setSelectedSubMerchant(sample.groupedEntities[0].id);
      }
      setIsProcessing(false);
      setIsMenuOpen(false);
      setIsUploadModalOpen(false);
    }, 300);
  };

  const handleResetData = () => {
    setIngestedDataset(null);
    setSelectedSubMerchant('bytex1');
    setIsMenuOpen(false);
  };

  // Determine active profile & transaction list
  let activeProfile = null;
  let activeTransactions = [];

  if (ingestedDataset) {
    const foundGroup = ingestedDataset.groupedEntities.find(g => g.id === selectedSubMerchant) || ingestedDataset.groupedEntities[0];
    if (foundGroup) {
      activeProfile = {
        name: foundGroup.grouping_key,
        tier: `Customer Entity • ${foundGroup.grouping_key_source}`,
        parent: foundGroup.client_name,
        riskBadge: foundGroup.risk_level === 'Critical' ? '🔴 High Risk Cluster' : (foundGroup.risk_level === 'Elevated' ? '🟡 Elevated Risk' : '🟢 Normal Risk'),
        triggerTitle: `Grouping Key: ${foundGroup.grouping_key} (${foundGroup.transaction_direction})`,
        aiAnalysis: `Aggregated ${foundGroup.transaction_count} ETRANSFER transactions totaling $${foundGroup.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Date range: ${foundGroup.first_transaction_date} to ${foundGroup.last_transaction_date}.`,
        typology: foundGroup.risk_level === 'Critical' ? 'High Risk Merchant / Dispensary' : 'Customer Account Activity',
        typologyDesc: foundGroup.distinct_rule_count > 0 ? `Triggered Rules: ${foundGroup.rule_names.join(', ')}` : 'Normal transaction pattern without automated rule breaches.',
        linkAnalysisText: `Client: ${foundGroup.client_name} (${foundGroup.client_id}) • Customer ID: ${foundGroup.customer_id} • Account: ${foundGroup.customer_account}`
      };
      activeTransactions = foundGroup.transactions.map(tx => ({
        ref: tx.id,
        interacRef1: tx.interac_ref1 || tx.interacRef1 || tx.id,
        sender: tx.sender_name,
        senderEmail: tx.sender_email || 'N/A',
        recipientName: tx.recipient_name,
        recipientEmail: tx.recipient_email,
        amount: tx.amount,
        secQ: tx.sec_question || 'N/A (Auto-deposit)',
        secA: tx.sec_answer || 'NULL',
        memo: tx.memo || 'N/A',
        transAlert: tx.needs_review ? '🔴 YES (Review Required)' : (tx.rule_names.length ? `🔴 YES (${tx.rule_names[0]})` : '🟢 NO (Normal behavior)'),
        clusterAlert: foundGroup.risk_level === 'Critical' ? '🔴 YES (High Risk Entity)' : '🟢 NO',
        direction: tx.transaction_direction,
        groupingKeySource: tx.grouping_key_source,
        rawRecord: tx.raw_record
      }));
    }
  } else {
    const foundDefault = DEFAULT_CLUSTERS.find(c => c.id === selectedSubMerchant) || DEFAULT_CLUSTERS[0];
    activeProfile = foundDefault;
    activeTransactions = foundDefault.transactions;
  }

  // Filter transactions
  const filteredTransactions = activeTransactions.filter(tx => {
    if (filterDirection !== 'ALL' && tx.direction !== filterDirection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mRef = (tx.ref || '').toLowerCase().includes(q);
      const mSen = (tx.sender || '').toLowerCase().includes(q);
      const mRec = (tx.recipientName || '').toLowerCase().includes(q) || (tx.recipientEmail || '').toLowerCase().includes(q);
      const mMemo = (tx.memo || '').toLowerCase().includes(q);
      if (!mRef && !mSen && !mRec && !mMemo) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 font-sans overflow-hidden">

      {/* 0. GLOBAL LEFT NAVIGATION RAIL */}
      <nav className="w-16 bg-[#121212] border-r border-gray-800 flex flex-col items-center py-4 shrink-0 z-30 shadow-xl">
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold mb-8 shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-colors cursor-pointer"
          title="E-Transfer Dashboard Home"
        >
          T
        </button>

        <div className="flex flex-col space-y-6 w-full">
          {/* Alerts Queue (ACTIVE) */}
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex justify-center w-full group relative cursor-pointer"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <Inbox size={20} className="text-indigo-400" />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Alerts Queue
            </span>
          </button>

          {/* Cluster Explorer */}
          <button
            onClick={() => onNavigate && onNavigate('explorer')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Network size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Cluster & Entity Explorer
            </span>
          </button>

          {/* Investigation Queue */}
          <button
            onClick={() => onNavigate && onNavigate('investigation')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Briefcase size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Investigation View
            </span>
          </button>

          {/* Watchlists */}
          <button
            onClick={() => alert('Watchlists module loaded.')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <ListIcon size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Watchlists
            </span>
          </button>

          {/* Rule Engine */}
          <button
            onClick={() => onNavigate && onNavigate('rules')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Zap size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Rule Management
            </span>
          </button>

          {/* Reports */}
          <button
            onClick={() => alert('E-Transfer Risk Reports & Analytics generated.')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <FileBarChart size={20} />
            <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Reports & Analytics
            </span>
          </button>
        </div>

        <div className="mt-auto mb-4">
          <button
            onClick={() => alert('System Settings')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
          LM
        </div>
      </nav>

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* 1. TOP CONTROL BAR */}
        <header className="bg-[#1A1A1A] border-b border-gray-800 p-4 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-white tracking-wide">E-Transfer Triage</h1>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700/50">
                <span className="text-gray-400">Active Rail:</span>
                <span className="text-white font-medium">E-Transfer</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700/50">
                <Clock size={14} className="text-gray-400" />
                <select className="bg-transparent text-white border-none focus:ring-0 cursor-pointer">
                  <option>Last 1 Hour</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Global Status Counters */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-400 mr-2">Global Status:</span>
              <div className="flex space-x-3 text-sm font-medium">
                <span className="flex items-center text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                  {ingestedDataset ? `${ingestedDataset.groupedEntities.filter(g => g.risk_level === 'Critical').length} Critical` : '3 Critical Clusters'}
                </span>
                <span className="flex items-center text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  {ingestedDataset ? `${ingestedDataset.groupedEntities.filter(g => g.risk_level === 'Elevated').length} Warning` : '12 Warning'}
                </span>
                <span className="flex items-center text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {ingestedDataset ? `${ingestedDataset.groupedEntities.filter(g => g.risk_level === 'Normal').length} Normal` : '20+ Normal'}
                </span>
              </div>
            </div>

            {/* Top-Right 3-Dots Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isMenuOpen ? 'bg-gray-800 text-white border-indigo-500' : 'bg-gray-900 text-gray-400 hover:text-white border-gray-800 hover:border-gray-700'
                }`}
                title="Upload Excel File / Options"
              >
                <MoreVertical size={18} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1e212b] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-1.5 border-b border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Data & File Operations
                  </div>

                  <button
                    onClick={() => { setIsUploadModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-600/20 hover:text-white text-gray-200 text-xs font-medium flex items-center transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={15} className="mr-3 text-indigo-400" />
                    <span>Upload ETRANSFER Excel File</span>
                  </button>

                  <button
                    onClick={() => { if (onNavigate) onNavigate('explorer'); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-600/20 hover:text-white text-gray-200 text-xs font-medium flex items-center transition-colors cursor-pointer"
                  >
                    <Network size={15} className="mr-3 text-indigo-400" />
                    <span>Open Cluster & Entity Explorer</span>
                  </button>

                  <button
                    onClick={handleLoadSampleData}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-600/20 hover:text-white text-gray-200 text-xs font-medium flex items-center transition-colors cursor-pointer"
                  >
                    <RefreshCw size={15} className="mr-3 text-emerald-400" />
                    <span>Load Sample E-Transfer File</span>
                  </button>

                  {ingestedDataset && (
                    <button
                      onClick={handleResetData}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-600/20 hover:text-red-300 text-gray-400 text-xs flex items-center transition-colors cursor-pointer"
                    >
                      <X size={15} className="mr-3 text-red-400" />
                      <span>Reset to Default Clusters</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. WORKSPACE PANELS */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT PANEL: Streamlined Cluster Navigator with Explorer Shortcut */}
          <aside className="w-16 hover:w-80 bg-[#18181b] border-r border-gray-800 flex flex-col shrink-0 transition-all duration-300 group/aside overflow-hidden z-20">
            <div className="p-4 border-b border-gray-800 min-w-[320px]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span className="flex items-center">
                  <Network size={16} className="mr-2 shrink-0" />
                  <span className="opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">Cluster Focus</span>
                </span>
              </h2>

              {/* Prominent Shortcut to Open Full Cluster Explorer */}
              <button
                onClick={() => onNavigate && onNavigate('explorer')}
                className="mt-3 w-full opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <span>Explore All {ingestedDataset ? ingestedDataset.groupedEntities.length : '3'} Clusters</span>
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-1 min-w-[320px]">

              {/* Ingested Excel Dataset Nodes */}
              {ingestedDataset ? (
                <div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 opacity-0 group-hover/aside:opacity-100 transition-opacity flex justify-between">
                    <span>Priority Clusters</span>
                    <span className="text-gray-500 font-normal">Top {Math.min(10, ingestedDataset.groupedEntities.length)}</span>
                  </div>
                  {ingestedDataset.groupedEntities.slice(0, 10).map(group => {
                    const isSelected = group.id === selectedSubMerchant;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedSubMerchant(group.id)}
                        className={`w-full text-left flex items-start p-2 rounded transition-colors mb-1 cursor-pointer ${
                          isSelected ? 'bg-indigo-900/30 border border-indigo-700/60 text-white' : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                          <div className="font-medium flex items-center justify-between text-xs">
                            <span className="truncate">{group.grouping_key}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${group.transaction_direction === 'Incoming' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'}`}>
                              {group.transaction_direction}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex justify-between">
                            <span>Client: {group.client_name}</span>
                            <span className="font-mono text-emerald-400">${group.total_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Default Pre-configured Clusters Tree */
                <>
                  <div>
                    <button
                      onClick={() => toggleNode('apaylo')}
                      className="w-full text-left flex items-start p-2 hover:bg-gray-800 rounded group cursor-pointer"
                    >
                      {expandedNodes['apaylo'] ? <ChevronDown size={16} className="mt-1 mr-1 shrink-0" /> : <ChevronRight size={16} className="mt-1 mr-1 shrink-0" />}
                      <div className="opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                        <div className="font-medium text-gray-200">Tier 2: Apaylo Finance Tech</div>
                        <div className="text-xs text-gray-500">Platform</div>
                        <div className="text-xs mt-1">Overall Risk: <span className="text-red-500">Elevated</span></div>
                      </div>
                    </button>

                    {expandedNodes['apaylo'] && (
                      <div className="ml-4 mt-1 border-l border-gray-800 pl-2 space-y-1">
                        <button
                          onClick={() => { toggleNode('bytex1'); setSelectedSubMerchant('bytex1'); }}
                          className={`w-full text-left flex items-start p-2 rounded transition-colors cursor-pointer ${selectedSubMerchant === 'bytex1' ? 'bg-red-900/20 border border-red-900/50' : 'hover:bg-gray-800'}`}
                        >
                          {expandedNodes['bytex1'] ? <ChevronDown size={16} className="mt-1 mr-1 text-red-400 shrink-0" /> : <ChevronRight size={16} className="mt-1 mr-1 text-red-400 shrink-0" />}
                          <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                            <div className="font-medium text-red-400 flex items-center justify-between text-xs">
                              <span className="truncate">Merchant: send@bytex.ca</span>
                              <AlertTriangle size={14} className="shrink-0 ml-1" />
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedSubMerchant('bytex2')}
                          className={`w-full text-left flex items-start p-2 rounded transition-colors cursor-pointer ${selectedSubMerchant === 'bytex2' ? 'bg-red-900/20 border border-red-900/50' : 'hover:bg-gray-800'}`}
                        >
                          <ChevronRight size={16} className="mt-1 mr-1 text-red-400 shrink-0 opacity-0" />
                          <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                            <div className="font-medium text-red-400 flex items-center justify-between text-xs">
                              <span className="truncate">Merchant: transact@bytex.ca</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* CENTER COLUMN: Risk Profile & Transaction Queue */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0a0a]">
            {/* CENTER-TOP PANEL: Risk Profile */}
            <div className="p-6 border-b border-gray-800 shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white mb-1">
                    Merchant: {activeProfile?.name || 'send@bytex.ca'}{' '}
                    <span className="text-sm text-gray-500 ml-2 font-normal">({activeProfile?.tier || 'Tier 3 Sub-Merchant'})</span>
                  </h2>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="bg-red-900/40 text-red-400 border border-red-800 px-2 py-1 rounded">
                      {activeProfile?.riskBadge || '🔴 High Risk Cluster'}
                    </span>
                    <span className="text-gray-400">Parent: {activeProfile?.parent || 'Apaylo Finance Tech'}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors shadow-lg shadow-red-900/20 cursor-pointer">
                    <Lock size={16} className="mr-2" /> Lock Sub-Merchant
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] border border-red-900/30 p-4 rounded-lg">
                  <h3 className="text-xs font-bold uppercase text-red-500 mb-2 tracking-wider">Cluster Alert Trigger</h3>
                  <p className="text-sm text-gray-300">{activeProfile?.triggerTitle || 'Suspicious Drug/Restricted Substance Sales Detected.'}</p>
                  <h3 className="text-xs font-bold uppercase text-blue-400 mt-4 mb-2 tracking-wider">AI Analysis</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {activeProfile?.aiAnalysis || 'System identified transactions with "Sent To" names matching drug keywords ("canna", "Weed"). Transactional patterns show rounded amounts ($104.00, $125.00) and invoice/order numbers in the Memo field, highly consistent with illicit substance merchants.'}
                  </p>
                </div>

                <div className="bg-[#1A1A1A] border border-purple-900/30 p-4 rounded-lg">
                  <h3 className="text-xs font-bold uppercase text-purple-400 mb-2 tracking-wider">Typology Prediction</h3>
                  <div className="text-lg text-white mb-2">{activeProfile?.typology || 'Unlicensed Dispensary'}</div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {activeProfile?.typologyDesc || 'Transactions masquerade as generic businesses ("Bytex") but slip-ups reveal actual purpose ("weed"). Volumes and memo patterns perfectly match illicit e-commerce sales.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CENTER-BOTTOM PANEL: Transaction Queue */}
            <div className="flex-1 p-6 flex flex-col overflow-hidden">
              <div className="flex justify-between items-end mb-4 shrink-0">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-white">Dual-Flagged Transaction Queue</h3>
                  <span className="text-xs text-gray-500 font-mono">({filteredTransactions.length} txns)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search ref, email, memo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-800 rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg flex-1 overflow-auto shadow-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#121212] text-xs uppercase text-gray-500 sticky top-0 border-b border-gray-800">
                    <tr>
                      <th className="p-4 font-medium text-center">Trans Alert?</th>
                      <th className="p-4 font-medium">Interac Ref (1)</th>
                      <th className="p-4 font-medium">Sender Name</th>
                      <th className="p-4 font-medium">Sender Email</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                      <th className="p-4 font-medium">Sec. Question</th>
                      <th className="p-4 font-medium">Sec. Answer</th>
                      <th className="p-4 font-medium">Memo</th>
                      <th className="p-4 font-medium text-center">Cluster Alert?</th>
                      <th className="p-4 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {filteredTransactions.map((tx, idx) => (
                      <tr key={tx.ref || idx} className="hover:bg-gray-800/50 transition-colors">
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-1 text-[10px] rounded border ${tx.transAlert && tx.transAlert.includes('YES') ? 'bg-red-950 border-red-900 text-red-400' : 'bg-green-950/30 border-green-900/30 text-green-500'}`}>
                            {tx.transAlert}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-gray-300 font-semibold">{tx.interacRef1 || tx.interac_ref1 || tx.ref}</td>
                        <td className="p-4 font-medium text-gray-200">{tx.sender}</td>
                        <td className="p-4 text-gray-400 text-xs font-mono">{tx.senderEmail || tx.sender_email || 'N/A'}</td>
                        <td className="p-4 text-right font-mono text-white">${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}</td>
                        <td className="p-4 text-gray-500 text-xs italic">{tx.secQ}</td>
                        <td className="p-4 text-gray-500 text-xs italic">{tx.secA}</td>
                        <td className="p-4 text-gray-400 text-xs font-mono">{tx.memo}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-2 py-1 bg-red-950 border border-red-900 text-red-400 text-[10px] rounded">
                            {tx.clusterAlert}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {tx.rawRecord ? (
                            <button
                              onClick={() => { setSelectedTxRecord(tx); setIsRawModalOpen(true); }}
                              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] rounded border border-gray-700 cursor-pointer"
                            >
                              Raw Data
                            </button>
                          ) : (
                            <span className="text-xs text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-blue-900/10 border border-blue-900/30 rounded p-3 text-sm text-blue-300/80 flex items-start shrink-0">
                <Activity size={16} className="mt-0.5 mr-2 shrink-0" />
                <p>Notice how transactions from "CATHERINE L PII" and "JO-ANNE LAUZON" did not trigger individual alerts because their recipient names ("Bytex") and amounts look legitimate in isolation. However, because they are destined for the risky merchant "send@bytex.ca" cluster, they are caught by the merchant-level flag.</p>
              </div>
            </div>
          </main>

          {/* RIGHT PANEL: Entity Resolution & Triage Actions */}
          <aside className="w-80 bg-[#18181b] border-l border-gray-800 p-6 flex flex-col shrink-0 overflow-y-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center">
              <CheckCircle size={16} className="mr-2" /> Alert Resolution
            </h3>

            {/* Triage Actions */}
            <div className="mb-8 space-y-3">
              <button
                onClick={() => alert('Dismissed alert as False Positive.')}
                className="w-full text-left p-3 rounded border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-medium text-white text-sm">False Positive</div>
                  <div className="text-xs text-gray-500">Dismiss and whitelist attributes</div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
              </button>

              <button
                onClick={() => alert('Initiated Request For Information (RFI).')}
                className="w-full text-left p-3 rounded border border-blue-900/50 hover:border-blue-500 hover:bg-blue-900/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-medium text-blue-400 text-sm">RFI (Request Info)</div>
                  <div className="text-xs text-gray-500">Ask client for documentation</div>
                </div>
                <Mail size={16} className="text-blue-500/70 group-hover:text-blue-400" />
              </button>

              <button
                onClick={() => alert('Filing Suspicious Transaction Report (STR).')}
                className="w-full text-left p-3 rounded border border-purple-900/50 hover:border-purple-500 hover:bg-purple-900/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-medium text-purple-400 text-sm">File STR</div>
                  <div className="text-xs text-gray-500">Suspicious Transaction Report</div>
                </div>
                <FileText size={16} className="text-purple-500/70 group-hover:text-purple-400" />
              </button>

              <button
                onClick={() => alert('Filing Unusual Transaction Report (UTR).')}
                className="w-full text-left p-3 rounded border border-red-900/50 hover:border-red-500 hover:bg-red-900/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-medium text-red-400 text-sm">UTR</div>
                  <div className="text-xs text-gray-500">Unusual Transaction Report</div>
                </div>
                <FileText size={16} className="text-red-500/70 group-hover:text-red-400" />
              </button>
            </div>

            <hr className="border-gray-800 my-6" />

            {/* Link Analysis Graph Info */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <Network size={14} className="mr-2 text-indigo-400" /> Link Analysis
              </h4>
              <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-colors">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Network size={32} className="text-indigo-500/50 mb-3" />
                <p className="text-xs text-gray-400">
                  {activeProfile?.linkAnalysisText || (
                    <>
                      CRM overlap detected:
                      <br /><br />
                      <span className="text-red-400 font-bold">send@bytex.ca</span> and <span className="text-red-400 font-bold">transact@bytex.ca</span> share the same physical address and phone number.
                    </>
                  )}
                </p>
                <div className="mt-3 text-[10px] uppercase text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/10">Entity Overlap Found</div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* EXCEL INGESTION MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#1c202b]">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600/20 border border-indigo-500/40 p-2 rounded-xl text-indigo-400">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ingest ETRANSFER Excel Data</h3>
                  <p className="text-xs text-gray-400">Target worksheet: <code className="text-emerald-400 font-mono">Full_Analysis</code> (~100k rows)</p>
                </div>
              </div>
              <button onClick={() => { setIsUploadModalOpen(false); setValidationError(null); }} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {validationError && (
                <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl text-xs text-red-200">
                  <div className="flex items-center font-bold text-red-400 mb-1 text-sm">
                    <AlertTriangle size={16} className="mr-2 shrink-0" />
                    {validationError.title}
                  </div>
                  <p className="leading-relaxed">{validationError.message}</p>
                </div>
              )}

              {isProcessing ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{progressInfo.stage}</h4>
                    <p className="text-xs text-gray-400 mt-1">Parsing worksheet & grouping records...</p>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progressInfo.progress}%` }}></div>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-500/60 bg-[#12141c]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Upload size={36} className="mx-auto text-indigo-400 mb-3" />
                  <h4 className="text-sm font-bold text-white">Click or Drag & Drop Excel File</h4>
                  <p className="text-xs text-gray-400 mt-1">Supports <b className="text-gray-200">.xlsx</b> or <b className="text-gray-200">.xls</b> spreadsheets</p>
                  <p className="text-[11px] text-gray-400 mt-3 italic">
                    File must contain worksheet <code className="text-emerald-400 bg-gray-900 px-1 py-0.5 rounded">Full_Analysis</code>
                  </p>
                </div>
              )}

              <div className="bg-[#12141c] border border-gray-800 p-4 rounded-xl">
                <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center">
                  <Database size={13} className="mr-1.5 text-indigo-400" /> Required Columns Check:
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {REQUIRED_COLUMNS.map(col => (
                    <span key={col} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#141720] border-t border-gray-800 flex justify-between items-center">
              <button
                onClick={handleLoadSampleData}
                disabled={isProcessing}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className="mr-1.5" /> Load Sample E-Transfer File
              </button>
              <button
                onClick={() => { setIsUploadModalOpen(false); setValidationError(null); }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW DATA INSPECTOR MODAL */}
      {isRawModalOpen && selectedTxRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1c202b]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Database size={16} className="mr-2 text-indigo-400" /> Raw Transaction Record Data
                </h3>
                <p className="text-xs text-gray-400 font-mono">Reference: {selectedTxRecord.ref}</p>
              </div>
              <button onClick={() => setIsRawModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-gray-300 space-y-4">
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Normalized Transaction Summary</div>
              <div className="grid grid-cols-2 gap-2 bg-[#0f1117] p-3 rounded-xl border border-gray-800">
                <div>Direction: <b className="text-white">{selectedTxRecord.direction}</b></div>
                <div>Grouping Source: <b className="text-indigo-400">{selectedTxRecord.groupingKeySource || 'RECIPIENT_EMAIL'}</b></div>
                <div>Amount: <b className="text-emerald-400">${selectedTxRecord.amount}</b></div>
                <div>Sender: <b className="text-gray-200">{selectedTxRecord.sender}</b></div>
              </div>

              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Original Raw Record JSON</div>
              <pre className="bg-[#0b0d12] p-4 rounded-xl border border-gray-800 text-[11px] text-emerald-300 overflow-x-auto">
                {JSON.stringify(selectedTxRecord.rawRecord || selectedTxRecord, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-[#141720] border-t border-gray-800 text-right">
              <button onClick={() => setIsRawModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FraudTriageDashboard;
