import Image from "next/image";
import { AdminContentBlocksEditor } from "@/components/admin-content-blocks-editor";
import {
  collectionLabel,
  labeledBlocksToTextarea,
  linesToTextarea,
  sourceLinksToTextarea,
  statusLabel,
} from "@/lib/post-helpers";
import { formatDateTimeInput } from "@/lib/formatters";
import type {
  AdminCollectionKey,
  AdminDirectorPage,
  AdminEntity,
  AdminFinancePage,
  AdminFinancialStatement,
  AdminMethodology,
  AdminPost,
  AdminReport,
  AdminResearcher,
} from "@/lib/types";

type AdminContentFormProps = {
  collection: AdminCollectionKey;
  action: string;
  entity?: AdminEntity | null;
  error?: string;
  configured: boolean;
};

function renderStatus(entity?: AdminEntity | null) {
  if (!entity) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-secondary-ink)]">
      <span className="rounded-md bg-[color:var(--color-surface-muted)] px-3 py-1 font-medium text-[color:var(--color-text)]">
        {statusLabel(entity.status)}
      </span>
      <span>ID: {entity.id}</span>
    </div>
  );
}

function renderCommonNotice(configured: boolean, error?: string) {
  return (
    <>
      {!configured ? (
        <div className="rounded-lg border border-[color:var(--color-border-stronger)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-sm text-[color:var(--color-primary)]">
          microCMS の環境変数がまだ入っていません。画面と導線は先に整っています。
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-[color:var(--color-primary)]/22 bg-[color:var(--color-surface-subtle)] px-4 py-3 text-sm text-[color:var(--color-primary)]">
          {error}
        </div>
      ) : null}
    </>
  );
}

function renderScheduleHint(label: string) {
  return (
    <p className="text-xs leading-6 text-[color:var(--color-muted)]">
      {label}より前は公開面に反映されません。未来の日時を入れると、予約更新として扱います。
    </p>
  );
}

function renderBodyFormatHint() {
  return (
    <div className="space-y-1 text-xs leading-6 text-[color:var(--color-muted)]">
      <p>大見出しは「## 見出し」、中見出しは「### 見出し」。空行で段落を分けます。</p>
      <p>画像は「![キャプション](画像URL)」と書くと、その位置に表示されます。</p>
      <p>D3.js のアニメーションは、本文ブロックの「D3を追加」から設定できます。</p>
    </div>
  );
}

function renderInlineImageUpload() {
  return (
    <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
      <span className="font-medium">本文用の写真・グラフ</span>
      <input
        type="file"
        name="inlineImageFiles"
        accept="image/*"
        multiple
        className="flex min-h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
      />
      <p className="text-xs leading-6 text-[color:var(--color-muted)]">
        保存すると画像をアップロードし、本文末尾に差し込み用の記法を追記します。保存後に本文の好きな位置へ移動できます。
      </p>
    </label>
  );
}

function PostFields({ entity }: { entity?: AdminEntity | null }) {
  const post = entity as AdminPost | undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={post?.slug ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">形式</span>
          <input
            type="text"
            name="format"
            required
            defaultValue={post?.format ?? "調査報告"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">カテゴリ</span>
          <input
            type="text"
            name="category"
            required
            defaultValue={post?.category ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">地域</span>
          <input
            type="text"
            name="region"
            required
            defaultValue={post?.region ?? "全国"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開日時</span>
          <input
            type="datetime-local"
            name="publishedDate"
            required
            defaultValue={formatDateTimeInput(post?.publishedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">著者名</span>
          <input
            type="text"
            name="authorName"
            required
            defaultValue={post?.authorName ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">カバー画像</span>
          <input
            type="file"
            name="coverImageFile"
            accept="image/*"
            className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
          />
        </label>
      </section>

      {post?.coverImage ? (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            <Image src={post.coverImage.url} alt={post.title} fill sizes="220px" className="object-cover" />
          </div>
          <div className="space-y-3 text-sm text-[color:var(--color-secondary-ink)]">
            <p>現在のカバー画像を保持しています。新しい画像を選ぶと差し替わります。</p>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="removeCoverImage" value="1" />
              <span>画像を外す</span>
            </label>
            <input type="hidden" name="existingCoverImageUrl" value={post.coverImage.url} />
          </div>
        </div>
      ) : null}

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">概要</span>
        <textarea
          name="excerpt"
          rows={4}
          required
          defaultValue={post?.excerpt ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">トピック</span>
          <textarea
            name="topicsText"
            rows={4}
            defaultValue={linesToTextarea(post?.topics ?? [])}
            placeholder="1行に1トピック"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">研究員スラッグ</span>
          <textarea
            name="researcherSlugsText"
            rows={4}
            defaultValue={linesToTextarea(post?.researcherSlugs ?? [])}
            placeholder="1行に1スラッグ"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">方法論スラッグ</span>
          <textarea
            name="methodologySlugsText"
            rows={4}
            defaultValue={linesToTextarea(post?.methodologySlugs ?? [])}
            placeholder="1行に1スラッグ"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">要点</span>
          <textarea
            name="keyFindingsText"
            rows={4}
            defaultValue={linesToTextarea(post?.keyFindings ?? [])}
            placeholder="1行に1項目"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">方法論の要約</span>
        <textarea
          name="methodologySummary"
          rows={4}
          defaultValue={post?.methodologySummary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">出典・基準</span>
          <textarea
            name="sourceBasis"
            rows={4}
            defaultValue={post?.sourceBasis ?? ""}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新メモ</span>
          <textarea
            name="updatedNote"
            rows={4}
            defaultValue={post?.updatedNote ?? ""}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">参考リンク</span>
        <textarea
          name="sourceLinksText"
          rows={4}
          defaultValue={sourceLinksToTextarea(post?.sourceLinks ?? [])}
          placeholder="ラベル | URL"
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <AdminContentBlocksEditor initialBlocks={post?.contentBlocks ?? []} />
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">互換本文（任意）</span>
        {renderBodyFormatHint()}
        <p className="text-xs leading-6 text-[color:var(--color-muted)]">
          既存原稿の移行や細かな調整にだけ使います。本文ブロックが入っている場合は、そちらが優先されます。
        </p>
        <textarea
          name="body"
          rows={18}
          defaultValue={post?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 font-mono text-sm outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

function ResearcherFields({ entity }: { entity?: AdminEntity | null }) {
  const researcher = entity as AdminResearcher | undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">名前</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={researcher?.name ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={researcher?.slug ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">役職</span>
          <input
            type="text"
            name="role"
            required
            defaultValue={researcher?.role ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">チーム</span>
          <input
            type="text"
            name="team"
            required
            defaultValue={researcher?.team ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(researcher?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">メール</span>
          <input
            type="email"
            name="email"
            defaultValue={researcher?.email ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">紹介文</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={researcher?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      {renderInlineImageUpload()}
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">本文</span>
        {renderBodyFormatHint()}
        <textarea
          name="bio"
          rows={10}
          required
          defaultValue={researcher?.bio ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">重点トピック</span>
          <textarea
            name="focusTopicsText"
            rows={4}
            defaultValue={linesToTextarea(researcher?.focusTopics ?? [])}
            placeholder="1行に1トピック"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">方法論スラッグ</span>
          <textarea
            name="methodologySlugsText"
            rows={4}
            defaultValue={linesToTextarea(researcher?.methodologySlugs ?? [])}
            placeholder="1行に1スラッグ"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">出典・基準</span>
        <textarea
          name="sourceBasis"
          rows={4}
          defaultValue={researcher?.sourceBasis ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <label className="space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">ポートレート画像</span>
        <input
          type="file"
          name="portraitImageFile"
          accept="image/*"
          className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
        />
      </label>

      {researcher?.portraitImage ? (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            <Image
              src={researcher.portraitImage.url}
              alt={researcher.name}
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
          <div className="space-y-3 text-sm text-[color:var(--color-secondary-ink)]">
            <p>現在の画像を保持しています。新しい画像を選ぶと差し替わります。</p>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="removePortraitImage" value="1" />
              <span>画像を外す</span>
            </label>
            <input type="hidden" name="existingPortraitImageUrl" value={researcher.portraitImage.url} />
          </div>
        </div>
      ) : null}
    </>
  );
}

function MethodologyFields({ entity }: { entity?: AdminEntity | null }) {
  const methodology = entity as AdminMethodology | undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={methodology?.title ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={methodology?.slug ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(methodology?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">レビュー担当</span>
          <input
            type="text"
            name="reviewer"
            required
            defaultValue={methodology?.reviewer ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">要約</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={methodology?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">重点トピック</span>
          <textarea
            name="focusTopicsText"
            rows={5}
            defaultValue={linesToTextarea(methodology?.focusTopics ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">向いている場面</span>
          <textarea
            name="goodForText"
            rows={5}
            defaultValue={linesToTextarea(methodology?.goodFor ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">やらないこと</span>
          <textarea
            name="limitsText"
            rows={5}
            defaultValue={linesToTextarea(methodology?.limits ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">出典・基準</span>
        <textarea
          name="sourceBasis"
          rows={4}
          defaultValue={methodology?.sourceBasis ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      {renderInlineImageUpload()}
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">本文</span>
        {renderBodyFormatHint()}
        <textarea
          name="body"
          rows={16}
          required
          defaultValue={methodology?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

function ReportFields({ entity }: { entity?: AdminEntity | null }) {
  const report = entity as AdminReport | undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={report?.title ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={report?.slug ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開日時</span>
          <input
            type="datetime-local"
            name="publishedDate"
            required
            defaultValue={formatDateTimeInput(report?.publishedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日時</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(report?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">種類</span>
          <input
            type="text"
            name="reportType"
            required
            defaultValue={report?.reportType ?? "調査報告書"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          <p className="text-xs leading-6 text-[color:var(--color-muted)]">
            決算資料として財務情報ページに出したいときは「決算資料」と入れます。
          </p>
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">地域</span>
          <input
            type="text"
            name="region"
            required
            defaultValue={report?.region ?? "全国"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">概要</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={report?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">トピック</span>
          <textarea
            name="topicNamesText"
            rows={4}
            defaultValue={linesToTextarea(report?.topicNames ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">研究員スラッグ</span>
          <textarea
            name="researcherSlugsText"
            rows={4}
            defaultValue={linesToTextarea(report?.researcherSlugs ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">方法論スラッグ</span>
          <textarea
            name="methodologySlugsText"
            rows={4}
            defaultValue={linesToTextarea(report?.methodologySlugs ?? [])}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">カバー画像</span>
          <input
            type="file"
            name="coverImageFile"
            accept="image/*"
            className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">PDF 添付</span>
          <input
            type="file"
            name="pdfFile"
            accept="application/pdf"
            className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
          />
        </label>
      </section>

      {report?.coverImage ? (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            <Image src={report.coverImage.url} alt={report.title} fill sizes="220px" className="object-cover" />
          </div>
          <div className="space-y-3 text-sm text-[color:var(--color-secondary-ink)]">
            <p>現在のカバー画像を保持しています。</p>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="removeCoverImage" value="1" />
              <span>画像を外す</span>
            </label>
            <input type="hidden" name="existingCoverImageUrl" value={report.coverImage.url} />
          </div>
        </div>
      ) : null}

      {report?.pdfUrl ? (
        <div className="space-y-2 text-sm text-[color:var(--color-secondary-ink)]">
          <p>現在の PDF: {report.pdfUrl}</p>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="removePdf" value="1" />
            <span>PDF を外す</span>
          </label>
          <input type="hidden" name="existingPdfUrl" value={report.pdfUrl} />
        </div>
      ) : null}

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">図表画像</span>
        <input
          type="file"
          name="figureFiles"
          accept="image/*"
          multiple
          className="flex min-h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">図表リスト</span>
          <textarea
            name="figuresText"
            rows={5}
            defaultValue={(report?.figures ?? []).map((item) => `${item.title} | ${item.url}`).join("\n")}
            placeholder="図表タイトル | URL"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">参考リンク</span>
          <textarea
            name="sourceLinksText"
            rows={5}
            defaultValue={sourceLinksToTextarea(report?.sourceLinks ?? [])}
            placeholder="ラベル | URL"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">出典・基準</span>
        <textarea
          name="sourceBasis"
          rows={4}
          defaultValue={report?.sourceBasis ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <AdminContentBlocksEditor initialBlocks={report?.contentBlocks ?? []} />
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">互換本文（任意）</span>
        {renderBodyFormatHint()}
        <p className="text-xs leading-6 text-[color:var(--color-muted)]">
          本文ブロックが空のときだけ、この本文を使います。ブロックで組んだ内容は自動で整形して保存されます。
        </p>
        <textarea
          name="body"
          rows={16}
          defaultValue={report?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

function DirectorFields({ entity }: { entity?: AdminEntity | null }) {
  const page = entity as AdminDirectorPage | undefined;

  return (
    <>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-3 text-sm text-[color:var(--color-secondary-ink)]">
        公開中の内容を残したまま予約更新したい場合は、既存版を編集するより「新規作成」で次の版を作る運用がおすすめです。
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={page?.title ?? "所長から"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={page?.slug ?? "director"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">サイトへの反映日時</span>
          <input
            type="datetime-local"
            name="effectiveDate"
            required
            defaultValue={formatDateTimeInput(page?.effectiveDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          {renderScheduleHint("この日時")}
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日時</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(page?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">導入文</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={page?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      {renderInlineImageUpload()}
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">補足本文</span>
        {renderBodyFormatHint()}
        <textarea
          name="body"
          rows={6}
          required
          defaultValue={page?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">役割カード</span>
        <textarea
          name="roleCardsText"
          rows={5}
          required
          defaultValue={labeledBlocksToTextarea(page?.roleCards ?? [])}
          placeholder="タイトル | 説明"
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開姿勢の見出し</span>
          <input
            type="text"
            name="stanceTitle"
            required
            defaultValue={page?.stanceTitle ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開姿勢の説明</span>
          <textarea
            name="stanceDescription"
            rows={3}
            required
            defaultValue={page?.stanceDescription ?? ""}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">公開姿勢カード</span>
        <textarea
          name="stanceCardsText"
          rows={5}
          required
          defaultValue={labeledBlocksToTextarea(page?.stanceCards ?? [])}
          placeholder="タイトル | 説明"
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">関連ページの説明</span>
        <textarea
          name="relatedSummary"
          rows={3}
          required
          defaultValue={page?.relatedSummary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

function FinanceFields({ entity }: { entity?: AdminEntity | null }) {
  const page = entity as AdminFinancePage | undefined;

  return (
    <>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-3 text-sm text-[color:var(--color-secondary-ink)]">
        公開中の内容を残したまま予約更新したい場合は、既存版を編集するより「新規作成」で次の版を作る運用がおすすめです。
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={page?.title ?? "財務情報の公開"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={page?.slug ?? "finance"}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">サイトへの反映日時</span>
          <input
            type="datetime-local"
            name="effectiveDate"
            required
            defaultValue={formatDateTimeInput(page?.effectiveDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          {renderScheduleHint("この日時")}
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日時</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(page?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">導入文</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={page?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      {renderInlineImageUpload()}
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">補足本文</span>
        {renderBodyFormatHint()}
        <textarea
          name="body"
          rows={5}
          required
          defaultValue={page?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開方針カード</span>
          <textarea
            name="disclosureItemsText"
            rows={6}
            required
            defaultValue={labeledBlocksToTextarea(page?.disclosureItems ?? [])}
            placeholder="タイトル | 説明"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開予定の区分</span>
          <textarea
            name="disclosureTableText"
            rows={6}
            required
            defaultValue={labeledBlocksToTextarea(page?.disclosureTable ?? [])}
            placeholder="項目 | 説明"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開の線引き</span>
          <textarea
            name="policyItemsText"
            rows={6}
            required
            defaultValue={labeledBlocksToTextarea(page?.policyItems ?? [])}
            placeholder="タイトル | 説明"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">お問い合わせ文</span>
        <textarea
          name="contactText"
          rows={4}
          required
          defaultValue={page?.contactText ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

function FinancialStatementFields({ entity }: { entity?: AdminEntity | null }) {
  const statement = entity as AdminFinancialStatement | undefined;

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">タイトル</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={statement?.title ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">スラッグ</span>
          <input
            type="text"
            name="slug"
            defaultValue={statement?.slug ?? ""}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">会計年度</span>
          <input
            type="text"
            name="fiscalYear"
            required
            defaultValue={statement?.fiscalYear ?? ""}
            placeholder="2025年度"
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">公開日時</span>
          <input
            type="datetime-local"
            name="publishedDate"
            required
            defaultValue={formatDateTimeInput(statement?.publishedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          {renderScheduleHint("この日時")}
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">更新日時</span>
          <input
            type="datetime-local"
            name="updatedDate"
            required
            defaultValue={formatDateTimeInput(statement?.updatedDate)}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">決算 PDF</span>
          <input
            type="file"
            name="pdfFile"
            accept="application/pdf"
            className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
          />
        </label>
      </section>

      {statement?.pdfUrl ? (
        <div className="space-y-2 text-sm text-[color:var(--color-secondary-ink)]">
          <p>現在の PDF: {statement.pdfUrl}</p>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="removePdf" value="1" />
            <span>PDF を外す</span>
          </label>
          <input type="hidden" name="existingPdfUrl" value={statement.pdfUrl} />
        </div>
      ) : null}

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">概要</span>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={statement?.summary ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <section className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">要点</span>
          <textarea
            name="highlightsText"
            rows={5}
            required
            defaultValue={linesToTextarea(statement?.highlights ?? [])}
            placeholder="1行に1項目"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">出典・基準</span>
          <textarea
            name="sourceBasis"
            rows={5}
            required
            defaultValue={statement?.sourceBasis ?? ""}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </section>

      {renderInlineImageUpload()}
      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">本文</span>
        {renderBodyFormatHint()}
        <textarea
          name="body"
          rows={8}
          required
          defaultValue={statement?.body ?? ""}
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>
    </>
  );
}

export function AdminContentForm({
  collection,
  action,
  entity,
  error,
  configured,
}: AdminContentFormProps) {
  const isPublished = entity?.status.includes("PUBLISH") ?? false;
  const supportsDraftButton = !entity || !isPublished || entity.status.includes("DRAFT");

  return (
    <form action={action} method="post" encType="multipart/form-data" className="space-y-8">
      {renderCommonNotice(configured, error)}
      {renderStatus(entity)}

      {collection === "posts" ? <PostFields entity={entity} /> : null}
      {collection === "researchers" ? <ResearcherFields entity={entity} /> : null}
      {collection === "methodologies" ? <MethodologyFields entity={entity} /> : null}
      {collection === "reports" ? <ReportFields entity={entity} /> : null}
      {collection === "director" ? <DirectorFields entity={entity} /> : null}
      {collection === "finance" ? <FinanceFields entity={entity} /> : null}
      {collection === "financialStatements" ? <FinancialStatementFields entity={entity} /> : null}

      {isPublished ? (
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-secondary-ink)]">
          公開中の {collectionLabel(collection)} です。保存すると公開内容が更新されます。
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {supportsDraftButton ? (
          <button
            type="submit"
            name="intent"
            value="draft"
            className="ui-button ui-button-secondary h-11 px-5 text-sm"
          >
            下書き保存
          </button>
        ) : null}
        <button
          type="submit"
          name="intent"
          value="publish"
          className="ui-button ui-button-primary h-11 px-5 text-sm"
        >
          {entity ? "変更を公開" : "今すぐ公開"}
        </button>
      </div>
    </form>
  );
}
