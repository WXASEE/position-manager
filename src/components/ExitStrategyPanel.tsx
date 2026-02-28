import { useState } from "react";
import { mockExitStrategies, ExitStrategy } from "@/data/mockData";

const priceFilters = [">100¢", ">99¢", ">98¢", ">97¢", ">96¢", ">95¢"];

const ExitStrategyPanel = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          OPTIMAL SELLING STRATEGY
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">TARGET PRICE:</span>
          {priceFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
              className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
              }`}
            >
              {filter}
            </button>
          ))}
          <button className="text-xs px-3 py-1 rounded border border-primary bg-primary text-primary-foreground font-semibold ml-2 hover:opacity-90 transition-opacity">
            SELL ALL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mockExitStrategies.map((strategy) => (
          <StrategyCard key={strategy.label} strategy={strategy} />
        ))}
      </div>
    </div>
  );
};

const StrategyCard = ({ strategy }: { strategy: ExitStrategy }) => {
  const pnlColor = strategy.pnl >= 0 ? "text-profit" : "text-loss";
  const borderColor = strategy.isBest ? "border-profit" : "border-border";

  return (
    <div className={`rounded-lg border ${borderColor} bg-card p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          {strategy.label}
          {strategy.isBest && (
            <span className="ml-2 text-xs font-semibold text-profit">(Best)</span>
          )}
        </h4>
        <div className={`text-right ${pnlColor}`}>
          <span className="font-mono font-semibold text-sm">
            {strategy.pnl >= 0 ? "+" : ""}${strategy.pnl.toFixed(2)}
          </span>
          <span className="text-xs ml-1 font-mono">
            ROI: ({strategy.roi >= 0 ? "+" : ""}{strategy.roi.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Combined Price */}
      <div>
        <span className="text-xs text-muted-foreground">COMBINED PRICE </span>
        <span className="font-mono text-sm text-foreground font-semibold">{strategy.combinedPrice}¢</span>
        <br />
        <span className="text-xs text-muted-foreground font-mono">{strategy.combinedPriceBreakdown}</span>
      </div>

      {/* Two columns: POLY and OPINION */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded bg-secondary/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">POLY</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              strategy.polyType === "LIMIT"
                ? "bg-primary/20 text-primary"
                : "bg-loss/20 text-loss"
            }`}>
              {strategy.polyType}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PRICE</span>
              <span className="font-mono text-foreground">{strategy.polyPrice}¢</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SHARES TO SELL</span>
              <span className="font-mono text-foreground">{strategy.polySharesToSell}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TOTAL VALUE</span>
              <span className="font-mono text-foreground">${strategy.polyTotalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded bg-secondary/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">OPINION</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              strategy.opinionType === "LIMIT"
                ? "bg-primary/20 text-primary"
                : "bg-loss/20 text-loss"
            }`}>
              {strategy.opinionType}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PRICE</span>
              <span className="font-mono text-foreground">{strategy.opinionPrice}¢</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SHARES TO SELL</span>
              <span className="font-mono text-foreground">{strategy.opinionSharesToSell}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TOTAL VALUE</span>
              <span className="font-mono text-foreground">${strategy.opinionTotalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="flex justify-between text-xs pt-1 border-t border-border">
        <span className={strategy.estFees < 0 ? "text-loss" : "text-profit"}>
          {strategy.feesLabel}
        </span>
        <span className={`font-mono ${strategy.estFees < 0 ? "text-loss" : "text-profit"}`}>
          {strategy.estFees === 0 ? "$0.00" : `-$${Math.abs(strategy.estFees).toFixed(2)}`}
        </span>
      </div>

      {/* Price Levels toggle */}
      <button className="text-xs text-primary hover:underline">
        ▸ Price Levels (4)
      </button>
    </div>
  );
};

export default ExitStrategyPanel;
