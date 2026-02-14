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
- `OPENAI_API_KEY` (optional, enables LLM writing)
- `OPENAI_MODEL` (optional)
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
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
4. Deploy.
5. Confirm cron schedule in `vercel.json`:
- `0 13 * * *` (13:00 UTC daily)

Vercel will automatically deploy on every push to the default branch.

## Daily Trigger In Production
Vercel Cron calls:
- `GET /api/cron/daily`

Security:
- Route requires a secret via `Authorization: Bearer <CRON_SECRET>`
- Query fallback `?secret=<CRON_SECRET>` is also supported

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

## Editorial Guardrails
- Calm, informed tone
- No lyrics
- No clickbait framing
- Recommendations include track/project titles only

## Discovery + Ranking Details
See `docs/AUTOMATION.md` for the complete signal collection and ranking method.
