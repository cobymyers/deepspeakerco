import type { ArtistCandidate, DraftPost } from "@/lib/pipeline/types";

function cleanJsonBlock(input: string): string {
  return input.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function fallbackDraft(candidate: ArtistCandidate, publishDate: string): DraftPost {
  const title = `${candidate.artist}: Momentum Without Noise`;
  const slug = `${slugify(candidate.artist)}-daily-brief`;
  const signals = candidate.signals.slice(0, 8).map((signal) => signal.context);
  const regionalSpread = candidate.markets.join(", ");

  const body = `## Artist Overview\n${candidate.artist} is moving through a classic early-breakthrough phase: visible enough to register in multiple public channels, but still defined by artistic development rather than full mainstream saturation. Their current run suggests a project in motion, not a finished product.\n\n## Why The Artist Is Trending Now\nRecent movement appears across ${candidate.sources.length} source categories (${candidate.sources.join(", ")}) with traction in ${regionalSpread}. The pattern is less about a single viral spike and more about repeated surface area: chart activity, discussion loops, and press visibility all rising at once.\n\n## Musical Style And Context\nThe material lands in a lane where strong melodic identity meets a contemporary production frame. The work draws from genre traditions while keeping enough tonal ambiguity to travel between playlists, scene communities, and editorial coverage without sounding over-designed for any one format.\n\n## Recommended Tracks Or Projects\n- Start with the newest single currently circulating in chart and discussion channels.\n- Move to the most recent EP or album-length release to hear the broader arc.\n- Revisit the previous release cycle to understand how the current moment has been building.\n\n## Editorial Note\nThis daily post is generated from public discovery signals and composed in a restrained editorial style. No lyrics are quoted, and recommendations focus on context and listening direction.`;

  return {
    title,
    slug,
    publishDate,
    excerpt:
      `${candidate.artist} is gathering cross-platform momentum across charts, discussion forums, and music press coverage in English-speaking markets.`,
    artist: candidate.artist,
    body,
    sourceSignals: signals,
    image: {
      kind: "abstract",
      alt: `Abstract artwork for ${candidate.artist}`
    }
  };
}

async function buildWithOpenAI(candidate: ArtistCandidate, publishDate: string): Promise<DraftPost | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return null;
  }

  const prompt = [
    "You are a calm, authoritative music editor.",
    "Write one long-form daily artist dispatch in Markdown.",
    "No hype language. No clickbait. No emoji. No lyrics.",
    "Focus on US, Canada, UK relevance and explain why attention is rising now.",
    "Return JSON with keys: title, excerpt, body.",
    `Artist: ${candidate.artist}`,
    `Signals:\n${candidate.signals
      .slice(0, 14)
      .map((signal) => `- [${signal.source}/${signal.market}] ${signal.context}`)
      .join("\n")}`
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 1200
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const outputText: string = payload?.output_text ?? "";
  if (!outputText) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleanJsonBlock(outputText));
    const title = String(parsed.title ?? "").trim();
    const excerpt = String(parsed.excerpt ?? "").trim();
    const body = String(parsed.body ?? "").trim();

    if (!title || !excerpt || !body) {
      return null;
    }

    return {
      title,
      slug: `${slugify(candidate.artist)}-daily-brief`,
      publishDate,
      excerpt,
      artist: candidate.artist,
      body,
      sourceSignals: candidate.signals.slice(0, 12).map((signal) => signal.context),
      image: {
        kind: "abstract",
        alt: `Abstract artwork for ${candidate.artist}`
      }
    };
  } catch {
    return null;
  }
}

export async function writeDraft(candidate: ArtistCandidate, publishDate: string): Promise<DraftPost> {
  const llmDraft = await buildWithOpenAI(candidate, publishDate);
  return llmDraft ?? fallbackDraft(candidate, publishDate);
}
