# SVM Portfolio Console

A standalone, local portfolio for Shravan V Moodlu, built with semantic HTML, CSS and JavaScript. The original `../web/` site is unchanged. No npm installation, framework, external fonts, API keys, or hosted backend is required.

## Run

From this directory:

```powershell
npm start
```

Or from anywhere:

```powershell
& 'C:\Users\svmoo\OneDrive\Documents\port\console-v2\start.ps1'
```

The default address is **http://127.0.0.1:4174**. If the port is occupied, the server tries the next available port (up to 20 higher) and prints the actual address. The server binds to loopback only. Keep it running while viewing the portfolio; Ctrl+C stops it.

Choose another port with `node server.mjs --port 4175` or `./start.ps1 -Port 4175`. Node.js is the only runtime prerequisite.

## Files

- `index.html`: main page, navigation, biography, experience, capabilities and contact.
- `styles.css`: responsive console hardware, layouts, tactile keys, dialogs and reduced-motion rules.
- `data.js`: all five engineering projects, source links and seven film entries.
- `app.js`: console previews, project tabs, accessible dialogs, film selection/playback and email copying.
- `assets/`: independent copies of the existing portfolio media and résumé, plus corrected film derivatives.
- `server.mjs`: small local static server with byte-range support for video seeking.
- `qa/`: content/source audit and original-file checksums. This folder is not served by the local server.

## Experience

- Console keys preview a destination on the typing display, then navigate to its full page section. The ordinary navigation provides the same primary destinations, including on phones.
- Project cards open detailed Overview, Approach and Stack views. Tabs support arrow keys, Home and End. Escape and the Close button dismiss a dialog and return focus to its opener.
- Film index buttons select the featured poster. Play opens the native video player, with next/previous film controls, scrubbing, volume and fullscreen support provided by the browser. Audio starts only after a visitor chooses playback. Closing a film releases the source; backgrounding the page pauses it.
- Reduced-motion preferences disable typing, blinking, key animation and smooth scrolling. Idle key waves pause during interaction, when the console is offscreen, while a dialog is open, and while the page is hidden.
- Contact uses the actual email address with a copy action and `mailto:` link. It is not a submission form and has no message-delivery backend.

## Content and media provenance

The existing portfolio and supplied résumé are the content sources. The reference PDF inspired the console's material, keys and display; its sample person, clients, counts and services were not used. The generated design concept is not embedded as a flattened interface: the console and controls are actual HTML/CSS.

Project results are résumé-reported, with evaluation context provided in the details. AarogyaLink is explicitly an ideathon concept, and LabCode is ongoing. Links were extracted from the résumé; external sites may change independently. Experience marked “Present” reflects the supplied résumé.

Seven film entries are retained; `creative-reel.mp4` is a duplicate of the original sixth entry and is not listed again. `film-06-corrected.mp4` and `film-07-corrected.mp4` rotate the baked sideways footage upright, preserve audio, use H.264/AAC and faststart, and cap the long edge at 1920px. Their original files remain untouched. Field Notes uses an upright title frame at 5 seconds for its poster; the mixed-orientation original film is preserved.

No captions or transcripts were supplied, so none are invented. Native controls remain available; film captions can be added as WebVTT tracks when accurate transcripts are available.

## Verification

Run JavaScript syntax checks with:

```powershell
npm run check
```

See `qa/source-audit.md` and `qa/verification.md` for the checks performed. Development screenshots are in `qa/` and do not form part of the public page. The original site hashes are recorded in `qa/original-hashes.json`.

This build is local only; nothing has been published.
