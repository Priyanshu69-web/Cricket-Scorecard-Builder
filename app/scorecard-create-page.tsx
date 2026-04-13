"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatchForm from "@/components/MatchForm";

export default function CreateScorecardPage() {
  return (
    <div className="min-h-screen bg-slate-100 pt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <Link href="/scorecard" className="mb-5 inline-flex items-center text-sm text-slate-600 transition hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to matches
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900">Set up a cricket match</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Create your teams, choose the format, decide who won the toss, and jump straight into
            live scoring.
          </p>
        </div>
        <MatchForm />
      </div>
    </div>
  );
}
