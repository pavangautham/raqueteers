"use client";

import { Match, Team, Standing } from "@/lib/types";
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface FinalStandingsProps {
  standingsA: Standing[];
  standingsB: Standing[];
  matches: Match[];
  teams: Team[];
}

interface RankedTeam {
  rank: number;
  team: Team;
  tag: string; // e.g. "Champion", "Runner-up", "Semi-finalist", "Group A #3"
  standing: Standing | null;
}

export default function FinalStandings({
  standingsA,
  standingsB,
  matches,
}: FinalStandingsProps) {
  const sf1 = matches.find((m) => m.round === "semi_final" && m.match_number === 13);
  const sf2 = matches.find((m) => m.round === "semi_final" && m.match_number === 14);
  const finalMatch = matches.find((m) => m.round === "final");

  // Only show once at least one semi-final is completed
  const anySFCompleted =
    sf1?.status === "completed" || sf2?.status === "completed";
  if (!anySFCompleted) return null;

  const allStandings = [...standingsA, ...standingsB];
  const getStanding = (teamId: number) =>
    allStandings.find((s) => s.team.id === teamId) ?? null;

  const ranked: RankedTeam[] = [];

  // 1st & 2nd — from final
  if (finalMatch?.status === "completed" && finalMatch.winner_team_id) {
    const winnerId = finalMatch.winner_team_id;
    const loserId =
      finalMatch.team1_id === winnerId
        ? finalMatch.team2_id
        : finalMatch.team1_id;

    const winnerStanding = getStanding(winnerId);
    if (winnerStanding) {
      ranked.push({
        rank: 1,
        team: winnerStanding.team,
        tag: "Champion",
        standing: winnerStanding,
      });
    }

    if (loserId) {
      const loserStanding = getStanding(loserId);
      if (loserStanding) {
        ranked.push({
          rank: 2,
          team: loserStanding.team,
          tag: "Runner-up",
          standing: loserStanding,
        });
      }
    }
  }

  // 3rd & 4th — SF losers, ranked by league performance
  const sfLosers: { teamId: number; standing: Standing }[] = [];
  for (const sf of [sf1, sf2]) {
    if (sf?.status === "completed" && sf.winner_team_id) {
      const loserId =
        sf.team1_id === sf.winner_team_id ? sf.team2_id : sf.team1_id;
      if (loserId) {
        const s = getStanding(loserId);
        if (s) sfLosers.push({ teamId: loserId, standing: s });
      }
    }
  }

  // Sort SF losers by league performance: points > net sets > net points
  sfLosers.sort((a, b) => {
    if (b.standing.points !== a.standing.points)
      return b.standing.points - a.standing.points;
    if (b.standing.netSets !== a.standing.netSets)
      return b.standing.netSets - a.standing.netSets;
    return b.standing.netPoints - a.standing.netPoints;
  });

  sfLosers.forEach((sl, i) => {
    ranked.push({
      rank: ranked.length + 1,
      team: sl.standing.team,
      tag: "Semi-finalist",
      standing: sl.standing,
    });
  });

  // 5th-8th — remaining teams (group 3rd & 4th), sorted by league stats
  const rankedIds = new Set(ranked.map((r) => r.team.id));
  const remaining = allStandings
    .filter((s) => !rankedIds.has(s.team.id))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.netSets !== a.netSets) return b.netSets - a.netSets;
      return b.netPoints - a.netPoints;
    });

  remaining.forEach((s) => {
    ranked.push({
      rank: ranked.length + 1,
      team: s.team,
      tag: `Group ${s.team.group_name} #${
        (s.team.group_name === "A" ? standingsA : standingsB).findIndex(
          (st) => st.team.id === s.team.id
        ) + 1
      }`,
      standing: s,
    });
  });

  if (ranked.length === 0) return null;

  const rankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case 2:
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case 3:
        return "bg-orange-600/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-800 text-gray-500 border-gray-700";
    }
  };

  const tagStyle = (tag: string) => {
    switch (tag) {
      case "Champion":
        return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      case "Runner-up":
        return "bg-gray-400/15 text-gray-300 border-gray-400/20";
      case "Semi-finalist":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";
      default:
        return "bg-gray-800/50 text-gray-500 border-gray-700/50";
    }
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-amber-400" />;
    if (rank <= 3) return <Medal className="w-4 h-4 text-gray-400" />;
    return null;
  };

  return (
    <div className="rounded-xl bg-gray-900/80 backdrop-blur border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Overall Standings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800/50">
              <th className="text-left py-2 px-3 font-medium">#</th>
              <th className="text-left py-2 px-2 font-medium">Team</th>
              <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">Stage</th>
              <th className="text-center py-2 px-1 font-medium">P</th>
              <th className="text-center py-2 px-1 font-medium">W</th>
              <th className="text-center py-2 px-1 font-medium">L</th>
              <th className="text-center py-2 px-1 font-medium">NS</th>
              <th className="text-center py-2 px-1 font-medium">NP</th>
              <th className="text-center py-2 px-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => (
              <tr
                key={r.team.id}
                className={`border-b border-gray-800/30 transition-colors ${
                  r.rank <= 3 ? "bg-amber-500/[0.03]" : ""
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border ${rankStyle(
                        r.rank
                      )}`}
                    >
                      {r.rank}
                    </span>
                    {rankIcon(r.rank)}
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <div>
                    <span className="text-gray-200 font-medium text-xs sm:text-sm">
                      {r.team.player1} & {r.team.player2}
                    </span>
                    {/* Show tag inline on mobile since Stage column is hidden */}
                    <span
                      className={`sm:hidden ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full border ${tagStyle(
                        r.tag
                      )}`}
                    >
                      {r.tag}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2 hidden sm:table-cell">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStyle(
                      r.tag
                    )}`}
                  >
                    {r.tag}
                  </span>
                </td>
                <td className="text-center py-2.5 px-1 text-gray-400">
                  {r.standing?.played ?? 0}
                </td>
                <td className="text-center py-2.5 px-1 text-emerald-400 font-medium">
                  {r.standing?.won ?? 0}
                </td>
                <td className="text-center py-2.5 px-1 text-red-400">
                  {r.standing?.lost ?? 0}
                </td>
                <td className="text-center py-2.5 px-1">
                  <span className="inline-flex items-center gap-0.5">
                    {(r.standing?.netSets ?? 0) > 0 ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : (r.standing?.netSets ?? 0) < 0 ? (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    ) : (
                      <Minus className="w-3 h-3 text-gray-600" />
                    )}
                    <span
                      className={
                        (r.standing?.netSets ?? 0) > 0
                          ? "text-emerald-400"
                          : (r.standing?.netSets ?? 0) < 0
                          ? "text-red-400"
                          : "text-gray-500"
                      }
                    >
                      {(r.standing?.netSets ?? 0) > 0
                        ? `+${r.standing?.netSets}`
                        : r.standing?.netSets ?? 0}
                    </span>
                  </span>
                </td>
                <td className="text-center py-2.5 px-1">
                  <span
                    className={
                      (r.standing?.netPoints ?? 0) > 0
                        ? "text-emerald-400"
                        : (r.standing?.netPoints ?? 0) < 0
                        ? "text-red-400"
                        : "text-gray-500"
                    }
                  >
                    {(r.standing?.netPoints ?? 0) > 0
                      ? `+${r.standing?.netPoints}`
                      : r.standing?.netPoints ?? 0}
                  </span>
                </td>
                <td className="text-center py-2.5 px-2">
                  <span className="inline-flex items-center justify-center w-7 h-6 rounded bg-white/5 text-white font-bold text-sm">
                    {r.standing?.points ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-800/50">
        <span className="text-[10px] text-gray-600">
          Ranking: Final result &gt; Semi-final result &gt; League performance (Pts &gt; Net Sets &gt; Net Points)
        </span>
      </div>
    </div>
  );
}
