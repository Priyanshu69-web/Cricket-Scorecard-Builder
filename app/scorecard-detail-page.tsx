"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Download,
  Image,
  Printer,
  Share2,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ScorecardDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const scorecardsRef = useRef<HTMLDivElement>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [shareToken, setShareToken] = useState("");
  const [copied, setCopied] = useState(false);

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  useEffect(() => {
    if (params.id && session?.user?.id) {
      fetchScorecard();
    }
  }, [params.id, session?.user?.id]);

  const fetchScorecard = async () => {
    try {
      const response = await fetch(`/api/scorecards/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setScorecard(data);
        
        const initialValues: Record<string, any> = {};
        data.fields?.forEach((field: any) => {
          const existingValue = data.values?.find(
            (v: any) => v.fieldId === field.id
          );
          initialValues[field.id] = existingValue?.value || "";
        });
        setValues(initialValues);
      } else {
        toast.error("Scorecard not found");
      }
    } catch (error) {
      toast.error("Failed to load scorecard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveValues = async () => {
    try {
      const response = await fetch(`/api/scorecards/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: Object.entries(values).map(([fieldId, value]) => ({
            fieldId,
            value,
          })),
        }),
      });

      if (response.ok) {
        toast.success("Scorecard updated successfully!");
        setIsEditing(false);
        await fetchScorecard();
      } else {
        toast.error("Failed to update scorecard");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    }
  };

  const handleExportPDF = async () => {
    if (!scorecardsRef.current) return;

    try {
      const canvas = await html2canvas(scorecardsRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${scorecard.title}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportImage = async () => {
    if (!scorecardsRef.current) return;

    try {
      const canvas = await html2canvas(scorecardsRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${scorecard.title}.png`;
      link.click();
      toast.success("Image exported successfully!");
    } catch (error) {
      toast.error("Failed to export image");
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/scorecards/${params.id}/share`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setShareToken(data.shareToken);
        toast.success("Share link created!");
      }
    } catch (error) {
      toast.error("Failed to create share link");
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scorecard?")) return;

    try {
      const response = await fetch(`/api/scorecards/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Scorecard deleted successfully!");
        redirect("/dashboard");
      } else {
        toast.error("Failed to delete scorecard");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  if (status === "loading" || !scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Link
              href="/dashboard"
              className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {scorecard.title}
                </h1>
                <p className="text-slate-400">
                  {scorecard.description || "No description"}
                </p>
              </div>
              <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <span className="text-sm text-blue-300">{scorecard.type}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? "View" : "Edit"}
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={handleExportImage}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Image className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600/50 text-red-400 hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>

          {/* Share Link */}
          {shareToken && (
            <motion.div variants={itemVariants}>
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-300 font-medium">
                      Share Link Created
                    </p>
                    <p className="text-xs text-green-400/70">
                      {`${window.location.origin}/share/${shareToken}`}
                    </p>
                  </div>
                  <Button
                    onClick={copyShareLink}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          ref={scorecardsRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  {isEditing ? "Edit Scorecard" : "Scorecard Data"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scorecard.fields?.map((field: any) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {field.name}
                        {field.required && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      {field.type === "text" && (
                        <Input
                          type="text"
                          value={values[field.id] || ""}
                          onChange={(e) =>
                            setValues({
                              ...values,
                              [field.id]: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                        />
                      )}
                      {field.type === "number" && (
                        <Input
                          type="number"
                          value={values[field.id] || ""}
                          onChange={(e) =>
                            setValues({
                              ...values,
                              [field.id]: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                        />
                      )}
                      {field.type === "checkbox" && (
                        <input
                          type="checkbox"
                          checked={values[field.id] || false}
                          onChange={(e) =>
                            setValues({
                              ...values,
                              [field.id]: e.target.checked,
                            })
                          }
                          disabled={!isEditing}
                          className="rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-4 mt-6 pt-6 border-t border-slate-600">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveValues}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Metadata */}
          <motion.div variants={itemVariants} className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Created</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(scorecard.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(scorecard.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Fields</p>
                <p className="text-sm font-semibold text-white">
                  {scorecard.fields?.length || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
