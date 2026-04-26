const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(dateString: string) {
  return dateFormatter.format(new Date(dateString));
}

export function formatDateTimeInput(dateString?: string | null) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function formatShortDate(dateString?: string | null) {
  if (!dateString) {
    return "未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function estimateReadingTime(text: string) {
  const rawLength = text.trim().length;

  if (rawLength === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(rawLength / 480));
}
