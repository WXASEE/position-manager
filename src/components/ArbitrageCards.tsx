import { useRef, useCallback, useState } from "react";
import { MatchedPosition, RawPolyPosition } from "@/hooks/usePositions";
import { ArrowRight, Link2, Unlink, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import ShareCard, { ShareCardData } from "./ShareCard";

interface MatchResult {
  matched: MatchedPosition[];
  unmatchedPoly: RawPolyPosition[];
  unmatchedOpinion: any[];
}

interface ArbitrageCardsProps {
  matchResult: MatchResult;
}

const ArbitrageCards = ({ matchResult }: ArbitrageCardsProps) => {
  const shareRef = useRef<HTMLDivElement>(null);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  const handleShare = useCallback(async (data: ShareCardData) => {
    setShareData(data);
    await new Promise((r) => setTimeout(r, 150));
    const el = shareRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#0f1219",
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "arbitrage-signal.png", { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Arbitrage Signal" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "arbitrage-signal.png";
          a.click();
          URL.revokeObjectURL(url);
          toast({ title: "Image downloaded!" });
        }
        setShareData(null);
      }, "image/png");
    } catch {
      toast({ title: "Failed to capture card", variant: "destructive" });
      setShareData(null);
    }
  }, []);
  const { matched, unmatchedPoly, unmatchedOpinion } = matchResult;

  if (matched.length === 0 && unmatchedPoly.length === 0 && unmatchedOpinion.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {matched.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              MATCHED POSITIONS
            </h2>
            <span className="text-xs text-muted-foreground">{matched.length} PAIRS</span>
          </div>

          <div className="grid gap-3 mb-6">
            {matched.map((m) => {
              const polyEntryPrice = m.poly.initialValue > 0 && m.poly.size > 0
                ? (m.poly.initialValue / m.poly.size) * 100
                : 0;
              const polyCurPrice = m.poly.curPrice * 100;

              const opinionEntryPrice = parseFloat(m.opinion.avgEntryPrice || "0") * 100;
              const opinionShares = parseFloat(m.opinion.sharesOwned || "0");
              const opinionLatest = parseFloat(m.opinion.latestPrice || "0");
              const opinionValueRaw = parseFloat(m.opinion.currentValueInQuoteToken || "0");
              const opinionLastPrice = opinionLatest > 0
                ? opinionLatest * 100
                : (opinionShares > 0 ? (opinionValueRaw / opinionShares) * 100 : 0);
              const opinionCurPrice = opinionLastPrice;

              const polyValue = m.poly.size * m.poly.curPrice;
              const polyInitial = m.poly.initialValue;
              const polyPnl = polyValue - polyInitial;

              const opinionPnl = parseFloat(m.opinion.unrealizedPnl || "0");
              const opinionValue = parseFloat(m.opinion.currentValueInQuoteToken || "0");
              const opinionInitial = parseFloat(m.opinion.totalCostInQuoteToken || "0") || (opinionShares * parseFloat(m.opinion.avgEntryPrice || "0"));

              const totalPnl = polyPnl + opinionPnl;
              const totalValue = polyValue + opinionValue;
              const totalCost = polyInitial + opinionInitial;
              const pnlColor = totalPnl >= 0 ? "text-profit" : "text-loss";

              const combinedEntrySpread = Math.abs(polyEntryPrice - opinionEntryPrice);
              const combinedCurSpread = Math.abs(polyCurPrice - opinionCurPrice);

              const todayYesNo = polyCurPrice + opinionCurPrice;
              const opinionFeeRate = parseFloat(m.opinion.feeRate || m.opinion.tradeFeeRate || "0");
              const opinionFee = opinionFeeRate > 0 ? opinionValue * opinionFeeRate : 0;
              const netValue = totalValue - opinionFee;
              const netPnl = netValue - totalCost;
              const yieldPct = totalCost > 0 ? (netPnl / totalCost) * 100 : 0;
              const isSellSignal = todayYesNo > 98.9;

              // Holding duration — use actual trade entry timestamp
              const entryTs = m.poly.entryTimestamp ? m.poly.entryTimestamp * 1000 : null;
              let holdingDays = 0;
              let holdingLabel = "";
              if (entryTs) {
                holdingDays = Math.max(1, Math.floor((Date.now() - entryTs) / (1000 * 60 * 60 * 24)));
                if (holdingDays < 30) holdingLabel = `${holdingDays}d`;
                else if (holdingDays < 365) holdingLabel = `${Math.floor(holdingDays / 30)}mo ${holdingDays % 30}d`;
                else holdingLabel = `${Math.floor(holdingDays / 365)}y ${Math.floor((holdingDays % 365) / 30)}mo`;
              }

              // APY = annualized yield
              const apy = holdingDays > 0 ? ((Math.pow(1 + yieldPct / 100, 365 / holdingDays) - 1) * 100) : 0;

              const cardShareData: ShareCardData = {
                title: m.matchedTitle,
                netProfit: netPnl,
                yieldPct,
                polySide: m.poly.outcome,
                polyPrice: polyCurPrice,
                opinionSide: m.opinion.outcomeSideEnum,
                opinionPrice: opinionCurPrice,
                totalCost,
                isSellSignal,
                holdingLabel,
                holdingDays,
              };

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground leading-snug flex-1 min-w-0 mr-3">
                      {m.matchedTitle}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className={`text-sm font-mono font-semibold ${pnlColor}`}>
                          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">${totalValue.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => handleShare(cardShareData)}
                        className="p-1.5 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                        title="Share card"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">
                      {(m.matchScore * 100).toFixed(0)}% match
                    </span>
                    {totalCost > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${totalPnl >= 0 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                        {totalPnl >= 0 ? "+" : ""}{yieldPct.toFixed(2)}% in {holdingDays > 0 ? `${holdingDays}d` : "—"}
                      </span>
                    )}
                    {holdingDays > 0 && totalCost > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${apy >= 0 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                        APY {apy.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Entry → Current layout */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                    {/* LEFT: Entry / Buy prices */}
                    <div className="rounded-md bg-secondary/50 p-3">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Entry Price
                      </div>

                      {/* Polymarket entry */}
                      <div className="mb-2.5 pb-2.5 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-poly" />
                          <span className="text-[10px] font-semibold text-poly uppercase">Polymarket</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Avg</span>
                            <span className="font-mono text-foreground">{polyEntryPrice.toFixed(1)}¢</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Side</span>
                            <span className={`font-mono ${m.poly.outcome === "Yes" ? "text-profit" : "text-loss"}`}>
                              {m.poly.outcome}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Shares</span>
                            <span className="font-mono text-foreground">{m.poly.size.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Cost</span>
                            <span className="font-mono text-foreground">${polyInitial.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Opinion entry */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-opinion" />
                          <span className="text-[10px] font-semibold text-opinion uppercase">Opinion</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Avg</span>
                            <span className="font-mono text-foreground">{opinionEntryPrice.toFixed(1)}¢</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Side</span>
                            <span className={`font-mono ${m.opinion.outcomeSideEnum === "Yes" ? "text-profit" : "text-loss"}`}>
                              {m.opinion.outcomeSideEnum}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Shares</span>
                            <span className="font-mono text-foreground">
                              {parseFloat(m.opinion.sharesOwned || "0").toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Cost</span>
                            <span className="font-mono text-foreground">${opinionInitial.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Entry Yes+No cost */}
                      <div className="mt-2.5 pt-2 border-t border-border">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-semibold">YES+NO =</span>
                          <span className="font-mono font-semibold text-foreground">
                            {(polyEntryPrice + opinionEntryPrice).toFixed(1)}¢
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="font-mono text-foreground">${totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center justify-center gap-1">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>

                    {/* RIGHT: Current prices */}
                    <div className="rounded-md bg-secondary/50 p-3">
                      <div className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Current Price
                      </div>

                      {/* Polymarket current */}
                      <div className="mb-2.5 pb-2.5 border-b border-border">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-poly" />
                          <span className="text-[10px] font-semibold text-poly uppercase">Polymarket</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-mono text-foreground">{polyCurPrice.toFixed(1)}¢</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-mono text-foreground">${polyValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">P&L</span>
                            <span className={`font-mono ${polyPnl >= 0 ? "text-profit" : "text-loss"}`}>
                              {polyPnl >= 0 ? "+" : ""}${polyPnl.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Opinion current */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-opinion" />
                          <span className="text-[10px] font-semibold text-opinion uppercase">Opinion</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Last Price</span>
                            <span className="font-mono text-foreground">{opinionLastPrice.toFixed(1)}¢</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-mono text-foreground">${opinionValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">P&L</span>
                            <span className={`font-mono ${opinionPnl >= 0 ? "text-profit" : "text-loss"}`}>
                              {opinionPnl >= 0 ? "+" : ""}${opinionPnl.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Current Yes+No + fees + sell signal */}
                      {(() => {
                        const todayYesNo = polyCurPrice + opinionCurPrice;
                        const opinionFeeRate = parseFloat(m.opinion.feeRate || m.opinion.tradeFeeRate || "0");
                        const opinionFee = opinionFeeRate > 0 ? opinionValue * opinionFeeRate : 0;
                        const totalFees = opinionFee;
                        const netValue = totalValue - totalFees;
                        const netPnl = netValue - totalCost;
                        const isSellSignal = todayYesNo > 98.9;
                        return (
                          <div className="mt-2.5 pt-2 border-t border-border">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground font-semibold">YES+NO =</span>
                              <span className={`font-mono font-semibold ${isSellSignal ? "text-profit" : "text-foreground"}`}>
                                {todayYesNo.toFixed(1)}¢
                              </span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-muted-foreground">Total Value</span>
                              <span className="font-mono text-foreground">${totalValue.toFixed(2)}</span>
                            </div>
                            {opinionFee > 0 && (
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-opinion text-[10px]">Opinion Fee ({(opinionFeeRate * 100).toFixed(1)}%)</span>
                                <span className="font-mono text-loss text-[10px]">-${opinionFee.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs mt-1 pt-1 border-t border-border/50">
                              <span className="text-muted-foreground font-semibold">Net</span>
                              <span className={`font-mono font-semibold ${netPnl >= 0 ? "text-profit" : "text-loss"}`}>
                                ${netValue.toFixed(2)} ({netPnl >= 0 ? "+" : ""}${netPnl.toFixed(2)})
                              </span>
                            </div>
                            {isSellSignal && (
                              <div className="mt-2 rounded-md bg-profit/15 border border-profit/30 px-3 py-2 text-center">
                                <span className="text-xs font-semibold text-profit font-mono">
                                  🔔 SELL — YES+NO &gt; 98.9¢
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(unmatchedPoly.length > 0 || unmatchedOpinion.length > 0) && (
        <div className="flex items-center gap-2 mb-3">
          <Unlink className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {unmatchedPoly.length} unmatched Polymarket · {unmatchedOpinion.length} unmatched Opinion
          </span>
        </div>
      )}
      {/* Offscreen share card for screenshot capture */}
      {shareData && (
        <div className="fixed -left-[9999px] top-0" ref={shareRef}>
          <ShareCard data={shareData} />
        </div>
      )}
    </div>
  );
};

export default ArbitrageCards;
