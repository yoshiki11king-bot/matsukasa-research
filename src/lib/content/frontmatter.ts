export type FrontmatterValue = string | number | boolean | string[] | number[] | Record<string, unknown>[] | null;
export type Frontmatter = Record<string, FrontmatterValue>;

function parseScalar(value: string): FrontmatterValue {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed === "null") {
    return null;
  }

  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try {
      const parsed = JSON.parse(trimmed) as FrontmatterValue;
      return parsed;
    } catch {
      return trimmed;
    }
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed.replace(/^'/, '"').replace(/'$/, '"'));
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return numeric;
  }

  return trimmed;
}

function serializeValue(value: FrontmatterValue) {
  if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (value === null) {
    return "null";
  }

  return String(value);
}

export function parseFrontmatter(source: string) {
  const normalized = source.replace(/\r\n/g, "\n");

  if (!normalized.startsWith("---\n")) {
    return {
      frontmatter: {} as Frontmatter,
      body: normalized,
    };
  }

  const endIndex = normalized.indexOf("\n---", 4);

  if (endIndex === -1) {
    return {
      frontmatter: {} as Frontmatter,
      body: normalized,
    };
  }

  const rawFrontmatter = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 4).replace(/^\n/, "");
  const frontmatter: Frontmatter = {};

  rawFrontmatter.split("\n").forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!match) {
      return;
    }

    frontmatter[match[1]] = parseScalar(match[2]);
  });

  return { frontmatter, body };
}

export function serializeFrontmatter(frontmatter: Frontmatter) {
  return [
    "---",
    ...Object.entries(frontmatter).map(([key, value]) => `${key}: ${serializeValue(value)}`),
    "---",
  ].join("\n");
}

export function buildMarkdownDocument(frontmatter: Frontmatter, body: string) {
  return `${serializeFrontmatter(frontmatter)}\n\n${body.trimEnd()}\n`;
}
