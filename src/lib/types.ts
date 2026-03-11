export interface Team {
  id: number;
  team_number: number;
  player1: string;
  player2: string;
  group_name: "A" | "B";
}

export interface Match {
  id: number;
  match_number: number;
  round: "league" | "semi_final" | "final";
  group_name: "A" | "B" | null;
  team1_id: number | null;
  team2_id: number | null;
  court: string;
  scheduled_time: string;
  umpire: string | null;
  line_umpire1: string | null;
  line_umpire2: string | null;
  status: "upcoming" | "live" | "completed";
  winner_team_id: number | null;
  created_at: string;
  // Joined
  team1?: Team;
  team2?: Team;
  set_scores?: SetScore[];
}

export interface SetScore {
  id: number;
  match_id: number;
  set_number: 1 | 2 | 3;
  team1_score: number;
  team2_score: number;
}

export interface Standing {
  team: Team;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  netSets: number;
  pointsFor: number;
  pointsAgainst: number;
  netPoints: number;
}
