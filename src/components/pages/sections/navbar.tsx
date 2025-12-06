"use client";

import { cn } from "@/lib/utils";
import {
  XIcon,
  MenuIcon,
  Volume2Icon,
  VolumeXIcon,
  GithubIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggleButton2 } from "../../theme-toggle";
import { Logo } from "../../ui/logo";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";
import { useIsSoundEnabled } from "@/store/use-sound-enabled";

/* -------------------------------
   🔗 Config
--------------------------------*/
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "stats", label: "Stats" },
  { id: "contact", label: "Contact" },
] as const;

type NavId = (typeof NAV_LINKS)[number]["id"];

/* -------------------------------
   🧭 Navbar Component
--------------------------------*/
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavId>("home");

  const { isSoundEnabled, toggleSoundEnabled } = useIsSoundEnabled();
  const { resolvedTheme, setTheme } = useTheme();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);

  /* --------------------------------
     Hash Sync for Active Tab
  --------------------------------*/
  useEffect(() => {
    const ids = NAV_LINKS.map((x) => x.id);
    const setFromHash = () => {
      const hash = window?.location?.hash?.replace("#", "") || "home";
      setActive(ids.includes(hash as NavId) ? (hash as NavId) : "home");
    };
    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    return () => window.removeEventListener("hashchange", setFromHash);
  }, []);

  /* --------------------------------
     Active Tab Clip Animation
  --------------------------------*/
  const updateClip = () => {
    const container = overlayRef.current;
    const target = activeTabRef.current;
    if (!container || !target) return;

    const cRect = container.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();

    const pad = 6;
    const left = Math.max(0, tRect.left - cRect.left - pad);
    const right = Math.max(0, cRect.right - tRect.right - pad);

    container.style.clipPath = `inset(0 ${((right / cRect.width) * 100).toFixed(
      2
    )}% 0 ${((left / cRect.width) * 100).toFixed(2)}% round 17px)`;
  };

  useEffect(() => {
    const id = requestAnimationFrame(updateClip);
    window.addEventListener("resize", updateClip);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", updateClip);
    };
  }, [active]);

  const handleNavClick = (id: NavId) => {
    setActive(id);
    setOpen(false);
  };

  /* --------------------------------
     JSX
  --------------------------------*/
  return (
    <nav
      id="home"
      className="sticky top-0 z-50 w-full border-b bg-background/80 px-4 py-2.5 backdrop-blur-xl md:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <a
          href="#home"
          onClick={() => handleNavClick("home")}
          className="group relative inline-flex items-center"
        >
          <div className="absolute -top-2 -left-2 h-4 w-4 border-t-2 border-l-2 duration-200 group-hover:-top-1 group-hover:-left-1" />
          <Logo className="w-14" hover />
          <div className="absolute -right-2 -bottom-2 h-4 w-4 border-r-2 border-b-2 duration-200 group-hover:-right-1 group-hover:-bottom-1" />
        </a>

        {/* Desktop Navigation */}
        <div className="relative hidden items-center md:flex">
          {/* Overlay Highlight */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-1.5 z-10 w-full overflow-hidden rounded-full [clip-path:inset(0_75%_0_0_round_17px)] [transition:clip-path_0.25s_ease]"
          >
            <div className="bg-foreground/10 relative flex gap-1 rounded-full border px-2 py-1">
              {NAV_LINKS.map((x) => (
                <span
                  key={x.id}
                  className="invisible px-4 py-1.5 text-sm font-medium"
                >
                  {x.label}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Layer */}
          <div className="relative z-20 flex items-center gap-1 rounded-full border bg-background/50 px-4 py-1.5 backdrop-blur-sm">
            {NAV_LINKS.map((x) => {
              const isActive = x.id === active;
              return (
                <a
                  key={x.id}
                  href={`#${x.id}`}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => handleNavClick(x.id)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
                    isActive ? "text-foreground" : "opacity-70 hover:opacity-100"
                  )}
                >
                  {x.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Actions (Sound / Theme / GitHub / Menu) */}
        <div className="inline-flex items-center gap-3">
          <div className="bg-background/50 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm">
            {/* GitHub */}
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-110"
              aria-label="GitHub"
            >
              <GithubIcon className="size-5" />
            </a>

            <Divider />

            {/* Sound Toggle */}
            <button
              onClick={toggleSoundEnabled}
              aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
              className="text-foreground/60 hover:text-foreground transition-all duration-200 hover:scale-110"
            >
              {isSoundEnabled ? (
                <Volume2Icon className="size-5" />
              ) : (
                <VolumeXIcon className="size-5" />
              )}
            </button>

            <Divider />

            {/* Theme Toggle */}
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
              className="transition-transform duration-200 hover:scale-110"
            >
              <ThemeToggleButton2 className="size-5" theme={resolvedTheme} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
            className="hover:bg-foreground/5 inline-flex size-9 items-center justify-center rounded-md border transition-colors md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <XIcon className="size-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MenuIcon className="size-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden md:hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="bg-background/50 mt-2 grid gap-1 rounded-xl border p-2 backdrop-blur-sm"
            >
              {NAV_LINKS.map((x, index) => (
                <motion.a
                  key={x.id}
                  href={`#${x.id}`}
                  onClick={() => handleNavClick(x.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative rounded-lg px-4 py-3 text-sm font-incognito transition-all duration-200",
                    x.id === active
                      ? "bg-foreground/10 font-semibold shadow-sm"
                      : "hover:bg-foreground/5 opacity-80 hover:opacity-100"
                  )}
                >
                  {x.label}
                </motion.a>
              ))}

              <div className="bg-border my-2 h-px" />

              {/* Quick actions grid */}
              <div className="grid grid-cols-3 gap-2 px-2 py-1 text-center">
                <QuickAction
                  label="GitHub"
                  icon={<GithubIcon className="size-5" />}
                  href={siteConfig.github}
                />
                <QuickAction
                  label={isSoundEnabled ? "Sound" : "Muted"}
                  icon={
                    isSoundEnabled ? (
                      <Volume2Icon className="size-5" />
                    ) : (
                      <VolumeXIcon className="size-5" />
                    )
                  }
                  onClick={toggleSoundEnabled}
                />
                <QuickAction
                  label="Theme"
                  icon={
                    <ThemeToggleButton2
                      className="size-5"
                      theme={resolvedTheme}
                    />
                  }
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* -------------------------------
   🔹 Subcomponents
--------------------------------*/
const Divider = () => <div className="bg-border h-4 w-px" />;

const QuickAction = ({
  label,
  icon,
  href,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) => {
  const Wrapper = href ? "a" : "button";
  return (
    <Wrapper
      {...(href
        ? { href, target: "_blank", rel: "noreferrer noopener" }
        : { onClick })}
      className="hover:bg-foreground/5 group flex flex-col items-center gap-1.5 rounded-lg py-2 transition-colors"
    >
      <div className="text-foreground/60 group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <span className="text-foreground/60 group-hover:text-foreground text-[10px] font-medium">
        {label}
      </span>
    </Wrapper>
  );
};

export default Navbar;
