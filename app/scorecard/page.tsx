"use client";

import { useState, useEffect } from "react";
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

export default function ScorecardIndexPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch matches from API
    setMatches(mockMatches);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Scorecards</h1>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No matches created yet.</p>
              <Link href="/">
                <Button>Create Your First Match</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {match.teamA.name} vs {match.teamB.name}
                  </CardTitle>
                  <CardDescription>
                    {match.matchType} • {match.venue || "Venue TBD"} •{" "}
                    {match.date
                      ? new Date(match.date).toLocaleDateString()
                      : "Date TBD"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{match.teamA.name}:</span>
                      <span className="font-semibold">
                        {match.teamA.score}/{match.teamA.wickets} (
                        {match.teamA.overs} ov)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{match.teamB.name}:</span>
                      <span className="font-semibold">
                        {match.teamB.score}/{match.teamB.wickets} (
                        {match.teamB.overs} ov)
                      </span>
                    </div>
                  </div>
                  <Link href={`/scorecard/${match.id}`} className="mt-4 block">
                    <Button className="w-full">View Scorecard</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
