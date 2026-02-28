import marketMatches from "./market_matches.json" with { type: "json" };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Build lookup maps from the embedded matching table
// market_a_title = Polymarket title, market_b_from_title = Opinion title
interface MatchEntry { market_a_title: string; market_b_from_title: string }

function normalize(s: string): string {
  return s.toLowerCase().replace(/[''""]/g, "'").replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}

// Build maps: normalized title -> match group index
// We index both the full title AND the base title (before " - " suffix) for flexible matching
const polyToGroup = new Map<string, number>();
const opinionToGroup = new Map<string, number>();

(marketMatches as MatchEntry[]).forEach((entry, idx) => {
  const normA = normalize(entry.market_a_title);
  const normB = normalize(entry.market_b_from_title);
  polyToGroup.set(normA, idx);
  opinionToGroup.set(normB, idx);

  // Index progressively shorter base parts before " - " for flexible matching
  // Only set if no collision (avoid overwriting a different group's entry)
  let remainA = entry.market_a_title;
  while (true) {
    const dashIdx = remainA.lastIndexOf(" - ");
    if (dashIdx <= 0) break;
    remainA = remainA.substring(0, dashIdx);
    const normRemA = normalize(remainA);
    if (!polyToGroup.has(normRemA)) {
      polyToGroup.set(normRemA, idx);
    }
  }

  let remainB = entry.market_b_from_title;
  while (true) {
    const dashIdx = remainB.lastIndexOf(" - ");
    if (dashIdx <= 0) break;
    remainB = remainB.substring(0, dashIdx);
    const normRemB = normalize(remainB);
    if (!opinionToGroup.has(normRemB)) {
      opinionToGroup.set(normRemB, idx);
    }
  }
});

/** Try multiple title constructions from a poly position to find a match group */
function findPolyGroup(pos: any): number | null {
  const candidates = [
    pos.title,
    pos.question,
    pos.market,
    pos.title && pos.outcome ? `${pos.title} - ${pos.outcome}` : null,
    pos.question && pos.outcome ? `${pos.question} - ${pos.outcome}` : null,
    pos.market && pos.outcome ? `${pos.market} - ${pos.outcome}` : null,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const g = polyToGroup.get(normalize(c));
    if (g !== undefined) return g;
  }
  return null;
}

/** Try multiple title constructions from an opinion position to find a match group */
function findOpinionGroup(pos: any): number | null {
  const candidates = [
    pos.rootMarketTitle && pos.marketTitle ? `${pos.rootMarketTitle} - ${pos.marketTitle}` : null,
    pos.rootMarketTitle,
    pos.marketTitle,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const g = opinionToGroup.get(normalize(c));
    if (g !== undefined) return g;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { polyWallet, opinionWallet } = await req.json();

    const results: { polyPositions: any[]; opinionPositions: any[]; matchedPositions: any[]; errors: string[] } = {
      polyPositions: [],
      opinionPositions: [],
      matchedPositions: [],
      errors: [],
    };

    // Fetch Polymarket positions (public API, no key needed)
    if (polyWallet) {
      try {
        const polyUrl = `https://data-api.polymarket.com/positions?user=${encodeURIComponent(polyWallet)}`;
        console.log('Fetching Polymarket positions:', polyUrl);
        const polyRes = await fetch(polyUrl);
        if (!polyRes.ok) {
          const errText = await polyRes.text();
          results.errors.push(`Polymarket API error (${polyRes.status}): ${errText}`);
        } else {
          const polyData = await polyRes.json();
          results.polyPositions = Array.isArray(polyData) ? polyData : [];
          console.log(`Found ${results.polyPositions.length} Polymarket positions`);

          // Fetch activity to get actual entry dates per conditionId
          if (results.polyPositions.length > 0) {
            try {
              const activityUrl = `https://data-api.polymarket.com/activity?user=${encodeURIComponent(polyWallet)}&type=TRADE&side=BUY&sortBy=TIMESTAMP&sortDirection=ASC&limit=500`;
              console.log('Fetching Polymarket activity:', activityUrl);
              const activityRes = await fetch(activityUrl);
              if (activityRes.ok) {
                const activityData = await activityRes.json();
                const entryDates: Record<string, number> = {};
                if (Array.isArray(activityData)) {
                  for (const trade of activityData) {
                    const cid = trade.conditionId;
                    const ts = trade.timestamp;
                    if (cid && ts && (!entryDates[cid] || ts < entryDates[cid])) {
                      entryDates[cid] = ts;
                    }
                  }
                }
                for (const pos of results.polyPositions) {
                  if (pos.conditionId && entryDates[pos.conditionId]) {
                    pos.entryTimestamp = entryDates[pos.conditionId];
                  }
                }
                console.log(`Mapped entry dates for ${Object.keys(entryDates).length} conditions`);
              }
            } catch (e) {
              console.warn('Failed to fetch activity data:', e);
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        results.errors.push(`Polymarket fetch failed: ${msg}`);
        console.error('Polymarket fetch error:', e);
      }
    }

    // Fetch Opinion positions (requires API key)
    if (opinionWallet) {
      const opinionApiKey = Deno.env.get('OPINION_API_KEY');
      if (!opinionApiKey) {
        results.errors.push('OPINION_API_KEY not configured');
      } else {
        try {
          const opinionUrl = `https://openapi.opinion.trade/openapi/positions/user/${encodeURIComponent(opinionWallet)}`;
          console.log('Fetching Opinion positions:', opinionUrl);
          const opinionRes = await fetch(opinionUrl, {
            headers: { 'apikey': opinionApiKey },
          });
          if (!opinionRes.ok) {
            const errText = await opinionRes.text();
            results.errors.push(`Opinion API error (${opinionRes.status}): ${errText}`);
          } else {
            const opinionData = await opinionRes.json();
            results.opinionPositions = opinionData?.result?.list || opinionData?.result || [];
            console.log(`Found ${results.opinionPositions.length} Opinion positions`);

            // Fetch latest traded price for each position
            const priceFetches = results.opinionPositions.map(async (pos: any) => {
              if (!pos.tokenId) return;
              try {
                const priceUrl = `https://openapi.opinion.trade/openapi/token/latest-price?token_id=${encodeURIComponent(pos.tokenId)}`;
                const priceRes = await fetch(priceUrl, { headers: { 'apikey': opinionApiKey } });
                if (priceRes.ok) {
                  const priceData = await priceRes.json();
                  const price = priceData?.result?.price;
                  if (price) {
                    pos.latestPrice = price;
                    console.log(`Set latestPrice=${price} for ${pos.marketTitle}`);
                  }
                } else {
                  await priceRes.text(); // consume body
                }
              } catch (e) {
                console.warn(`Failed to fetch latest price for ${pos.marketTitle}:`, e);
              }
            });
            await Promise.all(priceFetches);
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          results.errors.push(`Opinion fetch failed: ${msg}`);
          console.error('Opinion fetch error:', e);
        }
      }
    }

    // --- Server-side matching using the lookup table ---
    if (results.polyPositions.length > 0 && results.opinionPositions.length > 0) {
      // Build map: group index -> poly positions
      const polyByGroup = new Map<number, any[]>();
      const unmatchedPolyIdxs = new Set<number>();

      results.polyPositions.forEach((pos, idx) => {
        const g = findPolyGroup(pos);
        if (g !== null) {
          if (!polyByGroup.has(g)) polyByGroup.set(g, []);
          polyByGroup.get(g)!.push({ pos, idx });
        } else {
          unmatchedPolyIdxs.add(idx);
        }
      });

      // Build map: group index -> opinion positions
      const opinionByGroup = new Map<number, any[]>();
      const unmatchedOpinionIdxs = new Set<number>();

      results.opinionPositions.forEach((pos, idx) => {
        const g = findOpinionGroup(pos);
        if (g !== null) {
          if (!opinionByGroup.has(g)) opinionByGroup.set(g, []);
          opinionByGroup.get(g)!.push({ pos, idx });
        } else {
          unmatchedOpinionIdxs.add(idx);
        }
      });

      // Match: pair poly and opinion positions that share the same group
      const usedPolyIdxs = new Set<number>();
      const usedOpinionIdxs = new Set<number>();

      for (const [groupIdx, polyEntries] of polyByGroup) {
        const opinionEntries = opinionByGroup.get(groupIdx);
        if (!opinionEntries) continue;

        // Pair 1:1 (first available from each side)
        for (const pe of polyEntries) {
          for (const oe of opinionEntries) {
            if (usedPolyIdxs.has(pe.idx) || usedOpinionIdxs.has(oe.idx)) continue;
            usedPolyIdxs.add(pe.idx);
            usedOpinionIdxs.add(oe.idx);

            const matchEntry = (marketMatches as MatchEntry[])[groupIdx];
            results.matchedPositions.push({
              id: `match-${pe.idx}-${oe.idx}`,
              matchScore: 1.0, // exact lookup match
              matchedTitle: pe.pos.title || pe.pos.question || matchEntry.market_a_title,
              poly: pe.pos,
              opinion: oe.pos,
            });
            break;
          }
        }
      }

      // Tag unmatched positions (positions not in any match)
      const finalUnmatchedPoly = results.polyPositions.filter((_, i) => !usedPolyIdxs.has(i));
      const finalUnmatchedOpinion = results.opinionPositions.filter((_, i) => !usedOpinionIdxs.has(i));

      // Replace raw lists with only unmatched ones (matched are in matchedPositions)
      results.polyPositions = finalUnmatchedPoly;
      results.opinionPositions = finalUnmatchedOpinion;

      console.log(`Matched ${results.matchedPositions.length} pairs, ${finalUnmatchedPoly.length} unmatched poly, ${finalUnmatchedOpinion.length} unmatched opinion`);
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-positions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch positions';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
