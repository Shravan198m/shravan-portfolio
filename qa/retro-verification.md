# Retro TV verification — 2026-11-04

- JavaScript syntax checks passed for tv.js, admin.js, seed-content.mjs and server.mjs.
- All 11 API integration checks passed via npm test, including restart persistence, conflict handling, upload signatures, ranges and origin/token/path protections.
- Browser: home, project cover and project file navigation verified; all seven channel controls exercised.
- Browser: Offline video reached readyState 4 with playback time 18.8 seconds, 720x1280, no video error.
- Browser: admin identity edit saved revision 2 and appeared on the public TV automatically. Original text restored through admin, saved as revision 3.
- Browser: media library loaded 28 existing assets, including originals, corrected film derivatives and resume.
- Desktop screenshot: 1280x720; document dimensions equal viewport, no scrolling.
- Phone screenshot: 390x844; all seven channels fit. Films/About/Toolkit/Journey/Contact measured screen-content clientHeight and scrollHeight equal at 404px; page scrollHeight 844px.
- Public and admin browser error/warning logs empty at inspection.
- All 25 original ../web file hashes match the baseline; no original files changed.
- Saved screenshots: retro-tv-desktop.jpg, retro-tv-mobile.jpg, admin-studio.jpg.

The local server remains on 127.0.0.1:4174. This is a local editor, not a publicly deployed authentication system. Browser verification covers the listed desktop and phone sizes; no claim of exhaustive device testing.

## Login and cinematic refinement verification

- All 12 authenticated API integration checks pass; syntax checks include intro, login and auth modules.
- /admin redirects to login when unauthenticated. Login page visually inspected.
- Opening plays, hands off to interactive TV, and replay works. Controls behind opening are inert.
- Cabinet Next item advanced from Glaucoma to AI Interview Platform.
- At 390x844, document scrollHeight remains 844. Previous/Next are outside #crt.
- Mobile project detail Next page advanced to page 2; screen-content measured 361px clientHeight and 361px scrollHeight.
- Screenshots: natural-tv-cabinet.jpg, natural-tv-mobile.jpg, admin-login.jpg.

## 30-second story / VHS release

- All 12 API/auth tests and all JS syntax checks pass after adding audio MIME support.
- Browser score and all six narration clips reached readyState 4 without decoding errors.
- Score plays after explicit sound choice; first voice playback and its corresponding subtitle verified.
- Pause freezes both score and narration. Skip leaves all opening audio elements paused.
- Opening overflow clipping fixed: intro scrollTop remains 0 during pause/subtitle interaction.
- Photographic receiver and cabinet controls verified in desktop browser. VHS programme keys switch live content; sound state carries from the opening.
- At 390x844 the document stays exactly 844px high. Contact, skills, journey content height equals available height; About measured within 2px layout tolerance.
- Opening screenshot: story-rain-subtitle.jpg. Portfolio screenshot: photographic-tv-vhs.jpg.
- Audio quality inspected through decoding/signal measurements; no claim of perceptual listening review.
