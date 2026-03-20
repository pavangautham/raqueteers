"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Team, Match } from "@/lib/types";
import { fetchTournamentData } from "@/lib/fetchTournamentData";
import { calculateStandings } from "@/utils/calculateStandings";
import MatchCard from "@/components/MatchCard";
import StandingsTable from "@/components/StandingsTable";
import KnockoutBracket from "@/components/KnockoutBracket";
import FinalStandings from "@/components/FinalStandings";
import {
  Radio,
  Trophy,
  LayoutGrid,
  Wifi,
  WifiOff,
  BadgeInfo,
  BookOpen,
  Gamepad2,
  ImageIcon,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<"live" | "court1" | "court2" | "standings" | "knockout">("live");

  // Debounce timer ref to avoid hammering Supabase on rapid changes
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    const { teams: t, matches: m } = await fetchTournamentData();
    setTeams(t);
    setMatches(m);
  }, []);

  // Debounced fetch — collapses rapid realtime events into one fetch
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(), 300);
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("spectator-realtime")
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
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchData, debouncedFetch]);

  // Memoize derived data
  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === "live"),
    [matches]
  );
  const court1Matches = useMemo(
    () => matches.filter((m) => m.court === "Court 1" && m.round === "league"),
    [matches]
  );
  const court2Matches = useMemo(
    () => matches.filter((m) => m.court === "Court 2" && m.round === "league"),
    [matches]
  );

  const knockoutMatches = useMemo(
    () => matches.filter((m) => m.round !== "league"),
    [matches]
  );

  const standingsA = useMemo(
    () => calculateStandings(teams, matches, "A"),
    [teams, matches]
  );
  const standingsB = useMemo(
    () => calculateStandings(teams, matches, "B"),
    [teams, matches]
  );

  // Pre-build team map for child components
  const teamMap = useMemo(() => {
    const map = new Map<number, (typeof teams)[0]>();
    for (const t of teams) map.set(t.id, t);
    return map;
  }, [teams]);

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
          {/* Top row: logo + live status (mobile) / logo + nav + status (desktop) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-base sm:text-lg">🏸</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Raqueteers
                </h1>
                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest">
                  Badminton Tournament 2026
                </p>
              </div>
            </div>
            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/guide"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                <BadgeInfo className="w-3.5 h-3.5" />
                Guide
              </Link>
              <Link
                href="/rules"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Rules
              </Link>
              <Link
                href="/demo"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Demo
              </Link>
              <Link
                href="/gallery"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Gallery
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
              {connected ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
            {/* Mobile live status */}
            <div className="sm:hidden">
              {connected ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
          </div>
          {/* Mobile nav row */}
          <div className="flex sm:hidden items-center gap-1.5 mt-2.5 -mx-0.5">
            <Link
              href="/guide"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              <BadgeInfo className="w-3 h-3" />
              Guide
            </Link>
            <Link
              href="/rules"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              Rules
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              <Gamepad2 className="w-3 h-3" />
              Demo
            </Link>
            <Link
              href="/gallery"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              <ImageIcon className="w-3 h-3" />
              Gallery
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-[11px] font-medium transition-colors"
            >
              <Shield className="w-3 h-3" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Live Banner */}
      {liveMatches.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse_live" />
            <span className="text-sm text-red-300 font-medium">
              {liveMatches.length} match{liveMatches.length > 1 ? "es" : ""} live
              now
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-[73px] z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {[
              { key: "live", label: "Live", icon: Radio },
              { key: "court1", label: "Court 1", icon: LayoutGrid },
              { key: "court2", label: "Court 2", icon: LayoutGrid },
              { key: "standings", label: "Standings", icon: Trophy },
              { key: "knockout", label: "Knockout", icon: BadgeInfo },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as typeof tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  tab === key
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {key === "live" && liveMatches.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white">
                    {liveMatches.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === "live" && (
          <div className="space-y-4">
            {liveMatches.length === 0 ? (
              <div className="text-center py-16">
                <Radio className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No live matches right now</p>
                <p className="text-gray-600 text-xs mt-1">
                  Check the schedule below or switch to Court view
                </p>
              </div>
            ) : (
              liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} teamMap={teamMap} />
              ))
            )}
            <FinalStandings
              standingsA={standingsA}
              standingsB={standingsB}
              matches={matches}
              teams={teams}
            />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StandingsTable standings={standingsA} groupName="A" matches={matches} teamMap={teamMap} />
              <StandingsTable standings={standingsB} groupName="B" matches={matches} teamMap={teamMap} />
            </div>
          </div>
        )}

        {tab === "court1" && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Court 1 — Group B
            </h2>
            {court1Matches.map((m) => (
              <MatchCard key={m.id} match={m} teamMap={teamMap} />
            ))}
          </div>
        )}

        {tab === "court2" && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-green-400 flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Court 2 — Group A
            </h2>
            {court2Matches.map((m) => (
              <MatchCard key={m.id} match={m} teamMap={teamMap} />
            ))}
          </div>
        )}

        {tab === "standings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StandingsTable standings={standingsA} groupName="A" />
              <StandingsTable standings={standingsB} groupName="B" />
            </div>
            <FinalStandings
              standingsA={standingsA}
              standingsB={standingsB}
              matches={matches}
              teams={teams}
            />
          </div>
        )}

        {tab === "knockout" && (
          <div className="space-y-6">
            <KnockoutBracket matches={knockoutMatches} teamMap={teamMap} />
            <FinalStandings
              standingsA={standingsA}
              standingsB={standingsB}
              matches={matches}
              teams={teams}
            />
          </div>
        )}
      </div>
    </main>
  );
}
