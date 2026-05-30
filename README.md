<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HVN TONT Calendar

Internal calendar website for HVN TONT programs. Data is loaded from a private Google Sheet through Vercel Serverless API routes.

## Google Sheet Setup

Create a private Google Sheet with these tabs:

- `Total Campaigns`
- `Activation Template` (template only)
- `IOB`
- `FOCUS`
- `GS`

Share the sheet as `Viewer` with the Google Cloud service account email.

## Environment Variables

Set these in Vercel Project Settings. For local API testing, place them in `.env.local`.

```env
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_TOTAL_CAMPAIGNS_RANGE='Total Campaigns'!A3:L
GOOGLE_ACTIVATION_IOB_RANGE='IOB'!B6:V
GOOGLE_ACTIVATION_FOCUS_RANGE='FOCUS'!B6:V
GOOGLE_ACTIVATION_GS_RANGE='GS'!B6:V
```

Do not prefix these variables with `VITE_`; they must stay server-side only.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the Vite frontend only:
   `npm run dev`

For the full app with Google Sheet API routes, use:

```bash
vercel dev
```

Useful endpoints:

```text
/api/health
/api/calendar-data
```

## Routes

The frontend uses browser URL routing:

```text
/                 Home
/programs         Program list
/programs/:id     Program detail
/activation       Activation schedule
/awo              AWO schedule
```

`vercel.json` rewrites app route paths back to `/` so direct refreshes on these routes work on Vercel without intercepting Vite assets or API routes.
