# Automation Design

## End-to-End Flow
1. Collect public signals from multiple sources.
2. Convert raw mentions into normalized artist signals.
3. Score artists for cross-source momentum.
4. Filter out obvious mainstream superstars.
5. Pick the top eligible artist not already recently published.
6. Generate long-form editorial markdown.
7. Save the post in `content/posts`.
8. Homepage/archive update automatically from markdown sort order.

## Discovery Sources
Implemented in `src/lib/pipeline/sources.ts`.

Signals are collected from:
- Apple Music public RSS charts (US, CA, GB)
- Spotify chart pages (US, CA, GB)
- YouTube trending music surface
- Reddit music subreddits (`indieheads`, `popheads`, `hiphopheads`, `music`)
- Music press RSS feeds (Pitchfork, NME, The FADER)

All inputs are public endpoints; no private social APIs are used.

## Ranking / Emerging Logic
Implemented in `src/lib/pipeline/scoring.ts`.

Each mention gets a weighted signal score. Score increases when an artist appears in:
- more than one source type
- more than one market
- momentum-like context terms (breakthrough, rising, viral, debut)

Quality constraints:
- must appear in at least 2 source categories
- mainstream blocklist is excluded
- previously published artists are skipped

## Writing
Implemented in `src/lib/pipeline/writer.ts`.

Two modes:
- LLM mode (if `OPENAI_API_KEY` exists)
- Fallback deterministic template mode (if no API key / LLM failure)

Both modes enforce:
- no lyric quoting
- editorial tone
- context-first analysis

## Image Handling
Implemented in `src/lib/pipeline/image.ts`.

Image handling uses a license gate:
- First, it attempts Wikimedia Commons lookups for artist images.
- Only images with approved license metadata are accepted (CC0, Public Domain, CC BY, CC BY-SA).
- Images flagged with restricted terms (e.g., fair use, noncommercial, all rights reserved) are rejected.
- If no compliant image is found, it falls back to abstract visuals automatically.

## Publishing
Implemented in `src/lib/pipeline/publish.ts`.

Writes markdown with frontmatter to `content/posts`.
Publisher modes:
- `filesystem`: local write in development
- `github`: GitHub Contents API commit to the repository
- `auto`: resolves to GitHub on Vercel and filesystem locally

Slug collisions are handled automatically by suffixing `-2`, `-3`, etc.

## Schedule
- Cron route: `src/app/api/cron/daily/route.ts`
- Vercel schedule: `vercel.json`

Current schedule:
- `0 13 * * *` (daily at 13:00 UTC)

## Operational Maintenance
Recommended checks:
1. Review source endpoint availability monthly (some chart pages can change HTML shape).
2. Review mainstream blocklist quarterly.
3. Keep fallback writer intact to ensure daily publishing if LLM fails.
4. Monitor `/api/cron/daily` failures in Vercel logs.

## Legal + Editorial Notes
- Do not publish copyrighted lyrics.
- Use artist imagery only when license/terms allow.
- Default abstract visual mode keeps publication legally conservative.
