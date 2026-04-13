"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarBadge from "@/components/AvatarBadge";
import { PlayerProfile } from "@/types/cricket";

function toOvers(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    const id = String(params.id || "");
    fetch(`/api/players/${id}`)
      .then((res) => res.json())
      .then((data) => setPlayer(data?._id ? data : null))
      .catch(() => setPlayer(null));
  }, [params.id]);

  if (!player) {
    return <div className="px-4 py-24 text-slate-200">Loading player profile...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-24">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AvatarBadge name={player.name} imageUrl={player.imageUrl} className="h-12 w-12" />
            <CardTitle className="text-xl text-slate-900">{player.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Role</p>
            <p className="font-medium">{player.role}</p>
            <p className="mt-2 text-xs text-slate-500">Batting style</p>
            <p>{player.battingStyle}</p>
            <p className="mt-2 text-xs text-slate-500">Bowling style</p>
            <p>{player.bowlingStyle || "-"}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Matches</p>
            <p className="font-medium">{player.matchesPlayed}</p>
            <p className="mt-2 text-xs text-slate-500">Runs</p>
            <p>{player.batting.runs}</p>
            <p className="mt-2 text-xs text-slate-500">Average / SR</p>
            <p>
              {player.batting.average} / {player.batting.strikeRate}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Wickets</p>
            <p className="font-medium">{player.bowling.wickets}</p>
            <p className="mt-2 text-xs text-slate-500">Runs conceded</p>
            <p>{player.bowling.runsConceded}</p>
            <p className="mt-2 text-xs text-slate-500">Overs / Economy</p>
            <p>
              {toOvers(player.bowling.balls)} / {player.bowling.economy}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
