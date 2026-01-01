"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  GripVertical,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function CreateScorecardPage() {
  const { data: session, status } = useSession();
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Cricket");
  const [fields, setFields] = useState([
    { id: uuidv4(), name: "Team Name", type: "text", required: true, order: 0 },
    { id: uuidv4(), name: "Score", type: "number", required: true, order: 1 },
  ]);

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const templates: Record<string, any[]> = {
    Cricket: [
      { id: uuidv4(), name: "Team Name", type: "text", required: true, order: 0 },
      { id: uuidv4(), name: "Runs", type: "number", required: true, order: 1 },
      { id: uuidv4(), name: "Wickets", type: "number", required: true, order: 2 },
      { id: uuidv4(), name: "Overs", type: "number", required: true, order: 3 },
    ],
    Football: [
      { id: uuidv4(), name: "Team Name", type: "text", required: true, order: 0 },
      { id: uuidv4(), name: "Goals", type: "number", required: true, order: 1 },
      { id: uuidv4(), name: "Yellow Cards", type: "number", required: false, order: 2 },
      { id: uuidv4(), name: "Red Cards", type: "number", required: false, order: 3 },
    ],
    Custom: [
      { id: uuidv4(), name: "Team Name", type: "text", required: true, order: 0 },
      { id: uuidv4(), name: "Score", type: "number", required: true, order: 1 },
    ],
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setFields(
      templates[newType].map((f) => ({ ...f, id: uuidv4() }))
    );
  };

  const addField = () => {
    const newField = {
      id: uuidv4(),
      name: "New Field",
      type: "text",
      required: false,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    if (fields.length <= 1) {
      toast.error("You must have at least one field");
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a scorecard title");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/scorecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          fields: fields.map((f, i) => ({ ...f, order: i })),
          values: [],
          isPublic: false,
        }),
      });

      if (response.ok) {
        const scorecard = await response.json();
        toast.success("Scorecard created successfully!");
        redirect(`/scorecard/${scorecard._id}`);
      } else {
        toast.error("Failed to create scorecard");
      }
    } catch (error) {
      console.error("Error creating scorecard:", error);
      toast.error("An error occurred while creating the scorecard");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <Link
                href="/dashboard"
                className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white">
                Create New Scorecard
              </h1>
              <p className="text-slate-400 mt-2">
                Build your custom scorecard with fields tailored to your needs
              </p>
            </div>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Cricket Scorecard"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description..."
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Template Type
                    </label>
                    <Select value={type} onValueChange={handleTypeChange}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fields */}
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Fields ({fields.length})
                    <Button
                      onClick={addField}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      variants={itemVariants}
                      className="bg-slate-700/50 p-4 rounded-lg space-y-3 border border-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-slate-500" />
                        <div className="flex-1">
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              updateField(field.id, { name: e.target.value })
                            }
                            placeholder="Field name"
                            className="bg-slate-600/50 border-slate-500 text-white text-sm"
                          />
                        </div>
                        <Button
                          onClick={() => removeField(field.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">
                            Type
                          </label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, { type: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-600/50 border-slate-500 text-white text-sm h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer w-full">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                updateField(field.id, {
                                  required: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <span className="text-xs text-slate-400">
                              Required
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="mt-8 flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Scorecard
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Panel - Live Preview */}
          {showPreview && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:sticky lg:top-24"
            >
              <motion.div variants={itemVariants}>
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Live Preview</CardTitle>
                    <CardDescription className="text-slate-400">
                      See how your scorecard will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          {title || "Scorecard Title"}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                          {description || "Your scorecard description will appear here"}
                        </p>
                        <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                          <span className="text-xs text-blue-300">{type}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-6">
                        <h4 className="text-sm font-semibold text-white mb-4">
                          Fields
                        </h4>
                        <div className="space-y-3">
                          {fields.map((field) => (
                            <div
                              key={field.id}
                              className="bg-slate-700/50 p-3 rounded-lg"
                            >
                              <label className="block text-sm text-slate-300 mb-2">
                                {field.name}
                                {field.required && (
                                  <span className="text-red-400 ml-1">*</span>
                                )}
                              </label>
                              {field.type === "text" && (
                                <input
                                  type="text"
                                  placeholder={field.name}
                                  disabled
                                  className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-400 text-sm"
                                />
                              )}
                              {field.type === "number" && (
                                <input
                                  type="number"
                                  placeholder="0"
                                  disabled
                                  className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-400 text-sm"
                                />
                              )}
                              {field.type === "checkbox" && (
                                <input
                                  type="checkbox"
                                  disabled
                                  className="rounded"
                                />
                              )}
                              {field.type === "select" && (
                                <select disabled className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-400 text-sm">
                                  <option>Select option...</option>
                                </select>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <p className="text-xs text-blue-300">
                          ✓ Your scorecard will be saved and accessible from your dashboard
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
