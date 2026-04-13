import { Match } from "@/types/cricket";
import { IPlayer } from "@/lib/Player";

function toNumber(value: number) {
  return Number(value.toFixed(2));
}

export function updateDerivedStats(player: IPlayer) {
  player.batting.average =
    player.batting.outs === 0
      ? player.batting.runs
      : toNumber(player.batting.runs / player.batting.outs);
  player.batting.strikeRate =
    player.batting.balls === 0
      ? 0
      : toNumber((player.batting.runs / player.batting.balls) * 100);
  player.bowling.economy =
    player.bowling.balls === 0
      ? 0
      : toNumber(player.bowling.runsConceded / (player.bowling.balls / 6));
}

export function collectProfileIds(match: Match) {
  const ids = new Set<string>();
  for (const team of [match.teamA, match.teamB]) {
    for (const player of team.players) {
      if (player.profileId) {
        ids.add(player.profileId);
      }
    }
  }
  return Array.from(ids);
}
