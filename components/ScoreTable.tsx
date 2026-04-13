"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Innings } from "@/types/cricket";
import { economyRate, strikeRate, toOvers } from "@/lib/cricket";

type ScoreTableProps = {
  innings: Innings;
  battingTeamName: string;
  bowlingTeamName: string;
};

export default function ScoreTable({
  innings,
  battingTeamName,
  bowlingTeamName,
}: ScoreTableProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">{battingTeamName} batting</CardTitle>
          <CardDescription className="text-slate-400">
            Official-style batting table with dismissal details.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-3">Player</th>
                <th className="pb-3">Dismissal</th>
                <th className="pb-3 text-right">R</th>
                <th className="pb-3 text-right">B</th>
                <th className="pb-3 text-right">4s</th>
                <th className="pb-3 text-right">6s</th>
                <th className="pb-3 text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batting.map((player) => (
                <tr key={player.playerId} className="border-t border-white/5 text-slate-200">
                  <td className="py-3">{player.name}</td>
                  <td className="py-3 text-slate-400">
                    {player.isOut ? player.dismissal : player.balls > 0 ? "not out" : "yet to bat"}
                  </td>
                  <td className="py-3 text-right">{player.runs}</td>
                  <td className="py-3 text-right">{player.balls}</td>
                  <td className="py-3 text-right">{player.fours}</td>
                  <td className="py-3 text-right">{player.sixes}</td>
                  <td className="py-3 text-right">{strikeRate(player.runs, player.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">{bowlingTeamName} bowling</CardTitle>
          <CardDescription className="text-slate-400">
            Overs, maidens, runs, wickets, and economy.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-3">Bowler</th>
                <th className="pb-3 text-right">O</th>
                <th className="pb-3 text-right">M</th>
                <th className="pb-3 text-right">R</th>
                <th className="pb-3 text-right">W</th>
                <th className="pb-3 text-right">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowling
                .filter((bowler) => bowler.balls > 0 || bowler.runsConceded > 0 || bowler.wickets > 0)
                .map((bowler) => (
                  <tr key={bowler.playerId} className="border-t border-white/5 text-slate-200">
                    <td className="py-3">{bowler.name}</td>
                    <td className="py-3 text-right">{toOvers(bowler.balls)}</td>
                    <td className="py-3 text-right">{bowler.maidens}</td>
                    <td className="py-3 text-right">{bowler.runsConceded}</td>
                    <td className="py-3 text-right">{bowler.wickets}</td>
                    <td className="py-3 text-right">{economyRate(bowler.runsConceded, bowler.balls)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Extras and total</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs text-slate-500">Wides</p>
            <p className="mt-2 text-xl font-semibold text-white">{innings.extras.wides}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs text-slate-500">No-balls</p>
            <p className="mt-2 text-xl font-semibold text-white">{innings.extras.noBalls}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs text-slate-500">Byes</p>
            <p className="mt-2 text-xl font-semibold text-white">{innings.extras.byes}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs text-emerald-100/80">Total</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {innings.totalRuns}/{innings.wickets} ({toOvers(innings.legalBalls)})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
