import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STAGE_MAP: Record<string, string> = {
  "Group Stage": "group",
  "Round of 32": "round_of_32",
  "Round of 16": "round_of_16",
  "Quarter-finals": "quarter_final",
  "Semi-finals": "semi_final",
  "Third place play-off": "third_place",
  "Final": "final",
};

const STATUS_MAP: Record<string, string> = {
  "SCHEDULED": "scheduled",
  "TIMED": "scheduled",
  "IN_PLAY": "live",
  "PAUSED": "live",
  "FINISHED": "finished",
  "POSTPONED": "scheduled",
  "CANCELLED": "scheduled",
  "SUSPENDED": "live",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verwende football-data.org API (kostenlos, kein API-Key für Basiszugang)
    // WM 2026 hat noch keine Daten - wir nutzen die aktuelle WM-Kompetitions-ID
    // Für die WM 2026 API-ID: 2000 (FIFA World Cup)
    const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["X-Auth-Token"] = apiKey;
    }

    // Versuche Spiele von football-data.org abzurufen
    let matches: unknown[] = [];
    let teamsMap: Record<string, string> = {};

    try {
      const matchesRes = await fetch(
        "https://api.football-data.org/v4/competitions/2000/matches",
        { headers }
      );

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        matches = data.matches || [];

        // Teams aus DB laden für Name-zu-ID-Mapping
        const { data: dbTeams } = await supabase.from("teams").select("id, name");
        if (dbTeams) {
          for (const t of dbTeams) {
            teamsMap[t.name.toLowerCase()] = t.id;
          }
        }

        let updated = 0;
        let inserted = 0;

        for (const m of matches as Record<string, unknown>[]) {
          const homeTeamData = m.homeTeam as Record<string, unknown>;
          const awayTeamData = m.awayTeam as Record<string, unknown>;
          const scoreData = m.score as Record<string, unknown>;
          const fullTimeData = scoreData?.fullTime as Record<string, unknown> | null;

          const homeName = String(homeTeamData?.name || "").toLowerCase();
          const awayName = String(awayTeamData?.name || "").toLowerCase();

          // Suche nach Team-IDs (fuzzy match)
          const homeId = teamsMap[homeName] || findTeamId(teamsMap, homeName);
          const awayId = teamsMap[awayName] || findTeamId(teamsMap, awayName);

          if (!homeId || !awayId) continue;

          const stageRaw = String((m.stage as string) || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          const mappedStage = STAGE_MAP[stageRaw] || "group";
          const mappedStatus = STATUS_MAP[String(m.status || "SCHEDULED")] || "scheduled";

          const matchPayload = {
            external_id: `fd-${m.id}`,
            home_team_id: homeId,
            away_team_id: awayId,
            match_date: String(m.utcDate || ""),
            stage: mappedStage,
            status: mappedStatus,
            home_score: fullTimeData?.home != null ? Number(fullTimeData.home) : null,
            away_score: fullTimeData?.away != null ? Number(fullTimeData.away) : null,
            matchday: m.matchday ? Number(m.matchday) : null,
            updated_at: new Date().toISOString(),
          };

          const { data: existing } = await supabase
            .from("matches")
            .select("id")
            .eq("external_id", `fd-${m.id}`)
            .maybeSingle();

          if (existing) {
            await supabase.from("matches").update(matchPayload).eq("external_id", `fd-${m.id}`);
            updated++;
          } else {
            await supabase.from("matches").insert(matchPayload);
            inserted++;
          }
        }

        return new Response(
          JSON.stringify({ success: true, inserted, updated, total: matches.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (apiErr) {
      console.error("API error:", apiErr);
    }

    // Fallback: Nur bestehende "live" Spiele als "finished" markieren können
    return new Response(
      JSON.stringify({ success: true, message: "No external data available", matches: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function findTeamId(teamsMap: Record<string, string>, name: string): string | null {
  for (const [key, id] of Object.entries(teamsMap)) {
    if (key.includes(name) || name.includes(key)) return id;
  }
  return null;
}
