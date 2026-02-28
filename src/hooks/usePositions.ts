import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RawPolyPosition {
  asset: string;
  conditionId: string;
  curPrice: number;
  endDate: string;
  eventSlug: string;
  groupSlug: string;
  initialValue: number;
  market: string;
  marketSlug: string;
  outcome: string;
  outcomeIndex: number;
  percentChange: number;
  proxyWallet: string;
  question: string;
  size: number;
  startDate: string;
  title: string;
  entryTimestamp?: number; // Unix timestamp of first buy trade
}

export interface MatchedPosition {
  id: string;
  matchScore: number;
  matchedTitle: string;
  poly: RawPolyPosition;
  opinion: any;
}

export interface FetchResult {
  polyPositions: RawPolyPosition[];
  opinionPositions: any[];
  matchedPositions: MatchedPosition[];
  errors: string[];
}

export const usePositions = () => {
  const [polyWallet, setPolyWallet] = useState(() => localStorage.getItem("polyWallet") || "");
  const [opinionWallet, setOpinionWallet] = useState(() => localStorage.getItem("opinionWallet") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveWallets = useCallback((poly: string, opinion: string) => {
    localStorage.setItem("polyWallet", poly);
    localStorage.setItem("opinionWallet", opinion);
    setPolyWallet(poly);
    setOpinionWallet(opinion);
  }, []);

  const scanPositions = useCallback(async (poly?: string, opinion?: string) => {
    const pWallet = poly ?? polyWallet;
    const oWallet = opinion ?? opinionWallet;

    if (!pWallet && !oWallet) {
      setError("Please enter at least one wallet address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("fetch-positions", {
        body: { polyWallet: pWallet, opinionWallet: oWallet },
      });

      if (fnError) {
        setError(fnError.message);
        return;
      }

      setResult(data as FetchResult);
      if (data?.errors?.length) {
        console.warn("Position fetch warnings:", data.errors);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  }, [polyWallet, opinionWallet]);

  return {
    polyWallet,
    opinionWallet,
    setPolyWallet,
    setOpinionWallet,
    saveWallets,
    scanPositions,
    loading,
    result,
    error,
  };
};
