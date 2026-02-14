import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { POSTS_DIRECTORY, getAllPosts } from "@/lib/content";
import type { DraftPost } from "@/lib/pipeline/types";

type PublishTarget = "filesystem" | "github" | "auto";

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

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

function getPublishTarget(): PublishTarget {
  const raw = (process.env.PUBLISH_TARGET ?? "auto").toLowerCase();
  if (raw === "filesystem" || raw === "github" || raw === "auto") {
    return raw;
  }
  return "auto";
}

function resolveTarget(target: PublishTarget): "filesystem" | "github" {
  if (target === "filesystem" || target === "github") {
    return target;
  }

  return process.env.VERCEL ? "github" : "filesystem";
}

function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GitHub publishing.");
  }

  return {
    token,
    owner: process.env.GITHUB_REPO_OWNER ?? "cobymyers",
    repo: process.env.GITHUB_REPO_NAME ?? "deepspeakerco",
    branch: process.env.GITHUB_BRANCH ?? "main"
  };
}

function toBase64(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

async function getGithubContentSha(
  config: GitHubConfig,
  contentPath: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${contentPath}?ref=${config.branch}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DeepSpeakerBot/1.0"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub API failed while checking file: ${response.status}`);
  }

  const payload = await response.json();
  return typeof payload?.sha === "string" ? payload.sha : null;
}

async function createUniqueGithubSlug(
  config: GitHubConfig,
  publishDate: string,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const fileName = `${publishDate}-${slug}.md`;
    const contentPath = `content/posts/${fileName}`;
    const sha = await getGithubContentSha(config, contentPath);

    if (!sha) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }
}

function publishToFilesystem(draft: DraftPost): { slug: string; filePath: string } {
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

async function publishToGithub(draft: DraftPost): Promise<{ slug: string; filePath: string }> {
  const config = getGitHubConfig();
  const slug = await createUniqueGithubSlug(config, draft.publishDate, draft.slug);
  const fileName = `${draft.publishDate}-${slug}.md`;
  const contentPath = `content/posts/${fileName}`;
  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${contentPath}`;

  const content = matter.stringify(draft.body, {
    title: draft.title,
    slug,
    publishDate: draft.publishDate,
    excerpt: draft.excerpt,
    artist: draft.artist,
    image: draft.image,
    sourceSignals: draft.sourceSignals
  });

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "DeepSpeakerBot/1.0"
    },
    body: JSON.stringify({
      message: `chore: publish daily post for ${draft.publishDate}`,
      content: toBase64(content),
      branch: config.branch
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub publish failed (${response.status}): ${body.slice(0, 400)}`);
  }

  return { slug, filePath: contentPath };
}

export async function publishDraft(draft: DraftPost): Promise<{ slug: string; filePath: string }> {
  const target = resolveTarget(getPublishTarget());
  if (target === "github") {
    return publishToGithub(draft);
  }
  return publishToFilesystem(draft);
}
