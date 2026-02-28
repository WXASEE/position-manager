import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { RawPolyPosition } from "@/hooks/usePositions";
import PositionDetail from "./PositionDetail";

const formatPnl = (value: number, pct: number) => {
  const isPositive = value >= 0;
  const color = isPositive ? "text-profit" : "text-loss";
  const sign = isPositive ? "+" : "";
  return (
    <span className={`${color} font-mono text-sm`}>
      {sign}${value.toFixed(2)}
      <br />
      <span className="text-xs opacity-70">({sign}{pct.toFixed(2)}%)</span>
    </span>
  );
};

interface PositionsTableProps {
  polyPositions: RawPolyPosition[];
  opinionPositions: any[];
  loading: boolean;
  hasScanned: boolean;
}

const PositionsTable = ({ polyPositions, opinionPositions, loading, hasScanned }: PositionsTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!hasScanned && !loading) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-profit" />
          POLYMARKET POSITIONS
        </h2>
        <span className="text-xs text-muted-foreground">
          {polyPositions.length} ENTRIES
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Scanning wallets...</span>
        </div>
      )}

      {!loading && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-8"></th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">MARKET</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">SHARES</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">OUTCOME</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">CUR PRICE</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">INITIAL VALUE</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">CUR VALUE</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">P&L</th>
              </tr>
            </thead>
            <tbody>
              {polyPositions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No Polymarket positions found for this wallet.
                  </td>
                </tr>
              ) : (
                polyPositions.map((pos: any, i: number) => {
                  const curValue = pos.currentValue ?? pos.size * pos.curPrice;
                  const pnl = pos.cashPnl ?? (curValue - (pos.initialValue ?? 0));
                  const pnlPct = pos.percentPnl ?? (pos.initialValue > 0 ? (pnl / pos.initialValue) * 100 : 0);
                  const id = `poly-${i}`;

                  return (
                    <tr
                      key={id}
                      className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => toggleRow(id)}
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {expandedId === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground">{pos.title || pos.question}</div>
                        <div className="text-xs text-muted-foreground">{pos.market}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{pos.size.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-mono">
                        <span className={pos.outcome === "Yes" ? "text-profit" : "text-loss"}>
                          {pos.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        {(pos.curPrice * 100).toFixed(1)}¢
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${pos.initialValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${curValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatPnl(pnl, pnlPct)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Opinion Positions Table */}
      {hasScanned && opinionPositions.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              OPINION POSITIONS
            </h2>
            <span className="text-xs text-muted-foreground">{opinionPositions.length} ENTRIES</span>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">MARKET</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">OUTCOME</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">SHARES</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">AVG ENTRY</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">CUR VALUE</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">P&L</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {opinionPositions.map((pos: any, i: number) => {
                  const pnl = parseFloat(pos.unrealizedPnl || "0");
                  const pnlPct = parseFloat(pos.unrealizedPnlPercent || "0") * 100;
                  return (
                    <tr key={i} className="border-b border-border hover:bg-accent/50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground">{pos.rootMarketTitle}</div>
                        <div className="text-xs text-muted-foreground">{pos.marketTitle}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        <span className={pos.outcomeSideEnum === "Yes" ? "text-profit" : "text-loss"}>
                          {pos.outcomeSideEnum}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        {parseFloat(pos.sharesOwned || "0").toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        {(parseFloat(pos.avgEntryPrice || "0") * 100).toFixed(1)}¢
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                        ${parseFloat(pos.currentValueInQuoteToken || "0").toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatPnl(pnl, pnlPct)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          pos.marketStatusEnum === "Activated" ? "bg-profit/20 text-profit" : "bg-muted text-muted-foreground"
                        }`}>
                          {pos.marketStatusEnum}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionsTable;
