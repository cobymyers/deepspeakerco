# DeepSpeaker

DeepSpeaker is an automated editorial music blog that publishes one long-form post per day about emerging artists in the US, Canada, and UK.

## Stack
- Next.js (App Router)
- Markdown content files in `content/posts`
- Scheduled publishing via Vercel Cron hitting `/api/cron/daily`

## What Ships
- Modern editorial homepage with latest post + archive list
- Individual distraction-free post pages
- Fully automated daily content pipeline:
  - discovery
  - ranking + emerging filter
  - writing
  - markdown publish
  - homepage/archive auto-update

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Copy env template:
```bash
cp .env.example .env.local
```
3. Set required variables in `.env.local`:
- `CRON_SECRET` (required)
- `NEXT_PUBLIC_SITE_URL` (required)
- `PUBLISH_TARGET=filesystem` (recommended locally)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional, for Google Analytics 4)
- `OPENAI_API_KEY` (optional, enables LLM writing)
- `OPENAI_MODEL` (optional)
- `IMAGE_LICENSE_GATE=true` (optional, default true)
4. Run development server:
```bash
npm run dev
```

## Run Pipeline Manually
Dry run (no file write):
```bash
npm run generate:daily:dry
```

Publish run (writes markdown post):
```bash
npm run generate:daily
```

## Vercel Deployment
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel project settings:
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `PUBLISH_TARGET=github` (or `auto`)
- `GITHUB_TOKEN` (required for automated publishing in Vercel)
- `GITHUB_REPO_OWNER` (default `cobymyers`)
- `GITHUB_REPO_NAME` (default `deepspeakerco`)
- `GITHUB_BRANCH` (default `main`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional, GA4)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
- `IMAGE_LICENSE_GATE=true` (optional)
4. Deploy.
5. Confirm cron schedule in `vercel.json`:
- `0 13 * * *` (13:00 UTC daily)

Vercel will automatically deploy on every push to the default branch.

## Daily Trigger In Production
Vercel Cron calls:
- `GET /api/cron/daily`

Production publishing behavior:
- In Vercel, `PUBLISH_TARGET=auto` resolves to GitHub publishing.
- The cron function commits each new markdown post directly to the repo in `content/posts/`.
- GitHub push triggers a new Vercel deployment, which updates homepage/archive ordering.

Security:
- Route requires a secret via `Authorization: Bearer <CRON_SECRET>`
- Query fallback `?secret=<CRON_SECRET>` is also supported

## Analytics
- Vercel Analytics is installed and runs by default through `@vercel/analytics/react`.
- Enable viewing data in Vercel: Project -> Analytics.
- GA4 is also supported. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (for example `G-ABC123XYZ9`) in Vercel and redeploy.

## Content Model
Posts are markdown files with frontmatter in `content/posts/`.

Frontmatter schema:
- `title`
- `slug`
- `publishDate` (`YYYY-MM-DD`)
- `excerpt`
- `artist`
- `image` (optional metadata)
- `sourceSignals` (optional list)

## Artist Image License Gate
- The pipeline attempts to fetch artist imagery only from Wikimedia Commons metadata.
- Images are accepted only when license metadata passes an allowlist (CC0, Public Domain, CC BY, CC BY-SA) and does not include denylist terms (e.g., fair use, noncommercial).
- If no image passes the gate, the post falls back to abstract generated visuals automatically.
- Set `IMAGE_LICENSE_GATE=false` to disable licensed-image lookups and force abstract visuals.

## Editorial Guardrails
- Calm, informed tone
- No lyrics
- No clickbait framing
- Recommendations include track/project titles only

## Discovery + Ranking Details
See `docs/AUTOMATION.md` for the complete signal collection and ranking method.
