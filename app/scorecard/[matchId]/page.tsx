"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Match, Player, Bowler } from "@/types/cricket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrophyIcon,
  UsersIcon,
  TargetIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function ScorecardPage() {
  const params = useParams();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [currentBatsman, setCurrentBatsman] = useState<string | null>(null);
  const [currentBowler, setCurrentBowler] = useState<string | null>(null);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = () => {
    try {
      const matchData = localStorage.getItem(`match_${matchId}`);
      if (matchData) {
        const parsedMatch = JSON.parse(matchData);
        setMatch(parsedMatch);
        // Set current batsman and bowler if available
        const currentTeam =
          parsedMatch.currentInnings === 1
            ? parsedMatch.teamA
            : parsedMatch.teamB;
        const activeBatsman = currentTeam.players.find((p: Player) => !p.isOut);
        const activeBowler =
          parsedMatch.currentInnings === 1
            ? parsedMatch.teamB.bowlers[0]
            : parsedMatch.teamA.bowlers[0];
        setCurrentBatsman(activeBatsman?.id || null);
        setCurrentBowler(activeBowler?.id || null);
      }
    } catch (error) {
      console.error("Error loading match:", error);
      toast.error("Failed to load match data");
    }
    setLoading(false);
  };

  const saveMatch = (updatedMatch: Match) => {
    try {
      localStorage.setItem(`match_${matchId}`, JSON.stringify(updatedMatch));
      setMatch(updatedMatch);
    } catch (error) {
      console.error("Error saving match:", error);
      toast.error("Failed to save match data");
    }
  };

  const addPlayer = () => {
    if (!newPlayerName.trim() || !match) return;

    const currentTeam = match.currentInnings === 1 ? match.teamA : match.teamB;
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: newPlayerName.trim(),
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
    };

    const updatedTeam = {
      ...currentTeam,
      players: [...currentTeam.players, newPlayer],
    };

    const updatedMatch = {
      ...match,
      [match.currentInnings === 1 ? "teamA" : "teamB"]: updatedTeam,
    };

    saveMatch(updatedMatch);
    setNewPlayerName("");
    setShowAddPlayer(false);
    toast.success(`Player ${newPlayer.name} added successfully`);
  };

  const updateScore = (runs: number, isExtra = false, isWicket = false) => {
    if (!match || !currentBatsman) return;

    const currentTeam = match.currentInnings === 1 ? match.teamA : match.teamB;
    const batsmanIndex = currentTeam.players.findIndex(
      (p: Player) => p.id === currentBatsman
    );

    if (batsmanIndex === -1) return;

    const updatedPlayers = [...currentTeam.players];
    const batsman = updatedPlayers[batsmanIndex];

    // Update batsman stats
    if (!isExtra) {
      batsman.runs += runs;
      batsman.balls += 1;

      if (runs === 4) batsman.fours += 1;
      if (runs === 6) batsman.sixes += 1;
    }

    if (isWicket) {
      batsman.isOut = true;
      // Find next batsman
      const nextBatsman = updatedPlayers.find(
        (p: Player) => !p.isOut && p.id !== currentBatsman
      );
      setCurrentBatsman(nextBatsman?.id || null);
    }

    // Update team score and overs
    const totalBalls = updatedPlayers.reduce(
      (sum: number, p: Player) => sum + p.balls,
      0
    );
    const newOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
    const newScore = currentTeam.score + runs;
    const newWickets = currentTeam.wickets + (isWicket ? 1 : 0);

    const updatedTeam = {
      ...currentTeam,
      players: updatedPlayers,
      score: newScore,
      wickets: newWickets,
      overs: newOvers,
    };

    const updatedMatch = {
      ...match,
      [match.currentInnings === 1 ? "teamA" : "teamB"]: updatedTeam,
    };

    saveMatch(updatedMatch);
  };

  const switchInnings = () => {
    if (!match) return;

    const updatedMatch = {
      ...match,
      currentInnings: (match.currentInnings === 1 ? 2 : 1) as 1 | 2,
    };

    saveMatch(updatedMatch);
    setCurrentBatsman(null);
    setCurrentBowler(null);
    toast.success("Innings switched successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Match not found
            </h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentTeam = match.currentInnings === 1 ? match.teamA : match.teamB;
  const opposingTeam = match.currentInnings === 1 ? match.teamB : match.teamA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link href="/scorecard">
              <Button variant="outline" className="shadow-lg">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="shadow-lg">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>

          {/* Match Info */}
          <Card className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-white/30 dark:border-gray-600/30 rounded-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl text-gray-900 dark:text-white flex items-center gap-3">
                <TrophyIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                {match.teamA.name} vs {match.teamB.name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg flex flex-wrap gap-4">
                {match.matchType && (
                  <span className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    <TrophyIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    {match.matchType}
                  </span>
                )}
                {match.venue && (
                  <span className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {match.venue}
                  </span>
                )}
                {match.date && (
                  <span className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                    <CalendarIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    {new Date(match.date)
                      .toLocaleDateString()
                      .replace(/"/g, "")}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700/30">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                    {currentTeam.name}
                  </h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {currentTeam.score}/{currentTeam.wickets}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {currentTeam.overs} overs
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                    Innings
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {match.currentInnings}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Current
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700/30">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                    Target
                  </h3>
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {match.currentInnings === 2 ? opposingTeam.score + 1 : "-"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    To Win
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Batting Scorecard */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {currentTeam.name} Batting
                  </span>
                  <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Player</DialogTitle>
                        <DialogDescription>
                          Enter the name of the new player for{" "}
                          {currentTeam.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Player name"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                        />
                        <Button onClick={addPlayer}>Add</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-gray-900 dark:text-white">
                          Batsman
                        </th>
                        <th className="text-center py-2 text-gray-900 dark:text-white">
                          R
                        </th>
                        <th className="text-center py-2 text-gray-900 dark:text-white">
                          B
                        </th>
                        <th className="text-center py-2 text-gray-900 dark:text-white">
                          4s
                        </th>
                        <th className="text-center py-2 text-gray-900 dark:text-white">
                          6s
                        </th>
                        <th className="text-center py-2 text-gray-900 dark:text-white">
                          SR
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTeam.players.map((player: Player) => (
                        <tr
                          key={player.id}
                          className={`border-b border-gray-100 dark:border-gray-800 ${
                            player.isOut
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          } ${
                            currentBatsman === player.id
                              ? "bg-green-50 dark:bg-green-900/20"
                              : ""
                          }`}
                        >
                          <td className="py-2 flex items-center gap-2">
                            {player.name}
                            {player.isOut && (
                              <span className="text-red-500">†</span>
                            )}
                          </td>
                          <td className="text-center py-2">{player.runs}</td>
                          <td className="text-center py-2">{player.balls}</td>
                          <td className="text-center py-2">{player.fours}</td>
                          <td className="text-center py-2">{player.sixes}</td>
                          <td className="text-center py-2">
                            {player.balls > 0
                              ? ((player.runs / player.balls) * 100).toFixed(1)
                              : "0.0"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {currentTeam.players.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No players added yet. Click "Add Player" to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scoring Controls */}
          <div className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <TargetIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => updateScore(1)}
                    disabled={!currentBatsman}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    +1
                  </Button>
                  <Button
                    onClick={() => updateScore(2)}
                    disabled={!currentBatsman}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    +2
                  </Button>
                  <Button
                    onClick={() => updateScore(3)}
                    disabled={!currentBatsman}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    +3
                  </Button>
                  <Button
                    onClick={() => updateScore(4)}
                    disabled={!currentBatsman}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  >
                    +4
                  </Button>
                  <Button
                    onClick={() => updateScore(6)}
                    disabled={!currentBatsman}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  >
                    +6
                  </Button>
                  <Button
                    onClick={() => updateScore(0, false, true)}
                    disabled={!currentBatsman}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    Wicket
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    onClick={() => updateScore(1, true)}
                    disabled={!currentBatsman}
                    variant="outline"
                  >
                    Wide
                  </Button>
                  <Button
                    onClick={() => updateScore(1, true)}
                    disabled={!currentBatsman}
                    variant="outline"
                  >
                    No Ball
                  </Button>
                  <Button
                    onClick={() => updateScore(1, true)}
                    disabled={!currentBatsman}
                    variant="outline"
                  >
                    Bye
                  </Button>
                  <Button
                    onClick={() => updateScore(1, true)}
                    disabled={!currentBatsman}
                    variant="outline"
                  >
                    Leg Bye
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={switchInnings}
                  className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  Switch Innings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
