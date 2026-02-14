import Link from "next/link";
import { getLatestPost, getRecentPosts } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { PostListItem } from "@/components/PostListItem";

export default function HomePage() {
  const latest = getLatestPost();
  const recent = getRecentPosts(16);

  return (
    <main className="site-shell">
      <header className="site-head">
        <h1 className="wordmark">DeepSpeaker</h1>
        <p className="deck">
          A daily editorial on emerging artists with momentum across the US, Canada,
          and UK. Published automatically each day.
        </p>
      </header>

      {latest ? (
        <section className="home-grid">
          <article className="featured">
            <div className="meta">{formatLongDate(latest.publishDate)}</div>
            <Link href={`/posts/${latest.slug}`}>
              <h2>{latest.title}</h2>
            </Link>
            <p>{latest.excerpt}</p>
            <Link className="read-link" href={`/posts/${latest.slug}`}>
              Read today&apos;s dispatch
            </Link>
          </article>

          <aside className="rail">
            <h3>Recent Posts</h3>
            <ul className="post-list">
              {recent.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </ul>
          </aside>
        </section>
      ) : (
        <p className="deck">
          No posts have been published yet. Run <code>npm run generate:daily</code> to
          create the first dispatch.
        </p>
      )}
    </main>
  );
}
