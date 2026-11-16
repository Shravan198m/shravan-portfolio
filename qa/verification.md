# Verification — 3 November 2026

## Passed

- JavaScript syntax: `npm run check`.
- Browser layout checks at 320×740, 390×844, 768×1024, 1440×1000 and 1920×1080: no horizontal page overflow and no broken loaded images. Measurements are in `responsive-checks.json`.
- Visual review of desktop and phone console, project gallery, project dialog, tablet film library, about/skills and contact.
- All five project detail dialogs open and their Approach panels display. Overview/Approach/Stack switching and arrow-key tab selection checked.
- Escape closes project and film dialogs; project focus returns to its opener. Shift+Tab from the first project dialog control wraps to the final link inside the dialog.
- Project keyboard focus shows a visible orange outline, including themed cards.
- Console key navigation scrolls to the intended section, updates the hash and focuses its heading. Rapid keyboard movement between console keys leaves only the most recent title, finishing in READY.
- All seven films reached readyState 4 with nonzero playback progress and the expected decoded dimensions, without media errors. See `film-playback.json`.
- Next-film controls advance through all seven entries. Closing the film player pauses it, clears its source, and returns focus to Play.
- Email copy displays a success confirmation.
- No browser warning/error entries in the final browser log inspection.
- Local source, résumé and media links return successfully. Byte ranges and HTTP 416 handling were checked; details are in `source-audit.md`.
- All 25 files in the original `web/` folder match the captured SHA-256 hashes.

## Scope and remaining limitations

- Browser checks used the available Chromium-based in-app browser. Real iOS Safari, Android devices and other browser engines were not exercised.
- Reduced-motion handling was reviewed in source (CSS media query and JavaScript matchMedia). OS-level reduced-motion emulation was not available in the browser test surface.
- External repository/demo/social availability was not tested. Links are taken from supplied portfolio and résumé content.
- No captions/transcripts were supplied for the films. Native playback controls are available, but caption tracks have not been invented.
- The existing Field Notes video contains mixed-orientation footage. Its upright title is used as the poster; the original film is preserved.
- The contact action is email/copy, not a server-backed contact form.

## Delivery

Local server: `http://127.0.0.1:4174` (running at handoff).

Standalone source: `C:\Users\svmoo\OneDrive\Documents\port\console-v2`.

Nothing was published and the original project was not edited.
