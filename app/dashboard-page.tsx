"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BarChart3, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [scorecards, setScorecards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchScorecards();
    }
  }, [session?.user?.id]);

  const fetchScorecards = async () => {
    try {
      const response = await fetch("/api/scorecards");
      if (response.ok) {
        const data = await response.json();
        setScorecards(data);
      }
    } catch (error) {
      console.error("Failed to fetch scorecards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const stats = [
    {
      icon: BarChart3,
      title: "Total Scorecards",
      value: scorecards.length,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      title: "This Month",
      value: 0,
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Most Used",
      value: "Cricket",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {session.user?.name}! 👋
            </h1>
            <p className="text-slate-400">
              Create and manage your scorecards with ease
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-white">
                            {typeof stat.value === "number"
                              ? stat.value
                              : stat.value}
                          </p>
                        </div>
                        <div
                          className={`bg-gradient-to-br ${stat.color} p-4 rounded-lg`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Create New Button */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-12">
            <Link href="/scorecard/create">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg">
                <Plus className="mr-2 h-5 w-5" />
                Create New Scorecard
              </Button>
            </Link>
          </motion.div>

          {/* Recent Scorecards */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Scorecards
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : scorecards.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <BarChart3 className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 mb-6">
                    No scorecards yet. Create your first one!
                  </p>
                  <Link href="/scorecard/create">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Create Scorecard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scorecards.map((scorecard: any, index) => (
                  <motion.div
                    key={scorecard._id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <Link href={`/scorecard/${scorecard._id}`}>
                      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="text-white line-clamp-2">
                            {scorecard.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {scorecard.type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>{scorecard.fields?.length || 0} fields</span>
                            <span>
                              {new Date(
                                scorecard.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
