# Vercel deployment checklist

This project is ready for Vercel. It uses a Vercel Blob store for persistent portfolio content and uploaded media. No separate database, Supabase project, or paid backend is required for the current portfolio.

## One-time Vercel setup

1. Create a Vercel account and import this repository.
2. In the project dashboard, open **Storage** and create a **Blob** store. Connect it to this project. Vercel creates `BLOB_READ_WRITE_TOKEN` automatically.
3. In **Settings → Environment Variables**, add these values for Production, Preview, and Development:

| Name | Value |
| --- | --- |
| `ADMIN_EMAIL` | The email you use to sign in at `/admin`. |
| `ADMIN_PASSWORD` | A new long, unique password for the deployed control room. |
| `ADMIN_SESSION_SECRET` | A randomly generated secret with 32 or more characters. |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when the Blob store is connected. |

Generate a session secret locally with:

```powershell
[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
```

Do not place real values in `.env.example`, source code, GitHub, or a public message.

## Deploy

Use the Vercel dashboard’s Deploy button, or from an authenticated terminal:

```powershell
npx vercel login
npx vercel --prod
```

After the first deployment, open `https://your-domain.vercel.app/admin`, sign in, and press **Save to portfolio** once. That writes the current revision to Blob. Future text edits and uploaded images, videos, PDFs, and thumbnails then persist across deployments.

## What is deployed

- The public portfolio and cinematic introduction from `dist/`.
- A serverless API for the portfolio, content editor, login, media list, uploads, and deletion checks.
- Existing production images, films, audio, fonts, and resume.
- Cloud saved content and new uploads in Vercel Blob.

The local `storage/` directory and local administrator credential file are not published with the site.
