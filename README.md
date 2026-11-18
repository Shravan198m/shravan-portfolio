# SVM Retro Television Portfolio

A standalone portfolio in an analogue television room. The original `../web/` project is unchanged. Node.js is the only prerequisite; no package installation is needed.

## Start

Run `npm start` in this directory, or run `start.ps1`. Open http://127.0.0.1:4174/ for the portfolio and http://127.0.0.1:4174/admin for the editor. Keep the terminal running. A different port can be chosen with `node server.mjs --port 4175`.

## The television

Seven physical channel keys switch between Home, Engineering, Films, About, Toolkit, Journey and Contact. The public page stays within one viewport. Longer content uses previous/next pages inside the television. Project files contain the existing descriptions, approach, technology, process, notes and links. Films play inside the screen with native playback controls.

The dial and +/- keys change channels. Arrow keys work on the channel deck; Escape returns from a project file or film. Touch swipes change content pages. Sound is optional, and reduced-motion preferences disable decorative motion. Responsive layouts keep the television and keys visible on phones.

## Editing

Open `/admin` and sign in with your configured administrator email and password. All current content is prefilled. Edit identity, projects, films, biography, skills, journey, contact links, wall posters, channel labels/order/colors, and the room/TV appearance. Add, reorder or remove project and film entries. Choose existing media or upload replacement pictures, thumbnails, videos and PDF resumes. Save to portfolio publishes the draft to this local server; public pages pick it up automatically (after playback ends if a film is playing).

Saved content lives in `storage/content.json`, uploaded media in `assets/uploads/`, and the last 30 content backups in `storage/backups/`. Keep these with the project when moving it. Export & restore provides portable JSON content backups; media files must also be retained. Concurrent edits are detected rather than silently overwritten. Unsaved drafts can be discarded.

The server is intentionally a local editing workspace, bound to loopback. Administrator credentials are stored only as a salted scrypt hash in `storage/admin-auth.json` (excluded from Git and blocked from public serving). Sign-in creates an eight-hour HttpOnly, SameSite=Strict session; sign out, a new sign-in, or a server restart revokes the previous session. Incorrect sign-in attempts are limited to eight per 15 minutes. Editing APIs require authentication plus same-origin CSRF protection. The public portfolio stays readable without a login. Public hosting would still require HTTPS and an appropriate deployment configuration. Nothing has been published.

Uploads support PNG, JPEG, WebP, GIF, AVIF, MP4, WebM and PDF, with a 128 MiB per-file limit. Uploaded files cannot be deleted while referenced by saved content; original assets cannot be removed through the editor.

## Source layout

- `index.html`, `tv.css`, `tv.js`: interactive television and room.
- `admin.html`, `admin.css`, `admin.js`: content studio and media library.
- `server.mjs`: persistent API, media handling and local server.
- `seed-content.mjs`: initial content migrated from the existing portfolio.
- `CONTENT-CONTRACT.md`: shared data schema and API contract.
- `assets/`: portfolio media, generated room background and locally stored OFL fonts/licenses.
- `archive/console-2026-11-03/`: previous console implementation.
- `qa/`: verification results and screenshots; not publicly served.

## Content provenance

Portfolio content comes from the existing project and resume. Reference images and the PDF informed visual direction; their sample identities and claims were not copied. The room is a generated decorative background; the television and its controls are live HTML/CSS.

Five engineering projects and seven films are retained. AarogyaLink remains identified as an ideathon concept and LabCode as ongoing. Results are resume-reported. The sixth and seventh films use upright H.264/AAC derivatives; originals remain intact. No transcripts were supplied, so captions have not been invented.

## Checks

`npm run check` validates JavaScript syntax. `npm test` runs 12 isolated integration checks covering save/restart persistence, concurrent edits, upload handling, byte ranges and server protections, including login, session revocation, logout and rate limiting. See `qa/retro-verification.md` for browser checks. The original 25 file hashes are recorded in `qa/original-hashes.json`.

## Deploy to Vercel

The local server is for editing on this computer. For Vercel, the project now builds a public `dist/` folder and uses a serverless API with Vercel Blob for saved content and new media. This keeps administrator changes after a deployment and lets the editor upload videos directly to Blob rather than to temporary server storage.

1. Push this folder to a private GitHub repository, then import that repository in Vercel.
2. In the Vercel project, create and connect a **Blob** store. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically.
3. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a unique `ADMIN_SESSION_SECRET` of at least 32 characters in Project Settings → Environment Variables. Apply each to Production, Preview, and Development. The password belongs only in Vercel; it is never committed to this repository.
4. Deploy. The first request reads the current portfolio as the initial seed. The first Save to portfolio stores the editable content in Blob. Later saves and uploaded assets persist independently of future deployments.

Use `/admin` on the deployed domain to sign in. Keep the Vercel project private until the environment variables and Blob store are configured. `.env.example` lists the required names without secrets.

## Cinematic entrance and cabinet controls (November 2026)

The opening is a 7-second browser animation of original photographic-style artwork: a room, viewer on a beanbag, slow camera push, phosphor warm-up and SVM presents titles. It is not filmed footage or generated full-motion human video. It plays once per browser-tab session, can be skipped with Enter the room or Escape, and replayed using Opening film. Reduced-motion users enter directly. No audio autoplays.

Previous/Next project, page and film controls live on the physical cabinet below the glass. Material refinements soften scanlines, use a natural portrait, and give wood, metal and switches more restrained lighting.

New source: intro.js, intro.css, assets/screening-room-opening.png. The opening artwork is decorative; existing portfolio content remains the source of all personal/project information.

## Thirty-second story / photographic TV update

The new opening begins at an explicit Play with sound / Play silently choice. Its 30-second timeline moves through a rainy moonlit window, a cassette/camera/sketchbook insert, the beanbag room, and the actual live photographic receiver. The closing TV is the interactive element itself, preventing a different cabinet from appearing at the handoff. Skip, pause/resume, mute, replay, session remembering and reduced-motion handling are included. Backgrounding pauses the opening.

`assets/audio/intro-score.m4a` uses audio extracted from the supplied ScreenSketch recording at its original speed and pitch. The source has approximately 24 seconds of audio; its end fades into the closing rain and SFX rather than being artificially stretched. Six local Microsoft David narration clips have matching timed captions. These are synthesized speech, not a recorded human performance. Source signal details and processing are in `qa/audio-inspection.md`.

`sound-engine.js` supplies procedural rain, mechanical clicks, tape engagement, TV power and tuning sounds. Music lowers under narration. Opening media stop on skip/completion; portfolio films retain their own audio. The sound toggle is synchronized with the opening choice.

`photographic.css` places the live HTML screen over a detailed photographic walnut receiver. The VHS deck carries programme keys and an illuminated channel display; the cabinet transport retains Previous/Next. Side artworks respond to selected content and respect administrator poster overrides.

The sequence uses animated still artwork and live web elements; it is not a full-motion filmed scene. Original source recording and portfolio files are preserved.
