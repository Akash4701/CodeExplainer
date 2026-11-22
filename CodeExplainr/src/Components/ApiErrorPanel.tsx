import { AlertTriangle, RotateCcw } from 'lucide-react';
import { formatRetryTime, type ApiErrorInfo } from '../utils/apiError';

interface ApiErrorPanelProps {
  error: ApiErrorInfo;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export default function ApiErrorPanel({
  error,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
}: ApiErrorPanelProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 ${compact ? 'p-3' : 'p-4'}`}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{error.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900">{error.message}</p>
        {error.retryable && (
          <p className="mt-2 text-xs font-medium text-amber-700">
            Recommended: retry in about {formatRetryTime(error.retryAfter)}.
          </p>
        )}
        {error.retryable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
          >
            <RotateCcw size={15} />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
