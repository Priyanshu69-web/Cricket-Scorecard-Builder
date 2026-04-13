"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatchForm from "@/components/MatchForm";

export default function CreateScorecardPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,_#07131d_0%,_#102235_42%,_#08111d_100%)] pt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Link href="/scorecard" className="mb-5 inline-flex items-center text-sm text-emerald-200 transition hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to matches
          </Link>
          <h1 className="text-4xl font-semibold text-white">Set up a cricket match</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Create your teams, choose the format, decide who won the toss, and jump straight into
            live scoring.
          </p>
        </div>
        <MatchForm />
      </div>
    </div>
  );
}
