"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { methodologyFeature, topicPageDefinitions } from "@/lib/topic-pages";

const slides = [
  ...topicPageDefinitions.map((topic) => ({
    title: topic.name,
    href: `/topics/${topic.slug}`,
    subtitle: topic.strapline,
    description: topic.summary,
    imageUrl: topic.imageUrl,
    eyebrow: "TOPIC",
  })),
  {
    title: methodologyFeature.title,
    href: methodologyFeature.href,
    subtitle: methodologyFeature.strapline,
    description: methodologyFeature.summary,
    imageUrl: methodologyFeature.imageUrl,
    eyebrow: "METHODS",
  },
];

const AUTO_ADVANCE_DELAY = 4000;

function getWrappedSlideIndex(index: number) {
  return (index + slides.length) % slides.length;
}

export function HeaderImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const activeIndexRef = useRef(0);
  const currentSlideIndex = activeIndex;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    function handleVisibilityChange() {
      const visible = !document.hidden;
      setIsPageVisible(visible);

      if (!visible) {
        return;
      }

      setActiveIndex((current) => getWrappedSlideIndex(current));
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isPageVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => getWrappedSlideIndex(current + 1));
    }, AUTO_ADVANCE_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPageVisible]);

  function goPrevious() {
    setActiveIndex((current) => getWrappedSlideIndex(current - 1));
  }

  function goNext() {
    setActiveIndex((current) => getWrappedSlideIndex(current + 1));
  }

  function jumpToSlide(index: number) {
    setActiveIndex(index);
  }

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-6 lg:px-8">
        <div className="ui-carousel-frame ui-scan-frame relative h-[190px] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] sm:h-[230px] lg:h-[270px]">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="前の写真へ"
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/42 text-lg font-semibold text-white transition hover:bg-black/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="次の写真へ"
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-black/42 text-lg font-semibold text-white transition hover:bg-black/70"
          >
            ›
          </button>

          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {slides.map((slide, slideIndex) => (
              <Link
                key={`${slide.title}-${slideIndex}`}
                href={slide.href}
                className="relative block h-full min-w-full"
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={slideIndex === 0}
                  sizes="(min-width: 1024px) 1480px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/42 to-black/14" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-7">
                  <div className="max-w-[520px] space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{slide.eyebrow}</p>
                    <p className="font-editorial text-3xl font-semibold tracking-tight sm:text-[2.4rem]">{slide.title}</p>
                    <p className="text-sm leading-7 text-white/88 sm:text-base">{slide.subtitle}</p>
                    <p className="max-w-[520px] text-sm leading-7 text-white/72">{slide.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => jumpToSlide(slideIndex)}
                aria-label={`${slide.title}へ移動`}
                className={`h-2.5 rounded-full transition ${
                  slideIndex === currentSlideIndex ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
