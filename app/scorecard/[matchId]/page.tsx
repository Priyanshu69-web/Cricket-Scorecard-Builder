"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Match } from "@/types/cricket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";

// Mock data - in a real app, this would come from an API or database
const mockMatches: Match[] = [];

export default function ScorecardPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch match data from API
    const foundMatch = mockMatches.find((m) => m.id === matchId);
    if (foundMatch) {
      setMatch(foundMatch);
    }
    setLoading(false);
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match not found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {match.teamA.name} vs {match.teamB.name}
              </CardTitle>
              <CardDescription>
                {match.matchType} • {match.venue} •{" "}
                {match.date
                  ? new Date(match.date).toLocaleDateString()
                  : "Date TBD"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h3 className="font-semibold">{match.teamA.name}</h3>
                  <p className="text-2xl font-bold">
                    {match.teamA.score}/{match.teamA.wickets}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({match.teamA.overs} overs)
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{match.teamB.name}</h3>
                  <p className="text-2xl font-bold">
                    {match.teamB.score}/{match.teamB.wickets}
                  </p>
                  <p className="text-sm text-gray-600">
                    ({match.teamB.overs} overs)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team A Scorecard */}
          <Card>
            <CardHeader>
              <CardTitle>{match.teamA.name} Batting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.teamA.players.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No players added yet
                  </p>
                ) : (
                  match.teamA.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <span>{player.name}</span>
                      <span>
                        {player.runs} ({player.balls})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team B Scorecard */}
          <Card>
            <CardHeader>
              <CardTitle>{match.teamB.name} Batting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.teamB.players.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No players added yet
                  </p>
                ) : (
                  match.teamB.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <span>{player.name}</span>
                      <span>
                        {player.runs} ({player.balls})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
