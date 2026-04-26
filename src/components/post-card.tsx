import Image from "next/image";
import Link from "next/link";
import { estimateReadingTime, formatDate } from "@/lib/formatters";
import type { BlogPost } from "@/lib/types";

type PostCardProps = {
  post: BlogPost;
};

export function PostCard({ post }: PostCardProps) {
  const visibleTopics = post.topics.slice(0, 3);

  return (
    <article className="group h-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-stronger)]">
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
        {post.coverImage ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="rounded-t-xl border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-8 text-sm text-[color:var(--color-muted)]">
            画像なし
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
            <span className="rounded-full bg-[color:var(--color-surface-subtle)] px-3 py-1 font-medium text-[color:var(--color-primary)]">
              {post.format}
            </span>
            <span>更新 {formatDate(post.publishedDate)}</span>
            <span>{estimateReadingTime(post.body)}分</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-[1.06rem] font-semibold leading-8 tracking-tight text-[color:var(--color-primary)] transition group-hover:text-[color:var(--color-accent-ink)]">
              {post.title}
            </h2>
            <p className="max-h-[6.4rem] overflow-hidden text-sm leading-7 text-[color:var(--color-text)]">
              {post.excerpt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
            {visibleTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-text)]"
              >
                {topic}
              </span>
            ))}
            {post.topics.length > visibleTopics.length ? (
              <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-muted)]">
                +{post.topics.length - visibleTopics.length}
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-3 text-sm text-[color:var(--color-muted)]">
            <p>{post.authorName}</p>
            <span className="font-medium text-[color:var(--color-accent-ink)]">読む</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
