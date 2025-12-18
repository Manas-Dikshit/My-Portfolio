"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Robot } from "@/components/ui/robot";
import { Eyes } from "@/components/ui/robot-eyes";
import { Typewriter } from "@/components/ui/typewriter";
import { Marquee } from "@/components/ui/marquee";
import { Badge } from "@/components/ui/badge";
import { BackgroundNoise } from "@/components/shared/backgrounds";
import { portfolioData } from "@/lib/portfolio-data";

const gifs = [
  "/gifs/cate coding.gif",
  "/gifs/happy one piece GIF.gif",
  "/gifs/kawaii cat GIF.gif",
  "/gifs/kirby confused.gif",
  "/gifs/One Piece GIF by TOEI Animation UK.gif",
];

const ensureUrl = (u?: string) => (!u ? "#" : u.startsWith("http") ? u : `https://${u}`);

const ResumeViewer: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-x-hidden">
      <BackgroundNoise className="z-0" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-10 py-10 px-4 md:px-6">
        {/* ---------------- Header Section ---------------- */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Left: Robot & Intro */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/3 flex flex-col items-center gap-4"
          >
            <div className="w-52 md:w-56">
              <Robot>
                <div className="w-full h-full flex items-center justify-center">
                  <Eyes lookAround={{ enabled: true }} />
                </div>
              </Robot>
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">
                {portfolioData.personal.name}
              </h1>
              <p className="text-sm text-foreground/70 mt-1">
                {portfolioData.personal.title}
              </p>

              <div className="mt-3 text-sm">
                <Typewriter
                  text={[
                    portfolioData.personal.bio,
                    "Open to roles • Let's connect!",
                  ]}
                  speed={45}
                  waitTime={2000}
                  className="text-sm text-foreground/80"
                />
              </div>
            </div>

            <div className="w-full mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/"
                className="px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                Home
              </Link>
              <Link
                href="/portfolio"
                className="px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                Portfolio
              </Link>
              <a
                href="/Manas_Ranjan_Dikshit.pdf"
                download
                className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition"
              >
                Download CV
              </a>
            </div>
          </motion.aside>

          {/* Right: Resume Viewer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-full md:w-2/3"
          >
            <div className="relative w-full rounded-2xl shadow-lg bg-background border border-border overflow-hidden group">
              <iframe
                src="/Manas_Ranjan_Dikshit.pdf"
                title="Resume PDF"
                className="w-full h-[68vh] md:h-[78vh] transition-transform duration-300 group-hover:scale-[1.01]"
                aria-label="Embedded resume viewer"
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
              <a
                href="/Manas_Ranjan_Dikshit.pdf"
                download
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:brightness-110 transition"
              >
                Download PDF
              </a>
              <Link
                href={portfolioData.personal.cvUrl}
                target="_blank"
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
              >
                Open Original
              </Link>
              <Link
                href="/portfolio"
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
              >
                View Projects
              </Link>
            </div>
          </motion.section>
        </div>

        {/* ---------------- Skills Section ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Marquee
            className="bg-background/80 border border-border rounded-lg py-2"
            pauseOnHover
            repeat={6}
          >
            {portfolioData.skills.map((s, i) => (
              <Badge
                key={i}
                variant="outline"
                className="mx-2 text-sm bg-muted/40 hover:bg-muted transition"
              >
                {s.name}
              </Badge>
            ))}
          </Marquee>
        </motion.div>

        {/* ---------------- GIF Gallery ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full flex flex-wrap justify-center gap-4"
        >
          {gifs.map((g, i) => (
            <img
              key={i}
              src={encodeURI(g)}
              alt={`Animated gif ${i + 1}`}
              className="w-28 h-28 object-cover rounded-lg border border-border shadow-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          ))}
        </motion.div>

        {/* ---------------- Achievements ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <h3 className="text-lg font-semibold text-center mb-3">
            Selected Achievements
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {portfolioData.achievements.slice(0, 8).map((a, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="px-3 py-1 hover:bg-secondary/80 transition"
              >
                {a.title}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* ---------------- Social Links ---------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full flex justify-center gap-6 mt-6 text-sm font-medium"
        >
          {Object.entries(portfolioData.social).map(([key, value]) => (
            <a
              key={key}
              href={ensureUrl(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary transition"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeViewer;
