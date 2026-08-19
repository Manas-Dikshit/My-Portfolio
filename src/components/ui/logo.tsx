"use client";

import { motion, type Variants, useAnimationControls } from "motion/react";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface SVGPathData {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

type AnimationProps = {
  className?: string;
  animationTime?: number;
  hover?: boolean;
  onAnimationEnd?: () => void;
  loop?: boolean | number;
  paths: SVGPathData[];
  initialAnimation?: boolean;
  viewBox?: string;
};

export function Animation({
  className = "w-16",
  animationTime = 4,
  hover = false,
  onAnimationEnd,
  loop = false,
  paths,
  initialAnimation = true,
  viewBox = "0 0 377 193",
}: AnimationProps) {
  hover = loop ? false : hover;
  const controls = useAnimationControls();
  const [isAnimating, setIsAnimating] = useState(false);
  const currentLoopRef = useRef(0);
  const animationCompleteCountRef = useRef(0);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const total = paths?.length ?? 0;
  const perPath = total > 0 ? Math.max(0, animationTime) / total : 0;

  const totalLoops = useMemo(() => {
    if (loop === true) return Infinity;
    if (typeof loop === "number") return Math.max(1, Math.floor(loop));
    return 1;
  }, [loop]);

  const pathVariants: Variants = useMemo(
    () => ({
      hidden: {
        pathLength: 0,
        fillOpacity: 0,
        strokeWidth: 1,
      },
      visible: (i: number) => ({
        pathLength: 1,
        fillOpacity: 1,
        strokeWidth: 0,
        transition: {
          delay: perPath * i,
          duration: perPath || 0.001,
          ease: "easeInOut",
        },
      }),
    }),
    [perPath]
  );

  const startAnimation = useCallback(async () => {
    if (isAnimating || !mountedRef.current) return;

    setIsAnimating(true);
    animationCompleteCountRef.current = 0;
    currentLoopRef.current = 0;

    const runCycle = async () => {
      if (!mountedRef.current) return;
      await controls.start("visible");
      if (!mountedRef.current) return;
      currentLoopRef.current++;

      // Check if we need to loop
      if (currentLoopRef.current < totalLoops) {
        // Reset for next loop
        await controls.start("hidden");
        animationCompleteCountRef.current = 0;
        await runCycle();
      } else {
        // Animation fully complete
        setIsAnimating(false);
        onAnimationEnd?.();
      }
    };

    // Start from hidden state
    await controls.start("hidden");
    await runCycle();
  }, [controls, isAnimating, totalLoops, onAnimationEnd]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (initialAnimation) {
      startAnimation();
    } else {
      controls.set("visible");
    }
  }, [initialAnimation, controls, startAnimation]);

  const handleHover = () => {
    if (hover && !isAnimating) {
      startAnimation();
    }
  };

  return (
    <div className={cn(className)} onMouseEnter={handleHover}>
      <motion.svg width="100%" height="100%" viewBox={viewBox}>
        {paths.map((pathData, i) => (
          <motion.path
            key={i}
            d={pathData.d}
            fill={pathData.fill || "currentColor"}
            stroke={pathData.stroke || "currentColor"}
            strokeWidth={pathData.strokeWidth ?? 1}
            initial="hidden"
            animate={controls}
            variants={pathVariants}
            custom={i}
            onAnimationComplete={() => {
              animationCompleteCountRef.current++;
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}

export function Logo({ href, className }: { href?: string; className?: string }) {
  return href ? (
    <Link href={href}>
      <span
        className={cn(
          "inline-flex items-center justify-center font-pixelify text-2xl font-bold tracking-wider",
          className,
        )}
      >
        MRD
      </span>
    </Link>
  ) : (
    <span
      className={cn(
        "inline-flex items-center justify-center font-pixelify text-2xl font-bold tracking-wider",
        className,
      )}
    >
      MRD
    </span>
  );
}
