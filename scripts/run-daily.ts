import { runDailyPipeline } from "@/lib/pipeline/runDailyPipeline";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await runDailyPipeline({ dryRun });

  if (result.status === "skipped") {
    console.log(`[daily] skipped: ${result.reason}`);
    return;
  }

  console.log(`[daily] published ${result.artist} -> ${result.slug} (${result.filePath})`);
}

main().catch((error) => {
  console.error("[daily] pipeline failed", error);
  process.exit(1);
});
