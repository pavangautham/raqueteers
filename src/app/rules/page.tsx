"use client";

import {
  BookOpen,
  Trophy,
  Users,
  Swords,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Gavel,
  Timer,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import Link from "next/link";

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function RuleCard({ icon, title, children }: RuleCardProps) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="text-sm text-gray-400 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default function RulesPage() {
  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">
                Rules & Regulations
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Raqueteers Badminton Tournament 2026
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Tournament Format */}
        <RuleCard
          icon={<Trophy className="w-5 h-5 text-amber-400" />}
          title="Tournament Format"
        >
          <BulletItem>
            8 teams divided into <strong className="text-white">2 groups</strong> (Group A & Group B), 4 teams each.
          </BulletItem>
          <BulletItem>
            <strong className="text-white">League stage:</strong> Each team plays every other team in their group (round-robin). 12 league matches total.
          </BulletItem>
          <BulletItem>
            <strong className="text-white">Knockout stage:</strong> Top 2 from each group advance to Semi-Finals, followed by the Final.
          </BulletItem>
          <BulletItem>
            Semi-Final 1: <strong className="text-white">A1 vs B2</strong> | Semi-Final 2: <strong className="text-white">B1 vs A2</strong>
          </BulletItem>
        </RuleCard>

        {/* Match Format */}
        <RuleCard
          icon={<Target className="w-5 h-5 text-red-400" />}
          title="Match Format"
        >
          <BulletItem>
            Each match is <strong className="text-white">best of 3 sets</strong>. First team to win 2 sets wins the match.
          </BulletItem>
          <BulletItem>
            Each set is played to <strong className="text-white">21 points</strong>.
          </BulletItem>
          <BulletItem>
            A team must win by <strong className="text-white">2 clear points</strong>. At 20-20 (deuce), play continues until one team leads by 2 points.
          </BulletItem>
          <BulletItem>
            If the score reaches <strong className="text-white">29-29</strong>, the team that scores the 30th point wins the set (cap at 30).
          </BulletItem>
          <BulletItem>
            All matches are <strong className="text-white">doubles</strong> format (2 players per team).
          </BulletItem>
        </RuleCard>

        {/* Scoring & Points */}
        <RuleCard
          icon={<Swords className="w-5 h-5 text-purple-400" />}
          title="League Scoring & Tie-Breakers"
        >
          <BulletItem>
            <strong className="text-white">2 points</strong> for a win, <strong className="text-white">0 points</strong> for a loss.
          </BulletItem>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-3 mb-1">
            If teams are tied on points, the following tie-breakers apply (in order):
          </p>
          <div className="ml-6 space-y-1.5">
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold text-xs w-4">1.</span>
              <span><strong className="text-white">Net Sets</strong> — Sets won minus sets lost</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold text-xs w-4">2.</span>
              <span><strong className="text-white">Net Points</strong> — Total points scored minus total points conceded</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold text-xs w-4">3.</span>
              <span><strong className="text-white">Head-to-Head</strong> — Result of the match between the tied teams</span>
            </div>
          </div>
        </RuleCard>

        {/* Service Rules */}
        <RuleCard
          icon={<Gavel className="w-5 h-5 text-cyan-400" />}
          title="Service Rules"
        >
          <BulletItem>
            The serve must be hit <strong className="text-white">below the server&apos;s waist</strong> (underarm). The racket shaft must point downward at contact.
          </BulletItem>
          <BulletItem>
            The server and receiver must stand within their respective <strong className="text-white">diagonal service courts</strong>. The shuttle must land in the diagonally opposite service court.
          </BulletItem>
          <BulletItem>
            In doubles, the serving team&apos;s score determines the service court: <strong className="text-white">even score = right court</strong>, <strong className="text-white">odd score = left court</strong>.
          </BulletItem>
          <BulletItem>
            A <strong className="text-white">toss</strong> will be conducted before each match. The winner chooses to serve, receive, or pick a side.
          </BulletItem>
        </RuleCard>

        {/* Intervals & Change of Ends */}
        <RuleCard
          icon={<Timer className="w-5 h-5 text-yellow-400" />}
          title="Intervals & Change of Ends"
        >
          <BulletItem>
            Teams change ends after <strong className="text-white">every set</strong>.
          </BulletItem>
          <BulletItem>
            In the 3rd set (if played), teams change ends when the leading score reaches <strong className="text-white">11 points</strong>.
          </BulletItem>
          <BulletItem>
            A <strong className="text-white">60-second interval</strong> is allowed when the leading score reaches 11 in any set.
          </BulletItem>
          <BulletItem>
            A <strong className="text-white">2-minute interval</strong> is allowed between sets.
          </BulletItem>
        </RuleCard>

        {/* Faults & Lets */}
        <RuleCard
          icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
          title="Faults & Lets"
        >
          <BulletItem>
            Hitting the shuttle into the <strong className="text-white">net</strong> or <strong className="text-white">out of bounds</strong> results in a point for the opponent.
          </BulletItem>
          <BulletItem>
            The shuttle must not be hit <strong className="text-white">twice in succession</strong> by the same team, nor touch a player&apos;s body or clothing.
          </BulletItem>
          <BulletItem>
            A player must not reach over the net to hit the shuttle (contact must happen on the player&apos;s side). The racket may follow through over the net.
          </BulletItem>
          <BulletItem>
            A <strong className="text-white">&quot;let&quot;</strong> is called if the shuttle gets stuck on the net after passing over, or if a disturbance occurs. The rally is replayed.
          </BulletItem>
        </RuleCard>

        {/* Court & Officials */}
        <RuleCard
          icon={<Users className="w-5 h-5 text-green-400" />}
          title="Courts & Officials"
        >
          <BulletItem>
            League matches will be played across <strong className="text-white">Court 2</strong> (Group A) and <strong className="text-white">Court 3</strong> (Group B) simultaneously.
          </BulletItem>
          <BulletItem>
            All knockout matches (Semi-Finals & Final) will be played on <strong className="text-white">Court 3</strong>.
          </BulletItem>
          <BulletItem>
            Each match will have an assigned <strong className="text-white">Umpire</strong> and <strong className="text-white">2 Line Umpires</strong> as per the schedule.
          </BulletItem>
          <BulletItem>
            The <strong className="text-white">umpire&apos;s decision is final</strong> on all calls. No arguments or appeals.
          </BulletItem>
        </RuleCard>

        {/* Code of Conduct */}
        <RuleCard
          icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
          title="Code of Conduct"
        >
          <BulletItem>
            Players must show <strong className="text-white">respect</strong> towards opponents, umpires, and spectators at all times.
          </BulletItem>
          <BulletItem>
            <strong className="text-white">No abusive language</strong>, racket throwing, or unsportsmanlike behaviour.
          </BulletItem>
          <BulletItem>
            <strong className="text-white">Respect the umpires.</strong> They are doing their best just like you. Even umpires are human and can make mistakes — stay calm, accept the call gracefully, and move on. Getting angry over a close call never helps your game.
          </BulletItem>
          <BulletItem>
            Players must be <strong className="text-white">ready at the scheduled time</strong>. Be punctual and keep the tournament running smoothly.
          </BulletItem>
          <BulletItem>
            Deliberate time-wasting or delaying play is not allowed.
          </BulletItem>
        </RuleCard>

        {/* Fair Play */}
        <RuleCard
          icon={<Handshake className="w-5 h-5 text-pink-400" />}
          title="Spirit of the Game"
        >
          <p>
            This tournament is about <strong className="text-white">fun, fitness, and friendly competition</strong>.
            Play hard, play fair, and enjoy the game. Shake hands before and after every match.
            Let&apos;s make Raqueteers a memorable experience for everyone!
          </p>
        </RuleCard>
      </div>
    </main>
  );
}
