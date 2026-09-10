import { getRecentPosts } from "@/lib/content";
import { getArtistImageMap } from "@/lib/artistImages";
import { HeroNav } from "@/components/HeroNav";
import { StoryCard } from "@/components/StoryCard";
export default async function ArchivePage() {
  const posts = getRecentPosts(1200);
  const images = await getArtistImageMap(posts);
  return (
    <>
      <HeroNav />
      <main id="main" className="section archive-page">
        <p className="eyebrow">The collection / {posts.length} stories</p>
        <h1>Keep digging.</h1>
        <p className="archive-intro">
          A good song is always worth coming back to.
        </p>
        <div className="story-grid">
          {posts.map((post) => (
            <StoryCard
              key={post.slug}
              post={post}
              image={images.get(post.artist)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
