export interface Position {
  id: string;
  market: string;
  subtitle: string;
  sharesYes: number;
  sharesNo: number;
  avgPrice: number;
  nowPrice: number;
  paid: number;
  askPnl: number;
  askPnlPct: number;
  bidPnl: number;
  bidPnlPct: number;
  optimalPnl: number;
  optimalPnlPct: number;
  isHedged: boolean;
  polyShares: number;
  polySide: "Yes" | "No";
  polyAvg: number;
  polyNow: number;
  polyPaid: number;
  polyBestAsk: number;
  polyBestAskDepth: string;
  polyBestBid: number;
  polyBestBidDepth: string;
  polyAskPnl: number;
  polyBidPnl: number;
  opinionShares: number;
  opinionSide: "Yes" | "No";
  opinionAvg: number;
  opinionNow: number;
  opinionPaid: number;
  opinionBestAsk: number;
  opinionBestAskDepth: string;
  opinionBestBid: number;
  opinionBestBidDepth: string;
  opinionAskPnl: number;
  opinionBidPnl: number;
}

export interface ExitStrategy {
  label: string;
  isBest: boolean;
  combinedPrice: number;
  combinedPriceBreakdown: string;
  pnl: number;
  roi: number;
  polyPrice: number;
  polyType: "LIMIT" | "MARKET";
  polySharesToSell: number;
  polyTotalValue: number;
  opinionPrice: number;
  opinionType: "LIMIT" | "MARKET";
  opinionSharesToSell: number;
  opinionTotalValue: number;
  estFees: number;
  feesLabel: string;
}

export const mockPositions: Position[] = [
  {
    id: "1",
    market: "Will Chong Won-oh win the 2026 Seoul Mayoral Election",
    subtitle: "2026 Seoul Mayoral Election Winner - Chong Won-oh",
    sharesYes: 760, sharesNo: 757,
    avgPrice: 96, nowPrice: 99.3, paid: 728.61,
    askPnl: 32.88, askPnlPct: 4.51, bidPnl: 16.92, bidPnlPct: 2.32,
    optimalPnl: 26.67, optimalPnlPct: 3.66,
    isHedged: true,
    polyShares: 760, polySide: "Yes", polyAvg: 96, polyNow: 99.3, polyPaid: 728.61,
    polyBestAsk: 495.50, polyBestAskDepth: "@ 13.9c", polyBestBid: 70.80, polyBestBidDepth: "@ 11.8c",
    polyAskPnl: -9.18, polyBidPnl: -21.78,
    opinionShares: 757, opinionSide: "No", opinionAvg: 80.8, opinionNow: 83.6, opinionPaid: 464.75,
    opinionBestAsk: 495.50, opinionBestAskDepth: "@ 96.3c", opinionBestBid: 466.73, opinionBestBidDepth: "@ 81.1c",
    opinionAskPnl: 30.75, opinionBidPnl: 1.97,
  },
  {
    id: "2",
    market: "Will One Battle After Another win Best Film Editing at the 98th Academy Awards?",
    subtitle: "Oscars 2026: Best Film Editing Winner - One Battle After Another",
    sharesYes: 730, sharesNo: 740,
    avgPrice: 96.5, nowPrice: 97, paid: 708.36,
    askPnl: 22.41, askPnlPct: 3.16, bidPnl: -14.83, bidPnlPct: -2.09,
    optimalPnl: 16.66, optimalPnlPct: 2.35,
    isHedged: false,
    polyShares: 730, polySide: "Yes", polyAvg: 96.5, polyNow: 97, polyPaid: 708.36,
    polyBestAsk: 83.40, polyBestAskDepth: "@ 13.9c", polyBestBid: 70.80, polyBestBidDepth: "@ 11.8c",
    polyAskPnl: -9.18, polyBidPnl: -21.78,
    opinionShares: 740, opinionSide: "No", opinionAvg: 80.8, opinionNow: 83.6, opinionPaid: 464.75,
    opinionBestAsk: 495.50, opinionBestAskDepth: "@ 96.3c", opinionBestBid: 466.73, opinionBestBidDepth: "@ 81.1c",
    opinionAskPnl: 30.75, opinionBidPnl: 1.97,
  },
  {
    id: "3",
    market: "Will Bilibili Gaming win the LPL 2026 season?",
    subtitle: "LoL: LPL 2026 Season Winner - Bilibili Gaming",
    sharesYes: 510, sharesNo: 511,
    avgPrice: 96.3, nowPrice: 98.6, paid: 491.54,
    askPnl: 16.92, askPnlPct: 3.44, bidPnl: -8.21, bidPnlPct: -1.67,
    optimalPnl: 9.59, optimalPnlPct: 1.95,
    isHedged: true,
    polyShares: 510, polySide: "Yes", polyAvg: 96.3, polyNow: 98.6, polyPaid: 491.54,
    polyBestAsk: 83.40, polyBestAskDepth: "@ 13.9c", polyBestBid: 70.80, polyBestBidDepth: "@ 11.8c",
    polyAskPnl: -9.18, polyBidPnl: -21.78,
    opinionShares: 511, opinionSide: "No", opinionAvg: 80.8, opinionNow: 83.6, opinionPaid: 464.75,
    opinionBestAsk: 495.50, opinionBestAskDepth: "@ 96.3c", opinionBestBid: 466.73, opinionBestBidDepth: "@ 81.1c",
    opinionAskPnl: 30.75, opinionBidPnl: 1.97,
  },
  {
    id: "4",
    market: "Trump out as President before 2027?",
    subtitle: "Trump out as President before 2027?",
    sharesYes: 1037, sharesNo: 1014,
    avgPrice: 96.5, nowPrice: 97, paid: 997.88,
    askPnl: 10.38, askPnlPct: 1.04, bidPnl: -1.01, bidPnlPct: -0.10,
    optimalPnl: 8.27, optimalPnlPct: 0.83,
    isHedged: true,
    polyShares: 1037, polySide: "Yes", polyAvg: 96.5, polyNow: 97, polyPaid: 997.88,
    polyBestAsk: 83.40, polyBestAskDepth: "@ 13.9c", polyBestBid: 70.80, polyBestBidDepth: "@ 11.8c",
    polyAskPnl: -9.18, polyBidPnl: -21.78,
    opinionShares: 1014, opinionSide: "No", opinionAvg: 80.8, opinionNow: 83.6, opinionPaid: 464.75,
    opinionBestAsk: 495.50, opinionBestAskDepth: "@ 96.3c", opinionBestBid: 466.73, opinionBestBidDepth: "@ 81.1c",
    opinionAskPnl: 30.75, opinionBidPnl: 1.97,
  },
  {
    id: "5",
    market: "Will Marty Supreme win Best Film Editing at the 98th Academy Awards?",
    subtitle: "Oscars 2026: Best Film Editing Winner - Marty Supreme",
    sharesYes: 600, sharesNo: 575,
    avgPrice: 96.2, nowPrice: 96.4, paid: 557.33,
    askPnl: 21.57, askPnlPct: 3.87, bidPnl: -19.81, bidPnlPct: -3.55,
    optimalPnl: 7.12, optimalPnlPct: 1.28,
    isHedged: true,
    polyShares: 600, polySide: "Yes", polyAvg: 15.4, polyNow: 12.8, polyPaid: 92.58,
    polyBestAsk: 83.40, polyBestAskDepth: "@ 13.9c", polyBestBid: 70.80, polyBestBidDepth: "@ 11.8c",
    polyAskPnl: -9.18, polyBidPnl: -21.78,
    opinionShares: 575, opinionSide: "No", opinionAvg: 80.8, opinionNow: 83.6, opinionPaid: 464.75,
    opinionBestAsk: 495.50, opinionBestAskDepth: "@ 96.3c", opinionBestBid: 466.73, opinionBestBidDepth: "@ 81.1c",
    opinionAskPnl: 30.75, opinionBidPnl: 1.97,
  },
];

export const mockExitStrategies: ExitStrategy[] = [
  {
    label: "Limit on Poly, Market on Opinion",
    isBest: false,
    combinedPrice: 89.1,
    combinedPriceBreakdown: "13.5c + 75.2c → 89.1c",
    pnl: -47.62,
    roi: -8.54,
    polyPrice: 13.9,
    polyType: "LIMIT",
    polySharesToSell: 600,
    polyTotalValue: 83.40,
    opinionPrice: 75.2,
    opinionType: "MARKET",
    opinionSharesToSell: 575,
    opinionTotalValue: 432.77,
    estFees: -6.46,
    feesLabel: "Est. Fees (Opinion)",
  },
  {
    label: "Limit on Opinion, Market on Poly",
    isBest: true,
    combinedPrice: 97.6,
    combinedPriceBreakdown: "11.5c + 86.1c → 97.6c",
    pnl: 7.12,
    roi: 1.28,
    polyPrice: 11.5,
    polyType: "MARKET",
    polySharesToSell: 600,
    polyTotalValue: 68.95,
    opinionPrice: 86.1,
    opinionType: "LIMIT",
    opinionSharesToSell: 575,
    opinionTotalValue: 495.58,
    estFees: 0,
    feesLabel: "Est. Fees (Opinion)",
  },
  {
    label: "Two Market Sells",
    isBest: false,
    combinedPrice: 86.7,
    combinedPriceBreakdown: "11.5c + 75.2c → 86.7c",
    pnl: -62.07,
    roi: -11.14,
    polyPrice: 11.5,
    polyType: "MARKET",
    polySharesToSell: 600,
    polyTotalValue: 68.95,
    opinionPrice: 75.2,
    opinionType: "MARKET",
    opinionSharesToSell: 575,
    opinionTotalValue: 432.77,
    estFees: -6.46,
    feesLabel: "Est. Fees (Opinion)",
  },
];
