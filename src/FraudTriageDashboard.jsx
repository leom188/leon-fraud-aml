import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  Filter,
  Lock,
  ShieldAlert,
  ShieldCheck,
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
  List,
  Zap,
  FileBarChart,
  Settings,
  ExternalLink,
  Bot,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Brain,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  MinusSquare,
  ArrowLeft,
  ArrowUpRight,
  ListFilter
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
      { ref: '100000000755284517', date: '2025-02-14 14:32:10', interacRef1: 'C1AtwCsAFQs5', sender: 'KERI-ANNE BUCKNER', senderEmail: 'keri.b@gmail.com', recipientName: 'weed', recipientEmail: 'send@bytex.ca', amount: 125.00, secQ: 'NULL', secA: 'NULL', memo: 'Buckner1769810154189', transAlert: '🔴 YES (Keyword "weed")', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755284152', date: '2025-02-14 14:28:45', interacRef1: 'C1AtwCsAFQs6', sender: 'CATHERINE L PII', senderEmail: 'catherine.pii@yahoo.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 104.00, secQ: 'NULL', secA: 'NULL', memo: 'pii1769809869300', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755277363', date: '2025-02-14 14:15:20', interacRef1: 'C1AtwCsAFQs7', sender: 'JO-ANNE LAUZON', senderEmail: 'jlauzon@hotmail.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 255.36, secQ: 'NULL', secA: 'NULL', memo: 'Lauzon1769809350507', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' },
      { ref: '100000000755285402', date: '2025-02-14 13:58:05', interacRef1: 'C1AtwCsAFQs8', sender: 'COBY MATALSKI', senderEmail: 'coby.m@outlook.com', recipientName: 'Bytex', recipientEmail: 'send@bytex.ca', amount: 105.00, secQ: 'NULL', secA: 'NULL', memo: 'Matalski1769810187493', transAlert: '🟢 NO (Normal behavior)', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
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
      { ref: '100000000755299101', date: '2025-02-14 15:10:00', sender: 'MICHAEL CHEN', recipientName: 'Bytex Transact', recipientEmail: 'transact@bytex.ca', amount: 310.00, secQ: 'NULL', secA: 'NULL', memo: 'Tx10992', transAlert: '🟡 Warning (Velocity)', clusterAlert: '🔴 YES (Linked Entity)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
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
      { ref: '100000000755301882', date: '2025-02-14 16:04:12', sender: 'SARAH CONNOR', recipientName: 'PVPay', recipientEmail: 'sales@pvpay.ca', amount: 89.50, secQ: 'NULL', secA: 'NULL', memo: 'PV-8812', transAlert: '🟢 NO', clusterAlert: '🔴 YES (Illicit Merchant)', direction: 'Incoming', groupingKeySource: 'RECIPIENT_EMAIL' }
    ]
  }
];

const FraudTriageDashboard = ({
  onNavigate,
  externalDataState,
  setExternalDataState,
  externalSelectedGroupId,
  setExternalSelectedGroupId,
  columnMappings = {}
}) => {
  const getColLabel = (key, fallback) => {
    const railKey = `ETRANSFER:${key}`;
    return columnMappings?.[railKey]?.customLabel ||
      columnMappings?.[railKey]?.defaultLabel ||
      columnMappings?.[key]?.customLabel ||
      columnMappings?.[key]?.defaultLabel ||
      fallback;
  };

  const formatDisplayDate = (val) => {
    if (!val) return '—';
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return '—';
      const iso = val.toISOString();
      return iso.slice(0, 10) + ' ' + iso.slice(11, 19);
    }
    if (typeof val === 'string') {
      if (val.includes('T') && val.length >= 19) {
        return val.replace('T', ' ').slice(0, 19);
      }
      return val;
    }
    return String(val);
  };

  const getGroupingKeySourceLabel = (source) => {
    if (!source) return getColLabel('TRX_BEN_ACCT_NUM', 'Recipient Email');
    const s = String(source).toUpperCase().replace(/\s+/g, '_');
    if (s.includes('RECIPIENT_EMAIL') || s.includes('BEN_ACCT_NUM') || s === 'RECIPIENT EMAIL') {
      return getColLabel('TRX_BEN_ACCT_NUM', 'Recipient Email');
    }
    if (s.includes('RECIPIENT_NAME') || s.includes('ACCT_BEN_NAME') || s === 'RECIPIENT NAME') {
      return getColLabel('TRX_ACCT_BEN_NAME', 'Beneficiary Name');
    }
    if (s.includes('SENDER_EMAIL') || s.includes('FREE_TEXT_3') || s === 'SENDER EMAIL') {
      return getColLabel('TRX_FREE_TEXT_3', 'Sender Email');
    }
    if (s.includes('SENDER_NAME') || s.includes('FREE_TEXT_8') || s === 'SENDER NAME') {
      return getColLabel('TRX_FREE_TEXT_8', 'Sender Name');
    }
    if (s.includes('OPERATOR')) {
      return getColLabel('TRX_OPERATOR_CODE', 'Operator Code');
    }
    return source;
  };

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
    setOverrideDirectionalMode(null);
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
  const [rawModalViewMode, setRawModalViewMode] = useState('mapped'); // 'mapped' | 'json'
  const [rawModalSearch, setRawModalSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ stage: '', progress: 0 });
  const [validationError, setValidationError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Search, Filter & Directional View state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState('ALL');
  const [overrideDirectionalMode, setOverrideDirectionalMode] = useState(null);

  // View Layout States: Collapsible Panels and AI Modal
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);

  // Sender Grouping & Drill-Down State (for Incoming Direction Mode)
  const [incomingViewMode, setIncomingViewMode] = useState('grouped'); // 'grouped' | 'flat'
  const [selectedSenderEmail, setSelectedSenderEmail] = useState(null);
  const [senderSortField, setSenderSortField] = useState('totalAmount');
  const [senderSortDirection, setSenderSortDirection] = useState('desc');

  // Reset selected sender drilldown whenever the active entity cluster changes
  useEffect(() => {
    setSelectedSenderEmail(null);
    setSelectedTxRefs(new Set());
  }, [selectedSubMerchant]);

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
  // Transaction Selection & Alert Resolution States
  const [selectedTxRefs, setSelectedTxRefs] = useState(new Set());
  const [txResolutions, setTxResolutions] = useState({}); // { [txRef]: { closeType: 110 | 111, resolution: string, resolvedAt: string } }
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'OPEN' | 'CLOSED' | 'NON_ALERTED'
  const [resolutionToast, setResolutionToast] = useState(null);

  // Determine active profile & transaction list
  let activeProfile = null;
  let activeTransactions = [];
  let foundGroup = null;

  if (ingestedDataset) {
    foundGroup = (ingestedDataset.groupedEntities || []).find(g => g.id === selectedSubMerchant) || (ingestedDataset.groupedEntities || [])[0];
    if (foundGroup) {
      activeProfile = {
        name: foundGroup.grouping_key,
        tier: `Customer Entity • ${getGroupingKeySourceLabel(foundGroup.grouping_key_source) || 'E-Transfer'}`,
        parent: foundGroup.client_name,
        riskBadge: foundGroup.risk_level === 'Critical' ? '🔴 High Risk Cluster' : (foundGroup.risk_level === 'Elevated' ? '🟡 Elevated Risk' : '🟢 Normal Risk'),
        triggerTitle: `Grouping Key: ${foundGroup.grouping_key} (${foundGroup.transaction_direction || 'Incoming'})`,
        aiAnalysis: `Aggregated ${foundGroup.transaction_count || 0} ETRANSFER transactions totaling $${(Number(foundGroup.total_amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}. Date range: ${formatDisplayDate(foundGroup.first_transaction_date)} to ${formatDisplayDate(foundGroup.last_transaction_date)}.`,
        typology: foundGroup.risk_level === 'Critical' ? 'High Risk Merchant / Dispensary' : 'Customer Account Activity',
        typologyDesc: (foundGroup.distinct_rule_count > 0 && Array.isArray(foundGroup.rule_names)) ? `Triggered Rules: ${foundGroup.rule_names.join(', ')}` : 'Normal transaction pattern without automated rule breaches.',
        linkAnalysisText: `Client: ${foundGroup.client_name || 'N/A'} (${foundGroup.client_id || 'N/A'}) • Customer ID: ${foundGroup.customer_id || 'N/A'} • Account: ${foundGroup.customer_account || 'N/A'}`
      };
      activeTransactions = (foundGroup.transactions || []).map(tx => {
        // If TRX_ALERT_TYPE / ALERT_CLOSE_TYPE is null or empty, it means the alert is OPEN.
        const raw = tx.raw_record || tx.rawRecord || {};
        const rawCloseVal = raw.TRX_ALERT_TYPE ?? raw['TRX_ALERT_TYPE'] ?? raw['trx_alert_type'] ??
          raw.ALERT_CLOSE_TYPE ?? raw['ALERT_CLOSE_TYPE'] ?? raw['alert_close_type'] ??
          raw.ALERT_TYPE ?? raw['ALERT_TYPE'] ?? raw['alert_type'] ??
          raw.TRX_ALERT_CLOSE_TYPE ?? raw['TRX_ALERT_CLOSE_TYPE'] ??
          raw['Alert Close Type'] ?? tx.alert_close_type ?? null;

        const cleanCloseStr = (rawCloseVal !== undefined && rawCloseVal !== null) ? String(rawCloseVal).trim().toUpperCase() : '';
        const isOpen = cleanCloseStr === '' || cleanCloseStr === 'NULL' || cleanCloseStr === '0' || cleanCloseStr === 'PENDING' || cleanCloseStr === 'OPEN' || cleanCloseStr === 'OPEN ALERT';
        const hasValidRawClose = !isOpen && (!isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) > 0 : true);

        const resolution = txResolutions[tx.id || tx.ref] || (hasValidRawClose ? { closeType: !isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) : 110, resolution: 'Closed' } : null);
        const isClosed = Boolean(resolution);
        const isAlerted = true; // All records in triage batch are subject to investigation
        const alertCloseType = resolution ? resolution.closeType : (hasValidRawClose ? (!isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) : rawCloseVal) : null);
        const resolutionName = resolution ? resolution.resolution : (isClosed ? 'Closed' : 'Open Alert');

        // 7 Target Forensic Columns
        const trxAcctBenName = raw.TRX_ACCT_BEN_NAME ?? raw['TRX_ACCT_BEN_NAME'] ?? tx.recipient_name ?? tx.recipientName ?? '';
        const trxBenAcctNum = raw.TRX_BEN_ACCT_NUM ?? raw['TRX_BEN_ACCT_NUM'] ?? tx.recipient_email ?? tx.recipientEmail ?? '';
        const trxFreeText = raw.TRX_FREE_TEXT ?? raw['TRX_FREE_TEXT'] ?? '';
        const trxFreeText3 = raw.TRX_FREE_TEXT_3 ?? raw['TRX_FREE_TEXT_3'] ?? '';
        const trxOldValue = raw.TRX_OLD_VALUE ?? raw['TRX_OLD_VALUE'] ?? '';
        const trxNewValue = raw.TRX_NEW_VALUE ?? raw['TRX_NEW_VALUE'] ?? '';
        const trxSenMessage = raw.TRX_SEN_MESSAGE ?? raw['TRX_SEN_MESSAGE'] ?? tx.memo ?? '';
        const trxTranDate = formatDisplayDate(raw.TRX_TRAN_DATE ?? raw['TRX_TRAN_DATE'] ?? raw['TRANSACTION DATE'] ?? tx.transaction_date ?? tx.tranDate ?? tx.date ?? '2025-02-14 14:32');

        // Transaction Specific Alerts & Triggered Rules
        const ruleNames = tx.rule_names || (raw.RULE_NAMES ? String(raw.RULE_NAMES).split(';').map(s => s.trim()) : (tx.transAlert && tx.transAlert.includes('YES') ? ['Transaction Alert'] : []));

        return {
          ref: tx.id,
          date: trxTranDate,
          trxTranDate,
          interacRef1: tx.interac_ref1 || tx.interacRef1 || tx.id,
          sender: tx.sender_name,
          senderEmail: tx.sender_email || 'N/A',
          recipientName: trxAcctBenName || tx.recipient_name,
          recipientEmail: trxBenAcctNum || tx.recipient_email,
          amount: tx.amount,
          secQ: trxOldValue || tx.sec_question || tx.secQ || 'NULL',
          secA: trxNewValue || tx.sec_answer || tx.secA || 'NULL',
          memo: trxSenMessage || tx.memo || 'N/A',
          trxAcctBenName,
          trxBenAcctNum,
          trxFreeText,
          trxFreeText3,
          trxOldValue,
          trxNewValue,
          trxSenMessage,
          ruleNames,
          transAlert: tx.transAlert || raw.TRANS_ALERT || (ruleNames.length > 0 ? 'YES' : 'NO'),
          direction: tx.transaction_direction,
          groupingKeySource: tx.grouping_key_source,
          rawRecord: raw,
          isAlerted,
          isClosed,
          alertCloseType,
          resolutionName,
          resolvedAt: resolution ? resolution.resolvedAt : null
        };
      });
    }
  } else {
    const foundDefault = DEFAULT_CLUSTERS.find(c => c.id === selectedSubMerchant) || DEFAULT_CLUSTERS[0];
    activeProfile = foundDefault;
    activeTransactions = foundDefault.transactions.map(tx => {
      const raw = tx.rawRecord || tx.raw_record || {};
      const rawCloseVal = raw.TRX_ALERT_TYPE ?? raw['TRX_ALERT_TYPE'] ?? raw['trx_alert_type'] ??
        raw.ALERT_CLOSE_TYPE ?? raw['ALERT_CLOSE_TYPE'] ?? raw['alert_close_type'] ??
        raw.ALERT_TYPE ?? raw['ALERT_TYPE'] ?? raw['alert_type'] ??
        raw['Alert Close Type'] ?? tx.alert_close_type ?? null;

      const cleanCloseStr = (rawCloseVal !== undefined && rawCloseVal !== null) ? String(rawCloseVal).trim().toUpperCase() : '';
      const isOpen = cleanCloseStr === '' || cleanCloseStr === 'NULL' || cleanCloseStr === '0' || cleanCloseStr === 'PENDING' || cleanCloseStr === 'OPEN' || cleanCloseStr === 'OPEN ALERT';
      const hasValidRawClose = !isOpen && (!isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) > 0 : true);

      const resolution = txResolutions[tx.ref || tx.id] || (hasValidRawClose ? { closeType: !isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) : 110, resolution: 'Closed' } : null);
      const isClosed = Boolean(resolution);
      const isAlerted = true;
      const alertCloseType = resolution ? resolution.closeType : (hasValidRawClose ? (!isNaN(Number(cleanCloseStr)) ? Number(cleanCloseStr) : rawCloseVal) : null);
      const resolutionName = resolution ? resolution.resolution : (isClosed ? 'Closed' : 'Open Alert');

      // 7 Target Forensic Columns
      const trxAcctBenName = raw.TRX_ACCT_BEN_NAME ?? raw['TRX_ACCT_BEN_NAME'] ?? tx.recipientName ?? '';
      const trxBenAcctNum = raw.TRX_BEN_ACCT_NUM ?? raw['TRX_BEN_ACCT_NUM'] ?? tx.recipientEmail ?? '';
      const trxFreeText = raw.TRX_FREE_TEXT ?? raw['TRX_FREE_TEXT'] ?? '';
      const trxFreeText3 = raw.TRX_FREE_TEXT_3 ?? raw['TRX_FREE_TEXT_3'] ?? '';
      const trxOldValue = raw.TRX_OLD_VALUE ?? raw['TRX_OLD_VALUE'] ?? '';
      const trxNewValue = raw.TRX_NEW_VALUE ?? raw['TRX_NEW_VALUE'] ?? '';
      const trxSenMessage = raw.TRX_SEN_MESSAGE ?? raw['TRX_SEN_MESSAGE'] ?? tx.memo ?? '';
      const trxTranDate = formatDisplayDate(raw.TRX_TRAN_DATE ?? raw['TRX_TRAN_DATE'] ?? raw['TRANSACTION DATE'] ?? tx.date ?? tx.tranDate ?? tx.transaction_date ?? '2025-02-14 14:32');

      // Transaction Specific Alerts & Triggered Rules
      const ruleNames = tx.ruleNames || tx.rule_names || (tx.transAlert && tx.transAlert.includes('YES') ? ['Transaction Alert'] : []);

      return {
        ...tx,
        date: trxTranDate,
        trxTranDate,
        trxAcctBenName,
        trxBenAcctNum,
        trxFreeText,
        trxFreeText3,
        trxOldValue,
        trxNewValue,
        trxSenMessage,
        ruleNames,
        isAlerted,
        isClosed,
        alertCloseType,
        resolutionName,
        resolvedAt: resolution ? resolution.resolvedAt : null
      };
    });
  }

  // Active Direction Mode (Incoming Macro Aggregated View vs Outgoing Dispersion View)
  const currentDirection = overrideDirectionalMode || (foundGroup ? foundGroup.transaction_direction : (activeTransactions[0]?.direction || 'Incoming'));

  // Multi-Selection Helpers
  const toggleSelectTx = (ref) => {
    setSelectedTxRefs(prev => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const currentList = selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions;
    if (selectedTxRefs.size === currentList.length && currentList.length > 0) {
      setSelectedTxRefs(new Set());
    } else {
      setSelectedTxRefs(new Set(currentList.map(tx => tx.ref)));
    }
  };

  // Alert Resolution Execution Handler with Raw Data Mutation
  const handleResolveAlerts = (actionType) => {
    let closeCode = 110;
    let label = 'False Positive';
    if (actionType === 'RFI') {
      closeCode = 111;
      label = 'RFI (Request Info)';
    } else if (actionType === 'UTR') {
      closeCode = 110; // Per user instruction: "if UTR use 110"
      label = 'UTR (Unusual Tx Report)';
    } else if (actionType === 'FP') {
      closeCode = 110;
      label = 'False Positive';
    }

    // Determine target transactions (strictly scoped to selection or active sender drilldown)
    let targetRefs = [];
    if (selectedTxRefs.size > 0) {
      targetRefs = Array.from(selectedTxRefs);
    } else if (selectedSenderEmail) {
      // ONLY target open transactions belonging to the currently inspected sender!
      targetRefs = displayedDrilldownTransactions.filter(tx => !tx.isClosed).map(tx => tx.ref);
    } else {
      // Top-level queue: target visible open alerts in current view
      targetRefs = filteredTransactions.filter(tx => !tx.isClosed).map(tx => tx.ref);
    }

    if (targetRefs.length === 0) {
      alert('No open alert transactions selected or available for this sender to resolve.');
      return;
    }

    const newResolutions = { ...txResolutions };
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    targetRefs.forEach(ref => {
      newResolutions[ref] = {
        closeType: closeCode,
        resolution: label,
        resolvedAt: timestamp
      };
    });

    setTxResolutions(newResolutions);
    setSelectedTxRefs(new Set());

    // Update raw data record and dataset objects directly so TRX_ALERT_TYPE / ALERT_CLOSE_TYPE is updated
    if (ingestedDataset) {
      const updatedDataset = { ...ingestedDataset };
      updatedDataset.groupedEntities.forEach(group => {
        group.transactions.forEach(t => {
          if (targetRefs.includes(t.id) || targetRefs.includes(t.ref)) {
            t.raw_record = t.raw_record || {};
            t.raw_record.ALERT_CLOSE_TYPE = closeCode;
            t.raw_record['ALERT_CLOSE_TYPE'] = closeCode;
            t.raw_record.TRX_ALERT_TYPE = closeCode;
            t.raw_record['TRX_ALERT_TYPE'] = closeCode;
            t.alert_close_type = closeCode;
            t.ALERT_CLOSE_TYPE = closeCode;
            t.TRX_ALERT_TYPE = closeCode;
          }
        });
      });
      setIngestedDataset(updatedDataset);
      if (setExternalDataState) {
        setExternalDataState(updatedDataset);
      }
    }

    const senderContextLabel = activeDrilldownSender ? ` for sender ${activeDrilldownSender.email}` : '';
    setResolutionToast({
      message: `Closed ${targetRefs.length} alert(s)${senderContextLabel} as ${label} (Close Code: ${closeCode})`,
      type: 'success'
    });
    setTimeout(() => setResolutionToast(null), 4500);
  };

  // Helper to Highlight Illicit / High-Risk Keywords in Memos and Strings
  const highlightIllicitKeywords = (text) => {
    if (text === null || text === undefined || text === '') return '—';
    const str = String(text);
    const keywords = 'weed|canna|cannabis|green|420|ganja|vape|bros|mule|leaf|shrooms|pills|thc|hash|bud|herb|flower|extract|wax|kush';
    const matchRegex = new RegExp(keywords, 'i');
    if (!matchRegex.test(str)) return str;

    // Single capturing group so split() returns exactly one token per match
    const splitRegex = new RegExp(`(${keywords})`, 'gi');
    const testSingle = new RegExp(`^(?:${keywords})$`, 'i');
    const parts = str.split(splitRegex);

    return parts.map((part, i) => {
      if (testSingle.test(part)) {
        return (
          <span
            key={i}
            className="bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/90 px-1.5 py-0.5 rounded font-mono font-bold text-[10px] shadow-xs inline-block mx-0.5"
          >
            "{part}"
          </span>
        );
      }
      return part;
    });
  };

  // Entity Metrics
  const uniqueSenderEmailsCount = useMemo(() => {
    const senders = new Set();
    activeTransactions.forEach(tx => {
      const email = String(tx.senderEmail || '').trim();
      const sender = String(tx.sender || '').trim();
      if (email && email !== 'N/A' && email !== 'NULL') {
        senders.add(email.toLowerCase());
      } else if (sender && sender !== 'N/A' && sender !== 'NULL') {
        senders.add(sender.toLowerCase());
      }
    });
    return senders.size || 1;
  }, [activeTransactions]);

  const uniqueRecipientEmailsCount = useMemo(() => {
    const recipients = new Set();
    activeTransactions.forEach(tx => {
      const email = String(tx.recipientEmail || '').trim();
      const name = String(tx.recipientName || '').trim();
      if (email && email !== 'N/A' && email !== 'NULL') {
        recipients.add(email.toLowerCase());
      } else if (name && name !== 'N/A' && name !== 'NULL') {
        recipients.add(name.toLowerCase());
      }
    });
    return recipients.size || 1;
  }, [activeTransactions]);

  const totalVolume = foundGroup ? (Number(foundGroup.total_amount) || 0) : activeTransactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  const totalTxCount = foundGroup ? (Number(foundGroup.transaction_count) || 0) : activeTransactions.length;
  const avgTxAmount = totalTxCount > 0 ? totalVolume / totalTxCount : 0;

  // Sort State for Transaction Queue
  const [sortField, setSortField] = useState(null); // 'sender' | 'senderEmail' | 'amount' | 'interacRef1' | 'transAlert' | 'memo' | 'clusterAlert'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort transactions
  const filteredTransactions = useMemo(() => {
    let list = activeTransactions.filter(tx => {
      // Direction Filter
      if (filterDirection !== 'ALL' && tx.direction !== filterDirection) return false;

      // Transaction Alert Status Filter (All, Open Alerts, Closed Alerts, Non-Alerted)
      if (filterStatus === 'OPEN' && (!tx.isAlerted || tx.isClosed)) return false;
      if (filterStatus === 'CLOSED' && !tx.isClosed) return false;
      if (filterStatus === 'NON_ALERTED' && tx.isAlerted) return false;

      // Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mRef = String(tx.ref || '').toLowerCase().includes(q) || String(tx.interacRef1 || '').toLowerCase().includes(q);
        const mSen = String(tx.sender || '').toLowerCase().includes(q);
        const mSenEmail = String(tx.senderEmail || '').toLowerCase().includes(q);
        const mRec = String(tx.recipientName || '').toLowerCase().includes(q) || String(tx.recipientEmail || '').toLowerCase().includes(q);
        const mMemo = String(tx.memo || '').toLowerCase().includes(q);
        if (!mRef && !mSen && !mSenEmail && !mRec && !mMemo) return false;
      }
      return true;
    });

    if (sortField) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'date') {
          aVal = a.date || a.trxTranDate || '';
          bVal = b.date || b.trxTranDate || '';
        } else if (sortField === 'recipientName') {
          aVal = a.trxAcctBenName || a.recipientName || '';
          bVal = b.trxAcctBenName || b.recipientName || '';
        } else if (sortField === 'amount') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = String(aVal || '').toLowerCase();
          bVal = String(bVal || '').toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [activeTransactions, filterDirection, filterStatus, searchQuery, sortField, sortDirection]);

  const handleSenderSort = (field) => {
    if (senderSortField === field) {
      if (senderSortDirection === 'asc') {
        setSenderSortDirection('desc');
      } else {
        setSenderSortField(null);
        setSenderSortDirection('asc');
      }
    } else {
      setSenderSortField(field);
      setSenderSortDirection('desc');
    }
  };

  // Grouped Senders Aggregation (for Incoming Directional Mode)
  const allSenderGroupsUnfiltered = useMemo(() => {
    const map = new Map();
    activeTransactions.forEach(tx => {
      // Respect direction filter if set
      if (filterDirection !== 'ALL' && tx.direction !== filterDirection) return;

      const rawEmail = String(tx.senderEmail || '').trim();
      const rawSender = String(tx.sender || '').trim();
      const emailKey = (rawEmail && rawEmail !== 'N/A' && rawEmail !== 'NULL')
        ? rawEmail.toLowerCase()
        : (rawSender && rawSender !== 'N/A' && rawSender !== 'NULL' ? rawSender.toLowerCase() : 'unknown_sender');

      if (!map.has(emailKey)) {
        map.set(emailKey, {
          id: emailKey,
          email: tx.senderEmail || 'N/A',
          senderName: tx.sender || 'N/A',
          transactions: [],
          totalAmount: 0,
          distinctRules: new Set(),
          hasKeywords: false,
          matchedKeywords: new Set(),
          openAlertsCount: 0,
          closedAlertsCount: 0,
          nonAlertedCount: 0,
        });
      }
      const group = map.get(emailKey);
      group.transactions.push(tx);
      group.totalAmount += (Number(tx.amount) || 0);
      if (Array.isArray(tx.ruleNames)) {
        tx.ruleNames.forEach(r => group.distinctRules.add(r));
      }
      if (tx.isClosed) {
        group.closedAlertsCount++;
      } else if (tx.isAlerted) {
        group.openAlertsCount++;
      } else {
        group.nonAlertedCount++;
      }

      // Check keywords across all forensic fields (memo, secA, sender name, recipient name, etc.)
      const kwRegex = /(weed|canna|cannabis|dispensary|crypto|edibles|cbd|vape|wash|mule|cart|shrooms|pills|thc|hash|bud|herb|flower|extract|wax|kush)/gi;
      const combinedText = `${tx.memo || ''} ${tx.sender || ''} ${tx.senderEmail || ''} ${tx.recipientName || ''} ${tx.secQ || ''} ${tx.secA || ''}`;
      const matches = combinedText.match(kwRegex);
      if (matches) {
        group.hasKeywords = true;
        matches.forEach(m => group.matchedKeywords.add(m.toLowerCase()));
      }
    });

    return Array.from(map.values()).map(g => ({
      ...g,
      txCount: g.transactions.length,
      avgAmount: g.transactions.length > 0 ? g.totalAmount / g.transactions.length : 0,
      distinctRules: Array.from(g.distinctRules),
      matchedKeywords: Array.from(g.matchedKeywords),
      status: g.openAlertsCount > 0 ? 'OPEN' : (g.closedAlertsCount > 0 ? 'CLOSED' : 'NON_ALERTED')
    }));
  }, [activeTransactions, filterDirection]);

  const senderGroups = useMemo(() => {
    let list = [...allSenderGroupsUnfiltered];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(g =>
        String(g.email || '').toLowerCase().includes(q) ||
        String(g.senderName || '').toLowerCase().includes(q) ||
        (Array.isArray(g.distinctRules) && g.distinctRules.some(r => String(r).toLowerCase().includes(q))) ||
        (Array.isArray(g.matchedKeywords) && g.matchedKeywords.some(k => String(k).toLowerCase().includes(q)))
      );
    }

    // Filter by alert status
    if (filterStatus === 'OPEN') {
      list = list.filter(g => g.openAlertsCount > 0);
    } else if (filterStatus === 'CLOSED') {
      list = list.filter(g => g.closedAlertsCount > 0 && g.openAlertsCount === 0);
    } else if (filterStatus === 'NON_ALERTED') {
      list = list.filter(g => g.openAlertsCount === 0 && g.closedAlertsCount === 0);
    }

    // Sort
    if (senderSortField) {
      list.sort((a, b) => {
        let aVal = a[senderSortField];
        let bVal = b[senderSortField];
        if (senderSortField === 'totalAmount' || senderSortField === 'txCount' || senderSortField === 'avgAmount') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = String(aVal || '').toLowerCase();
          bVal = String(bVal || '').toLowerCase();
        }
        if (aVal < bVal) return senderSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return senderSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [allSenderGroupsUnfiltered, filterStatus, searchQuery, senderSortField, senderSortDirection]);

  // Selected Drilldown Sender Profile
  const activeDrilldownSender = useMemo(() => {
    if (!selectedSenderEmail) return null;
    return senderGroups.find(g => g.id === selectedSenderEmail) || null;
  }, [selectedSenderEmail, senderGroups]);

  // Displayed Transactions for Drilldown
  const displayedDrilldownTransactions = useMemo(() => {
    if (!activeDrilldownSender) return [];
    return filteredTransactions.filter(tx => {
      const rawEmail = String(tx.senderEmail || '').trim();
      const rawSender = String(tx.sender || '').trim();
      const emailKey = (rawEmail && rawEmail !== 'N/A' && rawEmail !== 'NULL')
        ? rawEmail.toLowerCase()
        : (rawSender && rawSender !== 'N/A' && rawSender !== 'NULL' ? rawSender.toLowerCase() : 'unknown_sender');
      return emailKey === activeDrilldownSender.id;
    });
  }, [activeDrilldownSender, filteredTransactions]);

  // Institutional Keyboard Hotkeys for Rapid Triage (F: FP, U: UTR, R: RFI, J/K: Next/Prev Cluster)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid firing when analyst is typing into search or input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleResolveAlerts('FP');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleResolveAlerts('UTR');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResolveAlerts('RFI');
      } else if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        if (ingestedDataset?.groupedEntities?.length > 0) {
          e.preventDefault();
          const currentIndex = ingestedDataset.groupedEntities.findIndex(g => g.id === selectedSubMerchant);
          if (currentIndex < ingestedDataset.groupedEntities.length - 1) {
            setSelectedSubMerchant(ingestedDataset.groupedEntities[currentIndex + 1].id);
          }
        }
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        if (ingestedDataset?.groupedEntities?.length > 0) {
          e.preventDefault();
          const currentIndex = ingestedDataset.groupedEntities.findIndex(g => g.id === selectedSubMerchant);
          if (currentIndex > 0) {
            setSelectedSubMerchant(ingestedDataset.groupedEntities[currentIndex - 1].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSubMerchant, ingestedDataset, selectedTxRefs, filteredTransactions]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 transition-colors duration-200">

      {/* 1. TOP CONTROL BAR */}
      <header className="bg-white dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-gray-800 p-4 flex justify-between items-center shrink-0 z-20 transition-colors duration-200">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">LEON • Entity Triage & Investigation</h1>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">Customer Entity Transaction Queue & Resolution Actions</p>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-gray-800/50 px-3 py-1.5 rounded border border-slate-200 dark:border-gray-700/50">
              <span className="text-slate-500 dark:text-gray-400">Active Rail:</span>
              <span className="text-slate-900 dark:text-white font-medium">E-Transfer</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-gray-800/50 px-3 py-1.5 rounded border border-slate-200 dark:border-gray-700/50">
              <Clock size={14} className="text-slate-400 dark:text-gray-400" />
              <select className="bg-transparent text-slate-800 dark:text-white border-none focus:ring-0 cursor-pointer">
                <option>Last 1 Hour</option>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Status Counters & Panel Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm text-slate-500 dark:text-gray-400 mr-2">Global Status:</span>
            <div className="flex space-x-3 text-sm font-medium">
              <span className="flex items-center text-rose-600 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                {ingestedDataset ? `${(ingestedDataset.groupedEntities || []).filter(g => g.risk_level === 'Critical').length} Critical` : '3 Critical Clusters'}
              </span>
              <span className="flex items-center text-amber-600 dark:text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                {ingestedDataset ? `${(ingestedDataset.groupedEntities || []).filter(g => g.risk_level === 'Elevated').length} Warning` : '12 Warning'}
              </span>
              <span className="flex items-center text-emerald-600 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {ingestedDataset ? `${(ingestedDataset.groupedEntities || []).filter(g => g.risk_level === 'Normal').length} Normal` : '20+ Normal'}
              </span>
            </div>
          </div>

          {/* Alert Resolution Sidebar Toggle */}
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-md ${isRightPanelOpen
              ? 'bg-sky-50 dark:bg-indigo-950/70 border-sky-300 dark:border-indigo-700/60 text-sky-700 dark:text-indigo-300 hover:bg-sky-100 dark:hover:bg-indigo-900/60'
              : 'bg-slate-100 dark:bg-gray-800/80 border-slate-300 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-700'
              }`}
            title={isRightPanelOpen ? 'Collapse Alert Resolution Panel' : 'Expand Alert Resolution Panel'}
          >
            {isRightPanelOpen ? <PanelRightClose size={15} className="text-sky-600 dark:text-indigo-400" /> : <PanelRightOpen size={15} className="text-sky-600 dark:text-indigo-400" />}
            <span className="hidden md:inline">{isRightPanelOpen ? 'Hide Actions' : 'Show Actions'}</span>
          </button>
        </div>
      </header>

      {/* 2. WORKSPACE PANELS */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Streamlined Cluster Navigator with Explorer Shortcut */}
        <aside className="w-16 hover:w-80 bg-white dark:bg-[#18181b] border-r border-slate-200 dark:border-gray-800 flex flex-col shrink-0 transition-all duration-300 group/aside overflow-hidden z-20 shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 min-w-[320px]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-400 flex items-center justify-between">
              <span className="flex items-center text-slate-800 dark:text-slate-200">
                <Network size={16} className="mr-2 shrink-0 text-sky-600 dark:text-sky-400" />
                <span className="opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300 font-bold">Cluster Focus</span>
              </span>
            </h2>

            {/* Prominent Shortcut to Open Full Cluster Explorer */}
            <button
              onClick={() => onNavigate && onNavigate('explorer')}
              className="mt-3 w-full opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-between cursor-pointer shadow-sm shadow-sky-600/20"
            >
              <span>Explore All {ingestedDataset && Array.isArray(ingestedDataset.groupedEntities) ? ingestedDataset.groupedEntities.length : '3'} Clusters</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-1 min-w-[320px]">

            {/* Ingested Excel Dataset Nodes */}
            {ingestedDataset ? (
              <div>
                <div className="text-xs font-bold text-sky-700 dark:text-indigo-400 uppercase tracking-wider mb-2 opacity-0 group-hover/aside:opacity-100 transition-opacity flex justify-between">
                  <span>Priority Clusters</span>
                  <span className="text-slate-500 dark:text-gray-500 font-normal">Top {Math.min(10, (ingestedDataset.groupedEntities || []).length)}</span>
                </div>
                {(ingestedDataset.groupedEntities || []).slice(0, 10).map(group => {
                  const isSelected = group.id === selectedSubMerchant;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedSubMerchant(group.id)}
                      className={`w-full text-left flex items-start p-2.5 rounded-xl transition-colors mb-1.5 cursor-pointer ${isSelected
                        ? 'bg-sky-50 dark:bg-indigo-900/30 border border-sky-300 dark:border-indigo-700/60 text-slate-900 dark:text-white shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-800 dark:text-gray-300 border border-transparent'
                        }`}
                    >
                      <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                        <div className="font-bold flex items-center justify-between text-xs">
                          <span className="truncate text-slate-900 dark:text-white">{group.grouping_key}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${group.transaction_direction === 'Incoming'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-sky-50 dark:bg-blue-950 text-sky-700 dark:text-blue-400 border-sky-200 dark:border-blue-800'
                            }`}>
                            {group.transaction_direction}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-gray-400 mt-1 flex justify-between">
                          <span className="font-medium">Client: {group.client_name}</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">${group.total_amount ? Number(group.total_amount).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</span>
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
                    className="w-full text-left flex items-start p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg group cursor-pointer text-slate-800 dark:text-gray-200"
                  >
                    {expandedNodes['apaylo'] ? <ChevronDown size={16} className="mt-1 mr-1 shrink-0 text-slate-500" /> : <ChevronRight size={16} className="mt-1 mr-1 shrink-0 text-slate-500" />}
                    <div className="opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                      <div className="font-bold text-slate-900 dark:text-gray-200">Tier 2: Apaylo Finance Tech</div>
                      <div className="text-xs text-slate-500 dark:text-gray-500">Platform</div>
                      <div className="text-xs mt-1 font-medium">Overall Risk: <span className="text-rose-600 dark:text-red-500 font-bold">Elevated</span></div>
                    </div>
                  </button>

                  {expandedNodes['apaylo'] && (
                    <div className="ml-4 mt-1 border-l border-slate-200 dark:border-gray-800 pl-2 space-y-1">
                      <button
                        onClick={() => { toggleNode('bytex1'); setSelectedSubMerchant('bytex1'); }}
                        className={`w-full text-left flex items-start p-2 rounded-lg transition-colors cursor-pointer ${selectedSubMerchant === 'bytex1' ? 'bg-rose-50 dark:bg-red-900/20 border border-rose-200 dark:border-red-900/50 text-rose-900 dark:text-red-200' : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'}`}
                      >
                        {expandedNodes['bytex1'] ? <ChevronDown size={16} className="mt-1 mr-1 text-rose-600 dark:text-red-400 shrink-0" /> : <ChevronRight size={16} className="mt-1 mr-1 text-rose-600 dark:text-red-400 shrink-0" />}
                        <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                          <div className="font-bold text-rose-700 dark:text-red-400 flex items-center justify-between text-xs">
                            <span className="truncate">Merchant: send@bytex.ca</span>
                            <AlertTriangle size={14} className="shrink-0 ml-1" />
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedSubMerchant('bytex2')}
                        className={`w-full text-left flex items-start p-2 rounded-lg transition-colors cursor-pointer ${selectedSubMerchant === 'bytex2' ? 'bg-rose-50 dark:bg-red-900/20 border border-rose-200 dark:border-red-900/50 text-rose-900 dark:text-red-200' : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'}`}
                      >
                        <ChevronRight size={16} className="mt-1 mr-1 text-rose-600 dark:text-red-400 shrink-0 opacity-0" />
                        <div className="flex-1 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                          <div className="font-bold text-rose-700 dark:text-red-400 flex items-center justify-between text-xs">
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
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100/50 dark:bg-[#0a0a0a]">

          {/* CENTER-TOP MACRO BAR */}
          <div className="px-6 py-3 bg-white dark:bg-[#0d0f17] border-b border-slate-200 dark:border-gray-800 flex flex-wrap justify-between items-center shrink-0 gap-3 shadow-xs dark:shadow-md">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{foundGroup ? foundGroup.client_name : 'Acme Corp'}</span>
                <ChevronRight size={14} className="text-slate-400 dark:text-gray-600" />
                <span className="text-slate-600 dark:text-gray-300 font-mono text-xs">Account: {foundGroup ? foundGroup.customer_account : '0043821'}</span>
                {currentDirection === 'Incoming' && (
                  <>
                    <ChevronRight size={14} className="text-slate-400 dark:text-gray-600" />
                    <span className="text-sky-700 dark:text-sky-400 font-mono text-xs font-semibold">
                      {getColLabel('TRX_BEN_ACCT_NUM', 'Payee Email')}: <span className="font-bold">{foundGroup?.grouping_key || activeProfile?.name || activeTransactions[0]?.recipientEmail || 'N/A'}</span>
                    </span>
                  </>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${currentDirection === 'Incoming'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                {currentDirection} Mode
              </span>
              <div className="hidden lg:flex items-center space-x-4 text-xs font-mono pl-3 border-l border-slate-200 dark:border-gray-800">
                <span className="text-slate-500 dark:text-gray-400">Vol: <b className="text-emerald-600 dark:text-emerald-400">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
                <span className="text-slate-500 dark:text-gray-400">Txns: <b className="text-slate-900 dark:text-white">{totalTxCount}</b></span>
                {currentDirection === 'Incoming' ? (
                  <span className="text-slate-500 dark:text-gray-400">Unique Senders: <b className="text-emerald-600 dark:text-emerald-400">{uniqueSenderEmailsCount}</b></span>
                ) : (
                  <span className="text-slate-500 dark:text-gray-400">Unique Recipients: <b className="text-sky-600 dark:text-blue-400">{uniqueRecipientEmailsCount}</b></span>
                )}
                <span className="text-slate-500 dark:text-gray-400">Avg/Txn: <b className="text-amber-600 dark:text-amber-400">${avgTxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* AI Triage Copilot Trigger Button (Icon with popup) */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 dark:from-indigo-950 dark:via-purple-950/80 dark:to-indigo-950 hover:from-sky-100 hover:to-indigo-100 dark:hover:from-indigo-900 dark:hover:to-purple-900 text-sky-700 dark:text-indigo-200 border border-sky-200 dark:border-indigo-500/50 hover:border-sky-300 dark:hover:border-indigo-400 rounded-lg text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-all shadow-xs dark:shadow-md group"
                title="Open AI Triage Intelligence Popup"
              >
                <Sparkles size={14} className="text-sky-600 dark:text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>AI Copilot</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-sky-100 dark:bg-indigo-900/80 text-sky-800 dark:text-indigo-300 border border-sky-200 dark:border-indigo-700/60 rounded font-mono font-bold">
                  94% Match
                </span>
              </button>

              <button
                onClick={() => setOverrideDirectionalMode(currentDirection === 'Incoming' ? 'Outgoing' : 'Incoming')}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#181b24] hover:bg-slate-200 dark:hover:bg-gray-800 text-sky-700 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-indigo-900/60 transition-all cursor-pointer flex items-center space-x-1"
              >
                <RefreshCw size={12} className="text-sky-600 dark:text-indigo-400" />
                <span>Switch Direction</span>
              </button>
            </div>
          </div>

          {/* CENTER-BOTTOM PANEL: Transaction Queue */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            {/* Resolution Feedback Notification */}
            {resolutionToast && (
              <div className="mb-3 p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs font-semibold text-emerald-200 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{resolutionToast.message}</span>
                </div>
                <button onClick={() => setResolutionToast(null)} className="text-emerald-400 hover:text-white p-1 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Multi-Selection Batch Actions Strip */}
            {selectedTxRefs.size > 0 && (
              <div className="mb-3 px-4 py-2.5 bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-indigo-950/90 border border-indigo-500/50 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-in fade-in duration-150">
                <div className="flex items-center space-x-2 text-xs text-indigo-200">
                  <CheckSquare size={16} className="text-indigo-400" />
                  <span><b>{selectedTxRefs.size}</b> transaction(s) selected</span>
                  <button
                    onClick={() => setSelectedTxRefs(new Set())}
                    className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer ml-2"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-indigo-300 font-semibold mr-1">Batch Close As:</span>
                  <button
                    onClick={() => handleResolveAlerts('FP')}
                    className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold border border-gray-600 transition-colors cursor-pointer shadow"
                  >
                    False Positive (110)
                  </button>
                  <button
                    onClick={() => handleResolveAlerts('RFI')}
                    className="px-2.5 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-200 rounded-lg text-xs font-semibold border border-blue-600 transition-colors cursor-pointer shadow"
                  >
                    RFI (111)
                  </button>
                  <button
                    onClick={() => handleResolveAlerts('UTR')}
                    className="px-2.5 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded-lg text-xs font-semibold border border-purple-600 transition-colors cursor-pointer shadow"
                  >
                    UTR (110)
                  </button>
                </div>
              </div>
            )}

            {/* Queue Controls & Filters Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 shrink-0 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                  <span>
                    {currentDirection === 'Incoming' && incomingViewMode === 'grouped' && !selectedSenderEmail
                      ? 'Entity Directory'
                      : selectedSenderEmail
                        ? 'Sender Drill-Down Ledger'
                        : 'Transaction Queue'}
                  </span>
                  <span className="ml-2 text-xs text-sky-700 dark:text-sky-400 font-mono font-medium">
                    {currentDirection === 'Incoming' && incomingViewMode === 'grouped' && !selectedSenderEmail
                      ? `(${senderGroups.length} Senders • ${activeTransactions.length} Total Txns)`
                      : selectedSenderEmail
                        ? `(${displayedDrilldownTransactions.length} txns)`
                        : `(${filteredTransactions.length} txns)`}
                  </span>
                </h3>

                {/* Incoming Mode Segmented View Toggle */}
                {currentDirection === 'Incoming' && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-0.5 text-xs shadow-inner">
                    <button
                      onClick={() => { setIncomingViewMode('grouped'); setSelectedSenderEmail(null); }}
                      className={`px-3 py-1 rounded-md transition-all font-semibold flex items-center space-x-1.5 cursor-pointer ${incomingViewMode === 'grouped'
                        ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 shadow font-bold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      title="Group all transactions by Sender Email"
                    >
                      <Users size={13} />
                      <span>Grouped by Sender ({senderGroups.length})</span>
                    </button>
                    <button
                      onClick={() => { setIncomingViewMode('flat'); setSelectedSenderEmail(null); }}
                      className={`px-3 py-1 rounded-md transition-all font-semibold flex items-center space-x-1.5 cursor-pointer ${incomingViewMode === 'flat'
                        ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 shadow font-bold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      title="View chronological flat stream of all transactions"
                    >
                      <ListFilter size={13} />
                      <span>Flat Ledger ({filteredTransactions.length})</span>
                    </button>
                  </div>
                )}

                <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono pl-3 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>Open Alert</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>Closed</span>
                  <span className="text-slate-600 dark:text-slate-400 flex items-center"><span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 mr-1.5"></span>Normal</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Direction Filter Dropdown */}
                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer font-sans shadow-xs"
                >
                  <option value="ALL">All Directions</option>
                  <option value="Incoming">Incoming Only</option>
                  <option value="Outgoing">Outgoing Only</option>
                </select>

                {/* Transaction / Sender Alert Status Filter Dropdown */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer font-sans shadow-xs"
                >
                  {currentDirection === 'Incoming' && incomingViewMode === 'grouped' && !selectedSenderEmail ? (
                    <>
                      <option value="ALL">All Transactions ({allSenderGroupsUnfiltered.length})</option>
                      <option value="OPEN">Open Alerts ({allSenderGroupsUnfiltered.filter(g => g.openAlertsCount > 0).length})</option>
                      <option value="CLOSED">Closed Alerts ({allSenderGroupsUnfiltered.filter(g => g.closedAlertsCount > 0 && g.openAlertsCount === 0).length})</option>
                      <option value="NON_ALERTED">Normal / Clean ({allSenderGroupsUnfiltered.filter(g => g.openAlertsCount === 0 && g.closedAlertsCount === 0).length})</option>
                    </>
                  ) : (
                    <>
                      <option value="ALL">All Statuses ({activeTransactions.length})</option>
                      <option value="OPEN">Open Alerts ({activeTransactions.filter(tx => tx.isAlerted && !tx.isClosed).length})</option>
                      <option value="CLOSED">Closed Alerts ({activeTransactions.filter(tx => tx.isClosed).length})</option>
                      <option value="NON_ALERTED">Non-Alerted ({activeTransactions.filter(tx => !tx.isAlerted).length})</option>
                    </>
                  )}
                </select>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search email, name, memo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Drill-Down Breadcrumb Banner */}
            {currentDirection === 'Incoming' && incomingViewMode === 'grouped' && activeDrilldownSender && (
              <div className="mb-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-sky-300 dark:border-sky-800/60 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm dark:shadow-xl animate-in fade-in">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedSenderEmail(null)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-xs shadow-xs"
                  >
                    <ArrowLeft size={14} />
                    <span>All Transactions ({senderGroups.length})</span>
                  </button>
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{activeDrilldownSender.email}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">({activeDrilldownSender.senderName})</span>
                    <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 rounded-full font-mono text-[11px] font-bold">
                      {activeDrilldownSender.txCount} txns
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-full font-mono text-[11px] font-bold">
                      ${activeDrilldownSender.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      Avg: ${activeDrilldownSender.avgAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const senderRefs = new Set(displayedDrilldownTransactions.map(t => t.ref));
                      setSelectedTxRefs(senderRefs);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                  >
                    Select All ({displayedDrilldownTransactions.length})
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 1: GROUPED BY SENDER TABLE */}
            {currentDirection === 'Incoming' && incomingViewMode === 'grouped' && !selectedSenderEmail ? (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex-1 overflow-auto shadow-sm dark:shadow-2xl backdrop-blur-sm">
                <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/95 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-[inset_0_-1px_0_rgba(51,65,85,0.8)] backdrop-blur select-none z-20">
                    <tr>
                      <th
                        onClick={() => handleSenderSort('email')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Sender Email"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={senderSortField === 'email' ? 'text-sky-700 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_FREE_TEXT_3', 'Sender Email & Identity')}</span>
                          {senderSortField === 'email' ? (
                            senderSortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSenderSort('senderName')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Sender Name"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={senderSortField === 'senderName' ? 'text-sky-700 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_FREE_TEXT_8', 'Sender Name')}</span>
                          {senderSortField === 'senderName' ? (
                            senderSortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSenderSort('txCount')}
                        className="p-3.5 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Transaction Count"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span className={senderSortField === 'txCount' ? 'text-sky-700 dark:text-sky-400 font-bold' : ''}>Txns</span>
                          {senderSortField === 'txCount' ? (
                            senderSortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSenderSort('totalAmount')}
                        className="p-3.5 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Total Amount"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span className={senderSortField === 'totalAmount' ? 'text-sky-700 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_AMT1', 'Total Volume')}</span>
                          {senderSortField === 'totalAmount' ? (
                            senderSortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSenderSort('avgAmount')}
                        className="p-3.5 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Avg Amount per Transaction"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span className={senderSortField === 'avgAmount' ? 'text-sky-700 dark:text-sky-400 font-bold' : ''}>Avg / Txn</span>
                          {senderSortField === 'avgAmount' ? (
                            senderSortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-3.5 font-bold text-center">{getColLabel('RULE_NAMES', 'Triggered Rules')}</th>
                      <th className="p-3.5 font-bold text-center">Status</th>
                      <th className="p-3.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
                    {senderGroups.map((group) => {
                      return (
                        <tr
                          key={group.id}
                          className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="p-3.5 font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                            <button
                              type="button"
                              onClick={() => setSelectedSenderEmail(group.id)}
                              className="flex items-center space-x-1.5 hover:text-sky-900 dark:hover:text-white underline decoration-sky-500/30 hover:decoration-sky-500 underline-offset-2 cursor-pointer transition-colors text-left"
                              title="Drill down into this sender's transactions"
                            >
                              <span>{highlightIllicitKeywords(group.email)}</span>
                              <ArrowUpRight size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
                            </button>
                          </td>
                          <td className="p-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {highlightIllicitKeywords(group.senderName)}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                              {group.txCount} txns
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            ${group.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                            ${group.avgAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-center">
                            {group.distinctRules.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-1">
                                {group.distinctRules.map((rule, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="inline-block px-2 py-0.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded text-[10px] font-mono font-bold shadow-xs"
                                  >
                                    ⚠️ {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500">Normal</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {group.openAlertsCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse"></span>
                                Open ({group.openAlertsCount})
                              </span>
                            ) : group.closedAlertsCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                                Closed ({group.closedAlertsCount})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mr-1.5"></span>
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedSenderEmail(group.id)}
                              className="px-2.5 py-1 bg-sky-50 dark:bg-sky-600/30 hover:bg-sky-600 text-sky-700 dark:text-sky-300 hover:text-white text-[10px] rounded-lg border border-sky-200 dark:border-sky-500/40 transition-colors font-bold flex items-center space-x-1 mx-auto cursor-pointer shadow-xs"
                            >
                              <span>Inspect ({group.txCount})</span>
                              <span>➔</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* LEVEL 2 & FLAT VIEW: DETAILED TRANSACTION LEDGER */
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex-1 overflow-auto shadow-sm dark:shadow-2xl backdrop-blur-sm">
                <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/95 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-[inset_0_-1px_0_rgba(51,65,85,0.8)] backdrop-blur select-none z-20">
                    <tr>
                      {/* Select All Checkbox */}
                      <th className="p-3.5 w-10 text-center">
                        <button
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          title={selectedTxRefs.size === (selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions).length && (selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions).length > 0 ? "Deselect all" : "Select all"}
                        >
                          {selectedTxRefs.size === (selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions).length && (selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions).length > 0 ? (
                            <CheckSquare size={16} className="text-sky-600 dark:text-sky-400" />
                          ) : selectedTxRefs.size > 0 ? (
                            <MinusSquare size={16} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <Square size={16} className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400" />
                          )}
                        </button>
                      </th>
                      {/* 1. Transaction Date (TRX_TRAN_DATE) */}
                      <th
                        onClick={() => handleSort('date')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Transaction Date"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={sortField === 'date' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>
                            {getColLabel('TRX_TRAN_DATE', 'Transaction Date')}
                          </span>
                          {sortField === 'date' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={12} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={11} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('interacRef1')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Interac Reference"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{getColLabel('TRX_SESSION_ID', 'Interac Ref (1)')}</span>
                          {sortField === 'interacRef1' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={12} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={11} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('sender')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Sender Name"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={sortField === 'sender' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_FREE_TEXT_8', 'Sender Name')}</span>
                          {sortField === 'sender' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('senderEmail')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Sender Email"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={sortField === 'senderEmail' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_FREE_TEXT_3', 'Sender Email')}</span>
                          {sortField === 'senderEmail' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('recipientName')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Payee Name"
                      >
                        <div className="flex items-center space-x-1">
                          <span className={sortField === 'recipientName' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>
                            {getColLabel('TRX_ACCT_BEN_NAME', 'Payee Name')}
                          </span>
                          {sortField === 'recipientName' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('amount')}
                        className="p-3.5 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Amount"
                      >
                        <div className="flex items-center justify-end space-x-1">
                          <span className={sortField === 'amount' ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>{getColLabel('TRX_AMT1', 'Amount')}</span>
                          {sortField === 'amount' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={13} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={12} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-3.5 font-bold">{getColLabel('TRX_OLD_VALUE', 'Sec. Question')} / {getColLabel('TRX_NEW_VALUE', 'Answer')}</th>
                      <th
                        onClick={() => handleSort('memo')}
                        className="p-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Message (TRX_SEN_MESSAGE)"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{getColLabel('TRX_SEN_MESSAGE', 'Message (TRX_SEN_MESSAGE)')}</span>
                          {sortField === 'memo' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={12} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={11} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('ruleNames')}
                        className="p-3.5 font-bold text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group"
                        title="Sort by Transaction Alerts"
                      >
                        <div className="flex items-center justify-center space-x-1">
                          <span>{getColLabel('RULE_NAMES', 'Transaction Alerts')}</span>
                          {sortField === 'ruleNames' ? (
                            sortDirection === 'asc' ? <ArrowUp size={12} className="text-sky-600 dark:text-sky-400" /> : <ArrowDown size={12} className="text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown size={11} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-3.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
                    {(selectedSenderEmail ? displayedDrilldownTransactions : filteredTransactions).map((tx, idx) => {
                      const isSelected = selectedTxRefs.has(tx.ref);
                      const textColor = tx.isClosed
                        ? 'text-amber-800 dark:text-amber-400'
                        : (tx.isAlerted ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-300');
                      const textDim = tx.isClosed
                        ? 'text-amber-700/80 dark:text-amber-400/80'
                        : (tx.isAlerted ? 'text-rose-600/80 dark:text-rose-400/80' : 'text-slate-600 dark:text-slate-400');

                      return (
                        <tr
                          key={tx.ref || idx}
                          className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-l-2 border-sky-500'
                            : tx.isClosed
                              ? 'bg-amber-50/40 dark:bg-amber-950/10'
                              : tx.isAlerted
                                ? 'bg-rose-50/40 dark:bg-rose-950/10'
                                : ''
                            }`}
                        >
                          {/* Row Checkbox Selector */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => toggleSelectTx(tx.ref)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare size={16} className="text-sky-600 dark:text-sky-400" />
                              ) : (
                                <Square size={16} className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* TRX_TRAN_DATE */}
                          <td className={`p-3.5 text-xs font-mono whitespace-nowrap ${textDim}`}>
                            {tx.date || tx.trxTranDate || '2025-02-14 14:32'}
                          </td>

                          <td className={`p-3.5 text-xs font-mono font-semibold ${textColor}`}>
                            {tx.interacRef1 || tx.interac_ref1 || tx.ref}
                          </td>
                          <td className={`p-3.5 font-medium ${textColor}`}>
                            {highlightIllicitKeywords(tx.sender)}
                          </td>
                          <td className={`p-3.5 text-xs font-mono ${textDim}`}>
                            {highlightIllicitKeywords(tx.senderEmail || tx.sender_email || 'N/A')}
                          </td>
                          {/* Beneficiary Name Only */}
                          <td className="p-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {highlightIllicitKeywords(tx.trxAcctBenName || tx.recipientName || 'N/A')}
                          </td>
                          <td className={`p-3.5 text-right font-mono font-bold ${textColor}`}>
                            ${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : (!isNaN(Number(tx.amount)) ? Number(tx.amount).toFixed(2) : String(tx.amount || '0.00'))}
                          </td>
                          <td className="p-3.5 text-slate-700 dark:text-slate-300 text-xs">
                            {(() => {
                              const cleanQ = tx.secQ && String(tx.secQ).trim() !== '' && String(tx.secQ).toUpperCase() !== 'NULL' && !String(tx.secQ).includes('Auto-deposit') ? String(tx.secQ) : null;
                              const cleanA = tx.secA && String(tx.secA).trim() !== '' && String(tx.secA).toUpperCase() !== 'NULL' ? String(tx.secA) : null;

                              if (!cleanQ && !cleanA) {
                                return <span className="text-slate-400 dark:text-slate-600 font-mono text-xs">NULL</span>;
                              }

                              return (
                                <div className="space-y-0.5">
                                  {cleanQ && (
                                    <div className="font-medium text-slate-800 dark:text-slate-200">
                                      {highlightIllicitKeywords(cleanQ)}
                                    </div>
                                  )}
                                  {cleanA && (
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1">
                                      <span className="text-slate-400 dark:text-slate-500 font-semibold">A:</span>
                                      <span className="italic">{highlightIllicitKeywords(cleanA)}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          {/* TRX_SEN_MESSAGE / Memo */}
                          <td className={`p-3.5 text-xs font-mono ${textDim}`}>
                            {highlightIllicitKeywords(tx.trxSenMessage || tx.memo || 'N/A')}
                          </td>
                          {/* Transaction Specific Alert(s) */}
                          <td className="p-3.5 text-center">
                            {Array.isArray(tx.ruleNames) && tx.ruleNames.length > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                {tx.ruleNames.map((rule, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="inline-block px-2 py-0.5 border text-[10px] rounded font-mono font-bold bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs"
                                  >
                                    ⚠️ {rule}
                                  </span>
                                ))}
                              </div>
                            ) : tx.isAlerted || (String(tx.transAlert || '').includes('YES')) ? (
                              <span className="inline-block px-2 py-0.5 border text-[10px] rounded font-mono font-bold bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
                                🔴 Alerted Tx
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 border text-[10px] rounded font-mono text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            {(tx.rawRecord || tx.raw_record) ? (
                              <button
                                type="button"
                                onClick={() => { setSelectedTxRecord(tx); setIsRawModalOpen(true); }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer font-medium shadow-xs"
                              >
                                View Raw
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-600 font-mono text-[10px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl p-3 text-xs text-sky-800 dark:text-sky-300/80 flex items-start shrink-0">
              <Activity size={16} className="mt-0.5 mr-2 shrink-0 text-sky-400" />
              <p>Forensic Keyword Scanner active across: <code className="text-sky-300 font-mono">TRX_ACCT_BEN_NAME</code>, <code className="text-sky-300 font-mono">TRX_BEN_ACCT_NUM</code>, <code className="text-sky-300 font-mono">TRX_SEN_MESSAGE</code>, <code className="text-sky-300 font-mono">TRX_FREE_TEXT</code>, <code className="text-sky-300 font-mono">TRX_FREE_TEXT_3</code>, <code className="text-sky-300 font-mono">TRX_OLD_VALUE</code>, and <code className="text-sky-300 font-mono">TRX_NEW_VALUE</code>.</p>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Entity Resolution & Triage Actions (Collapsible) */}
        {isRightPanelOpen ? (
          <aside className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col shrink-0 overflow-y-auto transition-all duration-200 shadow-lg dark:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center">
                  <CheckCircle size={16} className="mr-2 text-sky-600 dark:text-sky-400" /> Alert Resolution
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedTxRefs.size > 0
                    ? `${selectedTxRefs.size} transaction(s) selected`
                    : `Applies to all open alerts in queue`}
                </p>
              </div>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Collapse Resolution Panel"
              >
                <PanelRightClose size={16} />
              </button>
            </div>

            {/* Triage Actions */}
            <div className="mb-8 space-y-3">
              {/* 1. FALSE POSITIVE (Functional - Sets ALERT_CLOSE_TYPE: 110) */}
              <button
                onClick={() => handleResolveAlerts('FP')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-white text-sm flex items-center">
                    <span>False Positive</span>
                    <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded font-mono">Code 110</span>
                    <kbd className="ml-1.5 text-[9px] font-mono px-1 py-0.2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 rounded">F</kbd>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dismiss alert & set Close Type: 110</div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white" />
              </button>

              {/* 2. RFI (Functional - Sets ALERT_CLOSE_TYPE: 111) */}
              <button
                onClick={() => handleResolveAlerts('RFI')}
                className="w-full text-left p-3 rounded-xl border border-sky-200 dark:border-sky-950/80 bg-sky-50/60 dark:bg-sky-950/20 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="font-medium text-sky-700 dark:text-sky-400 text-sm flex items-center">
                    <span>RFI (Request Info)</span>
                    <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded font-mono">Code 111</span>
                    <kbd className="ml-1.5 text-[9px] font-mono px-1 py-0.2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 rounded">R</kbd>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Request client info & set Close Type: 111</div>
                </div>
                <Mail size={16} className="text-sky-600 dark:text-sky-400" />
              </button>

              {/* 3. FILE STR (Non-functional / Informative for now) */}
              <button
                onClick={() => alert('STR (Suspicious Transaction Report) filing gateway is currently in read-only mode for this sprint.')}
                className="w-full text-left p-3 rounded-xl border border-purple-200 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/10 hover:border-purple-300 dark:hover:border-purple-800 transition-all flex items-center justify-between group cursor-pointer opacity-80"
              >
                <div>
                  <div className="font-medium text-purple-700 dark:text-purple-400 text-sm flex items-center">
                    <span>File STR</span>
                    <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 rounded font-mono">Read-Only</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Suspicious Transaction Report (Module Inactive)</div>
                </div>
                <FileText size={16} className="text-purple-500/70 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              </button>

              {/* 4. UTR (Functional - Sets ALERT_CLOSE_TYPE: 110) */}
              <button
                onClick={() => handleResolveAlerts('UTR')}
                className="w-full text-left p-3 rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="font-medium text-rose-700 dark:text-rose-400 text-sm flex items-center">
                    <span>UTR</span>
                    <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded font-mono">Code 110</span>
                    <kbd className="ml-1.5 text-[9px] font-mono px-1 py-0.2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-700 dark:text-rose-300 rounded">U</kbd>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unusual Transaction Report & set Close Type: 110</div>
                </div>
                <FileText size={16} className="text-rose-600/70 group-hover:text-rose-600 dark:group-hover:text-rose-400" />
              </button>
            </div>

            <hr className="border-slate-200 dark:border-slate-800 my-6" />

            {/* Link Analysis Graph Info */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                <Network size={14} className="mr-2 text-sky-600 dark:text-sky-400" /> Link Analysis
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer hover:border-sky-500/50 transition-colors shadow-xs">
                <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Network size={32} className="text-sky-600 dark:text-sky-400/50 mb-3" />
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {activeProfile?.linkAnalysisText || (
                    <>
                      CRM overlap detected:
                      <br /><br />
                      <span className="text-rose-600 dark:text-rose-400 font-bold">send@bytex.ca</span> and <span className="text-rose-600 dark:text-rose-400 font-bold">transact@bytex.ca</span> share the same physical address and phone number.
                    </>
                  )}
                </p>
                <div className="mt-3 text-[10px] uppercase text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 px-2 py-1 rounded bg-sky-100/60 dark:bg-sky-500/10 font-bold">Entity Overlap Found</div>
              </div>
            </div>
          </aside>
        ) : (
          /* COLLAPSED RESOLUTION BAR */
          <div
            onClick={() => setIsRightPanelOpen(true)}
            className="w-10 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 cursor-pointer transition-colors group shrink-0 select-none"
            title="Open Alert Resolution & Actions Panel"
          >
            <PanelRightOpen size={16} className="text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 mb-6" />
            <span className="[writing-mode:vertical-rl] text-[10px] uppercase font-bold tracking-widest text-slate-600 dark:text-slate-500 group-hover:text-sky-700 dark:group-hover:text-sky-300">
              Alert Resolution
            </span>
          </div>
        )}

      </div>

      {/* EXCEL INGESTION MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181b24] border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1c202b]">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Upload size={16} className="mr-2 text-indigo-400" /> Ingest E-Transfer File (Excel)
              </h3>
              <button
                onClick={() => { setIsUploadModalOpen(false); setValidationError(null); }}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {validationError && (
                <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs space-y-1">
                  <div className="font-bold flex items-center">
                    <AlertCircle size={14} className="mr-1.5 text-red-400" /> {validationError.title}
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
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-500/60 bg-[#12141c]'
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
      {isRawModalOpen && selectedTxRecord && (() => {
        const rawObj = selectedTxRecord.rawRecord || selectedTxRecord;
        const allRawKeys = Object.keys(rawObj);
        const filteredRawKeys = allRawKeys.filter(k => {
          if (!rawModalSearch) return true;
          const search = rawModalSearch.toLowerCase();
          const mappedName = getColLabel(k, k).toLowerCase();
          const val = String(rawObj[k] ?? '').toLowerCase();
          return k.toLowerCase().includes(search) || mappedName.includes(search) || val.includes(search);
        });

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150 transition-colors">

              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-[#1c202b]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 rounded-xl text-sky-600 dark:text-sky-400">
                    <Database size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>Raw Transaction Record Data</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-full font-bold">
                        Mapped View Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Interac Ref: <b className="text-slate-800 dark:text-slate-200">{selectedTxRecord.interacRef1 || selectedTxRecord.interac_ref1 || selectedTxRecord.ref}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setRawModalViewMode('mapped')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${rawModalViewMode === 'mapped'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      Field Mappings ({allRawKeys.length})
                    </button>
                    <button
                      onClick={() => setRawModalViewMode('json')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${rawModalViewMode === 'json'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  <button
                    onClick={() => { setIsRawModalOpen(false); setRawModalSearch(''); }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 text-xs space-y-5">

                {/* 1. Target Forensic Attributes (7 Key Highlighted Columns with Mapped Labels) */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center">
                      <ShieldAlert size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
                      7 Primary Forensic Columns (Active Display Mappings)
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Keyword Highlights Enabled</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* TRX_ACCT_BEN_NAME */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_ACCT_BEN_NAME', 'Beneficiary Account Name')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_ACCT_BEN_NAME</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium mt-1 font-sans">
                        {highlightIllicitKeywords(selectedTxRecord.trxAcctBenName || rawObj.TRX_ACCT_BEN_NAME || 'N/A')}
                      </div>
                    </div>

                    {/* TRX_BEN_ACCT_NUM */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_BEN_ACCT_NUM', 'Beneficiary Account / Email')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_BEN_ACCT_NUM</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-1">
                        {highlightIllicitKeywords(selectedTxRecord.trxBenAcctNum || rawObj.TRX_BEN_ACCT_NUM || 'N/A')}
                      </div>
                    </div>

                    {/* TRX_SEN_MESSAGE */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_SEN_MESSAGE', 'Sender Memo / Message')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_SEN_MESSAGE</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-1">
                        {highlightIllicitKeywords(selectedTxRecord.trxSenMessage || selectedTxRecord.memo || rawObj.TRX_SEN_MESSAGE || 'N/A')}
                      </div>
                    </div>

                    {/* TRX_FREE_TEXT */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_FREE_TEXT', 'Free Text / Audit Line')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_FREE_TEXT</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-1">
                        {highlightIllicitKeywords(selectedTxRecord.trxFreeText || rawObj.TRX_FREE_TEXT || 'N/A')}
                      </div>
                    </div>

                    {/* TRX_FREE_TEXT_3 */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_FREE_TEXT_3', 'Sender Email')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_FREE_TEXT_3</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-1">
                        {highlightIllicitKeywords(selectedTxRecord.trxFreeText3 || rawObj.TRX_FREE_TEXT_3 || 'N/A')}
                      </div>
                    </div>

                    {/* TRX_OLD_VALUE -> TRX_NEW_VALUE */}
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {getColLabel('TRX_OLD_VALUE', 'Security Question')} ➔ {getColLabel('TRX_NEW_VALUE', 'Security Answer')}
                        </span>
                        <code className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">TRX_OLD / NEW_VALUE</code>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-1">
                        {highlightIllicitKeywords(selectedTxRecord.trxOldValue || rawObj.TRX_OLD_VALUE || 'Ø')} ➔ {highlightIllicitKeywords(selectedTxRecord.trxNewValue || rawObj.TRX_NEW_VALUE || 'Ø')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Normalized Transaction Summary */}
                <div className="bg-slate-50 dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Normalized Transaction Summary
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{getColLabel('TRX_DEB_CRE_IND', 'Direction')}</span>
                      <b className="text-slate-900 dark:text-white font-mono">{selectedTxRecord.direction || selectedTxRecord.transaction_direction}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Grouping Key Source</span>
                      <b className="text-sky-700 dark:text-indigo-400 font-mono">{getGroupingKeySourceLabel(selectedTxRecord.groupingKeySource)}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{getColLabel('TRX_AMT1', 'Amount')}</span>
                      <b className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">${typeof selectedTxRecord.amount === 'number' ? selectedTxRecord.amount.toFixed(2) : selectedTxRecord.amount}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{getColLabel('TRX_FREE_TEXT_8', 'Sender Name')}</span>
                      <b className="text-slate-900 dark:text-gray-200">{selectedTxRecord.sender || 'N/A'}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Alert Status</span>
                      <b className={selectedTxRecord.isClosed ? 'text-amber-700 dark:text-amber-400 font-bold' : (selectedTxRecord.isAlerted ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400')}>
                        {selectedTxRecord.isClosed ? `CLOSED (${selectedTxRecord.resolutionName || 'Resolved'})` : (selectedTxRecord.isAlerted ? 'OPEN ALERT' : 'Normal')}
                      </b>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{getColLabel('ALERT_CLOSE_TYPE', 'Alert Close Type')}</span>
                      <b className="text-amber-800 dark:text-amber-400 font-mono font-bold">{selectedTxRecord.alertCloseType || rawObj.ALERT_CLOSE_TYPE || 'NULL'}</b>
                    </div>
                  </div>
                </div>

                {/* 3. Mapped Fields Table vs Raw JSON */}
                {rawModalViewMode === 'mapped' ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center">
                        <List size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
                        All Spreadsheet Columns & Active Field Mappings ({filteredRawKeys.length})
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filter columns or values..."
                          value={rawModalSearch}
                          onChange={(e) => setRawModalSearch(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 pl-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3 w-1/3">Active Mapped Display Name</th>
                            <th className="p-3 w-1/4">Technical SQL Column Name</th>
                            <th className="p-3">Raw Value in Record</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 font-mono text-xs">
                          {filteredRawKeys.map((key) => {
                            const customOrMapped = getColLabel(key, key);
                            const isDifferent = customOrMapped !== key;
                            const val = rawObj[key];
                            const valDisplay = val instanceof Date
                              ? formatDisplayDate(val)
                              : (val === null || val === undefined ? '<NULL>' : (typeof val === 'object' ? JSON.stringify(val) : String(val)));

                            return (
                              <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="p-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                                  <div className="flex items-center space-x-1.5">
                                    <span>{customOrMapped}</span>
                                    {isDifferent && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Custom or System Mapped Field" />
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-sky-700 dark:text-sky-400 font-semibold">
                                  {key}
                                </td>
                                <td className="p-3 text-slate-800 dark:text-slate-200 break-all font-sans">
                                  {highlightIllicitKeywords(valDisplay)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider">
                      Original Raw Record JSON
                    </div>
                    <pre className="bg-slate-900 dark:bg-[#0b0d12] p-4 rounded-xl border border-slate-800 text-[11px] text-emerald-400 dark:text-emerald-300 overflow-x-auto shadow-inner">
                      {JSON.stringify(rawObj, null, 2)}
                    </pre>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-[#141720] border-t border-slate-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Showing {allRawKeys.length} mapped technical fields configured for payment rail <b>ETRANSFER</b>
                </span>
                <button
                  onClick={() => { setIsRawModalOpen(false); setRawModalSearch(''); }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI COPILOT INTELLIGENCE POPUP MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#151824] border border-indigo-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#1a1e30] to-[#121420]">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600/20 border border-indigo-500/40 p-2.5 rounded-xl text-indigo-400 shadow-md">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center">
                    <span>AI Triage Copilot • Entity Intelligence</span>
                    <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                      Local LLM Ready
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Entity: <b className="text-white">{foundGroup ? foundGroup.client_name : 'Acme Corp'}</b> • Account: <b className="text-indigo-400">{foundGroup ? foundGroup.customer_account : '0043821'}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Typology & Confidence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#1a1e2d] border border-gray-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Detected Typology</span>
                  <span className="text-xs font-bold text-red-400 flex items-center">
                    <AlertTriangle size={14} className="mr-1.5 shrink-0" />
                    {activeProfile?.typology || (currentDirection === 'Incoming' ? 'Unlicensed Merchant / Fan-In Funnel' : 'Rapid Layering / Money Mule')}
                  </span>
                </div>
                <div className="bg-[#1a1e2d] border border-gray-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Risk Confidence</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono flex items-center">
                    <CheckCircle size={14} className="mr-1.5 shrink-0" />
                    94% Match Probability
                  </span>
                </div>
                <div className="bg-[#1a1e2d] border border-gray-800/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Recommended Resolution</span>
                  <span className="text-xs font-bold text-indigo-300 flex items-center">
                    <Brain size={14} className="mr-1.5 shrink-0" />
                    {currentDirection === 'Incoming' ? 'File STR & Freeze Gateway' : 'File UTR & Restrict P2P'}
                  </span>
                </div>
              </div>

              {/* Entity Context Metrics Strip */}
              <div className="bg-[#10121a] border border-gray-800/80 p-3 rounded-xl flex flex-wrap justify-between items-center text-xs font-mono gap-2 text-gray-300">
                <span>Total Vol: <b className="text-emerald-400">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
                <span>Txns: <b className="text-white">{totalTxCount}</b></span>
                <span>Avg/Txn: <b className="text-amber-400">${avgTxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></span>
                <span>{currentDirection === 'Incoming' ? `Unique Senders: ` : `Unique Recipients: `}<b className="text-indigo-400">{currentDirection === 'Incoming' ? uniqueSenderEmailsCount : uniqueRecipientEmailsCount}</b></span>
              </div>

              {/* AI Narrative Breakdown */}
              <div className="bg-[#121420] border border-indigo-900/40 p-4 rounded-xl text-xs leading-relaxed text-gray-300 space-y-3 shadow-inner">
                <div className="flex items-start space-x-3">
                  <Bot size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h5 className="font-bold text-sm text-white">Local LLM Pattern Assessment</h5>
                    <p className="text-gray-200">
                      {activeProfile?.aiAnalysis || (
                        currentDirection === 'Incoming'
                          ? `The account displays characteristics of an unlicensed commercial collection funnel. Over ${totalTxCount} incoming e-Transfers totaling $${totalVolume.toLocaleString()} were received from ${uniqueSenderEmailsCount} distinct retail sender accounts, with an average ticket size of $${avgTxAmount.toFixed(2)}.`
                          : `The account displays rapid funds dispersion across ${uniqueRecipientEmailsCount} external accounts with high velocity, consistent with money mule layering patterns.`
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono bg-black/30 p-2.5 rounded-lg border border-gray-800">
                      Signals: <b className="text-amber-300">{activeProfile?.typologyDesc || 'Elevated velocity, keyword alerts in transfer memo, and multi-sender clustering detected.'}</b>
                    </p>
                  </div>
                </div>
              </div>

              {/* Red Flags Quick Checklist */}
              <div className="bg-[#10121a] border border-gray-800 p-3.5 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Key Red Flags Identified</span>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>Disproportionate ratio of incoming retail senders (<b className="text-white">{uniqueSenderEmailsCount} unique</b>) to business profile.</li>
                  <li>Frequent round-dollar denominations ($50.00, $100.00, $200.00) matching e-commerce carts.</li>
                  <li>High transaction velocity during off-peak hours.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#11131c] border-t border-gray-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsAiRunning(true);
                  setTimeout(() => setIsAiRunning(false), 1000);
                }}
                disabled={isAiRunning}
                className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={isAiRunning ? 'animate-spin text-indigo-400' : 'text-indigo-400'} />
                <span>{isAiRunning ? 'Re-Evaluating Entity...' : 'Re-Run Local AI'}</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsAiModalOpen(false);
                    alert('AI Assessment attached to Investigation Notes.');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md shadow-indigo-600/30 transition-colors flex items-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>Attach to Resolution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FraudTriageDashboard;
