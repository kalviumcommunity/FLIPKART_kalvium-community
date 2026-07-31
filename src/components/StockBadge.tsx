import { CheckCircle2, XCircle } from 'lucide-react';

export function StockBadge({ inStock, className = '' }: { inStock: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      } ${className}`}
    >
      {inStock ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {inStock ? 'In Stock' : 'Out of Stock'}
    </span>
  );
}
//adding comment to test commit
