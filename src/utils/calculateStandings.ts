import { Team, Match, Standing } from "@/lib/types";

/**
 * Determine the winner of a match based on sets won (best of 3).
 */
function getMatchWinner(
  match: Match
): { winnerId: number; loserId: number; setsT1: number; setsT2: number } | null {
  if (!match.set_scores || !match.team1_id || !match.team2_id) return null;

  let setsT1 = 0;
  let setsT2 = 0;

  for (const s of match.set_scores) {
    if (s.team1_score === 0 && s.team2_score === 0) continue;
    if (s.team1_score > s.team2_score) setsT1++;
    else if (s.team2_score > s.team1_score) setsT2++;
  }

  if (setsT1 >= 2)
    return { winnerId: match.team1_id, loserId: match.team2_id, setsT1, setsT2 };
  if (setsT2 >= 2)
    return { winnerId: match.team2_id, loserId: match.team1_id, setsT1, setsT2 };
  return null;
}

/**
 * Calculate group standings with full tie-breaker hierarchy:
 * 1. Points (2 per win)
 * 2. Net Sets (sets won - sets lost)
 * 3. Net Points (points scored - points conceded)
 * 4. Head-to-Head
 *
 * Single pass through matches for both standings and h2h.
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  groupName: "A" | "B"
): Standing[] {
  const groupTeams = teams.filter((t) => t.group_name === groupName);
  const groupMatches = matches.filter(
    (m) => m.group_name === groupName && m.round === "league"
  );

  const standingsMap = new Map<number, Standing>();
  // Build h2h in the same loop as standings
  const h2h = new Map<string, number>();

  for (const team of groupTeams) {
    standingsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      setsWon: 0,
      setsLost: 0,
      netSets: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      netPoints: 0,
    });
  }

  for (const match of groupMatches) {
    if (!match.team1_id || !match.team2_id || !match.set_scores) continue;

    const result = getMatchWinner(match);
    if (!result) continue;

    const s1 = standingsMap.get(match.team1_id);
    const s2 = standingsMap.get(match.team2_id);
    if (!s1 || !s2) continue;

    s1.played++;
    s2.played++;

    s1.setsWon += result.setsT1;
    s1.setsLost += result.setsT2;
    s2.setsWon += result.setsT2;
    s2.setsLost += result.setsT1;

    for (const setScore of match.set_scores) {
      s1.pointsFor += setScore.team1_score;
      s1.pointsAgainst += setScore.team2_score;
      s2.pointsFor += setScore.team2_score;
      s2.pointsAgainst += setScore.team1_score;
    }

    if (result.winnerId === match.team1_id) {
      s1.won++;
      s1.points += 2;
      s2.lost++;
    } else {
      s2.won++;
      s2.points += 2;
      s1.lost++;
    }

    // H2H — built in same loop
    h2h.set(`${result.winnerId}-${result.loserId}`, 1);
  }

  // Compute net values and sort
  const standings = Array.from(standingsMap.values()).map((s) => ({
    ...s,
    netSets: s.setsWon - s.setsLost,
    netPoints: s.pointsFor - s.pointsAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.netSets !== a.netSets) return b.netSets - a.netSets;
    if (b.netPoints !== a.netPoints) return b.netPoints - a.netPoints;
    if (h2h.has(`${a.team.id}-${b.team.id}`)) return -1;
    if (h2h.has(`${b.team.id}-${a.team.id}`)) return 1;
    return 0;
  });

  return standings;
}

/**
 * Determine semi-final matchups from standings.
 * SF1: A1 vs B2, SF2: B1 vs A2
 */
export function getSemiFinalsTeams(
  standingsA: Standing[],
  standingsB: Standing[]
): {
  sf1: { team1: Team | null; team2: Team | null };
  sf2: { team1: Team | null; team2: Team | null };
} {
  return {
    sf1: {
      team1: standingsA[0]?.team ?? null,
      team2: standingsB[1]?.team ?? null,
    },
    sf2: {
      team1: standingsB[0]?.team ?? null,
      team2: standingsA[1]?.team ?? null,
    },
  };
}
