import Image from "next/image";
import Link from "next/link";
import { estimateReadingTime, formatDate } from "@/lib/formatters";
import { getTopicHref } from "@/lib/topic-pages";
import type { BlogPost } from "@/lib/types";

type StoryCardProps = {
  post: BlogPost;
};

type StoryImageProps = {
  post: BlogPost;
  sizes: string;
  aspectClassName: string;
};

type StoryTopicsProps = {
  post: BlogPost;
  limit?: number;
};

type PopularPostsAsideProps = {
  posts: BlogPost[];
};

function StoryMeta({ post }: StoryCardProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--color-muted)]">
      <span className="font-medium text-[color:var(--color-primary)]">{post.format}</span>
      <span>|</span>
      <span>{formatDate(post.publishedDate)}</span>
      <span>|</span>
      <span>{estimateReadingTime(post.body)}分</span>
    </div>
  );
}

function StoryTopics({ post, limit = 3 }: StoryTopicsProps) {
  const visibleTopics = post.topics.slice(0, limit);

  if (visibleTopics.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTopics.map((topic) => (
        <Link
          key={topic}
          href={getTopicHref(topic)}
          className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-xs text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
        >
          {topic}
        </Link>
      ))}
    </div>
  );
}

function StoryImage({ post, sizes, aspectClassName }: StoryImageProps) {
  if (!post.coverImage) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] text-sm text-[color:var(--color-muted)] ${aspectClassName}`}
      >
        画像なし
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] ${aspectClassName}`}
    >
      <Image
        src={post.coverImage.url}
        alt={post.coverImage.alt || post.title}
        fill
        sizes={sizes}
        className="object-cover transition duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}

export function LeadStory({ post }: StoryCardProps) {
  return (
    <article className="ui-warm-panel-soft group rounded-[1.75rem] border border-[color:var(--color-border)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <Link href={`/posts/${post.slug}`} className="block space-y-5">
        <StoryImage post={post} sizes="(min-width: 1280px) 540px, 100vw" aspectClassName="aspect-[16/9]" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-[0.72rem] font-semibold tracking-[0.14em] text-[color:var(--color-warm-ink)]">
              FEATURE
            </span>
            <StoryMeta post={post} />
          </div>
          <h2 className="text-[1.85rem] font-semibold leading-[1.5] tracking-tight text-[color:var(--color-primary)] transition group-hover:text-[color:var(--color-accent-ink)] lg:text-[2.25rem]">
            {post.title}
          </h2>
          <p className="text-[0.98rem] leading-8 text-[color:var(--color-secondary-ink)]">{post.excerpt}</p>
          <StoryTopics post={post} limit={4} />
        </div>
      </Link>
    </article>
  );
}

export function SideStory({ post }: StoryCardProps) {
  return (
    <article className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-stronger)] hover:shadow-[var(--shadow-card)]">
      <Link href={`/posts/${post.slug}`} className="block space-y-3">
        <StoryImage post={post} sizes="(min-width: 1280px) 250px, 100vw" aspectClassName="aspect-[16/10]" />
        <div className="space-y-2">
          <StoryMeta post={post} />
          <h2 className="text-[1.02rem] font-semibold leading-8 text-[color:var(--color-primary)] transition group-hover:text-[color:var(--color-accent-ink)]">
            {post.title}
          </h2>
        </div>
      </Link>
    </article>
  );
}

export function StoryRow({ post }: StoryCardProps) {
  return (
    <article className="group border-b border-[color:var(--color-border)] py-5 first:pt-0 last:border-b-0 last:pb-0">
      <Link href={`/posts/${post.slug}`} className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <StoryImage post={post} sizes="220px" aspectClassName="aspect-[16/10]" />
        <div className="space-y-3">
          <StoryMeta post={post} />
          <div className="space-y-2">
            <h2 className="text-[1.26rem] font-semibold leading-8 text-[color:var(--color-primary)] transition group-hover:text-[color:var(--color-accent-ink)]">
              {post.title}
            </h2>
            <p className="text-[0.96rem] leading-8 text-[color:var(--color-secondary-ink)]">{post.excerpt}</p>
          </div>
          <StoryTopics post={post} />
        </div>
      </Link>
    </article>
  );
}

export function PopularPostsAside({ posts }: PopularPostsAsideProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside className="space-y-4 rounded-[2rem] border border-[color:rgba(15,23,42,0.84)] bg-[color:var(--color-primary)] px-5 py-6 text-[color:var(--color-primary-contrast)] shadow-[var(--shadow-soft)] lg:px-6 lg:py-7">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-white/70">POPULAR</p>
          <span className="h-px flex-1 bg-white/15" />
        </div>
        <p className="text-base font-semibold text-white">人気ランキング</p>
      </div>

      <ol className="space-y-4">
        {posts.map((post, index) => (
          <li key={post.id} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
            <Link href={`/posts/${post.slug}`} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
              <span className="text-2xl font-semibold leading-none text-[color:var(--color-accent)]">{index + 1}</span>
              <span className="space-y-2">
                <span className="block text-base font-semibold leading-7 text-white transition hover:text-white/80">
                  {post.title}
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/65">
                  <span>{formatDate(post.publishedDate)}</span>
                  {post.topics.slice(0, 2).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-white/15 px-2.5 py-1 text-white/85"
                    >
                      {topic}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
