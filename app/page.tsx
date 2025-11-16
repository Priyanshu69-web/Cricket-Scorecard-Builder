"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Match } from "@/types/cricket";
import { v4 as uuidv4 } from "uuid";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, MapPinIcon, TrophyIcon, UsersIcon } from "lucide-react";

const matchSchema = z.object({
  teamA: z.string().min(1, "Team A name is required"),
  teamB: z.string().min(1, "Team B name is required"),
  date: z.string().optional(),
  venue: z.string().optional(),
  matchType: z.enum(["T20", "ODI", "Test", "Custom"]).optional(),
  oversPerInnings: z.number().min(1).max(50).optional(),
});

type MatchFormData = z.infer<typeof matchSchema>;

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load matches from localStorage on component mount
    const loadMatches = () => {
      const storedMatches: Match[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("match_")) {
          try {
            const matchData = JSON.parse(localStorage.getItem(key)!);
            // Check if match is less than 24 hours old
            if (
              matchData.createdAt &&
              Date.now() - matchData.createdAt < 24 * 60 * 60 * 1000
            ) {
              storedMatches.push(matchData);
            } else {
              // Remove expired matches
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid data
            localStorage.removeItem(key);
          }
        }
      }
      setMatches(storedMatches);
    };

    loadMatches();
  }, []);

  const form = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      teamA: "",
      teamB: "",
      date: "",
      venue: "",
      matchType: "T20",
      oversPerInnings: 20,
    },
  });

  const onSubmit = (data: MatchFormData) => {
    const newMatch: Match = {
      id: uuidv4(),
      teamA: {
        id: uuidv4(),
        name: data.teamA,
        players: [],
        bowlers: [],
        score: 0,
        wickets: 0,
        overs: 0,
      },
      teamB: {
        id: uuidv4(),
        name: data.teamB,
        players: [],
        bowlers: [],
        score: 0,
        wickets: 0,
        overs: 0,
      },
      currentInnings: 1,
      date: data.date,
      venue: data.venue,
      matchType: data.matchType,
      oversPerInnings: data.oversPerInnings,
      createdAt: Date.now(), // Add timestamp for expiration
    };

    const updatedMatches = [...matches, newMatch];
    setMatches(updatedMatches);
    localStorage.setItem(`match_${newMatch.id}`, JSON.stringify(newMatch));
    toast.success(
      `Match "${data.teamA} vs ${data.teamB}" created successfully!`
    );
    form.reset();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <TrophyIcon className="h-10 w-10 text-green-600" />
              Cricket Scorecard Builder
            </h1>
            <p className="text-lg text-gray-600">
              Create and manage professional cricket matches
            </p>
          </div>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/10 dark:bg-gray-900/10 border-b border-white/20 dark:border-gray-700/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <TrophyIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            Cricket Scorecard Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create and manage professional cricket matches
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Match Form */}
          <Card className="shadow-lg bg-white/80 dark:bg-gray-900/30 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                Create New Match
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Set up a new cricket match with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teamA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team A</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter team name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teamB"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team B</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter team name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="matchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="T20">T20</SelectItem>
                            <SelectItem value="ODI">ODI</SelectItem>
                            <SelectItem value="Test">Test</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            Date
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            Venue
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter venue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="oversPerInnings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overs per Innings</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 20)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    Create Match
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Matches List */}
          <Card className="shadow-lg bg-white/80 dark:bg-gray-900/30 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Recent Matches
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {matches.length === 0
                  ? "No matches created yet"
                  : `${matches.length} match${
                      matches.length > 1 ? "es" : ""
                    } available`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TrophyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No matches created yet. Create your first match to get
                    started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <Card
                      key={match.id}
                      className="border-l-4 border-l-green-500 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-white/20 dark:border-gray-600/20"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {match.teamA.name} vs {match.teamB.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {match.matchType && (
                                <span className="flex items-center gap-1">
                                  <TrophyIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  {match.matchType}
                                </span>
                              )}
                              {match.date && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  {new Date(match.date).toLocaleDateString()}
                                </span>
                              )}
                              {match.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  {match.venue}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            asChild
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                          >
                            <Link href={`/scorecard/${match.id}`}>
                              Open Scorecard
                            </Link>
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Overs per innings: {match.oversPerInnings || 20}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
