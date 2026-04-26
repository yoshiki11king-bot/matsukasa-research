type FlashMessageProps = {
  tone: "error" | "success" | "warning";
  message: string;
};

const toneMap = {
  error: "border-[color:var(--color-primary)]/22 bg-[color:var(--color-surface-subtle)] text-[color:var(--color-primary)]",
  success: "border-[color:var(--color-accent)]/25 bg-[color:var(--color-accent-soft)] text-[color:var(--color-primary)]",
  warning: "border-[color:var(--color-border-stronger)] bg-[color:var(--color-surface-muted)] text-[color:var(--color-primary)]",
};

export function FlashMessage({ tone, message }: FlashMessageProps) {
  return <div className={`rounded-lg border px-4 py-3 text-sm ${toneMap[tone]}`}>{message}</div>;
}
