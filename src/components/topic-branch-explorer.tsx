"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/search-icon";
import {
  anchorStyle,
  buildArticleBranches,
  centerPosition,
  floatingStyle,
  getPreferredArticleBranchId,
  primaryNodes,
  revealStyle,
  type MapPosition,
} from "@/lib/topic-branch-data";
import { getTopicHref } from "@/lib/topic-pages";
import type { InstituteTopic } from "@/lib/types";

type TopicBranchExplorerProps = {
  query: string;
  selectedTopics: string[];
  topics: InstituteTopic[];
};

function mapPath(from: MapPosition, to: MapPosition) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const bendX = (from.y - to.y) * 0.08;
  const bendY = (to.x - from.x) * 0.035;

  return `M ${from.x} ${from.y} Q ${midX + bendX} ${midY + bendY} ${to.x} ${to.y}`;
}

function branchStroke(active: boolean) {
  return active ? "rgba(249,115,22,0.62)" : "rgba(30,64,175,0.16)";
}

function branchStrokeWidth(active: boolean) {
  return active ? "0.92" : "0.52";
}

export function TopicBranchExplorer({ query, selectedTopics, topics }: TopicBranchExplorerProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const articleBranches = useMemo(() => buildArticleBranches(topics), [topics]);
  const preferredArticleBranchId = useMemo(
    () => getPreferredArticleBranchId(articleBranches, selectedTopics),
    [articleBranches, selectedTopics],
  );
  const selectedTopicNames = useMemo(() => new Set(selectedTopics), [selectedTopics]);
  const selectedBranchIds = useMemo(
    () =>
      new Set(
        articleBranches
          .filter((group) => group.topics.some((topic) => selectedTopicNames.has(topic.name)))
          .map((group) => group.id),
      ),
    [articleBranches, selectedTopicNames],
  );
  const hasSelectedBranches = selectedBranchIds.size > 0;

  const [activePrimaryId, setActivePrimaryId] = useState<string>("articles");
  const [activeArticleBranchId, setActiveArticleBranchId] = useState<string | null>(
    () => preferredArticleBranchId ?? articleBranches[0]?.id ?? null,
  );

  const activePrimary = primaryNodes.find((node) => node.id === activePrimaryId) ?? primaryNodes[0];
  const resolvedArticleBranchId =
    (activeArticleBranchId && articleBranches.some((group) => group.id === activeArticleBranchId)
      ? activeArticleBranchId
      : preferredArticleBranchId) ??
    articleBranches[0]?.id ??
    null;
  const activeArticleBranch =
    articleBranches.find((group) => group.id === resolvedArticleBranchId) ?? articleBranches[0] ?? null;

  const contextTitle =
    activePrimary.kind === "articles"
      ? activeArticleBranch?.label ?? "記事を探す"
      : activePrimary.label;
  const contextDescription =
    activePrimary.kind === "articles"
      ? activeArticleBranch?.description ?? "知りたいテーマを選べます。"
      : activePrimary.description;

  return (
    <section>
      <div className="ui-tech-panel overflow-hidden rounded-[2.25rem] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] shadow-[var(--shadow-soft)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.52fr)_390px]">
          <div className="space-y-5 px-4 py-5 md:hidden">
            <div className="rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">CENTER</p>
                  <p className="mt-1 text-lg font-semibold text-[color:var(--color-primary)]">松笠研究所</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePrimaryId("articles");
                    if (!resolvedArticleBranchId && articleBranches[0]) {
                      setActiveArticleBranchId(articleBranches[0].id);
                    }
                  }}
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-medium text-[color:var(--color-warm-ink)] transition hover:text-[color:var(--color-primary)]"
                >
                  記事から始める
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {primaryNodes.map((node, index) => {
                const active = activePrimary.id === node.id;
                const highlightedBySelection = node.id === "articles" && hasSelectedBranches;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      setActivePrimaryId(node.id);
                      if (node.id === "articles" && !resolvedArticleBranchId && articleBranches[0]) {
                        setActiveArticleBranchId(articleBranches[0].id);
                      }
                    }}
                    className={`ui-explorer-float rounded-[1.45rem] border px-4 py-4 text-left text-white transition ${
                      active || highlightedBySelection
                        ? "border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] !text-[color:var(--color-primary)] shadow-[0_16px_32px_rgba(15,23,42,0.1)]"
                        : "border-[rgba(147,197,253,0.5)] bg-[linear-gradient(180deg,#1d64c2_0%,#164a94_100%)] shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                    }`}
                    style={floatingStyle(index, 6.4)}
                  >
                    <p className="text-base font-semibold">{node.label}</p>
                  </button>
                );
              })}
            </div>

            {activePrimary.kind === "articles" ? (
              <div className="space-y-4 rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-card)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">BRANCH</p>
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">テーマの枝</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {articleBranches.map((branch, index) => {
                    const active = branch.id === activeArticleBranch?.id;
                    const selected = selectedBranchIds.has(branch.id);

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setActiveArticleBranchId(branch.id)}
                        className={`ui-explorer-reveal rounded-[1.3rem] border px-4 py-4 text-left text-white transition ${
                          active || selected
                            ? "border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] !text-[color:var(--color-primary)] shadow-[0_16px_32px_rgba(15,23,42,0.1)]"
                            : "border-[rgba(147,197,253,0.36)] bg-[linear-gradient(180deg,rgba(96,133,227,0.94)_0%,rgba(61,105,202,0.84)_100%)] shadow-[0_10px_20px_rgba(30,64,175,0.12)]"
                        }`}
                        style={revealStyle(index)}
                      >
                        <p className="text-base font-semibold">{branch.label}</p>
                      </button>
                    );
                  })}
                </div>
                {activeArticleBranch ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeArticleBranch.topics.map((topic, index) => {
                      const active = selectedTopicNames.has(topic.name);

                      return (
                        <Link
                          key={topic.name}
                          href={getTopicHref(topic.name)}
                          className={`ui-explorer-reveal rounded-[1.2rem] border px-4 py-4 text-center text-sm font-medium transition ${
                            active
                              ? "border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] text-[color:var(--color-primary)] shadow-[0_14px_28px_rgba(15,23,42,0.1)]"
                              : "border-[rgba(147,197,253,0.3)] bg-[linear-gradient(180deg,rgba(107,134,232,0.94)_0%,rgba(127,154,241,0.78)_100%)] text-white shadow-[0_10px_20px_rgba(30,64,175,0.12)]"
                          }`}
                          style={revealStyle(index)}
                        >
                          {topic.name}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4 rounded-[1.6rem] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.84)] px-4 py-4 shadow-[var(--shadow-card)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">PATH</p>
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">{activePrimary.label}</p>
                </div>
                <div className="grid gap-3">
                  {activePrimary.links.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="ui-explorer-reveal rounded-[1.2rem] border border-[rgba(147,197,253,0.3)] bg-[linear-gradient(180deg,rgba(96,133,227,0.94)_0%,rgba(127,154,241,0.78)_100%)] px-4 py-4 text-white shadow-[0_10px_20px_rgba(30,64,175,0.12)] transition hover:scale-[1.01]"
                      style={revealStyle(index)}
                    >
                      <p className="text-sm font-semibold">{item.label}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative hidden min-h-[650px] overflow-hidden px-6 py-7 md:block xl:min-h-[690px]">
            <div className="absolute inset-6 rounded-[2rem] border border-[color:var(--color-border)] bg-[radial-gradient(circle_at_52%_48%,#ffffff_0%,#ffffff_46%,rgba(248,250,252,0.9)_100%)]" />
            <div className="absolute inset-8 rounded-[1.9rem] border border-[rgba(15,23,42,0.06)] bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.18))]" />
            <div className="pointer-events-none absolute inset-8 rounded-[1.9rem] bg-[repeating-linear-gradient(90deg,rgba(15,23,42,0.026)_0_1px,transparent_1px_44px),repeating-linear-gradient(0deg,rgba(15,23,42,0.022)_0_1px,transparent_1px_44px)]" />
            <div className="pointer-events-none absolute inset-x-8 top-[42%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.94),transparent)]" />

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {primaryNodes.map((node) => (
                <path
                  key={`center-${node.id}`}
                  className={`ui-map-branch ${
                    node.id === activePrimary.id || (node.id === "articles" && hasSelectedBranches)
                      ? "ui-map-branch-active"
                      : ""
                  }`}
                  d={mapPath(centerPosition, node.position)}
                  stroke={branchStroke(node.id === activePrimary.id || (node.id === "articles" && hasSelectedBranches))}
                  strokeWidth={branchStrokeWidth(node.id === activePrimary.id || (node.id === "articles" && hasSelectedBranches))}
                  fill="none"
                  strokeLinecap="round"
                  pathLength={1}
                />
              ))}

              {activePrimary.kind === "links"
                ? activePrimary.links.map((item, index) => {
                    const leafPosition =
                      activePrimary.leafPositions[index] ??
                      activePrimary.leafPositions[activePrimary.leafPositions.length - 1];

                    return (
                      <path
                        key={`leaf-${item.href}`}
                        className="ui-map-branch ui-map-branch-active"
                        d={mapPath(activePrimary.position, leafPosition)}
                        stroke="rgba(249,115,22,0.42)"
                        strokeWidth="0.68"
                        fill="none"
                        strokeLinecap="round"
                        pathLength={1}
                      />
                    );
                  })
                : null}

              {activePrimary.kind === "articles"
                ? articleBranches.map((branch) => (
                  <path
                      key={`branch-${branch.id}`}
                      className={`ui-map-branch ${
                        branch.id === activeArticleBranch?.id || selectedBranchIds.has(branch.id)
                          ? "ui-map-branch-active"
                          : ""
                      }`}
                      d={mapPath(primaryNodes[0].position, branch.position)}
                      stroke={branchStroke(branch.id === activeArticleBranch?.id || selectedBranchIds.has(branch.id))}
                      strokeWidth={branchStrokeWidth(branch.id === activeArticleBranch?.id || selectedBranchIds.has(branch.id))}
                      fill="none"
                      strokeLinecap="round"
                      pathLength={1}
                    />
                  ))
                : null}

              {activePrimary.kind === "articles" && activeArticleBranch
                ? activeArticleBranch.topics.map((topic, index) => {
                    const leafPosition =
                      activeArticleBranch.leafPositions[index] ??
                      activeArticleBranch.leafPositions[activeArticleBranch.leafPositions.length - 1];

                    return (
                      <path
                        key={`topic-${topic.name}`}
                        className="ui-map-branch ui-map-branch-active"
                        d={mapPath(activeArticleBranch.position, leafPosition)}
                        stroke="rgba(249,115,22,0.42)"
                        strokeWidth="0.62"
                        fill="none"
                        strokeLinecap="round"
                        pathLength={1}
                      />
                    );
                  })
                : null}
            </svg>

            <div className="pointer-events-none absolute inset-x-8 top-8 z-10 flex items-center justify-between gap-4 rounded-[1.1rem] border border-[rgba(15,23,42,0.08)] bg-white/66 px-4 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">
                MRC NAVIGATION GRAPH
              </p>
              <p className="hidden text-xs font-medium text-[color:var(--color-secondary-ink)] lg:block">
                中心から入口を選び、枝先のテーマへ進みます
              </p>
              <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-[color:var(--color-accent-ink)]">
                ACTIVE / {contextTitle}
              </p>
            </div>

            <div className="absolute z-20" style={anchorStyle(centerPosition)}>
              <button
                type="button"
                onClick={() => {
                  setActivePrimaryId("articles");
                  if (!resolvedArticleBranchId && articleBranches[0]) {
                    setActiveArticleBranchId(articleBranches[0].id);
                  }
                }}
                className={`ui-map-node ui-terminal-node ui-terminal-node-core ui-explorer-float ui-explorer-glow relative flex h-[122px] w-[252px] items-center justify-center overflow-hidden rounded-[1.9rem] border px-8 text-center text-white shadow-[0_18px_38px_rgba(15,23,42,0.22)] ${
                  hasSelectedBranches
                    ? "ui-terminal-node-active border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] !text-[color:var(--color-primary)] shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
                    : "border-[rgba(147,197,253,0.6)] bg-[linear-gradient(180deg,#0f58b8_0%,#164e9a_100%)]"
                }`}
                aria-pressed={activePrimary.id === "articles"}
              >
                <span className="space-y-2">
                  <span className="block text-[1.78rem] font-semibold tracking-tight">松笠研究所</span>
                  <span className="block text-sm text-white/82">知りたい入口を選ぶ</span>
                </span>
              </button>
            </div>

            {primaryNodes.map((node, index) => {
              const active = activePrimary.id === node.id;
              const highlightedBySelection = node.id === "articles" && hasSelectedBranches;

              return (
                <div key={node.id} className="absolute z-20" style={anchorStyle(node.position)}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePrimaryId(node.id);
                      if (node.id === "articles" && !resolvedArticleBranchId && articleBranches[0]) {
                        setActiveArticleBranchId(articleBranches[0].id);
                      }
                    }}
                    className={`ui-map-node ui-terminal-node ui-explorer-float relative flex h-[86px] w-[166px] items-center justify-center overflow-hidden rounded-[1.5rem] border px-5 text-center text-white transition duration-200 ${
                      active || highlightedBySelection
                        ? "ui-terminal-node-active ui-explorer-glow border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] !text-[color:var(--color-primary)] shadow-[0_18px_38px_rgba(15,23,42,0.12)]"
                        : "border-[rgba(147,197,253,0.5)] bg-[linear-gradient(180deg,#1d64c2_0%,#164a94_100%)] shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:scale-[1.02]"
                    }`}
                    style={floatingStyle(index)}
                    aria-pressed={active}
                  >
                    {active || highlightedBySelection ? (
                      <span className="absolute right-5 top-4 h-2 w-2 rounded-full bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.14)]" />
                    ) : null}
                    <span className="space-y-1">
                      <span className="block text-[1.1rem] font-semibold tracking-tight">{node.label}</span>
                      <span className="block text-xs text-white/78">{active ? "枝を開いています" : "入口を開く"}</span>
                    </span>
                  </button>
                </div>
              );
            })}

            {activePrimary.kind === "links"
              ? activePrimary.links.map((item, index) => {
                  const position =
                    activePrimary.leafPositions[index] ??
                    activePrimary.leafPositions[activePrimary.leafPositions.length - 1];

                  return (
                    <div key={item.href} className="absolute z-20" style={anchorStyle(position)}>
                      <Link
                        href={item.href}
                        className="ui-map-node ui-terminal-node ui-terminal-node-soft ui-explorer-float ui-explorer-reveal flex h-[54px] w-[112px] items-center justify-center rounded-[1.05rem] border border-[rgba(147,197,253,0.34)] bg-[linear-gradient(180deg,rgba(107,134,232,0.94)_0%,rgba(127,154,241,0.8)_100%)] px-3 text-center text-[0.78rem] font-medium leading-[1.35] text-white shadow-[0_12px_24px_rgba(30,64,175,0.14)] transition duration-200 hover:scale-[1.03]"
                        style={{
                          ...floatingStyle(index + 1, 6.6),
                          ...revealStyle(index),
                        }}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })
              : null}

            {activePrimary.kind === "articles"
              ? articleBranches.map((branch, index) => {
                  const active = branch.id === activeArticleBranch?.id;
                  const selected = selectedBranchIds.has(branch.id);

                  return (
                    <div key={branch.id} className="absolute z-20" style={anchorStyle(branch.position)}>
                      <button
                        type="button"
                        onClick={() => setActiveArticleBranchId(branch.id)}
                        className={`ui-map-node ui-terminal-node ui-explorer-float ui-explorer-reveal relative flex h-[76px] w-[146px] items-center justify-center overflow-hidden rounded-[1.35rem] border px-4 text-center text-white transition duration-200 ${
                          active || selected
                            ? "ui-terminal-node-active border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] !text-[color:var(--color-primary)] shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
                            : "border-[rgba(147,197,253,0.42)] bg-[linear-gradient(180deg,#3d7ddf_0%,#255db5_100%)] shadow-[0_12px_24px_rgba(30,64,175,0.16)] hover:scale-[1.02]"
                        }`}
                        style={{
                          ...floatingStyle(index + 2, 6.8),
                          ...revealStyle(index),
                        }}
                        aria-pressed={active}
                      >
                        {active || selected ? (
                          <span className="absolute right-4 top-3 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_0_4px_rgba(255,255,255,0.14)]" />
                        ) : null}
                        <span className="text-[1rem] font-semibold leading-[1.4]">{branch.label}</span>
                      </button>
                    </div>
                  );
                })
              : null}

            {activePrimary.kind === "articles" && activeArticleBranch
              ? activeArticleBranch.topics.map((topic, index) => {
                  const position =
                    activeArticleBranch.leafPositions[index] ??
                    activeArticleBranch.leafPositions[activeArticleBranch.leafPositions.length - 1];
                  const active = selectedTopicNames.has(topic.name);

                  return (
                    <div key={topic.name} className="absolute z-20" style={anchorStyle(position)}>
                      <Link
                        href={getTopicHref(topic.name)}
                        className={`ui-map-node ui-terminal-node ui-terminal-node-soft ui-explorer-float ui-explorer-reveal flex h-[50px] w-[100px] items-center justify-center rounded-[1rem] border px-3 text-center text-[0.76rem] font-medium leading-[1.3] transition duration-200 hover:scale-[1.03] ${
                          active
                            ? "ui-terminal-node-active border-[color:var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] text-[color:var(--color-primary)] shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
                            : "border-[rgba(147,197,253,0.46)] bg-[linear-gradient(180deg,#dbeafe_0%,#bfdbfe_100%)] text-[color:var(--color-primary)] shadow-[0_10px_20px_rgba(30,64,175,0.12)]"
                        }`}
                        style={{
                          ...floatingStyle(index + 1, 6.4),
                          ...revealStyle(index),
                        }}
                      >
                        {topic.name}
                      </Link>
                    </div>
                  );
                })
              : null}
          </div>

          <div className="border-t border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.78)] px-4 py-5 backdrop-blur md:px-5 md:py-7 xl:border-l xl:border-t-0">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">CURRENT FOCUS</p>
                <div className="space-y-2">
                  <h2 className="text-[1.4rem] font-semibold tracking-tight text-[color:var(--color-primary)]">
                    {contextTitle}
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">{contextDescription}</p>
                  {selectedTopics.length > 0 || query ? (
                    <div className="pt-1">
                      <Link
                        href="/articles"
                        className="text-xs font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
                      >
                        条件を外す
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <form action="/articles" className="space-y-3 rounded-[1.4rem] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.86)] px-4 py-4 shadow-[var(--shadow-card)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">DIRECT SEARCH</p>
                  <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                    記事名、本文、地域、研究員名でも直接探せます。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={searchInputRef}
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="テーマ、本文、地域、研究員で検索"
                    className="h-12 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                  {selectedTopics.length > 0 ? <input type="hidden" name="topics" value={selectedTopics.join(",")} /> : null}
                  <button
                    type="submit"
                    aria-label="記事を探す"
                    className="ui-button ui-button-primary h-12 w-12 shrink-0 rounded-xl px-0 text-sm"
                  >
                    <SearchIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="text-xs font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
                >
                  入力欄を開く
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
