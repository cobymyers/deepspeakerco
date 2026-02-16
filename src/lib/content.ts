import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

export type ImageMeta = {
  kind: "abstract" | "platform" | "licensed";
  alt: string;
  url?: string;
  palette?: string[];
  license?: string;
  attribution?: string;
  source?: string;
};

export type PostMeta = {
  title: string;
  slug: string;
  publishDate: string;
  excerpt: string;
  artist: string;
  image?: ImageMeta;
  sourceSignals?: string[];
};

export type Post = PostMeta & {
  body: string;
  filePath: string;
};

function ensurePostDirectory(): void {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
  }
}

function readMarkdownFile(filePath: string): Post {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  if (!data.title || !data.slug || !data.publishDate || !data.excerpt || !data.artist) {
    throw new Error(`Invalid frontmatter in ${filePath}`);
  }

  return {
    title: String(data.title),
    slug: String(data.slug),
    publishDate: String(data.publishDate),
    excerpt: String(data.excerpt),
    artist: String(data.artist),
    image: data.image as ImageMeta | undefined,
    sourceSignals: Array.isArray(data.sourceSignals)
      ? data.sourceSignals.map((signal) => String(signal))
      : undefined,
    body: content.trim(),
    filePath
  };
}

export function getAllPosts(): Post[] {
  ensurePostDirectory();
  const fileNames = fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((name) => name.endsWith(".md"))
    .sort();

  const posts = fileNames.map((fileName) =>
    readMarkdownFile(path.join(POSTS_DIRECTORY, fileName))
  );

  return posts.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getLatestPost(): Post | null {
  const posts = getAllPosts();
  return posts[0] ?? null;
}

export function getRecentPosts(limit = 12): PostMeta[] {
  return getAllPosts()
    .slice(0, limit)
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      publishDate: post.publishDate,
      excerpt: post.excerpt,
      artist: post.artist,
      image: post.image,
      sourceSignals: post.sourceSignals
    }));
}

export function hasPostForDate(date: string): boolean {
  return getAllPosts().some((post) => post.publishDate === date);
}

export function getPublishedArtists(): Set<string> {
  return new Set(getAllPosts().map((post) => post.artist.toLowerCase()));
}
