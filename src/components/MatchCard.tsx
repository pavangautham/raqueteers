"use client";

import { memo, useMemo } from "react";
import { Match, Team } from "@/lib/types";
import { Radio, Users, Clock, MapPin } from "lucide-react";

function teamShort(team: Team | undefined): string {
  if (!team) return "TBD";
  return `${team.player1} & ${team.player2}`;
}

interface MatchCardProps {
  match: Match;
  teamMap: Map<number, Team>;
}

export default memo(function MatchCard({ match, teamMap }: MatchCardProps) {
  const team1 = match.team1_id ? teamMap.get(match.team1_id) : undefined;
  const team2 = match.team2_id ? teamMap.get(match.team2_id) : undefined;

  const sets = useMemo(
    () => [...(match.set_scores ?? [])].sort((a, b) => a.set_number - b.set_number),
    [match.set_scores]
  );

  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const courtColor =
    match.court === "Court 1"
      ? "border-court-1"
      : match.court === "Court 2"
      ? "border-court-2"
      : "border-court-3";
  const courtBg =
    match.court === "Court 1"
      ? "bg-blue-500/10"
      : match.court === "Court 2"
      ? "bg-green-500/10"
      : "bg-amber-500/10";

  const { setsT1, setsT2 } = useMemo(() => {
    let t1 = 0, t2 = 0;
    for (const s of sets) {
      const a = s.team1_score, b = s.team2_score;
      // Set is complete only if: 21+ with 2-point lead, or either reached 30
      const setComplete =
        (a >= 21 && a - b >= 2) ||
        (b >= 21 && b - a >= 2) ||
        a >= 30 || b >= 30;
      if (!setComplete) continue;
      if (a > b) t1++;
      else if (b > a) t2++;
    }
    return { setsT1: t1, setsT2: t2 };
  }, [sets]);

  return (
    <div
      className={`relative rounded-xl border-l-4 ${courtColor} bg-gray-900/80 backdrop-blur p-4 shadow-lg transition-all hover:shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-400">
              <Radio className="w-3 h-3 animate-pulse_live" />
              LIVE
            </span>
          )}
          {isCompleted && (
            <span className="text-xs font-semibold text-emerald-400">
              COMPLETED
            </span>
          )}
          {!isLive && !isCompleted && (
            <span className="text-xs font-semibold text-gray-500">
              UPCOMING
            </span>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${courtBg} ${
              match.court === "Court 1"
                ? "text-blue-400"
                : match.court === "Court 2"
                ? "text-green-400"
                : "text-amber-400"
            }`}
          >
            {match.court}
          </span>
          {match.round !== "league" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium uppercase">
              {match.round === "semi_final" ? "Semi Final" : match.round === "third_place" ? "3rd Place" : "Final"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <Clock className="w-3 h-3" />
          {match.scheduled_time}
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-2">
        {/* Team 1 */}
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            isCompleted && match.winner_team_id === match.team1_id
              ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span
              className={`text-sm font-medium truncate ${
                isCompleted && match.winner_team_id === match.team1_id
                  ? "text-emerald-300"
                  : "text-gray-200"
              }`}
            >
              {teamShort(team1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {sets.map((s) => (
              <span
                key={s.set_number}
                className={`w-8 text-center text-sm font-mono font-bold ${
                  s.team1_score > s.team2_score
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {s.team1_score}
              </span>
            ))}
            {isLive && (
              <span className="text-xs text-gray-400 font-bold ml-1">
                [{setsT1}]
              </span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            isCompleted && match.winner_team_id === match.team2_id
              ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span
              className={`text-sm font-medium truncate ${
                isCompleted && match.winner_team_id === match.team2_id
                  ? "text-emerald-300"
                  : "text-gray-200"
              }`}
            >
              {teamShort(team2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {sets.map((s) => (
              <span
                key={s.set_number}
                className={`w-8 text-center text-sm font-mono font-bold ${
                  s.team2_score > s.team1_score
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {s.team2_score}
              </span>
            ))}
            {isLive && (
              <span className="text-xs text-gray-400 font-bold ml-1">
                [{setsT2}]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Umpire info */}
      {match.umpire && (
        <div className="mt-2 text-[10px] text-gray-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Umpire: {match.umpire}
          {match.line_umpire1 && ` | Line: ${match.line_umpire1}`}
          {match.line_umpire2 && `, ${match.line_umpire2}`}
        </div>
      )}

      {/* Set headers */}
      {sets.length > 0 && (
        <div className="flex justify-end gap-2 mt-1 pr-1">
          {sets.map((s) => (
            <span
              key={s.set_number}
              className="w-8 text-center text-[10px] text-gray-600"
            >
              S{s.set_number}
            </span>
          ))}
          {isLive && <span className="text-[10px] text-gray-600 ml-1">Sets</span>}
        </div>
      )}
    </div>
  );
});
