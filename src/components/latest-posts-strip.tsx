import Image from "next/image";
import Link from "next/link";
import { estimateReadingTime, formatDate } from "@/lib/formatters";
import type { BlogPost } from "@/lib/types";

type LatestPostsStripProps = {
  posts: BlogPost[];
};

export function LatestPostsStrip({ posts }: LatestPostsStripProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="ui-tech-panel overflow-hidden rounded-[1.9rem] border border-[rgba(249,115,22,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,247,237,0.76)_100%)] shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-2">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">RECENT PICKS</p>
          <h2 className="text-[1.5rem] font-semibold tracking-tight text-[color:var(--color-primary)]">いま読む記事</h2>
        </div>
        <Link href="/articles" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]">
          記事一覧へ
        </Link>
      </div>

      <div className="grid gap-3 border-t border-[color:var(--color-border)] px-5 py-5 sm:px-6 lg:grid-cols-3 xl:grid-cols-5">
        {posts.map((post) => {
          const leadTopic = post.topics[0];

          return (
            <article
              key={post.id}
              className="ui-precision-card group overflow-hidden rounded-[1.2rem] border border-[rgba(15,23,42,0.1)] bg-[rgba(255,255,255,0.96)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(249,115,22,0.28)]"
            >
              <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
                <div className="relative aspect-[5/4] overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt || post.title}
                      fill
                      sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.8)] via-[rgba(15,23,42,0.2)] to-[rgba(15,23,42,0.04)]" />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-3 py-3">
                    {leadTopic ? (
                      <span className="rounded-full bg-[rgba(255,255,255,0.18)] px-2.5 py-1 text-[0.72rem] font-medium text-white backdrop-blur-sm">
                        {leadTopic}
                      </span>
                    ) : <span />}
                    <span className="text-[0.72rem] font-medium text-white/78">{formatDate(post.publishedDate)}</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8">
                    <h3 className="text-[1rem] font-semibold leading-6 tracking-tight text-white">
                      {post.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                  <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 text-xs text-[color:var(--color-muted)]">
                    <span className="truncate">{post.authorName}</span>
                    <span>{estimateReadingTime(post.body)}分</span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
