"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PlayerForm from "@/components/PlayerForm";
import { createMatch, quickPlayers, saveMatch } from "@/lib/cricket";
import { MatchFormat } from "@/types/cricket";

const formatOptions: Array<{ label: string; value: MatchFormat; overs: number }> = [
  { label: "T20", value: "T20", overs: 20 },
  { label: "ODI", value: "ODI", overs: 50 },
  { label: "Test", value: "Test", overs: 90 },
  { label: "Custom", value: "Custom", overs: 10 },
];

function listToPlayers(input: string, fallbackName: string) {
  const players = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (players.length >= 11) {
    return players.slice(0, 11);
  }

  return quickPlayers(fallbackName);
}

export default function MatchForm() {
  const router = useRouter();
  const [teamAName, setTeamAName] = useState("Mumbai Mavericks");
  const [teamBName, setTeamBName] = useState("Delhi Daredevils");
  const [format, setFormat] = useState<MatchFormat>("T20");
  const [oversLimit, setOversLimit] = useState(20);
  const [venue, setVenue] = useState("Wankhede Stadium");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tossWinner, setTossWinner] = useState<"teamA" | "teamB">("teamA");
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");
  const [teamAPlayers, setTeamAPlayers] = useState(quickPlayers("Mumbai Mavericks").join("\n"));
  const [teamBPlayers, setTeamBPlayers] = useState(quickPlayers("Delhi Daredevils").join("\n"));

  function quickStart() {
    const nextTeamA = "Mumbai Mavericks";
    const nextTeamB = "Delhi Daredevils";
    setTeamAName(nextTeamA);
    setTeamBName(nextTeamB);
    setFormat("T20");
    setOversLimit(20);
    setVenue("Wankhede Stadium");
    setTossWinner("teamA");
    setTossDecision("bat");
    setTeamAPlayers(quickPlayers(nextTeamA).join("\n"));
    setTeamBPlayers(quickPlayers(nextTeamB).join("\n"));
  }

  function updateFormat(nextFormat: MatchFormat) {
    setFormat(nextFormat);
    const config = formatOptions.find((option) => option.value === nextFormat);
    if (config) {
      setOversLimit(config.overs);
    }
  }

  function handleCreate() {
    const match = createMatch({
      teamAName,
      teamBName,
      format,
      oversLimit,
      tossWinner,
      tossDecision,
      venue,
      date,
      teamAPlayers: listToPlayers(teamAPlayers, teamAName),
      teamBPlayers: listToPlayers(teamBPlayers, teamBName),
    });

    saveMatch(match);
    router.push(`/scorecard/${match.id}`);
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-white">Create match</CardTitle>
          <CardDescription className="text-slate-400">
            Set up teams, toss, overs, and player lists in one place.
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={quickStart}
          variant="outline"
          className="rounded-full border-emerald-300/20 text-emerald-200 hover:bg-emerald-300/10"
        >
          <Zap className="mr-2 h-4 w-4" />
          Quick Start Match
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Team A</label>
            <Input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} className="border-white/10 bg-slate-950/50 text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Team B</label>
            <Input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} className="border-white/10 bg-slate-950/50 text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Format</label>
            <select
              value={format}
              onChange={(e) => updateFormat(e.target.value as MatchFormat)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-white"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Overs</label>
            <Input type="number" value={oversLimit} onChange={(e) => setOversLimit(Number(e.target.value || 20))} className="border-white/10 bg-slate-950/50 text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Venue</label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="border-white/10 bg-slate-950/50 text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-white/10 bg-slate-950/50 text-white" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Toss winner</label>
            <select
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value as "teamA" | "teamB")}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-white"
            >
              <option value="teamA">{teamAName}</option>
              <option value="teamB">{teamBName}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Toss decision</label>
            <select
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value as "bat" | "bowl")}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-white"
            >
              <option value="bat">Bat first</option>
              <option value="bowl">Bowl first</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlayerForm label={`${teamAName} squad`} value={teamAPlayers} onChange={setTeamAPlayers} />
          <PlayerForm label={`${teamBName} squad`} value={teamBPlayers} onChange={setTeamBPlayers} />
        </div>

        <Button
          onClick={handleCreate}
          className="h-12 w-full rounded-2xl bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
        >
          Start scoring
        </Button>
      </CardContent>
    </Card>
  );
}
