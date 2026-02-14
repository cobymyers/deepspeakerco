import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false
});

type RichTextProps = {
  markdown: string;
};

export function RichText({ markdown }: RichTextProps) {
  const html = marked.parse(markdown, { async: false });

  return <article className="post-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
