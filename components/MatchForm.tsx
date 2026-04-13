"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PlayerForm from "@/components/PlayerForm";
import PlayerPicker from "@/components/PlayerPicker";
import { createMatch, quickPlayers } from "@/lib/cricket";
import { createMatchRecord } from "@/lib/cricket-api";
import { MatchFormat, PlayerProfile } from "@/types/cricket";

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

function pickPlayers(
  selectedIds: string[],
  profiles: PlayerProfile[],
  textInput: string,
  fallbackName: string
) {
  if (selectedIds.length >= 11) {
    return selectedIds
      .slice(0, 11)
      .map((id) => profiles.find((item) => item._id === id))
      .filter((value): value is PlayerProfile => Boolean(value))
      .map((player) => ({ name: player.name, profileId: player._id }));
  }
  return listToPlayers(textInput, fallbackName);
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
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [selectedTeamAIds, setSelectedTeamAIds] = useState<string[]>([]);
  const [selectedTeamBIds, setSelectedTeamBIds] = useState<string[]>([]);

  async function loadProfiles() {
    const res = await fetch("/api/players");
    const data = await res.json();
    setProfiles(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProfiles().catch(() => setProfiles([]));
  }, []);

  const selectableProfiles = useMemo(() => profiles.slice(0, 80), [profiles]);

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

  async function handleCreate() {
    const match = createMatch({
      teamAName,
      teamBName,
      format,
      oversLimit,
      tossWinner,
      tossDecision,
      venue,
      date,
      teamAPlayers: pickPlayers(selectedTeamAIds, profiles, teamAPlayers, teamAName),
      teamBPlayers: pickPlayers(selectedTeamBIds, profiles, teamBPlayers, teamBName),
    });

    await createMatchRecord(match);
    router.push(`/scorecard/${match.id}`);
  }

  async function handleCreateInlinePlayer(
    team: "A" | "B",
    payload: {
    name: string;
    role: PlayerProfile["role"];
    battingStyle: PlayerProfile["battingStyle"];
    bowlingStyle: string;
    imageUrl: string;
  }) {
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    await loadProfiles();
    if (created?._id) {
      if (team === "A") {
        setSelectedTeamAIds((value) =>
          value.length < 11 && !value.includes(created._id) ? [...value, created._id] : value
        );
      } else {
        setSelectedTeamBIds((value) =>
          value.length < 11 && !value.includes(created._id) ? [...value, created._id] : value
        );
      }
    }
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Create match</CardTitle>
          <CardDescription>
            Set up teams, toss, overs, and player lists in one place.
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={quickStart}
          variant="outline"
          className="rounded-md"
        >
          <Zap className="mr-2 h-4 w-4" />
          Quick Start Match
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Team A</label>
            <Input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Team B</label>
            <Input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Format</label>
            <select
              value={format}
              onChange={(e) => updateFormat(e.target.value as MatchFormat)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {formatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Overs</label>
            <Input type="number" value={oversLimit} onChange={(e) => setOversLimit(Number(e.target.value || 20))} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Venue</label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Toss winner</label>
            <select
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value as "teamA" | "teamB")}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="teamA">{teamAName}</option>
              <option value="teamB">{teamBName}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Toss decision</label>
            <select
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value as "bat" | "bowl")}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="bat">Bat first</option>
              <option value="bowl">Bowl first</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlayerPicker
            title={`Select saved players for ${teamAName}`}
            players={selectableProfiles}
            selectedIds={selectedTeamAIds}
            onChange={setSelectedTeamAIds}
            onCreatePlayer={(payload) => handleCreateInlinePlayer("A", payload)}
          />
          <PlayerPicker
            title={`Select saved players for ${teamBName}`}
            players={selectableProfiles}
            selectedIds={selectedTeamBIds}
            onChange={setSelectedTeamBIds}
            onCreatePlayer={(payload) => handleCreateInlinePlayer("B", payload)}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlayerForm label={`${teamAName} squad`} value={teamAPlayers} onChange={setTeamAPlayers} />
          <PlayerForm label={`${teamBName} squad`} value={teamBPlayers} onChange={setTeamBPlayers} />
        </div>

        <Button
          onClick={handleCreate}
          className="h-11 w-full rounded-md bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
        >
          Start scoring
        </Button>
      </CardContent>
    </Card>
  );
}
