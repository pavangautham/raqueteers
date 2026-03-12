"use client";

import { useState, useCallback } from "react";
import { Match, Team } from "@/lib/types";
import AdminScoreInput from "@/components/AdminScoreInput";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

const DEMO_TEAMS: Team[] = [
  { id: 901, team_number: 901, player1: "Demo Player 1", player2: "Demo Player 2", group_name: "A" },
  { id: 902, team_number: 902, player1: "Demo Player 3", player2: "Demo Player 4", group_name: "A" },
];

function createDemoMatch(): Match {
  return {
    id: 9999,
    match_number: 0,
    round: "league",
    group_name: "A",
    team1_id: 901,
    team2_id: 902,
    court: "Court 2",
    scheduled_time: "Demo",
    umpire: null,
    line_umpire1: null,
    line_umpire2: null,
    status: "live",
    winner_team_id: null,
    created_at: new Date().toISOString(),
    set_scores: [
      { id: 1, match_id: 9999, set_number: 1, team1_score: 0, team2_score: 0 },
      { id: 2, match_id: 9999, set_number: 2, team1_score: 0, team2_score: 0 },
      { id: 3, match_id: 9999, set_number: 3, team1_score: 0, team2_score: 0 },
    ],
  };
}

export default function DemoPage() {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/guide"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Guide
        </Link>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold">Practice Mode</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sandbox environment — tap +1, undo, flip sides, and switch sets. Nothing is saved to the server.
        </p>
      </div>

      <AdminScoreInput
        key={resetKey}
        match={createDemoMatch()}
        teams={DEMO_TEAMS}
        onUpdate={() => {}}
        role="scorer"
        demoMode
      />

      <div className="text-center pb-4">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Back to Scoreboard
        </Link>
      </div>
    </main>
  );
}
