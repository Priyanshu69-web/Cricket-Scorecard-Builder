"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Download, Image, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function SharePage() {
  const params = useParams();
  const [scorecard, setScorecard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (params.token) {
      fetchSharedScorecard();
    }
  }, [params.token]);

  const fetchSharedScorecard = async () => {
    try {
      const response = await fetch(`/api/share/${params.token}`);
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
        toast.error("Scorecard not found or has been deleted");
      }
    } catch (error) {
      toast.error("Failed to load scorecard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById("sharecard-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
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
    try {
      const element = document.getElementById("sharecard-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-8">
            <p className="text-slate-300 mb-4">Scorecard not found or has been deleted</p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
              <span className="text-sm text-blue-300">Shared Scorecard</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {scorecard.title}
            </h1>
            <p className="text-slate-400 mb-6">
              {scorecard.description || "No description provided"}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={handleExportImage}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Image className="h-4 w-4 mr-2" />
                Export Image
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} id="sharecard-content">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Scorecard Data</CardTitle>
                <CardDescription className="text-slate-400">
                  Type: {scorecard.type}
                </CardDescription>
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
                          disabled
                          className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                        />
                      )}
                      {field.type === "number" && (
                        <Input
                          type="number"
                          value={values[field.id] || ""}
                          disabled
                          className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                        />
                      )}
                      {field.type === "checkbox" && (
                        <div className="text-slate-300">
                          {values[field.id] ? "✓ Yes" : "○ No"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
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
                <p className="text-xs text-slate-400 mb-1">Type</p>
                <p className="text-sm font-semibold text-white">
                  {scorecard.type}
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
