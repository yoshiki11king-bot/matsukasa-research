import { readMarkdownDocument } from "@/lib/content";

export function getDirectorPage() {
  return readMarkdownDocument("director/index.md");
}
