"use client";

import { useState } from "react";
import { Standing, Match, Team } from "@/lib/types";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface StandingsTableProps {
  standings: Standing[];
  groupName: string;
  matches?: Match[];
  teamMap?: Map<number, Team>;
}

export default function StandingsTable({
  standings,
  groupName,
  matches,
  teamMap,
}: StandingsTableProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  function getTeamMatches(teamId: number): Match[] {
    if (!matches) return [];
    const teamMatches = matches.filter(
      (m) =>
        m.round === "league" &&
        (m.team1_id === teamId || m.team2_id === teamId)
    );
    // Sort: live first, then completed, then upcoming
    const order = { live: 0, completed: 1, upcoming: 2 };
    return teamMatches.sort((a, b) => order[a.status] - order[b.status]);
  }

  function getOpponentName(match: Match, teamId: number): string {
    const opponentId =
      match.team1_id === teamId ? match.team2_id : match.team1_id;
    if (!opponentId || !teamMap) return "TBD";
    const opponent = teamMap.get(opponentId);
    return opponent ? `${opponent.player1} & ${opponent.player2}` : "TBD";
  }

  function renderMatchResult(match: Match, teamId: number) {
    if (match.status === "upcoming") {
      return (
        <span className="text-gray-500 text-[11px]">Upcoming</span>
      );
    }

    if (match.status === "live") {
      return (
        <span className="flex items-center gap-1.5 text-amber-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      );
    }

    // Completed
    const won = match.winner_team_id === teamId;
    const sets = match.set_scores || [];
    const sortedSets = [...sets].sort((a, b) => a.set_number - b.set_number);

    const isTeam1 = match.team1_id === teamId;
    const setsWon = sortedSets.filter((s) =>
      isTeam1 ? s.team1_score > s.team2_score : s.team2_score > s.team1_score
    ).length;
    const setsLost = sortedSets.length - setsWon;

    const scoreStr = sortedSets
      .map((s) =>
        isTeam1
          ? `${s.team1_score}-${s.team2_score}`
          : `${s.team2_score}-${s.team1_score}`
      )
      .join(", ");

    return (
      <span className="text-[11px]">
        <span
          className={`font-semibold ${won ? "text-emerald-400" : "text-red-400"}`}
        >
          {won ? "Won" : "Lost"} {setsWon}-{setsLost}
        </span>
        {scoreStr && (
          <span className="text-gray-500 ml-1">({scoreStr})</span>
        )}
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900/80 backdrop-blur border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Group {groupName}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800/50">
              <th className="text-left py-2 px-3 font-medium">#</th>
              <th className="text-left py-2 px-2 font-medium">Team</th>
              <th className="text-center py-2 px-1 font-medium">P</th>
              <th className="text-center py-2 px-1 font-medium">W</th>
              <th className="text-center py-2 px-1 font-medium">L</th>
              <th className="text-center py-2 px-1 font-medium">NS</th>
              <th className="text-center py-2 px-1 font-medium">NP</th>
              <th className="text-center py-2 px-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const isQualified = i < 2;
              const isExpanded = expandedTeamId === s.team.id;
              const teamMatches = isExpanded ? getTeamMatches(s.team.id) : [];
              return (
                <>
                  <tr
                    key={s.team.id}
                    onClick={() =>
                      setExpandedTeamId(isExpanded ? null : s.team.id)
                    }
                    className={`border-b border-gray-800/30 transition-colors cursor-pointer select-none ${
                      isQualified
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : "hover:bg-gray-800/30"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                          i === 0
                            ? "bg-amber-500/20 text-amber-400"
                            : i === 1
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-200 font-medium text-xs sm:text-sm">
                          {s.team.player1} & {s.team.player2}
                        </span>
                        {matches && (
                          isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          )
                        )}
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-1 text-gray-400">
                      {s.played}
                    </td>
                    <td className="text-center py-2.5 px-1 text-emerald-400 font-medium">
                      {s.won}
                    </td>
                    <td className="text-center py-2.5 px-1 text-red-400">
                      {s.lost}
                    </td>
                    <td className="text-center py-2.5 px-1">
                      <span className="inline-flex items-center gap-0.5">
                        {s.netSets > 0 ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : s.netSets < 0 ? (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-600" />
                        )}
                        <span
                          className={
                            s.netSets > 0
                              ? "text-emerald-400"
                              : s.netSets < 0
                              ? "text-red-400"
                              : "text-gray-500"
                          }
                        >
                          {s.netSets > 0 ? `+${s.netSets}` : s.netSets}
                        </span>
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-1">
                      <span
                        className={
                          s.netPoints > 0
                            ? "text-emerald-400"
                            : s.netPoints < 0
                            ? "text-red-400"
                            : "text-gray-500"
                        }
                      >
                        {s.netPoints > 0 ? `+${s.netPoints}` : s.netPoints}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span className="inline-flex items-center justify-center w-7 h-6 rounded bg-white/5 text-white font-bold text-sm">
                        {s.points}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${s.team.id}-matches`} className="bg-gray-800/20">
                      <td colSpan={8} className="px-3 py-2">
                        {teamMatches.length === 0 ? (
                          <p className="text-gray-500 text-[11px] py-1">
                            No league matches found
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {teamMatches.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between py-1 px-2 rounded bg-gray-800/40"
                              >
                                <span className="text-gray-300 text-[11px]">
                                  vs {getOpponentName(m, s.team.id)}
                                </span>
                                {renderMatchResult(m, s.team.id)}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {standings.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-800/50">
          <span className="text-[10px] text-emerald-600">
            Top 2 qualify for Semi-Finals
          </span>
        </div>
      )}
    </div>
  );
}
