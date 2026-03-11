import { supabase } from "./supabase";
import { Team, Match, SetScore } from "./types";

/**
 * Fetch all tournament data in 3 parallel queries,
 * then join set_scores to matches using a Map (O(n) instead of O(n*m)).
 */
export async function fetchTournamentData(): Promise<{
  teams: Team[];
  matches: Match[];
}> {
  const [teamsRes, matchesRes, scoresRes] = await Promise.all([
    supabase.from("teams").select("*").order("team_number"),
    supabase.from("matches").select("*").order("match_number"),
    supabase.from("set_scores").select("*").order("set_number"),
  ]);

  const teams: Team[] = teamsRes.data ?? [];

  if (!matchesRes.data || !scoresRes.data) {
    return { teams, matches: [] };
  }

  // Group scores by match_id using a Map — O(n)
  const scoresByMatch = new Map<number, SetScore[]>();
  for (const s of scoresRes.data) {
    const existing = scoresByMatch.get(s.match_id);
    if (existing) {
      existing.push(s);
    } else {
      scoresByMatch.set(s.match_id, [s]);
    }
  }

  // Join in O(n)
  const matches: Match[] = matchesRes.data.map((m) => ({
    ...m,
    set_scores: scoresByMatch.get(m.id) ?? [],
  }));

  return { teams, matches };
}
