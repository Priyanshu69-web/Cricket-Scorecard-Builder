"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AvatarBadge from "@/components/AvatarBadge";
import { PlayerProfile } from "@/types/cricket";

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<PlayerProfile["role"]>("Batsman");
  const [battingStyle, setBattingStyle] = useState<PlayerProfile["battingStyle"]>("Right");
  const [bowlingStyle, setBowlingStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function fetchPlayers() {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function createPlayer() {
    if (!name.trim()) return;
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, battingStyle, bowlingStyle, imageUrl }),
    });
    setName("");
    setBowlingStyle("");
    setImageUrl("");
    fetchPlayers();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Player Profiles</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Create and manage reusable players for match selection.</p>
      </div>

      <Card className="mb-4 border-slate-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-900">Add player</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-6">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlayerProfile["role"])}
            className="h-10 rounded-md border border-slate-300 px-2 text-sm"
          >
            <option>Batsman</option>
            <option>Bowler</option>
            <option>All-rounder</option>
            <option>Wicketkeeper</option>
          </select>
          <select
            value={battingStyle}
            onChange={(e) => setBattingStyle(e.target.value as PlayerProfile["battingStyle"])}
            className="h-10 rounded-md border border-slate-300 px-2 text-sm"
          >
            <option>Right</option>
            <option>Left</option>
          </select>
          <Input value={bowlingStyle} onChange={(e) => setBowlingStyle(e.target.value)} placeholder="Bowling style" />
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Profile image URL" />
          <Button onClick={createPlayer}>Create</Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-900">All players</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Player</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Matches</th>
                <th className="pb-2">Runs</th>
                <th className="pb-2">Wickets</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player._id} className="border-t border-slate-200 text-slate-700">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <AvatarBadge name={player.name} imageUrl={player.imageUrl} />
                      <Link href={`/players/${player._id}`} className="text-blue-600 hover:underline">
                        {player.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-2">{player.role}</td>
                  <td className="py-2">{player.matchesPlayed}</td>
                  <td className="py-2">{player.batting.runs}</td>
                  <td className="py-2">{player.bowling.wickets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
