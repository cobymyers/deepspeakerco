import type { ArtistCandidate, DraftPost } from "@/lib/pipeline/types";

function cleanJsonBlock(input: string): string {
  return input
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function fallbackDraft(
  candidate: ArtistCandidate,
  publishDate: string,
): DraftPost {
  const tracks = Array.from(
    new Set(
      candidate.signals
        .filter((signal) =>
          signal.context.startsWith("Apple Music charting track: "),
        )
        .map((signal) =>
          signal.context.slice("Apple Music charting track: ".length).trim(),
        )
        .filter(Boolean),
    ),
  ).slice(0, 3);
  if (!tracks.length) {
    throw new Error(
      "Insufficient listening evidence: no named tracks; refusing to publish generic copy.",
    );
  }
  const title = `${candidate.artist}: start with ${tracks[0]}`;
  const slug = `${slugify(candidate.artist)}-daily-brief`;
  const signals = candidate.signals.slice(0, 8).map((signal) => signal.context);
  const recommendations = tracks
    .map((track) => {
      const url = `https://music.apple.com/us/search?term=${encodeURIComponent(`${candidate.artist} ${track}`)}`;
      const label = track.replace(/[\\[\]]/g, "");
      return `- **${label}** — [Find this track on Apple Music](${url}).`;
    })
    .join("\n");
  const body = `## Start listening\nThese named tracks appeared in the Apple Music chart signals collected for ${candidate.artist} on ${publishDate}. Use them as starting points for a listening session.\n\n${recommendations}\n\n## Take a closer listen\nChoose one track and play it through, then return to its opening. Notice which instrument or vocal detail holds your attention the second time. Follow the artist link in your music app to explore the release it belongs to.\n\n## About this brief\nThis is an automated listening brief based on collected chart signals, rather than a review or a claim about the artist’s career stage. Listening links open Apple Music search so you can choose the matching recording.`;

  return {
    title,
    slug,
    publishDate,
    excerpt: `A listening route into ${candidate.artist}, starting with “${tracks[0]}”${tracks.length > 1 ? ` and ${tracks.length - 1} more track${tracks.length > 2 ? "s" : ""}` : ""}.`,
    artist: candidate.artist,
    body,
    sourceSignals: signals,
    image: {
      kind: "abstract",
      alt: `Abstract artwork for ${candidate.artist}`,
    },
  };
}

async function buildWithOpenAI(
  candidate: ArtistCandidate,
  publishDate: string,
): Promise<DraftPost | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return null;
  }

  const prompt = [
    "You are a calm, authoritative music editor.",
    "Write one long-form daily artist dispatch in Markdown.",
    "No hype language. No clickbait. No emoji. No lyrics.",
    "Use only facts supported by the supplied signals. Do not invent genre, instrumentation, biography, career stage, or trending claims.",
    "Include named tracks from the signals and Apple Music search links with URL-encoded artist and track names. If evidence is thin, write a short honest listening brief rather than padding with generic prose.",
    "Return JSON with keys: title, excerpt, body.",
    `Artist: ${candidate.artist}`,
    `Signals:\n${candidate.signals
      .slice(0, 14)
      .map(
        (signal) => `- [${signal.source}/${signal.market}] ${signal.context}`,
      )
      .join("\n")}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 1200,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const outputText: string =
    payload?.output_text ??
    (payload?.output ?? [])
      .filter((item: { type: string }) => item.type === "message")
      .flatMap(
        (item: { content?: Array<{ type: string; text?: string }> }) =>
          item.content ?? [],
      )
      .filter((item: { type: string }) => item.type === "output_text")
      .map((item: { text?: string }) => item.text ?? "")
      .join("");
  if (!outputText) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleanJsonBlock(outputText));
    const title = String(parsed.title ?? "").trim();
    const excerpt = String(parsed.excerpt ?? "").trim();
    const body = String(parsed.body ?? "").trim();

    const namedTracks = candidate.signals
      .filter((signal) =>
        signal.context.startsWith("Apple Music charting track: "),
      )
      .map((signal) =>
        signal.context.slice("Apple Music charting track: ".length).trim(),
      )
      .filter(Boolean);
    const hasNamedListeningLink =
      namedTracks.some((track) => body.includes(track)) &&
      /\]\(https:\/\/music\.apple\.com\//.test(body);
    if (!title || !excerpt || !body || !hasNamedListeningLink) {
      return null;
    }

    return {
      title,
      slug: `${slugify(candidate.artist)}-daily-brief`,
      publishDate,
      excerpt,
      artist: candidate.artist,
      body,
      sourceSignals: candidate.signals
        .slice(0, 12)
        .map((signal) => signal.context),
      image: {
        kind: "abstract",
        alt: `Abstract artwork for ${candidate.artist}`,
      },
    };
  } catch {
    return null;
  }
}

export async function writeDraft(
  candidate: ArtistCandidate,
  publishDate: string,
): Promise<DraftPost> {
  const llmDraft = await buildWithOpenAI(candidate, publishDate);
  return llmDraft ?? fallbackDraft(candidate, publishDate);
}
