import type { Match } from './supabase';

export type ChampionPointsTier = {
  points: number;
  label: string;
  deadline: string;
};

export function getChampionPoints(matches: Match[], now: Date = new Date()): number {
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  );

  const firstMatch = sortedMatches[0];
  const groupMatches = sortedMatches.filter(m => m.stage === 'group');
  const lastGroupMatch = groupMatches[groupMatches.length - 1];
  const quarterFinalMatches = sortedMatches.filter(m => m.stage === 'quarter_final');
  const firstQF = quarterFinalMatches[0];
  const finalMatch = sortedMatches.find(m => m.stage === 'final');

  if (!firstMatch) return 25;

  const firstMatchDate = new Date(firstMatch.match_date);
  const lastGroupDate = lastGroupMatch ? new Date(lastGroupMatch.match_date) : null;
  const firstQFDate = firstQF ? new Date(firstQF.match_date) : null;
  const finalDate = finalMatch ? new Date(finalMatch.match_date) : null;

  // Vor dem ersten Spieltag: 30 Punkte
  if (now < firstMatchDate) return 30;

  // Vor Ende der Gruppenphase: 25 Punkte
  if (!lastGroupDate || now < lastGroupDate) return 25;

  // Vor dem Viertelfinale: 20 Punkte
  if (!firstQFDate || now < firstQFDate) return 20;

  // Vor dem Finale: 15 Punkte
  if (!finalDate || now < finalDate) return 15;

  // Nach dem Finale: 0 Punkte
  return 0;
}

export function getChampionTiers(matches: Match[]): ChampionPointsTier[] {
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  );

  const firstMatch = sortedMatches[0];
  const groupMatches = sortedMatches.filter(m => m.stage === 'group');
  const lastGroupMatch = groupMatches[groupMatches.length - 1];
  const quarterFinalMatches = sortedMatches.filter(m => m.stage === 'quarter_final');
  const firstQF = quarterFinalMatches[0];
  const finalMatch = sortedMatches.find(m => m.stage === 'final');

  return [
    {
      points: 30,
      label: 'Vor dem 1. Spieltag',
      deadline: firstMatch ? new Date(firstMatch.match_date).toLocaleDateString('de-DE') : '–',
    },
    {
      points: 25,
      label: 'Bis Ende Gruppenphase',
      deadline: lastGroupMatch ? new Date(lastGroupMatch.match_date).toLocaleDateString('de-DE') : '–',
    },
    {
      points: 20,
      label: 'Bis Viertelfinale',
      deadline: firstQF ? new Date(firstQF.match_date).toLocaleDateString('de-DE') : '–',
    },
    {
      points: 15,
      label: 'Bis Finale',
      deadline: finalMatch ? new Date(finalMatch.match_date).toLocaleDateString('de-DE') : '–',
    },
  ];
}
