"use client";

import { useState, useRef } from "react";
import { Match, Team } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
  Save,
  Radio,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Undo2,
  ArrowLeftRight,
  Lock,
  RefreshCw,
} from "lucide-react";

type Role = "scorer" | "super_admin";

interface AdminScoreInputProps {
  match: Match;
  teams: Team[];
  onUpdate: () => void;
  role: Role;
  demoMode?: boolean;
}

export default function AdminScoreInput({
  match,
  teams,
  onUpdate,
  role,
  demoMode = false,
}: AdminScoreInputProps) {
  const team1 = teams.find((t) => t.id === match.team1_id);
  const team2 = teams.find((t) => t.id === match.team2_id);

  // Scorer can only edit live/upcoming matches; completed = locked
  const isSuperAdmin = role === "super_admin";
  const isLocked = !isSuperAdmin && match.status === "completed";
  const sets =
    match.set_scores?.sort((a, b) => a.set_number - b.set_number) ?? [];

  const [scores, setScores] = useState<
    { set_number: number; team1_score: number; team2_score: number }[]
  >(
    sets.length > 0
      ? sets.map((s) => ({
          set_number: s.set_number,
          team1_score: s.team1_score,
          team2_score: s.team2_score,
        }))
      : [1, 2, 3].map((n) => ({
          set_number: n,
          team1_score: 0,
          team2_score: 0,
        }))
  );

  const [activeSet, setActiveSet] = useState(() => {
    for (let i = 0; i < scores.length; i++) {
      if (scores[i].team1_score === 0 && scores[i].team2_score === 0) {
        return i > 0 ? i - 1 : 0;
      }
    }
    return scores.length - 1;
  });

  // Flip is purely visual — does NOT affect database writes
  const [flipped, setFlipped] = useState(false);

  const [status, setStatus] = useState<Match["status"]>(match.status);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(match.status === "live");
  const [editingScore, setEditingScore] = useState<{
    setIdx: number;
    team: "team1_score" | "team2_score";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // History for undo (stores last 20 actions)
  const [history, setHistory] = useState<typeof scores[]>([]);

  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-19), scores.map((s) => ({ ...s }))]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setScores(prev);
    setHistory((h) => h.slice(0, -1));
  };

  /**
   * Check if a set is already won.
   * Rules: first to 21, win by 2. At 29-29 first to 30 wins.
   */
  const isSetWon = (s: { team1_score: number; team2_score: number }) => {
    const a = s.team1_score;
    const b = s.team2_score;
    // Normal win at 21+ with 2 point lead
    if (a >= 21 && a - b >= 2) return true;
    if (b >= 21 && b - a >= 2) return true;
    // Cap: 30 wins regardless
    if (a >= 30 || b >= 30) return true;
    return false;
  };

  /**
   * Check if a +1 is allowed for a given team in a set.
   */
  const canIncrement = (
    s: { team1_score: number; team2_score: number },
    team: "team1_score" | "team2_score"
  ) => {
    // If set already won, no more points
    if (isSetWon(s)) return false;
    const myScore = s[team];
    // Hard cap at 30
    if (myScore >= 30) return false;
    return true;
  };

  /**
   * Count sets won by each team (only completed sets).
   */
  const countSetsWon = (
    scoreList: { team1_score: number; team2_score: number }[]
  ) => {
    let t1 = 0;
    let t2 = 0;
    for (const s of scoreList) {
      if (!isSetWon(s)) continue;
      if (s.team1_score > s.team2_score) t1++;
      else t2++;
    }
    return { t1, t2 };
  };

  /**
   * Check if match is already decided (one team won 2 sets).
   */
  const isMatchDecided = (
    scoreList: { team1_score: number; team2_score: number }[]
  ) => {
    const { t1, t2 } = countSetsWon(scoreList);
    return t1 >= 2 || t2 >= 2;
  };

  /**
   * Check if a set tab should be accessible.
   * Set 3 is only available if each team has won 1 set.
   */
  const isSetAvailable = (setIdx: number) => {
    if (setIdx <= 1) return true; // Set 1 & 2 always available
    // Set 3: only if score is 1-1 in sets
    const { t1, t2 } = countSetsWon(scores.slice(0, 2));
    return t1 === 1 && t2 === 1;
  };

  const increment = (setIdx: number, team: "team1_score" | "team2_score") => {
    const s = scores[setIdx];
    if (!canIncrement(s, team)) return;
    pushHistory();
    setScores((prev) =>
      prev.map((sc, i) =>
        i === setIdx ? { ...sc, [team]: sc[team] + 1 } : sc
      )
    );
  };

  const handleDirectEdit = (
    setIdx: number,
    team: "team1_score" | "team2_score",
    value: string
  ) => {
    const num = Math.max(0, Math.min(30, parseInt(value) || 0));
    const otherTeam = team === "team1_score" ? "team2_score" : "team1_score";
    const otherScore = scores[setIdx][otherTeam];
    // Validate badminton rules: max 21 unless deuce (both >= 20), then max 30
    let clamped = num;
    if (otherScore < 20) {
      clamped = Math.min(num, 21);
    }
    setScores((prev) =>
      prev.map((s, i) =>
        i === setIdx ? { ...s, [team]: clamped } : s
      )
    );
  };

  const startEdit = (
    setIdx: number,
    team: "team1_score" | "team2_score"
  ) => {
    pushHistory();
    setEditingScore({ setIdx, team });
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const finishEdit = () => {
    setEditingScore(null);
  };

  const handleSave = async () => {
    if (status === "completed") {
      const confirmed = window.confirm(
        "Are you sure you want to mark this match as Completed? The match will be locked and scores can no longer be edited."
      );
      if (!confirmed) return;
    }
    setSaving(true);
    try {
      // In demo mode, skip all DB writes
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 300)); // simulate save delay
        setHistory([]);
        onUpdate();
        return;
      }

      // Build all score upsert promises in parallel
      const scorePromises = scores.map((score) => {
        const existing = sets.find((s) => s.set_number === score.set_number);
        if (existing) {
          return supabase
            .from("set_scores")
            .update({
              team1_score: score.team1_score,
              team2_score: score.team2_score,
            })
            .eq("id", existing.id);
        } else {
          return supabase.from("set_scores").insert({
            match_id: match.id,
            set_number: score.set_number,
            team1_score: score.team1_score,
            team2_score: score.team2_score,
          });
        }
      });

      const { t1: wonT1, t2: wonT2 } = countSetsWon(scores);
      let winnerId: number | null = null;
      if (status === "completed") {
        if (wonT1 >= 2) winnerId = match.team1_id;
        else if (wonT2 >= 2) winnerId = match.team2_id;
      }

      // Fire all writes in parallel (scores + match status)
      await Promise.all([
        ...scorePromises,
        supabase
          .from("matches")
          .update({ status, winner_team_id: winnerId })
          .eq("id", match.id),
      ]);

      // Clear undo history after successful save
      setHistory([]);
      onUpdate();
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const courtColor =
    match.court === "Court 2" ? "border-blue-500" : "border-green-500";

  const current = scores[activeSet];

  const { t1: setsT1, t2: setsT2 } = countSetsWon(scores);
  const matchDecided = isMatchDecided(scores);
  const currentSetWon = current ? isSetWon(current) : false;

  return (
    <div
      className={`rounded-xl border ${courtColor} bg-gray-900/90 backdrop-blur overflow-hidden`}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 hover:bg-gray-800/30 transition-colors"
      >
        {/* Top row: match number, team names, chevron */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500 shrink-0">
            #{match.match_number}
          </span>
          <span className="text-sm font-medium text-gray-200 truncate min-w-0">
            <span className="sm:hidden">
              {team1 ? `${team1.player1}` : "TBD"} vs{" "}
              {team2 ? `${team2.player1}` : "TBD"}
            </span>
            <span className="hidden sm:inline">
              {team1 ? `${team1.player1} & ${team1.player2}` : "TBD"} vs{" "}
              {team2 ? `${team2.player1} & ${team2.player2}` : "TBD"}
            </span>
          </span>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {match.status === "live" && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                <Radio className="w-3 h-3 animate-pulse_live" /> LIVE
              </span>
            )}
            {match.status === "completed" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {isLocked && (
              <Lock className="w-3 h-3 text-gray-600" />
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        {/* Bottom row: time + set scores */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-500">
            {match.scheduled_time}
          </span>
          <div className="flex gap-1.5 text-xs font-mono text-gray-500">
            {scores.map((s, i) => (
              <span key={i}>
                {s.team1_score}-{s.team2_score}
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Locked Banner for Scorers */}
          {isLocked && (
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3">
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-xs text-gray-400">
                This match is <strong className="text-gray-300">completed and locked</strong>. Only super admins (Pavan & Manyutej) can edit.
              </span>
            </div>
          )}

          {/* Match decided banner */}
          {matchDecided && status !== "completed" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs text-emerald-300 text-center">
              Match decided! <strong>{setsT1 >= 2 ? (team1 ? `${team1.player1} & ${team1.player2}` : "Team 1") : (team2 ? `${team2.player1} & ${team2.player2}` : "Team 2")}</strong> wins {Math.max(setsT1, setsT2)}-{Math.min(setsT1, setsT2)} in sets. Set status to <strong>Completed</strong> and hit Live Update.
            </div>
          )}

          {/* Set Selector Tabs */}
          <div className="flex gap-2">
            {scores.map((s, idx) => {
              const available = isSetAvailable(idx);
              const setDone = isSetWon(s);
              return (
              <button
                key={idx}
                onClick={() => available && setActiveSet(idx)}
                disabled={!available}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  !available
                    ? "bg-gray-800/30 text-gray-700 cursor-not-allowed"
                    : activeSet === idx
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                Set {s.set_number}
                {setDone && " ✓"}
                {(s.team1_score > 0 || s.team2_score > 0) && (
                  <span className="ml-1.5 text-xs opacity-70">
                    {s.team1_score}-{s.team2_score}
                  </span>
                )}
              </button>
              );
            })}
          </div>

          {/* Score Panel for Active Set */}
          {current && (() => {
            // Flip mapping — visual only, DB always uses team1/team2
            const leftTeam = flipped ? team2 : team1;
            const rightTeam = flipped ? team1 : team2;
            const leftKey: "team1_score" | "team2_score" = flipped ? "team2_score" : "team1_score";
            const rightKey: "team1_score" | "team2_score" = flipped ? "team1_score" : "team2_score";
            const leftScore = current[leftKey];
            const rightScore = current[rightKey];
            const leftSets = flipped ? setsT2 : setsT1;
            const rightSets = flipped ? setsT1 : setsT2;

            return (
            <div className="bg-gray-800/50 rounded-2xl p-5 space-y-4">
              {/* Flip Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-white text-[11px] font-medium active:scale-95 transition-all"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Flip Sides
                </button>
              </div>

              {/* Sets Won Indicator */}
              <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                <span>
                  Sets:{" "}
                  <span className="text-white font-bold">{leftSets}</span>
                </span>
                <span>-</span>
                <span>
                  <span className="text-white font-bold">{rightSets}</span> :Sets
                </span>
              </div>

              {/* Set won banner */}
              {currentSetWon && !matchDecided && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300 text-center">
                  Set {current.set_number} complete! Move to the next set.
                </div>
              )}

              {/* Two big +1 buttons side by side */}
              {(() => {
                const leftDisabled = isLocked || currentSetWon || !canIncrement(current, leftKey);
                const rightDisabled = isLocked || currentSetWon || !canIncrement(current, rightKey);
                const allDisabled = isLocked || currentSetWon;
                return (
              <div className={`grid grid-cols-2 gap-4 ${allDisabled ? "opacity-40" : ""}`}>
                {/* Left Team +1 Button */}
                <button
                  onClick={() => increment(activeSet, leftKey)}
                  disabled={leftDisabled}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-blue-600/10 border-2 border-blue-500/40 active:scale-95 active:bg-blue-600/25 transition-all select-none disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  <span className="text-xs text-blue-300 font-medium text-center px-2 w-full break-words leading-snug">
                    {leftTeam ? `${leftTeam.player1} & ${leftTeam.player2}` : "TBD"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Plus className="w-6 h-6 text-blue-400" />
                    <span className="text-3xl font-bold text-blue-400">1</span>
                  </div>
                </button>

                {/* Right Team +1 Button */}
                <button
                  onClick={() => increment(activeSet, rightKey)}
                  disabled={rightDisabled}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-orange-600/10 border-2 border-orange-500/40 active:scale-95 active:bg-orange-600/25 transition-all select-none disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  <span className="text-xs text-orange-300 font-medium text-center px-2 w-full break-words leading-snug">
                    {rightTeam ? `${rightTeam.player1} & ${rightTeam.player2}` : "TBD"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Plus className="w-6 h-6 text-orange-400" />
                    <span className="text-3xl font-bold text-orange-400">1</span>
                  </div>
                </button>
              </div>
                );
              })()}

              {/* Live Score Display — tap to manually edit */}
              <div className={`grid grid-cols-[1fr,auto,1fr] gap-3 items-center ${isLocked ? "opacity-40 pointer-events-none" : ""}`}>
                {/* Left Score */}
                {!isLocked && editingScore?.setIdx === activeSet &&
                editingScore?.team === leftKey ? (
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    value={leftScore}
                    onChange={(e) =>
                      handleDirectEdit(activeSet, leftKey, e.target.value)
                    }
                    onBlur={finishEdit}
                    onKeyDown={(e) => e.key === "Enter" && finishEdit()}
                    className="h-16 bg-gray-900 border-2 border-blue-500 rounded-xl text-center text-white font-mono text-3xl font-bold focus:outline-none"
                    autoFocus
                  />
                ) : !isLocked ? (
                  <button
                    onClick={() => startEdit(activeSet, leftKey)}
                    className="h-16 bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center text-white font-mono text-3xl font-bold hover:border-blue-500/50 transition-colors"
                    title="Tap to edit score"
                  >
                    {leftScore}
                  </button>
                ) : (
                  <div className="h-16 bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center text-white font-mono text-3xl font-bold">
                    {leftScore}
                  </div>
                )}

                {/* Undo in the center */}
                <button
                  onClick={undo}
                  disabled={isLocked || history.length === 0}
                  className="w-12 h-12 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 transition-all"
                  title="Undo last point"
                >
                  <Undo2 className="w-5 h-5" />
                </button>

                {/* Right Score */}
                {!isLocked && editingScore?.setIdx === activeSet &&
                editingScore?.team === rightKey ? (
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    value={rightScore}
                    onChange={(e) =>
                      handleDirectEdit(activeSet, rightKey, e.target.value)
                    }
                    onBlur={finishEdit}
                    onKeyDown={(e) => e.key === "Enter" && finishEdit()}
                    className="h-16 bg-gray-900 border-2 border-blue-500 rounded-xl text-center text-white font-mono text-3xl font-bold focus:outline-none"
                    autoFocus
                  />
                ) : !isLocked ? (
                  <button
                    onClick={() => startEdit(activeSet, rightKey)}
                    className="h-16 bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center text-white font-mono text-3xl font-bold hover:border-orange-500/50 transition-colors"
                    title="Tap to edit score"
                  >
                    {rightScore}
                  </button>
                ) : (
                  <div className="h-16 bg-gray-900/80 border border-gray-700 rounded-xl flex items-center justify-center text-white font-mono text-3xl font-bold">
                    {rightScore}
                  </div>
                )}
              </div>

              {!isLocked && (
              <p className="text-[10px] text-gray-600 text-center">
                Tap score to edit manually &bull; Undo reverts last action
              </p>
              )}
            </div>
            );
          })()}

          {/* All Sets Summary */}
          <div className="grid grid-cols-3 gap-2">
            {scores.map((s, idx) => (
              <div
                key={idx}
                className={`text-center py-2 rounded-lg text-xs font-mono ${
                  idx === activeSet
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                    : "bg-gray-800/50 text-gray-500"
                }`}
              >
                <div className="text-[10px] text-gray-600 mb-0.5">
                  Set {s.set_number}
                </div>
                <span
                  className={
                    s.team1_score > s.team2_score
                      ? "text-emerald-400 font-bold"
                      : ""
                  }
                >
                  {s.team1_score}
                </span>
                <span className="text-gray-600 mx-1">-</span>
                <span
                  className={
                    s.team2_score > s.team1_score
                      ? "text-emerald-400 font-bold"
                      : ""
                  }
                >
                  {s.team2_score}
                </span>
              </div>
            ))}
          </div>

          {/* Umpire info */}
          {match.umpire && (
            <div className="text-[10px] text-gray-600">
              Umpire: {match.umpire}
              {match.line_umpire1 && ` | Line: ${match.line_umpire1}`}
              {match.line_umpire2 && `, ${match.line_umpire2}`}
            </div>
          )}

          {/* Controls */}
          {!isLocked && (
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Match["status"])}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Pushing..." : "Live Update"}
            </button>
          </div>
          )}

          {/* Reset Match — Super Admin only */}
          {isSuperAdmin && (
            <button
              onClick={async () => {
                if (!window.confirm("Reset all scores and status for this match?")) return;
                setSaving(true);
                if (!demoMode) {
                  const resetScores = sets.map((s) =>
                    supabase
                      .from("set_scores")
                      .update({ team1_score: 0, team2_score: 0 })
                      .eq("id", s.id)
                  );
                  await Promise.all([
                    ...resetScores,
                    supabase
                      .from("matches")
                      .update({ status: "upcoming", winner_team_id: null })
                      .eq("id", match.id),
                  ]);
                }
                setScores((prev) => prev.map((s) => ({ ...s, team1_score: 0, team2_score: 0 })));
                setStatus("upcoming");
                setHistory([]);
                setActiveSet(0);
                setSaving(false);
                onUpdate();
              }}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-medium py-2 rounded-lg transition-colors border border-red-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Match
            </button>
          )}
        </div>
      )}
    </div>
  );
}
