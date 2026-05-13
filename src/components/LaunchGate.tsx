"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

export function LaunchGate() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
        <div className="relative z-10">
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
              <div className="space-y-4">
                <h1
                  id="launch-gate-title"
                  className="font-editorial text-[2.1rem] font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] sm:text-[3rem]"
                >
                  松笠研究所は創設準備段階です
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
                href="/projects/rudbeckia"
                onClick={closeGate}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-transparent bg-[color:var(--color-primary)] px-6 py-3 text-sm font-medium !text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-[color:var(--color-primary-hover)] focus-visible:bg-[color:var(--color-primary-hover)]"
              >
                Project: Rudbeckia
              </Link>
              <button
                type="button"
                onClick={closeGate}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.16)] bg-[rgba(255,255,255,0.78)] px-6 py-3 text-sm font-medium text-[color:var(--color-primary)] transition hover:border-[rgba(15,23,42,0.28)] hover:bg-white focus-visible:bg-white"
              >
                サイト
              </button>
            </div>

            <p className="text-xs leading-6 text-[color:var(--color-muted)]">
              この表示はページに入るたびに表示されます。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
