"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Innings } from "@/types/cricket";
import { economyRate, strikeRate, toOvers } from "@/lib/cricket";
import CollapsibleCard from "@/components/CollapsibleCard";

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
    <div className="space-y-3">
      <CollapsibleCard
        title={`${battingTeamName} batting`}
        description="Compact live batting card."
        className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2">Player</th>
                <th className="pb-2">Dismissal</th>
                <th className="pb-2 text-right">R</th>
                <th className="pb-2 text-right">B</th>
                <th className="pb-2 text-right">4s</th>
                <th className="pb-2 text-right">6s</th>
                <th className="pb-2 text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {innings.batting.map((player) => (
                <tr key={player.playerId} className="border-t border-slate-100 text-slate-700">
                  <td className="py-2">{player.name}</td>
                  <td className="py-2 text-slate-500">
                    {player.isOut ? player.dismissal : player.balls > 0 ? "not out" : "yet to bat"}
                  </td>
                  <td className="py-2 text-right">{player.runs}</td>
                  <td className="py-2 text-right">{player.balls}</td>
                  <td className="py-2 text-right">{player.fours}</td>
                  <td className="py-2 text-right">{player.sixes}</td>
                  <td className="py-2 text-right">{strikeRate(player.runs, player.balls)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title={`${bowlingTeamName} bowling`}
        description="Overs, runs, wickets, economy."
        defaultOpen={false}
        className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2">Bowler</th>
                <th className="pb-2 text-right">O</th>
                <th className="pb-2 text-right">M</th>
                <th className="pb-2 text-right">R</th>
                <th className="pb-2 text-right">W</th>
                <th className="pb-2 text-right">Econ</th>
              </tr>
            </thead>
            <tbody>
              {innings.bowling
                .filter((bowler) => bowler.balls > 0 || bowler.runsConceded > 0 || bowler.wickets > 0)
                .map((bowler) => (
                  <tr key={bowler.playerId} className="border-t border-slate-100 text-slate-700">
                    <td className="py-2">{bowler.name}</td>
                    <td className="py-2 text-right">{toOvers(bowler.balls)}</td>
                    <td className="py-2 text-right">{bowler.maidens}</td>
                    <td className="py-2 text-right">{bowler.runsConceded}</td>
                    <td className="py-2 text-right">{bowler.wickets}</td>
                    <td className="py-2 text-right">{economyRate(bowler.runsConceded, bowler.balls)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="Extras and total"
        defaultOpen={false}
        className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid gap-2 md:grid-cols-5">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Wide</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{innings.extras.wides}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs text-slate-500">No ball</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{innings.extras.noBalls}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Bye</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{innings.extras.byes}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs text-slate-500">Leg bye</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{innings.extras.legByes}</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
            <p className="text-xs text-emerald-700">Total</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {innings.totalRuns}/{innings.wickets} ({toOvers(innings.legalBalls)})
            </p>
          </div>
        </div>
      </CollapsibleCard>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="space-y-1 text-xs text-slate-700">
          {innings.fallOfWickets.length === 0 ? (
            <p className="text-slate-500">No wickets yet.</p>
          ) : (
            innings.fallOfWickets.map((item) => (
              <p key={`${item.wicket}-${item.over}`}>
                {item.score}-{item.wicket} ({item.batterName}, {item.over} ov)
              </p>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
