"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Match } from "@/types/cricket";
import { formatDate, getMatchResult, getTeamById, loadAllMatches, scoreSummary } from "@/lib/cricket";

export default function ScorecardIndexPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setMatches(loadAllMatches());
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_#0a1522_0%,_#101e30_45%,_#09111b_100%)] pt-20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-100">
              Match History
            </p>
            <h1 className="text-4xl font-semibold text-white">All saved scorecards</h1>
            <p className="mt-3 text-slate-400">Pick up live matches or review completed games.</p>
          </div>
          <Link href="/scorecard/create">
            <Button className="rounded-full bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Plus className="mr-2 h-4 w-4" />
              New Match
            </Button>
          </Link>
        </div>

        {matches.length === 0 ? (
          <Card className="border-white/10 bg-white/5 text-center backdrop-blur-xl">
            <CardContent className="py-20">
              <Trophy className="mx-auto mb-5 h-16 w-16 text-slate-500" />
              <h2 className="text-2xl font-semibold text-white">No matches yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Create a match and start scoring ball-by-ball with live batting, bowling, and over
                timelines.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {matches.map((match) => {
              const currentInnings = match.innings[match.currentInnings - 1];
              const battingTeam = getTeamById(match, currentInnings.battingTeamId);
              const bowlingTeam = getTeamById(match, currentInnings.bowlingTeamId);
              return (
                <Link key={match.id} href={`/scorecard/${match.id}`}>
                  <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-emerald-300/30">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {match.teamA.name} vs {match.teamB.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {match.format} • {formatDate(match.date)} • {match.venue || "Venue TBD"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                          <p className="text-xs text-slate-500">Now batting</p>
                          <p className="mt-2 font-semibold text-white">{battingTeam.name}</p>
                          <p className="mt-1 text-sm text-slate-300">{scoreSummary(match)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                          <p className="text-xs text-slate-500">Now bowling</p>
                          <p className="mt-2 font-semibold text-white">{bowlingTeam.name}</p>
                          <p className="mt-1 text-sm text-slate-300 capitalize">{match.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-400">
                          <Clock3 className="h-4 w-4" />
                          Updated {new Date(match.updatedAt).toLocaleTimeString()}
                        </span>
                        <span className="font-medium text-emerald-200">
                          {match.status === "completed" ? getMatchResult(match) : "Open live screen"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
