import type { Match, Prediction, Team } from './supabase';

export interface TeamStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  teams: TeamStanding[];
  /** true if all 6 group matches have a prediction */
  complete: boolean;
}

function getWinner(home: number, away: number): 'home' | 'away' | 'draw' {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

export function computeGroupStandings(
  matches: Match[],
  predictions: Prediction[],
): GroupStanding[] {
  const groupMatches = matches.filter((m) => m.stage === 'group');
  const predMap = new Map<string, Prediction>(predictions.map((p) => [p.match_id, p]));

  // Collect all groups
  const groups = new Set<string>();
  for (const m of groupMatches) {
    const home = (m as any).home_team as Team | undefined;
    const away = (m as any).away_team as Team | undefined;
    const grp = home?.group_name || away?.group_name;
    if (grp) groups.add(grp);
  }

  const result: GroupStanding[] = [];

  for (const group of Array.from(groups).sort()) {
    const gMatches = groupMatches.filter((m) => {
      const home = (m as any).home_team as Team | undefined;
      const away = (m as any).away_team as Team | undefined;
      return home?.group_name === group || away?.group_name === group;
    });

    // Collect unique teams in the group
    const teamMap = new Map<string, Team>();
    for (const m of gMatches) {
      const home = (m as any).home_team as Team | undefined;
      const away = (m as any).away_team as Team | undefined;
      if (home) teamMap.set(home.id, home);
      if (away) teamMap.set(away.id, away);
    }

    const standings = new Map<string, TeamStanding>();
    for (const [id, team] of teamMap) {
      standings.set(id, { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 });
    }

    let tippedCount = 0;
    for (const m of gMatches) {
      // Use real result if finished, otherwise use prediction
      let homeScore: number | null = null;
      let awayScore: number | null = null;

      if (m.status === 'finished' && m.home_score !== null && m.away_score !== null) {
        homeScore = m.home_score;
        awayScore = m.away_score;
        tippedCount++;
      } else {
        const pred = predMap.get(m.id);
        if (pred !== undefined) {
          homeScore = pred.home_score;
          awayScore = pred.away_score;
          tippedCount++;
        }
      }

      if (homeScore === null || awayScore === null) continue;

      const homeTeam = (m as any).home_team as Team | undefined;
      const awayTeam = (m as any).away_team as Team | undefined;
      if (!homeTeam || !awayTeam) continue;

      const hs = standings.get(homeTeam.id)!;
      const as_ = standings.get(awayTeam.id)!;
      const winner = getWinner(homeScore, awayScore);

      hs.played++;
      as_.played++;
      hs.goalsFor += homeScore;
      hs.goalsAgainst += awayScore;
      as_.goalsFor += awayScore;
      as_.goalsAgainst += homeScore;

      if (winner === 'home') {
        hs.won++;
        hs.points += 3;
        as_.lost++;
      } else if (winner === 'away') {
        as_.won++;
        as_.points += 3;
        hs.lost++;
      } else {
        hs.drawn++;
        as_.drawn++;
        hs.points++;
        as_.points++;
      }
      hs.goalDiff = hs.goalsFor - hs.goalsAgainst;
      as_.goalDiff = as_.goalsFor - as_.goalsAgainst;
    }

    const sorted = Array.from(standings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.name.localeCompare(b.team.name);
    });

    result.push({
      group,
      teams: sorted,
      complete: tippedCount === gMatches.length,
    });
  }

  return result;
}

/** Returns true when all 48 group matches have a prediction (or are finished) */
export function allGroupsComplete(standings: GroupStanding[]): boolean {
  return standings.length > 0 && standings.every((g) => g.complete);
}
