import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug, getRecentPosts } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { RichText } from "@/components/RichText";

type Params = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | DeepSpeaker"
    };
  }

  return {
    title: `${post.title} | DeepSpeaker`,
    description: post.excerpt
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getRecentPosts(300).map((post) => ({ slug: post.slug }));
}

export default function PostPage({ params }: Params) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="post-page">
      <Link href="/" className="back-link">
        Back to archive
      </Link>
      <header className="post-header">
        <div className="post-item-meta">{formatLongDate(post.publishDate)}</div>
        <h1 className="post-title">{post.title}</h1>
      </header>
      <RichText markdown={post.body} />
    </main>
  );
}
