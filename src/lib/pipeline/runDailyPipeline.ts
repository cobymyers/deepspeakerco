import { currentISODate } from "@/lib/date";
import { getPublishedArtists, hasPostForDate } from "@/lib/content";
import { collectSignals } from "@/lib/pipeline/sources";
import { scoreCandidates } from "@/lib/pipeline/scoring";
import { writeDraft } from "@/lib/pipeline/writer";
import { buildAbstractImageMeta, selectLicensedArtistImage } from "@/lib/pipeline/image";
import { publishDraft } from "@/lib/pipeline/publish";
import type { PipelineResult } from "@/lib/pipeline/types";

const DEBUG = process.env.PIPELINE_DEBUG === "true";

export async function runDailyPipeline(options?: { publishDate?: string; dryRun?: boolean }): Promise<PipelineResult> {
  const publishDate = options?.publishDate ?? currentISODate();

  if (hasPostForDate(publishDate)) {
    return { status: "skipped", reason: `A post already exists for ${publishDate}` };
  }

  const signals = await collectSignals();
  if (DEBUG) {
    console.log(`[pipeline] Collected ${signals.length} raw signals.`);
  }

  if (signals.length === 0) {
    return { status: "skipped", reason: "No discovery signals were collected." };
  }

  const candidates = scoreCandidates(signals);
  const publishedArtists = getPublishedArtists();
  const pick = candidates.find((candidate) => !publishedArtists.has(candidate.artist.toLowerCase()));

  if (!pick) {
    return {
      status: "skipped",
      reason: "No suitable emerging artist candidate remained after scoring and dedupe."
    };
  }

  const draft = await writeDraft(pick, publishDate);
  const licensedImage = await selectLicensedArtistImage(pick.artist);
  draft.image = licensedImage ?? buildAbstractImageMeta(pick.artist);

  if (DEBUG) {
    console.log(
      `[pipeline] image mode for ${pick.artist}: ${draft.image.kind}${draft.image.license ? ` (${draft.image.license})` : ""}`
    );
  }

  if (options?.dryRun) {
    return {
      status: "published",
      slug: draft.slug,
      filePath: "dry-run",
      artist: draft.artist
    };
  }

  const published = await publishDraft(draft);
  return {
    status: "published",
    slug: published.slug,
    filePath: published.filePath,
    artist: draft.artist
  };
}
