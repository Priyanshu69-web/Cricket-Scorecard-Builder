import { Match } from "@/types/cricket";

export async function createMatchRecord(match: Match) {
  const res = await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match }),
  });
  if (!res.ok) {
    throw new Error("Failed to create match");
  }
}

export async function updateMatchRecord(match: Match) {
  const res = await fetch(`/api/matches/${match.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match }),
  });
  if (!res.ok) {
    throw new Error("Failed to update match");
  }
}

export async function fetchMatch(matchId: string): Promise<Match | null> {
  const res = await fetch(`/api/matches/${matchId}`);
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as Match;
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch("/api/matches");
  if (!res.ok) {
    return [];
  }
  return (await res.json()) as Match[];
}

export async function removeMatch(matchId: string) {
  await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
}
