"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import SectionHeading from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeadingLine from "@/components/ui/heading-line";
import { Robot } from "@/components/ui/robot";

import env from "@/config/env";
import { cn } from "@/lib/utils";
import { portfolioData } from "@/lib/portfolio-data";

const About = () => {
  const { personal, education, experience } = portfolioData;

  return (
    <SectionHeading text="About" id="about" className="overflow-hidden">
      {/* Main Section */}
      <div className="flex flex-col lg:flex-row items-center lg:h-[95vh]">
        {/* Text Side */}
        <div className="relative flex-1 px-4 py-12 md:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="font-incognito text-2xl font-semibold md:text-5xl lg:text-4xl"
          >
            Meet the Developer,
            <br />
            Not Just the Code
          </motion.h2>

          <HeadingLine className="mt-6" lineWidth={40} />

          <Robot className="absolute top-6 -right-8 z-5 w-64 font-mono text-white max-md:scale-x-[-1] md:top-8 md:right-4">
            <div className="max-md:scale-x-[-1]">Hey👋</div>
          </Robot>

          {/* Bio Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            viewport={{ once: true }}
            className="text-foreground/70 bg-muted/20 relative z-10 mx-auto mt-6 max-w-3xl rounded-lg border-2 border-dotted text-sm leading-relaxed backdrop-blur-3xl md:text-base shadow-lg"
          >
            <div className="p-6 space-y-4">
              {[
                {
                  text: (
                    <>
                      I build fast, friendly products that make users smile{" "}
                      <Gif src="/gifs/kawaii%20cat%20GIF.gif" alt="kawaii cat cheering" /> — and
                      sometimes their dogs too.
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Stack: Next.js, React, TypeScript, Tailwind. Clean APIs, tiny
                      micro-interactions, big delight{" "}
                      <Gif src="/gifs/cate%20coding.gif" alt="cat coding intensely" />.
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Off-duty: coffee, sketching animations, and One Piece marathons{" "}
                      <Gif
                        src="/gifs/happy%20one%20piece%20GIF.gif"
                        alt="happy One Piece vibe"
                      />
                      .
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Best in small teams: quick loops, clear comms, high-fives after deploy{" "}
                      <Gif
                        src="/gifs/One%20Piece%20GIF%20by%20TOEI%20Animation%20UK.gif"
                        alt="One Piece teamwork"
                      />
                      .
                    </>
                  ),
                },
                {
                  text: (
                    <>
                      Got a messy brief or a half-baked idea?{" "}
                      <Gif src="/gifs/kirby%20confused.gif" alt="kirby confused but ready" /> Let’s
                      turn it into something real.
                    </>
                  ),
                },
              ].map(({ text }, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {text}
                </motion.p>
              ))}
            </div>

            <div className="border-t-2 border-dotted p-6 flex justify-center">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group border-2 font-medium hover:shadow-lg transition-all"
              >
                <a href="#contact" aria-label="Go to Contact section">
                  Contact Me
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Profile Card */}
        <div className="relative hidden lg:flex h-full items-center justify-center border-l md:w-1/2">
          <div className="absolute inset-0">
            <div className="before:bg-border after:bg-border relative h-full w-full before:absolute before:top-1/2 before:left-0 before:h-0.5 before:w-full after:absolute after:top-0 after:left-1/2 after:h-full after:w-0.5" />
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: -2 }}
            whileInView={{ opacity: 1, rotate: -2 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative py-4 md:w-72"
          >
            <div className="sticky top-8">
              <div className="bg-primary/10 absolute inset-0 rotate-3 rounded-2xl" />
              <div className="bg-primary/20 absolute inset-0 rotate-1 rounded-2xl" />

              <div className="bg-background relative rounded-2xl border-2 p-6 shadow-xl backdrop-blur-md">
                <div className="text-center">
                  <div className="border-foreground/20 bg-muted/20 mb-4 overflow-hidden rounded-lg border-2 border-dashed p-4">
                    <img
                      src="/ascii-art-profile.png"
                      alt="ASCII profile"
                      className="-mb-5 h-auto w-full object-cover dark:invert"
                    />
                  </div>
                  <h3 className="font-incognito text-2xl font-semibold">{personal.name}</h3>
                  <p className="text-foreground/60 mt-1 font-mono text-sm">{personal.title}</p>

                  {/* Status badges */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("border-green-500/30 bg-green-500/10", {
                        "border-red-500/30 bg-red-500/10": !env.NEXT_PUBLIC_AVAILABLE_STATUS,
                      })}
                    >
                      <div
                        className={cn(
                          "mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500",
                          { "bg-red-500": !env.NEXT_PUBLIC_AVAILABLE_STATUS },
                        )}
                      />
                      {env.NEXT_PUBLIC_AVAILABLE_STATUS ? "Available" : "Not Available"}
                    </Badge>
                    <Badge variant="outline">{personal.stats.experience}</Badge>
                    <Badge variant="outline">{personal.title}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Education & Experience */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 mt-12"
      >
        <InfoCard title="Education" items={education} />
        <InfoCard title="Experience" items={experience} />
      </motion.div>
    </SectionHeading>
  );
};

/* --- Subcomponents --- */

const Gif = ({ src, alt }: { src: string; alt: string }) => (
  <span className="mx-1 inline-block align-middle">
    <span className="ring-offset-background relative inline-block w-12 rotate-3 overflow-hidden rounded-md ring ring-offset-2">
      <img src={src} alt={alt} className="h-auto w-full object-cover object-center" />
    </span>
  </span>
);

const InfoCard = ({
  title,
  items,
}: {
  title: string;
  items: any[];
}) => (
  <div className="bg-muted/20 rounded-lg border-2 p-6 backdrop-blur-sm">
    <h4 className="font-incognito text-xl font-semibold">{title}</h4>
    <HeadingLine className="mt-3" />
    <div className="mt-4 space-y-4">
      {items.map((item, i) => (
        <div key={`${item.institution || item.company}-${i}`}>
          <div className="font-semibold">{item.degree || item.position}</div>
          <div className="text-foreground/60 text-sm">{item.institution || item.company}</div>
          <div className="text-foreground/50 text-xs font-mono">{item.year || item.period}</div>
          {item.description && (
            <p className="text-foreground/70 text-sm mt-1">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default About;
