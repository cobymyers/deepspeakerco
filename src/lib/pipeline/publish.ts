import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { POSTS_DIRECTORY, getAllPosts } from "@/lib/content";
import type { DraftPost } from "@/lib/pipeline/types";

function createUniqueSlug(baseSlug: string): string {
  const existingSlugs = new Set(getAllPosts().map((post) => post.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  while (existingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }

  return `${baseSlug}-${index}`;
}

export function publishDraft(draft: DraftPost): { slug: string; filePath: string } {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
  }

  const slug = createUniqueSlug(draft.slug);
  const fileName = `${draft.publishDate}-${slug}.md`;
  const filePath = path.join(POSTS_DIRECTORY, fileName);

  const content = matter.stringify(draft.body, {
    title: draft.title,
    slug,
    publishDate: draft.publishDate,
    excerpt: draft.excerpt,
    artist: draft.artist,
    image: draft.image,
    sourceSignals: draft.sourceSignals
  });

  fs.writeFileSync(filePath, content, "utf8");

  return { slug, filePath };
}
