"use client";

import {
  ArrowLeft,
  Eye,
  Pencil,
  Smartphone,
  MousePointer,
  ArrowLeftRight,
  Undo2,
  CheckCircle2,
  Radio,
  LayoutGrid,
  Trophy,
  Lock,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

function Step({
  num,
  title,
  desc,
  icon,
}: {
  num: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
          {num}
        </div>
        <div className="w-px flex-1 bg-gray-800 mt-1" />
      </div>
      <div className="pb-6">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function LastStep({
  num,
  title,
  desc,
  icon,
}: {
  num: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
          {num}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold">How to Use Raqueteers</h1>
        <p className="text-xs text-gray-500 mt-1">
          Step-by-step guide for spectators and scorers
        </p>
      </div>

      {/* Spectator Guide */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">For Spectators</h2>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <Step
            num={1}
            title="Open the App"
            desc="Visit raqueteers.live on your phone or laptop. The home page shows all matches with live scores updating in real-time."
            icon={<Smartphone className="w-3.5 h-3.5 text-blue-400" />}
          />
          <Step
            num={2}
            title="Switch Tabs"
            desc="Use the tabs at the top to filter: Live (active matches), Court 2, Court 3, Standings (group tables), or Knockout (semi-finals and final)."
            icon={<LayoutGrid className="w-3.5 h-3.5 text-blue-400" />}
          />
          <Step
            num={3}
            title="Check Live Scores"
            desc="Live matches show a red LIVE badge with a pulsing indicator. Set scores update automatically — no need to refresh. The green highlight shows the match winner once completed."
            icon={<Radio className="w-3.5 h-3.5 text-red-400" />}
          />
          <Step
            num={4}
            title="View Standings"
            desc="The Standings tab shows both Group A and Group B tables with points, net sets, net points. Top 2 from each group qualify for semi-finals."
            icon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
          />
          <LastStep
            num={5}
            title="Refresh"
            desc={"Scores update automatically via real-time connection (green \"Live\" indicator in header). If it shows \"Offline\", tap the refresh button to reconnect."}
            icon={<RefreshCw className="w-3.5 h-3.5 text-blue-400" />}
          />
        </div>
      </section>

      {/* Scorer Guide */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold">For Scorers (Umpires)</h2>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <Step
            num={1}
            title="Go to Admin Page"
            desc={"Visit raqueteers.live/admin. Enter the scorer PIN provided to you and tap \"Enter\". You will see all matches you can score."}
            icon={<Lock className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={2}
            title="Find Your Match"
            desc="Use the Court filter (All / Court 2 / Court 3) to quickly find the match you are umpiring. The match card will show team names and set scores."
            icon={<LayoutGrid className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={3}
            title="Set Match to LIVE"
            desc={"Before starting, change the match status to \"Live\" using the status dropdown. This tells spectators the match is in progress."}
            icon={<Radio className="w-3.5 h-3.5 text-red-400" />}
          />
          <Step
            num={4}
            title="Score with +1 Buttons"
            desc="Tap the big +1 button on the side of the team that won the rally. The score updates instantly on screen. The left button (blue) scores for the left team, right button (orange) for the right team."
            icon={<MousePointer className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={5}
            title="Flip Sides"
            desc={"Teams switch sides after each set. Use the \"Flip Sides\" toggle so the +1 buttons match the physical court layout. This is purely visual — scores are always saved to the correct team."}
            icon={<ArrowLeftRight className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={6}
            title="Undo Mistakes"
            desc="Tapped the wrong button? Hit the Undo button to reverse the last score change. You can undo up to 20 actions. You can also tap the score number directly to manually edit it."
            icon={<Undo2 className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={7}
            title="Switch Sets"
            desc="When a set is won (21 points with 2-point lead, or 30 max), a green banner will prompt you to move to the next set. Tap Set 2 or Set 3 tab to continue scoring. Set 3 only appears if sets are tied 1-1."
            icon={<LayoutGrid className="w-3.5 h-3.5 text-orange-400" />}
          />
          <Step
            num={8}
            title="Save and Go Live"
            desc={"Tap the \"Live Update\" button to save scores to the server. All spectators will see the updated scores in real-time. Save frequently during the match!"}
            icon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
          />
          <LastStep
            num={9}
            title="Complete the Match"
            desc={"Once the match is decided (best of 3 sets), change the status to \"Completed\" and hit Live Update one final time. The match will be locked — only super admins can edit after this."}
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          />
        </div>
      </section>

      {/* Try It Out */}
      <section className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 text-center space-y-2">
        <h3 className="text-sm font-bold text-purple-300">Want to practice?</h3>
        <p className="text-xs text-gray-400">
          Try the scoring interface with mock data — no PIN needed, nothing saved.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors"
        >
          Open Practice Mode
        </Link>
      </section>

      {/* Quick Tips */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Quick Tips</h3>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span>Keep your phone charged and screen awake during scoring.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span>Save after every few points to keep spectators updated.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span>Use Flip Sides when teams change ends between sets.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span>If you accidentally close the browser, go back to /admin and re-enter your PIN. Your saved scores are safe on the server.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span>Tap the Logout button when you are done scoring your match.</span>
          </li>
        </ul>
      </section>

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
