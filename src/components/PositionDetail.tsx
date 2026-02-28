import { Position, mockExitStrategies } from "@/data/mockData";
import ExitStrategyPanel from "./ExitStrategyPanel";

interface PositionDetailProps {
  position: Position;
}

const PositionDetail = ({ position }: PositionDetailProps) => {
  const formatPnlValue = (value: number) => {
    const isPositive = value >= 0;
    const color = isPositive ? "text-profit" : "text-loss";
    const sign = isPositive ? "+" : "";
    return <span className={`${color} font-mono`}>{sign}${value.toFixed(2)}</span>;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breakdown table: Poly vs Opinion */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">MARKET</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">AVG → NOW</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">PAID</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">◎ BEST ASK</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">◎ BEST BID</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">ASK P&L</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">BID P&L</th>
            </tr>
          </thead>
          <tbody>
            {/* Poly Row */}
            <tr className="border-b border-border">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-foreground">{position.market}</div>
                <div className="text-xs text-muted-foreground">
                  {position.polyShares} shares{" "}
                  <span className={position.polySide === "Yes" ? "text-profit" : "text-loss"}>
                    {position.polySide}
                  </span>{" "}
                  <span className="text-primary font-semibold">Poly</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                {position.polyAvg}c → {position.polyNow}c
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                ${position.polyPaid.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                <span className="text-foreground">${position.polyBestAsk.toFixed(2)}</span>
                <br />
                <span className="text-xs text-muted-foreground">{position.polyBestAskDepth}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                <span className="text-foreground">${position.polyBestBid.toFixed(2)}</span>
                <br />
                <span className="text-xs text-muted-foreground">{position.polyBestBidDepth}</span>
              </td>
              <td className="px-4 py-3 text-right">{formatPnlValue(position.polyAskPnl)}</td>
              <td className="px-4 py-3 text-right">{formatPnlValue(position.polyBidPnl)}</td>
            </tr>
            {/* Opinion Row */}
            <tr className="border-b border-border">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-foreground">{position.subtitle}</div>
                <div className="text-xs text-muted-foreground">
                  {position.opinionShares} shares{" "}
                  <span className={position.opinionSide === "No" ? "text-loss" : "text-profit"}>
                    {position.opinionSide}
                  </span>{" "}
                  <span className="text-primary font-semibold">Opinion</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                {position.opinionAvg}c → {position.opinionNow}c
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                ${position.opinionPaid.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                <span className="text-foreground">${position.opinionBestAsk.toFixed(2)}</span>
                <br />
                <span className="text-xs text-muted-foreground">{position.opinionBestAskDepth}</span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                <span className="text-foreground">${position.opinionBestBid.toFixed(2)}</span>
                <br />
                <span className="text-xs text-muted-foreground">{position.opinionBestBidDepth}</span>
              </td>
              <td className="px-4 py-3 text-right">{formatPnlValue(position.opinionAskPnl)}</td>
              <td className="px-4 py-3 text-right">{formatPnlValue(position.opinionBidPnl)}</td>
            </tr>
            {/* Combined Row */}
            <tr className="bg-secondary/20">
              <td className="px-4 py-3 text-sm font-semibold text-foreground">Combined Arbitrage Pair</td>
              <td className="px-4 py-3 text-right font-mono text-sm text-foreground">
                {position.avgPrice}c → {position.nowPrice}c
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-foreground">
                ${position.paid.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {formatPnlValue(position.polyBestAsk + position.opinionBestAsk)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {formatPnlValue(position.polyBestBid + position.opinionBestBid)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {formatPnlValue(position.askPnl)}
                <br />
                <span className={`text-xs ${position.askPnlPct >= 0 ? "text-profit" : "text-loss"}`}>
                  ({position.askPnlPct >= 0 ? "+" : ""}{position.askPnlPct.toFixed(2)}%)
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                {formatPnlValue(position.bidPnl)}
                <br />
                <span className={`text-xs ${position.bidPnlPct >= 0 ? "text-profit" : "text-loss"}`}>
                  ({position.bidPnlPct >= 0 ? "+" : ""}{position.bidPnlPct.toFixed(2)}%)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Exit Strategy */}
      <ExitStrategyPanel />
    </div>
  );
};

export default PositionDetail;
