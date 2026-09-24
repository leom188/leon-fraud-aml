import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PaymentRail } from '../../types/rails';
import { excelAdapter } from '../../services/dataSource/excelAdapter';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRail: PaymentRail;
  onDataLoaded: (data: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  activeRail,
  onDataLoaded
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ stage: '', progress: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMessage('Please upload a valid Excel spreadsheet (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressInfo({ stage: 'Reading Excel buffer...', progress: 10 });

    try {
      const buffer = await file.arrayBuffer();
      const result = await excelAdapter.parseArrayBuffer(buffer, activeRail, (p) => setProgressInfo(p));
      onDataLoaded(result);
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      console.error('Ingestion error', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to parse Excel file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-[#10141E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-sky-600">
            <Upload size={18} />
            <DialogTitle className="text-base font-bold">
              Ingest {activeRail} Batch
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Upload an Excel transaction export (.xlsx) for automated grouping and triage.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30'
                : 'border-slate-300 dark:border-slate-800 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 mb-3">
              <FileSpreadsheet size={24} />
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Click to browse or drag & drop file
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Accepts .xlsx, .xls containing "Full_Analysis" or first worksheet
            </p>
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>{progressInfo.stage}</span>
                <span>{progressInfo.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progressInfo.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
