"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, CircleDot, History, Smartphone } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Activity,
      title: "Live ball-by-ball scoring",
      description: "One tap updates score, overs, strike, bowler figures, and run rate instantly.",
    },
    {
      icon: CircleDot,
      title: "Real cricket timeline",
      description: "See every over as colored ball events like a real scoring app.",
    },
    {
      icon: History,
      title: "Match history",
      description: "Create and revisit multiple matches with saved scorecards.",
    },
    {
      icon: Smartphone,
      title: "Thumb-friendly controls",
      description: "Big scoring buttons built for fast mobile use under pressure.",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(180deg,_#08131f_0%,_#0d1b2a_48%,_#071018_100%)] pt-20">
      <section className="mx-auto max-w-7xl px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="mb-5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-1 text-xs uppercase tracking-[0.28em] text-emerald-100">
            Cricket Scorecard Builder
          </p>
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
            Score every ball, track every player, and run the match like a real cricket app.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
            Create matches, manage innings, update batting and bowling live, undo mistakes, and
            review a proper scorecard with over timelines.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/scorecard/create">
              <Button size="lg" className="h-12 rounded-full bg-emerald-400 px-8 text-slate-950 hover:bg-emerald-300">
                Start Match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/scorecard">
              <Button size="lg" variant="outline" className="h-12 rounded-full border-white/15 text-slate-200 hover:bg-white/10">
                View Match History
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-emerald-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                    <p className="mt-3 text-slate-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
