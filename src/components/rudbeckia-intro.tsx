"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type IntroPhase = "visible" | "exiting" | "hidden";

export function RudbeckiaIntro() {
  const [phase, setPhase] = useState<IntroPhase>("visible");

  const dismiss = useCallback(() => {
    setPhase((current) => (current === "hidden" ? current : "exiting"));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("exiting");
    }, 2850);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss]);

  useEffect(() => {
    if (phase !== "exiting") {
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase("hidden");
    }, 760);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Project: Rudbeckia を読み込んでいます"
      className={`rudbeckia-intro fixed inset-0 z-[9999] grid min-h-dvh place-items-center overflow-hidden bg-[#fafff4] text-[#17201d] ${
        phase === "exiting" ? "rudbeckia-intro-exit" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 rudbeckia-intro-field" />
      <div className="pointer-events-none absolute inset-0 rudbeckia-intro-scan" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d9a326]/22 rudbeckia-intro-orbit" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[54vmin] w-[54vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#58c432]/18 rudbeckia-intro-orbit rudbeckia-intro-orbit-late" />

      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 top-4 rounded-full border border-[#d7c596]/70 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#48603f] shadow-[0_14px_34px_rgba(23,32,29,0.08)] backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5fbf2f]"
      >
        SKIP
      </button>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center rudbeckia-intro-logo">
        <p className="mb-6 text-[11px] font-semibold tracking-[0.46em] text-[#5fbf2f] sm:text-xs">
          PROJECT ENTRY
        </p>
        <div className="relative w-full max-w-[860px] border border-[#dfd1aa]/72 bg-white/90 px-5 py-6 shadow-[0_32px_90px_rgba(23,32,29,0.16)] backdrop-blur-xl sm:px-10 sm:py-8">
          <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d39a2d] to-transparent" />
          <Image
            src="/projects/rudbeckia/title-logo.svg"
            alt="Project: Rudbeckia"
            width={1200}
            height={360}
            priority
            unoptimized
            sizes="(min-width: 1024px) 860px, 92vw"
            className="h-auto w-full object-contain mix-blend-multiply rudbeckia-intro-image"
          />
        </div>
        <p className="mt-7 text-xs font-semibold tracking-[0.28em] text-[#6f7d6a] sm:text-sm">
          OPENING THE PROJECT BOARD
        </p>
        <div className="mt-5 h-1 w-56 overflow-hidden rounded-full bg-[#dfead5]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#5fbf2f] via-[#d39a2d] to-[#5fbf2f] rudbeckia-intro-meter" />
        </div>
      </div>
    </div>
  );
}
