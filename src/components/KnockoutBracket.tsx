"use client";

import { useMemo } from "react";
import { Match, Team } from "@/lib/types";
import { Swords, Trophy } from "lucide-react";

interface KnockoutBracketProps {
  matches: Match[];
  teamMap: Map<number, Team>;
}

export default function KnockoutBracket({ matches, teamMap }: KnockoutBracketProps) {
  const sf1 = matches.find((m) => m.match_number === 13);
  const sf2 = matches.find((m) => m.match_number === 14);
  const thirdPlace = matches.find((m) => m.round === "third_place");
  const final = matches.find((m) => m.match_number === 15);

  const getTeamLabel = (teamId: number | null | undefined) => {
    if (!teamId) return "TBD";
    const t = teamMap.get(teamId);
    return t ? `${t.player1} & ${t.player2}` : "TBD";
  };

  const renderKnockoutMatch = (match: Match | undefined, label: string) => {
    if (!match) return null;
    const isLive = match.status === "live";
    const isCompleted = match.status === "completed";
    const sets = [...(match.set_scores ?? [])].sort((a, b) => a.set_number - b.set_number);

    return (
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          {label === "Final" ? (
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          ) : label.includes("3rd") ? (
            <Trophy className="w-3.5 h-3.5 text-orange-400" />
          ) : (
            <Swords className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span className="font-bold text-gray-300">{label}</span>
          <span className="ml-auto">{match.scheduled_time} | {match.court}</span>
          {isLive && (
            <span className="text-red-400 font-bold animate-pulse_live">LIVE</span>
          )}
          {isCompleted && (
            <span className="text-emerald-400 font-bold">DONE</span>
          )}
        </div>
        <div className="space-y-1.5">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              isCompleted && match.winner_team_id === match.team1_id
                ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "bg-gray-800/50"
            }`}
          >
            <span className="text-sm text-gray-200">
              {getTeamLabel(match.team1_id)}
            </span>
            <div className="flex gap-2 font-mono text-sm">
              {sets.map((s) => (
                <span
                  key={s.set_number}
                  className={
                    s.team1_score > s.team2_score
                      ? "text-white font-bold"
                      : "text-gray-500"
                  }
                >
                  {s.team1_score}
                </span>
              ))}
            </div>
          </div>
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              isCompleted && match.winner_team_id === match.team2_id
                ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "bg-gray-800/50"
            }`}
          >
            <span className="text-sm text-gray-200">
              {getTeamLabel(match.team2_id)}
            </span>
            <div className="flex gap-2 font-mono text-sm">
              {sets.map((s) => (
                <span
                  key={s.set_number}
                  className={
                    s.team2_score > s.team1_score
                      ? "text-white font-bold"
                      : "text-gray-500"
                  }
                >
                  {s.team2_score}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Swords className="w-5 h-5 text-purple-400" />
        Knockout Stage
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderKnockoutMatch(sf1, "Semi Final 1 — A1 vs B2")}
        {renderKnockoutMatch(sf2, "Semi Final 2 — B1 vs A2")}
      </div>
      {thirdPlace && (
        <div className="max-w-lg mx-auto">
          {renderKnockoutMatch(thirdPlace, "3rd Place Match")}
        </div>
      )}
      <div className="max-w-lg mx-auto">
        {renderKnockoutMatch(final, "Final")}
      </div>
    </div>
  );
}
