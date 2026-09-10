import assert from "node:assert/strict";
import { test } from "node:test";
import { writeDraft } from "../src/lib/pipeline/writer";
import type { ArtistCandidate } from "../src/lib/pipeline/types";
const candidate: ArtistCandidate = {
  artist: "Example Artist",
  score: 1,
  sources: ["apple_music"],
  markets: ["US"],
  signals: [
    {
      artist: "Example Artist",
      source: "apple_music",
      market: "US",
      weight: 1,
      context: "Apple Music charting track: A Song",
    },
  ],
};
test("fallback gives a named, encoded listening link without invented career claims", async () => {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "";
  try {
    const draft = await writeDraft(candidate, "2026-09-09");
    assert.match(draft.body, /A Song/);
    assert.match(draft.body, /Example%20Artist%20A%20Song/);
    assert.doesNotMatch(
      draft.body,
      /early-breakthrough|newest single|Momentum Without Noise/,
    );
    await assert.rejects(
      writeDraft({ ...candidate, signals: [] }, "2026-09-09"),
      /Insufficient listening evidence/,
    );
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});
test("reads Responses message output and rejects generic model copy", async () => {
  const previous = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-only";
  try {
    const modelBody =
      "Listen to [A Song](https://music.apple.com/us/search?term=A%20Song).";
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    title: "A real listening guide",
                    excerpt: "Start here.",
                    body: modelBody,
                  }),
                },
              ],
            },
          ],
        }),
      );
    assert.equal((await writeDraft(candidate, "2026-09-09")).body, modelBody);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            title: "Generic",
            excerpt: "Generic",
            body: "Listen to the newest single.",
          }),
        }),
      );
    assert.match((await writeDraft(candidate, "2026-09-09")).body, /A Song/);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});
