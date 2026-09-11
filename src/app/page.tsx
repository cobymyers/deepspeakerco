import { ArtistPhoto } from "@/components/ArtistPhoto";
import { PelicanSleeves } from "@/components/PelicanSleeves";
import Link from "next/link";
import { getRecentPosts, getPostBySlug } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { getArtistImageMap } from "@/lib/artistImages";
import { HeroNav } from "@/components/HeroNav";
import { StoryCard } from "@/components/StoryCard";
export default async function HomePage() {
  const posts = getRecentPosts(12);
  const featured = getPostBySlug("olivia-dean-daily-brief") ?? posts[0];
  const more = posts.filter((post) => post.slug !== featured?.slug);
  const images = await getArtistImageMap(
    featured ? [featured, ...more] : posts,
  );
  return (
    <>
      <HeroNav />
      <main id="main" className="landing">
        <div className="intro section">
          <p className="eyebrow">For the love of the next song.</p>
          <p>Good music. A closer listen.</p>
          <span>Records worth your time. Stories behind the sound.</span>
        </div>
        {featured ? (
          <section className="feature section" aria-labelledby="feature-title">
            <div
              className="feature-art"
              style={
                images.get(featured.artist)
                  ? { backgroundImage: `url("${images.get(featured.artist)}")` }
                  : undefined
              }
            >
              {images.get(featured.artist) && (
                <ArtistPhoto
                  src={images.get(featured.artist)!}
                  artist={featured.artist}
                  priority
                />
              )}
              {!images.get(featured.artist) && (
                <span className="record" aria-hidden="true">
                  DS
                </span>
              )}
              <span className="feature-stamp">
                On our
                <br />
                radar <span aria-hidden="true">↗</span>
              </span>
              <span className="feature-artist">{featured.artist}</span>
            </div>
            <div className="feature-copy">
              <p className="eyebrow">
                <span className="dot" /> Featured story ·{" "}
                <time dateTime={featured.publishDate}>
                  {formatLongDate(featured.publishDate)}
                </time>
              </p>
              <h1 id="feature-title">{featured.title}</h1>
              <p className="feature-excerpt">{featured.excerpt}</p>
              <Link className="button" href={`/posts/${featured.slug}`}>
                Read & listen <span aria-hidden="true">↗</span>
              </Link>
              <p className="feature-note">
                A little context. A new place to start listening.
              </p>
            </div>
          </section>
        ) : (
          <section className="section">
            <h1>The next great listen is on its way.</h1>
          </section>
        )}
        <section id="posts" className="section stories">
          <div className="section-head">
            <div>
              <p className="eyebrow">Keep digging</p>
              <h2>More good listening.</h2>
            </div>
            <Link className="text-link" href="/archive">
              All stories <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="story-grid">
            {more.map((post) => (
              <StoryCard
                key={post.slug}
                post={post}
                image={images.get(post.artist)}
              />
            ))}
          </div>
        </section>
        <PelicanSleeves />
      </main>
      <footer className="site-footer">
        <span className="wordmark">deep speaker.</span>
        <p>Less noise. More music.</p>
        <Link href="/archive">Explore the archive ↗</Link>
      </footer>
    </>
  );
}
