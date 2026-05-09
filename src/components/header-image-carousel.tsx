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

function normalizeLoopPosition(index: number) {
  if (index <= 0) {
    return slides.length;
  }

  if (index >= slides.length + 1) {
    return 1;
  }

  return index;
}

export function HeaderImageCarousel() {
  const loopedSlides = [slides[slides.length - 1], ...slides, slides[0]];
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const activeIndexRef = useRef(1);
  const currentSlideIndex = (activeIndex - 1 + slides.length) % slides.length;

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

      const normalizedIndex = normalizeLoopPosition(activeIndexRef.current);

      if (normalizedIndex !== activeIndexRef.current) {
        setIsTransitionEnabled(false);
        setActiveIndex(normalizedIndex);
      }
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loopedSlides.length]);

  useEffect(() => {
    if (isTransitionEnabled) {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [isTransitionEnabled]);

  useEffect(() => {
    if (!isPageVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        const normalizedIndex = normalizeLoopPosition(current);

        if (normalizedIndex !== current) {
          setIsTransitionEnabled(false);
          return normalizedIndex;
        }

        setIsTransitionEnabled(true);
        return current + 1;
      });
    }, AUTO_ADVANCE_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPageVisible]);

  function goPrevious() {
    setIsTransitionEnabled(true);
    setActiveIndex((current) => current - 1);
  }

  function goNext() {
    setIsTransitionEnabled(true);
    setActiveIndex((current) => current + 1);
  }

  function jumpToSlide(index: number) {
    setIsTransitionEnabled(true);
    setActiveIndex(index + 1);
  }

  function handleTransitionEnd() {
    if (activeIndex === 0) {
      setIsTransitionEnabled(false);
      setActiveIndex(slides.length);
      return;
    }

    if (activeIndex === loopedSlides.length - 1) {
      setIsTransitionEnabled(false);
      setActiveIndex(1);
    }
  }

  return (
    <section className="border-b border-[color:var(--color-border)] bg-white/80 backdrop-blur">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-4 lg:px-8 lg:py-5">
        <div className="ui-carousel-frame ui-scan-frame relative h-[170px] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] sm:h-[210px] lg:h-[250px]">
          <button
            type="button"
            onClick={goPrevious}
            aria-label="前の写真へ"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-[rgba(15,23,42,0.48)] text-lg font-semibold text-white transition hover:bg-[rgba(15,23,42,0.7)]"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="次の写真へ"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-[rgba(15,23,42,0.48)] text-lg font-semibold text-white transition hover:bg-[rgba(15,23,42,0.7)]"
          >
            ›
          </button>

          <div
            className={`flex h-full ${isTransitionEnabled ? "transition-transform duration-700 ease-out" : ""}`}
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {loopedSlides.map((slide, slideIndex) => (
              <Link
                key={`${slide.title}-${slideIndex}`}
                href={slide.href}
                className="relative block h-full min-w-full"
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={slideIndex === 1}
                  sizes="(min-width: 1024px) 1480px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,23,42,0.68)] via-[rgba(15,23,42,0.28)] to-[rgba(15,23,42,0.08)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.1)_0%,transparent_34%,rgba(255,255,255,0.08)_100%)] mix-blend-screen" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-7">
                  <div className="max-w-[520px] space-y-2">
                    <p className="text-xs font-semibold tracking-[0.14em] text-white/78">{slide.eyebrow}</p>
                    <p className="text-2xl font-semibold tracking-tight sm:text-[2rem]">{slide.title}</p>
                    <p className="text-sm leading-7 text-white/88 sm:text-base">{slide.subtitle}</p>
                    <p className="max-w-[480px] text-sm leading-7 text-white/76">{slide.description}</p>
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
