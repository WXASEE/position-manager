import PortfolioSummary from "@/components/PortfolioSummary";
import PositionsTable from "@/components/PositionsTable";
import ArbitrageCards from "@/components/ArbitrageCards";
import WalletInputs from "@/components/WalletInputs";
import { usePositions } from "@/hooks/usePositions";

const Index = () => {
  const {
    polyWallet,
    opinionWallet,
    setPolyWallet,
    setOpinionWallet,
    saveWallets,
    scanPositions,
    loading,
    result,
    error,
  } = usePositions();

  const handleScan = () => {
    saveWallets(polyWallet, opinionWallet);
    scanPositions(polyWallet, opinionWallet);
  };

  // Server now returns matchedPositions, polyPositions (unmatched), opinionPositions (unmatched)
  const matchResult = result ? {
    matched: result.matchedPositions || [],
    unmatchedPoly: result.polyPositions,
    unmatchedOpinion: result.opinionPositions,
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              Polarlyst Arbitrage Positions
              <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider border-l border-border pl-2 ml-1">
                Portfolio Manager
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time monitoring of your cross-exchange arbitrage exposures.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <WalletInputs
              polyWallet={polyWallet}
              opinionWallet={opinionWallet}
              onPolyChange={setPolyWallet}
              onOpinionChange={setOpinionWallet}
              onScan={handleScan}
              loading={loading}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-[1600px] mx-auto">
        {error && (
          <div className="mb-4 rounded-lg border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">{error}</div>
        )}

        {result && result.errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-primary space-y-1">
            {result.errors.map((e, i) => (
              <div key={i}>⚠ {e}</div>
            ))}
          </div>
        )}

        <PortfolioSummary
          matchedPositions={result?.matchedPositions || []}
        />
        {matchResult && <ArbitrageCards matchResult={matchResult} />}
        <PositionsTable
          polyPositions={matchResult?.unmatchedPoly || result?.polyPositions || []}
          opinionPositions={matchResult?.unmatchedOpinion || result?.opinionPositions || []}
          loading={loading}
          hasScanned={result !== null}
        />
      </main>
    </div>
  );
};

export default Index;
