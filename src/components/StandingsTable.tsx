"use client";

import { Standing } from "@/lib/types";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StandingsTableProps {
  standings: Standing[];
  groupName: string;
}

export default function StandingsTable({
  standings,
  groupName,
}: StandingsTableProps) {
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
              return (
                <tr
                  key={s.team.id}
                  className={`border-b border-gray-800/30 transition-colors ${
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
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-medium text-xs sm:text-sm">
                        {s.team.player1} & {s.team.player2}
                      </span>
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
