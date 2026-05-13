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
    <section className="border-y border-[color:var(--color-border)] py-7">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div className="space-y-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Latest Publications</p>
          <h2 className="font-editorial text-[1.85rem] font-semibold tracking-tight text-[color:var(--color-primary)]">いま読む記事</h2>
        </div>
        <Link href="/articles" className="text-sm font-semibold uppercase tracking-[0.04em] text-[color:var(--color-primary)] underline decoration-[color:var(--color-border-stronger)] underline-offset-4 transition hover:text-[color:var(--color-accent-ink)]">
          記事一覧へ
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-5">
        {posts.map((post) => {
          const leadTopic = post.topics[0];

          return (
            <article
              key={post.id}
              className="ui-precision-card group overflow-hidden border-r border-[color:var(--color-border)] pr-5 transition duration-200 last:border-r-0 xl:min-h-[420px]"
            >
              <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
                <div className="relative aspect-[5/4] overflow-hidden bg-[color:var(--color-surface-muted)]">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt || post.title}
                      fill
                      sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
                    <span>{leadTopic ?? post.format}</span>
                    <span>|</span>
                    <span>{formatDate(post.publishedDate)}</span>
                  </div>
                  <h3 className="font-editorial text-[1.35rem] font-semibold leading-8 tracking-tight text-[color:var(--color-primary)] transition group-hover:text-[color:var(--color-accent-ink)]">
                    {post.title}
                  </h3>
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
