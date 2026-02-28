import { useState } from "react";
import { Loader2, Scan } from "lucide-react";

interface WalletInputsProps {
  polyWallet: string;
  opinionWallet: string;
  onPolyChange: (val: string) => void;
  onOpinionChange: (val: string) => void;
  onScan: () => void;
  loading: boolean;
}

const WalletInputs = ({
  polyWallet,
  opinionWallet,
  onPolyChange,
  onOpinionChange,
  onScan,
  loading,
}: WalletInputsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
        <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider w-12 sm:w-auto">Poly</label>
        <input
          type="text"
          value={polyWallet}
          onChange={(e) => onPolyChange(e.target.value)}
          placeholder="0x..."
          className="h-8 sm:h-7 w-full sm:w-40 rounded border border-border bg-secondary px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
        <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider w-12 sm:w-auto">Opinion</label>
        <input
          type="text"
          value={opinionWallet}
          onChange={(e) => onOpinionChange(e.target.value)}
          placeholder="0x..."
          className="h-8 sm:h-7 w-full sm:w-40 rounded border border-border bg-secondary px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        onClick={onScan}
        disabled={loading}
        className="h-8 sm:h-7 mt-1 sm:mt-0 px-3 rounded bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
        SCAN
      </button>
    </div>
  );
};

export default WalletInputs;
