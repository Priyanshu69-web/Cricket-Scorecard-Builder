"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Match } from "@/types/cricket";
import { formatDate, getMatchResult, getTeamById, scoreSummary } from "@/lib/cricket";
import { fetchMatches } from "@/lib/cricket-api";

export default function ScorecardIndexPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches().then(setMatches);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pt-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-700 dark:border-sky-300/20 dark:bg-sky-300/10 dark:text-sky-100">
              Match History
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">All saved scorecards</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Pick up live matches or review completed games.</p>
          </div>
          <Link href="/scorecard/create">
            <Button className="rounded-md bg-emerald-600 text-white hover:bg-emerald-500">
              <Plus className="mr-2 h-4 w-4" />
              New Match
            </Button>
          </Link>
        </div>

        {matches.length === 0 ? (
          <Card className="border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="py-20">
              <Trophy className="mx-auto mb-5 h-16 w-16 text-slate-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">No matches yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
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
                  <Card className="h-full border-slate-200 bg-white transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">
                        {match.teamA.name} vs {match.teamB.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        {match.format} • {formatDate(match.date)} • {match.venue || "Venue TBD"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-xs text-slate-500">Now batting</p>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{battingTeam.name}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{scoreSummary(match)}</p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-xs text-slate-500">Now bowling</p>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{bowlingTeam.name}</p>
                          <p className="mt-1 text-sm capitalize text-slate-600 dark:text-slate-300">{match.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
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
