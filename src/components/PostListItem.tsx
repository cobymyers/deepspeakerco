import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { formatLongDate } from "@/lib/date";

type PostListItemProps = {
  post: PostMeta;
};

export function PostListItem({ post }: PostListItemProps) {
  return (
    <li className="post-item">
      <Link className="post-item-link" href={`/posts/${post.slug}`}>
        <div className="post-item-meta">{formatLongDate(post.publishDate)}</div>
        <h4 className="post-item-title">{post.title}</h4>
      </Link>
    </li>
  );
}
