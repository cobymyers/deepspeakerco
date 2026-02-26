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
    backgroundImage: `linear-gradient(180deg, rgba(8, 16, 26, 0.12), rgba(8, 16, 26, 0.58)), url(${imageUrl})`
  };
}

export default async function ArchivePage() {
  const posts = getRecentPosts(1200);
  const artistImageMap = await getArtistImageMap(posts);

  return (
    <main className="landing archive-layout">
      <section className="archive-hero section">
        <HeroNav />
        <div className="archive-hero-copy">
          <h1>Archive</h1>
          <p>All Deep Speaker posts in one place</p>
          <Link className="ghost-link" href="/">
            Back Home
          </Link>
        </div>
      </section>

      <section className="section archive-posts">
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
      </section>
    </main>
  );
}
