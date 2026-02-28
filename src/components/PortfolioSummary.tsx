import { RawPolyPosition, MatchedPosition } from "@/hooks/usePositions";

interface SummaryCardProps {
  label: string;
  value: string;
  subtitle: string;
  variant?: "default" | "profit" | "loss";
}

const PortfolioSummaryCard = ({ label, value, subtitle, variant = "default" }: SummaryCardProps) => {
  const barColor = variant === "profit" ? "bg-profit" : variant === "loss" ? "bg-loss" : "bg-primary";

  return (
    <div className="rounded-lg bg-card border border-border p-4 flex flex-col gap-2 min-w-[200px]">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="text-primary">●</span>
        {label}
      </div>
      <div className="text-lg font-bold font-mono text-foreground">{value}</div>
      <div className={`h-2 w-20 rounded-full ${barColor}`} />
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
};

interface PortfolioSummaryProps {
  matchedPositions: MatchedPosition[];
}

const PortfolioSummary = ({ matchedPositions }: PortfolioSummaryProps) => {
  let totalCost = 0;
  let totalCurrentValue = 0;
  let totalSpread = 0;

  for (const m of matchedPositions) {
    // Poly side
    const polyInitial = m.poly.initialValue;
    const polyValue = m.poly.size * m.poly.curPrice;
    const polyCurPrice = m.poly.curPrice * 100;

    // Opinion side
    const opinionInitial = parseFloat(m.opinion.totalCostInQuoteToken || "0") ||
      (parseFloat(m.opinion.sharesOwned || "0") * parseFloat(m.opinion.avgEntryPrice || "0"));
    const opinionValue = parseFloat(m.opinion.currentValueInQuoteToken || "0");
    const opinionShares = parseFloat(m.opinion.sharesOwned || "0");
    const opinionCurPrice = opinionShares > 0 ? (opinionValue / opinionShares) * 100 : 0;

    totalCost += polyInitial + opinionInitial;
    totalCurrentValue += polyValue + opinionValue;

    // Spread = |YES + NO - 100| at current prices (how much arb profit per ¢)
    const yesNo = polyCurPrice + opinionCurPrice;
    totalSpread += Math.max(0, yesNo - 100);
  }

  const totalProfit = totalCurrentValue - totalCost;
  const profitVariant = totalProfit >= 0 ? "profit" : "loss";
  const spreadVariant = totalSpread > 0 ? "profit" : "default";

  const cards: SummaryCardProps[] = [
    {
      label: "Matched Positions",
      value: String(matchedPositions.length),
      subtitle: "Cross-exchange arbitrage pairs",
      variant: "default",
    },
    {
      label: "Total Buy-in Cost",
      value: `$${totalCost.toFixed(2)}`,
      subtitle: "Capital deployed across both platforms",
      variant: "default",
    },
    {
      label: "Current Portfolio",
      value: `$${totalCurrentValue.toFixed(2)}`,
      subtitle: "Total value at current prices",
      variant: totalCurrentValue >= totalCost ? "profit" : "loss",
    },
    {
      label: "Total Profit",
      value: `${totalProfit >= 0 ? "+" : ""}$${totalProfit.toFixed(2)}`,
      subtitle: `${totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(1) : "0"}% return`,
      variant: profitVariant as "profit" | "loss",
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        📊 PORTFOLIO SUMMARY
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <PortfolioSummaryCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

export default PortfolioSummary;
