import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { formatLongDate } from "@/lib/date";

export function StoryCard({ post, image }: { post: PostMeta; image?: string }) {
  return (
    <article className="story-card">
      <Link href={`/posts/${post.slug}`} className="story-card-link">
        <div
          className="story-art"
          style={image ? { backgroundImage: `url("${image}")` } : undefined}
        >
          {!image && (
            <span className="record" aria-hidden="true">
              DS
            </span>
          )}
          <span className="art-label">{post.artist}</span>
        </div>
        <p className="eyebrow">
          {post.artist} <span> / </span>{" "}
          <time dateTime={post.publishDate}>
            {formatLongDate(post.publishDate)}
          </time>
        </p>
        <h3>{post.title}</h3>
        <p className="story-excerpt">{post.excerpt}</p>
        <span className="text-link">
          Read the story <span aria-hidden="true">↗</span>
        </span>
      </Link>
    </article>
  );
}
