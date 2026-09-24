import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronRight, RotateCcw, X } from 'lucide-react';

export interface CompletionToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface CompletionToastProps {
  title: string;
  subtitle?: string;
  actions?: CompletionToastAction[];
  autoAdvanceSeconds?: number;
  onAutoAdvance?: () => void;
  onDismiss?: () => void;
  onUndo?: () => void;
  undoWindowSeconds?: number;
}

export const CompletionToast: React.FC<CompletionToastProps> = ({
  title,
  subtitle,
  actions = [],
  autoAdvanceSeconds = 4,
  onAutoAdvance,
  onDismiss,
  onUndo,
  undoWindowSeconds = 8,
}) => {
  const [undoAvailable, setUndoAvailable] = useState(Boolean(onUndo));
  const [undoProgress, setUndoProgress] = useState(100);
  const [advanceProgress, setAdvanceProgress] = useState(100);
  const [dismissed, setDismissed] = useState(false);
  const dismissedRef = useRef(false);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = () => {
    [undoTimerRef, advanceTimerRef, startRef].forEach(r => { if (r.current) clearTimeout(r.current); });
    [undoTickRef, advanceTickRef].forEach(r => { if (r.current) clearInterval(r.current); });
  };

  const dismiss = (fn?: () => void) => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setDismissed(true);
    clearAll();
    fn?.();
  };

  useEffect(() => {
    if (!onUndo) return;
    const FPS = 20;
    const step = 100 / (undoWindowSeconds * FPS);
    undoTickRef.current = setInterval(() => setUndoProgress(p => Math.max(0, p - step)), 1000 / FPS);
    undoTimerRef.current = setTimeout(() => {
      setUndoAvailable(false);
      if (undoTickRef.current) clearInterval(undoTickRef.current);
    }, undoWindowSeconds * 1000);
    return () => clearAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!onAutoAdvance || autoAdvanceSeconds <= 0) return;
    const startDelay = onUndo ? undoWindowSeconds * 1000 : 0;
    startRef.current = setTimeout(() => {
      const FPS = 20;
      const step = 100 / (autoAdvanceSeconds * FPS);
      advanceTickRef.current = setInterval(() => setAdvanceProgress(p => Math.max(0, p - step)), 1000 / FPS);
      advanceTimerRef.current = setTimeout(() => {
        if (!dismissedRef.current) {
          dismissedRef.current = true;
          setDismissed(true);
          clearAll();
          onAutoAdvance();
        }
      }, autoAdvanceSeconds * 1000);
    }, startDelay);
    return () => { if (startRef.current) clearTimeout(startRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed) return null;

  const isInUndoWindow = undoAvailable && Boolean(onUndo);
  const showAdvanceBar = !isInUndoWindow && onAutoAdvance && autoAdvanceSeconds > 0;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] rounded-xl
                 shadow-2xl border border-slate-200 dark:border-slate-700
                 bg-white dark:bg-[#12161F]
                 animate-in fade-in slide-in-from-top-3 duration-300"
    >
      <div className="h-1 w-full overflow-hidden rounded-t-xl">
        {isInUndoWindow ? (
          <div className="h-full bg-amber-400 transition-all duration-100 ease-linear" style={{ width: `${undoProgress}%` }} />
        ) : showAdvanceBar ? (
          <div className="h-full bg-sky-500 transition-all duration-100 ease-linear" style={{ width: `${advanceProgress}%` }} />
        ) : (
          <div className="h-full bg-emerald-400" style={{ width: '100%' }} />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{title}</span>
          </div>
          <button onClick={() => dismiss(onDismiss)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer ml-2 mt-0.5 shrink-0">
            <X size={14} />
          </button>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-9 mb-3 leading-relaxed">{subtitle}</p>
        )}

        {isInUndoWindow && onUndo && (
          <div className="ml-9 mb-3 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg px-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" style={{ opacity: Math.max(0.3, undoProgress / 100) }} />
            <span>Closing in progress — </span>
            <button onClick={() => dismiss(onUndo)} className="font-bold underline underline-offset-2 cursor-pointer hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1">
              <RotateCcw size={10} />
              Undo
            </button>
          </div>
        )}

        {actions.length > 0 && (
          <div className="ml-9 flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => dismiss(action.onClick)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  action.primary
                    ? 'bg-sky-600 hover:bg-sky-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {action.label}
                {action.primary && <ChevronRight size={12} />}
              </button>
            ))}
          </div>
        )}

        {showAdvanceBar && (
          <p className="ml-9 mt-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Auto-advancing in {autoAdvanceSeconds}s…
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletionToast;
