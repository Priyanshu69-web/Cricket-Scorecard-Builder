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
import {
  ArrowLeftIcon,
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";

export default function ScorecardIndexPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load matches from localStorage
    const loadMatches = () => {
      const storedMatches: Match[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("match_")) {
          try {
            const matchData = JSON.parse(localStorage.getItem(key)!);
            storedMatches.push(matchData);
          } catch {
            // Remove invalid data
            localStorage.removeItem(key);
          }
        }
      }
      setMatches(storedMatches);
      setLoading(false);
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-6 shadow-lg">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-4">
              <TrophyIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
              Scorecard Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              View and manage all your cricket matches in one place
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/30 dark:border-gray-600/30 rounded-2xl">
            <CardContent className="text-center py-20">
              <TrophyIcon className="h-20 w-20 mx-auto mb-6 text-gray-400 dark:text-gray-500" />
              <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                No matches created yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Create your first match to start tracking scores and building
                professional scorecards.
              </p>
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-lg"
                >
                  Create Your First Match
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/30 dark:border-gray-600/30 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {match.teamA.name} vs {match.teamB.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 flex flex-wrap gap-2">
                    {match.matchType && (
                      <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-xs">
                        <TrophyIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                        {match.matchType}
                      </span>
                    )}
                    {match.date && (
                      <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-xs">
                        <CalendarIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                    )}
                    {match.venue && (
                      <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full text-xs">
                        <MapPinIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                        {match.venue}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {match.teamA.name}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {match.teamA.score}/{match.teamA.wickets}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <ClockIcon className="h-4 w-4" />
                        {match.teamA.overs} overs
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {match.teamB.name}
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {match.teamB.score}/{match.teamB.wickets}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <ClockIcon className="h-4 w-4" />
                        {match.teamB.overs} overs
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href={`/scorecard/${match.id}`}>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 shadow-lg">
                        View Scorecard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
