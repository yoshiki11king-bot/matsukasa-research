"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

const LAUNCH_GATE_STORAGE_KEY = "matsukasa-launch-gate-seen";

function hasSeenLaunchGate() {
  try {
    return window.localStorage.getItem(LAUNCH_GATE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveLaunchGateSeen() {
  try {
    window.localStorage.setItem(LAUNCH_GATE_STORAGE_KEY, "true");
  } catch {
    // Storage can be unavailable in strict privacy modes. The button should still close the gate.
  }
}

export function LaunchGate() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenGate = hasSeenLaunchGate();

    if (!hasSeenGate) {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        saveLaunchGateSeen();
        setIsVisible(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  function closeGate() {
    saveLaunchGateSeen();
    setIsVisible(false);
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex min-h-dvh items-center justify-center overflow-y-auto bg-black/48 px-5 py-8 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-gate-title"
      aria-describedby="launch-gate-description"
    >
      <div className="ui-preparation-gate relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,253,248,0.96)] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="relative h-12 w-[76px] shrink-0">
                <Image
                  src="/matsukasa-logo.png"
                  alt={`${siteConfig.name} のロゴ`}
                  fill
                  sizes="76px"
                  className="object-contain mix-blend-multiply"
                  priority
                />
              </span>
              <div className="space-y-1">
                <p className="font-editorial text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">
                  {siteConfig.name}
                </p>
                <p className="text-sm text-[color:var(--color-secondary-ink)]">{siteConfig.englishName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[color:var(--color-secondary-ink)]">
                FOUNDING PHASE
              </p>
              <div className="space-y-4">
                <h1
                  id="launch-gate-title"
                  className="font-editorial text-[2.1rem] font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] sm:text-[3rem]"
                >
                  松笠研究所は、創設準備段階にあります
                </h1>
                <div
                  id="launch-gate-description"
                  className="max-w-2xl space-y-4 text-[0.98rem] leading-8 text-[color:var(--color-secondary-ink)] sm:text-base"
                >
                  <p>松笠研究所は、2026年に創設準備を開始した独立系調査研究プロジェクトです。</p>
                  <p>
                    現在は、公開方法論の整備、既存統計のレビュー、初期レポートの制作、小規模調査の設計から活動を始めています。
                  </p>
                  <p>
                    本サイトでは、創設過程そのものを公開しながら、無党派・中立・高独立性を備えた調査研究機関の構築を進めます。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/about"
                onClick={closeGate}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-transparent bg-[color:var(--color-primary)] px-6 py-3 text-sm font-medium !text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-[color:var(--color-primary-hover)] focus-visible:bg-[color:var(--color-primary-hover)]"
              >
                創設趣旨を読んで入る
              </Link>
              <button
                type="button"
                onClick={closeGate}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.16)] bg-[rgba(255,255,255,0.78)] px-6 py-3 text-sm font-medium text-[color:var(--color-primary)] transition hover:border-[rgba(15,23,42,0.28)] hover:bg-white focus-visible:bg-white"
              >
                サイトを見る
              </button>
            </div>

            <p className="text-xs leading-6 text-[color:var(--color-muted)]">
              この表示は一度閉じると、次回以降は表示されません。
            </p>
          </section>

          <aside className="rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#111827_0%,#1f2937_58%,#1f3a34_100%)] p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/64">DECLARATION</p>
            <div className="mt-5 space-y-4">
              <p className="text-lg font-semibold">創設過程をひらいて進めます。</p>
              <p className="text-sm leading-7 text-white/78">
                調査の方法、公開基準、更新履歴、財務情報を順に整え、参照しやすい研究所サイトとして育てていきます。
              </p>
            </div>
            <div className="mt-6 h-px bg-[linear-gradient(90deg,rgba(148,163,184,0.72),rgba(255,255,255,0.22),transparent)]" />
            <p className="mt-4 text-xs leading-6 text-white/64">
              This project is currently in its founding phase.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
