"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ArrowRight, Zap, Users, Shield, Smartphone } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();

  if (session) {
    redirect("/dashboard");
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Create and manage scorecards in seconds with our intuitive interface",
    },
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Share scorecards and track scores with your team in real-time",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your scorecards are encrypted and secured with enterprise-grade protection",
    },
    {
      icon: Smartphone,
      title: "Fully Responsive",
      description: "Works seamlessly on desktop, tablet, and mobile devices",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BarChart3 className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Professional Scorecard Builder
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Create, manage, and share custom scorecards for any sport or activity. Perfect for teams, coaches, and enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-12 text-white"
        >
          Why Choose Scorecard Builder?
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-sm h-full transition-all duration-300">
                  <CardContent className="p-6">
                    <Icon className="w-12 h-12 text-blue-500 mb-4 group-hover:text-purple-400 transition-colors" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto px-4 py-20 text-center"
      >
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to create your first scorecard?
          </h2>
          <p className="text-slate-300 mb-8">
            Join thousands of users who are already using Scorecard Builder to track their favorite sports and activities.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Start Free Trial
            </Button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
