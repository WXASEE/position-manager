import { TrendingUp, TrendingDown } from "lucide-react";
import polarlystLogo from "@/assets/polarlyst-logo.png";

export interface ShareCardData {
  title: string;
  netProfit: number;
  yieldPct: number;
  polySide: string;
  polyPrice: number;
  opinionSide: string;
  opinionPrice: number;
  totalCost: number;
  isSellSignal: boolean;
  holdingLabel: string;
  holdingDays: number;
}

interface ShareCardProps {
  data: ShareCardData;
}

const clampSide = (s: string) => ((s || "").trim().toLowerCase() === "yes" ? "Yes" : "No");

const ShareCard = ({ data }: ShareCardProps) => {
  const sidePoly = clampSide(data.polySide);
  const sideOpinion = clampSide(data.opinionSide);

  const isPositive = data.netProfit >= 0;
  const profitAbs = Math.abs(data.netProfit);

  const apy =
    data.holdingDays > 0 ? (Math.pow(1 + data.yieldPct / 100, 365 / Math.max(1, data.holdingDays)) - 1) * 100 : 0;

  const profitColor = isPositive ? "text-emerald-400" : "text-rose-400";
  const profitGlow = isPositive ? "shadow-emerald-500/20" : "shadow-rose-500/20";
  const badgeYes = "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25";
  const badgeNo = "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25";

  const SignalIcon = data.isSellSignal ? TrendingDown : TrendingUp;

  return (
    <div className="w-[420px] rounded-[28px] overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-black" />
      <div className="absolute inset-0">
        {/* subtle radial glows */}
        <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)]" />
      </div>

      <div className="relative p-6 pt-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {/* FIXED: centered badge */}
          <div className="inline-flex items-center justify-center gap-1.5 h-6 px-3 rounded-lg bg-white/5 ring-1 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[8px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Arbitrage Signal
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-60">
            <img src={polarlystLogo} alt="Polarlyst" className="h-4" />
          </div>
        </div>

        {/* Title */}
        <div className="text-[18px] leading-snug font-semibold text-slate-100/95 mb-6">{data.title}</div>

        {/* Net Profit */}
        <div className="text-center mb-3">
          <div className="font-mono text-[11px] font-extrabold tracking-[0.22em] text-slate-400 uppercase">
            Net Profit
          </div>
        </div>

        <div className="text-center mb-5">
          <div className="inline-flex items-end gap-2">
            <span className={`font-mono text-[22px] font-black ${profitColor} opacity-80`}>$</span>
            <span
              className={[
                "font-mono text-[48px] leading-none font-black tracking-[-0.04em]",
                profitColor,
                "drop-shadow",
              ].join(" ")}
            >
              {profitAbs.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400/90">
            {data.holdingDays > 0 ? `${data.holdingDays}d holding` : ""}
          </div>
        </div>

        {/* Yield pill */}
        <div className="flex justify-center mb-6">
          <div
            className={[
              "inline-flex items-center gap-3 rounded-full px-4 py-3",
              "bg-white/6 ring-1 ring-white/12 backdrop-blur",
              "shadow-lg",
              profitGlow,
            ].join(" ")}
          >
            <SignalIcon className={["h-4 w-4", isPositive ? "text-emerald-300" : "text-rose-300"].join(" ")} />

            <div className="flex items-baseline gap-2">
              <span className={["font-mono text-sm font-extrabold", profitColor].join(" ")}>
                {data.yieldPct >= 0 ? "+" : ""}
                {data.yieldPct.toFixed(2)}%
              </span>
              <span className="text-sm font-semibold text-slate-200/80">Yield</span>
            </div>

            <span className="h-4 w-px bg-white/12" />

            <span className="font-mono text-[12px] font-bold tracking-wide text-slate-300/80 uppercase">
              {data.holdingDays > 0 ? `APY ${apy.toFixed(1)}%` : "RISK FREE"}
            </span>
          </div>
        </div>

        {/* Market cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Polymarket */}
          <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-full bg-emerald-400/90 shadow-[0_0_24px_rgba(52,211,153,0.35)]" />

              {/* FIXED: YES/NO centered */}
              <span
                className={[
                  "inline-flex items-center justify-center",
                  "h-5 min-w-[28px] px-2 rounded",
                  "text-[9px] font-bold uppercase tracking-wide",
                  sidePoly === "Yes" ? badgeYes : badgeNo,
                ].join(" ")}
              >
                {sidePoly}
              </span>
            </div>

            <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-1">Polymarket</div>

            <div className="flex items-end gap-1">
              <span className="font-mono text-[32px] font-black text-slate-100 leading-none">
                {data.polyPrice.toFixed(1)}
              </span>
              <span className="font-mono text-[18px] font-bold text-slate-400/80 pb-[2px]">¢</span>
            </div>
          </div>

          {/* Opinion */}
          <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-full bg-sky-400/90 shadow-[0_0_24px_rgba(56,189,248,0.30)]" />

              {/* FIXED: YES/NO centered */}
              <span
                className={[
                  "inline-flex items-center justify-center",
                  "h-5 min-w-[28px] px-2 rounded",
                  "text-[9px] font-bold uppercase tracking-wide",
                  sideOpinion === "Yes" ? badgeYes : badgeNo,
                ].join(" ")}
              >
                {sideOpinion}
              </span>
            </div>

            <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-1">Opinion</div>

            <div className="flex items-end gap-1">
              <span className="font-mono text-[32px] font-black text-slate-100 leading-none">
                {data.opinionPrice.toFixed(1)}
              </span>
              <span className="font-mono text-[18px] font-bold text-slate-400/80 pb-[2px]">¢</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-[11px] text-slate-500/80">
          Prices are snapshots • Not financial advice
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
