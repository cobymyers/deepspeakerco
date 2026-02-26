import Link from "next/link";
import type { CSSProperties } from "react";
import { getRecentPosts } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { getArtistImageMap } from "@/lib/artistImages";
import { HeroNav } from "@/components/HeroNav";

function tileStyle(imageUrl?: string): CSSProperties | undefined {
  if (!imageUrl) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(8, 16, 26, 0.1), rgba(8, 16, 26, 0.55)), url(${imageUrl})`
  };
}

export default async function HomePage() {
  const posts = getRecentPosts(120);
  const artistImageMap = await getArtistImageMap(posts);

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

      <section id="posts" className="section artists">
        <div className="section-head">
          <h2>New Posts</h2>
          <Link className="ghost-link" href="/archive">
            View Archive
          </Link>
        </div>
        {posts.length ? (
          <div className="artist-grid">
            {posts.map((post, index) => (
              <article
                key={post.slug}
                className="artist-card"
                style={{ "--card-index": index } as CSSProperties}
              >
                <Link href={`/posts/${post.slug}`} className="artist-card-link">
                  <div
                    className={`artist-image image-${(index % 4) + 1}`}
                    style={tileStyle(artistImageMap.get(post.artist) ?? post.image?.url)}
                  />
                  <h3>{post.artist}</h3>
                  <p>{formatLongDate(post.publishDate)}</p>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
