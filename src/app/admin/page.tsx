"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Team, Match } from "@/lib/types";
import { fetchTournamentData } from "@/lib/fetchTournamentData";
import {
  calculateStandings,
  getSemiFinalsTeams,
} from "@/utils/calculateStandings";
import AdminScoreInput from "@/components/AdminScoreInput";
import StandingsTable from "@/components/StandingsTable";
import {
  Shield,
  Filter,
  RefreshCw,
  Trophy,
  Swords,
  Loader2,
  Lock,
  LogOut,
  Crown,
  User,
  AlertTriangle,
} from "lucide-react";

type Role = "scorer" | "super_admin";

const SCORER_PIN = process.env.NEXT_PUBLIC_SCORER_PIN || "1234";
const SUPER_ADMIN_PIN = process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN || "9999";

const MATCH_NUMBERS = { sf1: 13, sf2: 14, final: 15 } as const;

export default function AdminPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [courtFilter, setCourtFilter] = useState<
    "all" | "Court 2" | "Court 3"
  >("all");
  const [roundFilter, setRoundFilter] = useState<"league" | "knockout">(
    "league"
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handlePinSubmit = () => {
    if (pin === SUPER_ADMIN_PIN) {
      setRole("super_admin");
      setPinError(false);
      sessionStorage.setItem("raqueteers_role", "super_admin");
    } else if (pin === SCORER_PIN) {
      setRole("scorer");
      setPinError(false);
      sessionStorage.setItem("raqueteers_role", "scorer");
    } else {
      setPinError(true);
    }
    setPin("");
  };

  const handleLogout = () => {
    setRole(null);
    sessionStorage.removeItem("raqueteers_role");
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("raqueteers_role");
    if (saved === "super_admin" || saved === "scorer") {
      setRole(saved);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const { teams: t, matches: m } = await fetchTournamentData();
    setTeams(t);
    setMatches(m);
    setLoading(false);
  }, []);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(), 300);
  }, [fetchData]);

  // Fetch data + subscribe to realtime
  useEffect(() => {
    if (!role) return;
    fetchData();

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        debouncedFetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "set_scores" },
        debouncedFetch
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchData, debouncedFetch, role]);

  // Check if all league matches are completed
  const allLeagueComplete = useMemo(
    () =>
      matches
        .filter((m) => m.round === "league")
        .every((m) => m.status === "completed"),
    [matches]
  );

  const handleUpdateSemiFinals = async () => {
    if (!allLeagueComplete) return;
    setSyncing(true);
    const standingsA = calculateStandings(teams, matches, "A");
    const standingsB = calculateStandings(teams, matches, "B");
    const { sf1, sf2 } = getSemiFinalsTeams(standingsA, standingsB);

    const sf1Match = matches.find(
      (m) => m.match_number === MATCH_NUMBERS.sf1
    );
    const sf2Match = matches.find(
      (m) => m.match_number === MATCH_NUMBERS.sf2
    );

    // Run all DB writes in parallel
    if (sf1Match && sf1.team1 && sf1.team2) {
      await supabase
        .from("matches")
        .update({ team1_id: sf1.team1.id, team2_id: sf1.team2.id, umpire: null })
        .eq("id", sf1Match.id);
      if (!sf1Match.set_scores?.length) {
        await supabase.from("set_scores").insert([
          { match_id: sf1Match.id, set_number: 1, team1_score: 0, team2_score: 0 },
          { match_id: sf1Match.id, set_number: 2, team1_score: 0, team2_score: 0 },
          { match_id: sf1Match.id, set_number: 3, team1_score: 0, team2_score: 0 },
        ]);
      }
    }

    if (sf2Match && sf2.team1 && sf2.team2) {
      await supabase
        .from("matches")
        .update({ team1_id: sf2.team1.id, team2_id: sf2.team2.id, umpire: null })
        .eq("id", sf2Match.id);
      if (!sf2Match.set_scores?.length) {
        await supabase.from("set_scores").insert([
          { match_id: sf2Match.id, set_number: 1, team1_score: 0, team2_score: 0 },
          { match_id: sf2Match.id, set_number: 2, team1_score: 0, team2_score: 0 },
          { match_id: sf2Match.id, set_number: 3, team1_score: 0, team2_score: 0 },
        ]);
      }
    }
    await fetchData();
    setSyncing(false);
  };

  const handleUpdateFinal = async () => {
    setSyncing(true);
    const sf1 = matches.find((m) => m.match_number === MATCH_NUMBERS.sf1);
    const sf2 = matches.find((m) => m.match_number === MATCH_NUMBERS.sf2);
    const finalMatch = matches.find(
      (m) => m.match_number === MATCH_NUMBERS.final
    );

    if (
      finalMatch &&
      sf1?.status === "completed" &&
      sf2?.status === "completed" &&
      sf1.winner_team_id &&
      sf2.winner_team_id
    ) {
      await supabase
        .from("matches")
        .update({
          team1_id: sf1.winner_team_id,
          team2_id: sf2.winner_team_id,
        })
        .eq("id", finalMatch.id);

      if (!finalMatch.set_scores?.length) {
        await supabase.from("set_scores").insert([
          { match_id: finalMatch.id, set_number: 1, team1_score: 0, team2_score: 0 },
          { match_id: finalMatch.id, set_number: 2, team1_score: 0, team2_score: 0 },
          { match_id: finalMatch.id, set_number: 3, team1_score: 0, team2_score: 0 },
        ]);
      }
    }

    await fetchData();
    setSyncing(false);
  };

  // ---- PIN GATE ----
  if (!role) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900/80 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Scorer Login</h1>
            <p className="text-xs text-gray-500 text-center">
              Enter your PIN to access the scoring panel
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="Enter PIN"
              className={`w-full bg-gray-800 border ${
                pinError ? "border-red-500" : "border-gray-700"
              } rounded-xl px-4 py-3.5 text-center text-white text-2xl font-mono tracking-[0.5em] placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-400 text-center">
                Invalid PIN. Try again.
              </p>
            )}
            <button
              onClick={handlePinSubmit}
              disabled={pin.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold text-sm py-3 rounded-xl transition-colors"
            >
              Enter
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---- MAIN ADMIN UI ----
  const isSuperAdmin = role === "super_admin";

  const leagueMatches = matches.filter((m) => m.round === "league");
  const knockoutMatches = matches.filter((m) => m.round !== "league");

  const filteredLeague =
    courtFilter === "all"
      ? leagueMatches
      : leagueMatches.filter((m) => m.court === courtFilter);

  const standingsA = calculateStandings(teams, matches, "A");
  const standingsB = calculateStandings(teams, matches, "B");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSuperAdmin
                  ? "bg-gradient-to-br from-amber-500 to-orange-600"
                  : "bg-gradient-to-br from-blue-500 to-cyan-600"
              }`}
            >
              {isSuperAdmin ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                {isSuperAdmin ? "Super Admin" : "Scorer"}
                {isSuperAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                    Pavan & Manyutej
                  </span>
                )}
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Raqueteers Tournament Control
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Role Info Banner */}
        {!isSuperAdmin && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-300">
            <strong>Scorer mode:</strong> You can update scores for{" "}
            <strong>live and upcoming</strong> matches only. Completed matches
            are locked.
          </div>
        )}

        {/* Round Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setRoundFilter("league")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roundFilter === "league"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            League
          </button>
          <button
            onClick={() => setRoundFilter("knockout")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roundFilter === "knockout"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <Swords className="w-4 h-4" />
            Knockout
          </button>
        </div>

        {roundFilter === "league" && (
          <>
            {/* Court Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              {(["all", "Court 2", "Court 3"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCourtFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    courtFilter === c
                      ? c === "Court 2"
                        ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30"
                        : c === "Court 3"
                        ? "bg-green-600/20 text-green-400 ring-1 ring-green-500/30"
                        : "bg-white/10 text-white"
                      : "bg-gray-800 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {c === "all" ? "All Courts" : c}
                </button>
              ))}
            </div>

            {/* League Matches */}
            <div className="space-y-3">
              {filteredLeague.map((m) => (
                <AdminScoreInput
                  key={m.id}
                  match={m}
                  teams={teams}
                  onUpdate={fetchData}
                  role={role}
                />
              ))}
            </div>

            {/* Standings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <StandingsTable standings={standingsA} groupName="A" />
              <StandingsTable standings={standingsB} groupName="B" />
            </div>
          </>
        )}

        {roundFilter === "knockout" && (
          <div className="space-y-4">
            {/* Generate Semi-Finals — Super Admin only */}
            {isSuperAdmin && (
              <>
                {!allLeagueComplete && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    All league matches must be completed before generating semi-finals.
                  </div>
                )}
                <button
                  onClick={handleUpdateSemiFinals}
                  disabled={syncing || !allLeagueComplete}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 disabled:text-purple-300/50 text-white font-medium text-sm py-3 px-4 rounded-lg transition-colors"
                >
                  {syncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Swords className="w-4 h-4" />
                  )}
                  Generate Semi-Finals from Standings
                </button>
              </>
            )}

            {/* Semi-Final Matches */}
            {knockoutMatches
              .filter((m) => m.round === "semi_final")
              .map((m) => (
                <AdminScoreInput
                  key={m.id}
                  match={m}
                  teams={teams}
                  onUpdate={fetchData}
                  role={role}
                />
              ))}

            {/* Generate Final — Super Admin only */}
            {isSuperAdmin && (
              <button
                onClick={handleUpdateFinal}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-medium text-sm py-3 px-4 rounded-lg transition-colors"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trophy className="w-4 h-4" />
                )}
                Generate Final from Semi-Final Winners
              </button>
            )}

            {/* Final Match */}
            {knockoutMatches
              .filter((m) => m.round === "final")
              .map((m) => (
                <AdminScoreInput
                  key={m.id}
                  match={m}
                  teams={teams}
                  onUpdate={fetchData}
                  role={role}
                />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
