"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SharedScorecard = {
  title: string;
  description?: string;
  entityLabel: string;
  summary?: {
    rankedEntries?: Array<{ id: string; name: string; finalScore: number }>;
    criterionInsights?: Array<{ id: string; name: string; average: number }>;
    insights?: string[];
  };
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export default function SharePage() {
  const params = useParams();
  const [scorecard, setScorecard] = useState<SharedScorecard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.token) {
      fetchSharedScorecard();
    }
  }, [params.token]);

  async function fetchSharedScorecard() {
    try {
      const response = await fetch(`/api/share/${params.token}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Scorecard not found");
      }

      setScorecard(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportPDF() {
    const element = document.getElementById("sharecard-content");
    if (!element || !scorecard) {
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const width = 210;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
      pdf.save(`${scorecard.title}.pdf`);
    } catch {
      toast.error("Failed to export PDF");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-8 text-center text-slate-200">
            Shared scorecard not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_26%),linear-gradient(180deg,_#111827_0%,_#162337_50%,_#0f172a_100%)] pt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-sm text-sky-100">
            Shared Scorecard
          </div>
          <h1 className="text-4xl font-bold text-white">{scorecard.title}</h1>
          <p className="mt-3 text-slate-400">{scorecard.description || "No description provided"}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleExportPDF} className="bg-sky-300 text-slate-950 hover:bg-sky-200">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-white/15 text-slate-200 hover:bg-white/10"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div id="sharecard-content" className="space-y-8">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Ranking</CardTitle>
              <CardDescription className="text-slate-400">
                {scorecard.entityLabel}s ranked by weighted final score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(scorecard.summary?.rankedEntries || []).map((entry, index: number) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">#{index + 1}</p>
                      <p className="font-medium text-white">{entry.name}</p>
                    </div>
                    <p className="text-lg font-semibold text-white">{entry.finalScore}</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
                      style={{ width: `${Math.min(entry.finalScore, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Criteria performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(scorecard.summary?.criterionInsights || []).map((criterion) => (
                <div key={criterion.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-200">{criterion.name}</span>
                    <span className="text-slate-400">{criterion.average}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-fuchsia-300 to-sky-300"
                      style={{ width: `${Math.min(criterion.average, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(scorecard.summary?.insights || []).map((insight: string) => (
                <div key={insight} className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
                  {insight}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
