import Link from "next/link";
import type { CSSProperties } from "react";
import { getLatestPost, getRecentPosts } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { HeroNav } from "@/components/HeroNav";

export default function HomePage() {
  const latest = getLatestPost();
  const recent = getRecentPosts(8);
  const featuredArtists = recent.slice(0, 4);
  const tileStyle = (imageUrl?: string): CSSProperties | undefined => {
    if (!imageUrl) {
      return undefined;
    }

    return {
      backgroundImage: `linear-gradient(170deg, rgba(8, 8, 8, 0.22), rgba(8, 8, 8, 0.6)), url(${imageUrl})`
    };
  };

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-overlay" />
        <HeroNav />
        <div className="hero-copy">
          <h1>Deep Speaker</h1>
          <p>A music blog for everyone</p>
        </div>
      </section>

      <section id="artists" className="section artists">
        <div className="section-head">
          <h2>New Artists</h2>
          <Link className="ghost-link" href={latest ? `/posts/${latest.slug}` : "/"}>
            Latest Dispatch
          </Link>
        </div>
        {featuredArtists.length ? (
          <div className="artist-grid">
            {featuredArtists.map((post, index) => (
              <article key={post.slug} className="artist-card">
                <Link href={`/posts/${post.slug}`} className="artist-card-link">
                    <div
                      className={`artist-image image-${(index % 4) + 1}`}
                      style={tileStyle(post.image?.url)}
                    />
                  <h3>{post.artist}</h3>
                  <p>{formatLongDate(post.publishDate)}</p>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <div className="section section-separator" aria-hidden />

      <section className="section latest" id="blogs">
        <h2 className="blogs-title">Blogs</h2>
        <div className="latest-card">
          {latest ? (
            <>
              <div className="meta">{formatLongDate(latest.publishDate)}</div>
              <Link href={`/posts/${latest.slug}`}>
                <h2>{latest.title}</h2>
              </Link>
              <p>{latest.excerpt}</p>
              <Link className="read-link" href={`/posts/${latest.slug}`}>
                Read full dispatch
              </Link>
            </>
          ) : (
            <p>No posts published yet.</p>
          )}
        </div>
      </section>

      <section className="section archive">
        <h2 className="archive-title">Archive</h2>
        <ul className="archive-list">
          {recent.map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`}>
                {post.title} <span>{formatLongDate(post.publishDate)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
