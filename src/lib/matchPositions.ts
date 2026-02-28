import { RawPolyPosition } from "@/hooks/usePositions";

export interface MatchedPosition {
  id: string;
  matchScore: number;
  matchedTitle: string;
  poly: RawPolyPosition;
  opinion: any;
  priceSpread: number; // difference in cents
}

export interface UnmatchedPosition {
  source: "polymarket" | "opinion";
  position: any;
}

export interface MatchResult {
  matched: MatchedPosition[];
  unmatchedPoly: RawPolyPosition[];
  unmatchedOpinion: any[];
}

/** Normalize a title for comparison: lowercase, strip punctuation, collapse whitespace */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''""]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract meaningful words (3+ chars, no stop words) */
function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "it", "its", "are", "was", "were", "be",
    "been", "will", "would", "could", "should", "has", "have", "had",
    "this", "that", "these", "those", "from", "than", "before", "after",
  ]);
  const words = normalize(text).split(" ");
  return new Set(words.filter((w) => w.length >= 3 && !stopWords.has(w)));
}

/** Jaccard similarity between two keyword sets */
function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const MATCH_THRESHOLD = 0.35;

export function matchPositions(
  polyPositions: RawPolyPosition[],
  opinionPositions: any[]
): MatchResult {
  const matched: MatchedPosition[] = [];
  const usedPoly = new Set<number>();
  const usedOpinion = new Set<number>();

  // Pre-compute keywords
  const polyKeywords = polyPositions.map((p) =>
    extractKeywords((p.title || "") + " " + (p.question || "") + " " + (p.market || ""))
  );
  const opinionKeywords = opinionPositions.map((o) =>
    extractKeywords((o.rootMarketTitle || "") + " " + (o.marketTitle || ""))
  );

  // Build similarity matrix and greedily match best pairs
  const pairs: { pi: number; oi: number; score: number }[] = [];

  for (let pi = 0; pi < polyPositions.length; pi++) {
    for (let oi = 0; oi < opinionPositions.length; oi++) {
      const score = similarity(polyKeywords[pi], opinionKeywords[oi]);
      if (score >= MATCH_THRESHOLD) {
        pairs.push({ pi, oi, score });
      }
    }
  }

  // Sort descending by score for greedy matching
  pairs.sort((a, b) => b.score - a.score);

  for (const { pi, oi, score } of pairs) {
    if (usedPoly.has(pi) || usedOpinion.has(oi)) continue;
    usedPoly.add(pi);
    usedOpinion.add(oi);

    const poly = polyPositions[pi];
    const opinion = opinionPositions[oi];

    const polyPriceCents = poly.curPrice * 100;
    const opinionPriceCents = parseFloat(opinion.currentPrice || opinion.avgEntryPrice || "0") * 100;

    matched.push({
      id: `match-${pi}-${oi}`,
      matchScore: score,
      matchedTitle: poly.title || poly.question || opinion.rootMarketTitle,
      poly,
      opinion,
      priceSpread: Math.abs(polyPriceCents - opinionPriceCents),
    });
  }

  const unmatchedPoly = polyPositions.filter((_, i) => !usedPoly.has(i));
  const unmatchedOpinion = opinionPositions.filter((_, i) => !usedOpinion.has(i));

  return { matched, unmatchedPoly, unmatchedOpinion };
}
