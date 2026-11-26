# Photographic intro reference and generation record

The original images are the art-direction authority. They remain unchanged:
`01-exterior-rain.png`, `04-kitchen-coffee.png`, `screening-room-opening.png`,
`02-viewer-remote.png`, and `03-tv-reveal.png`.

One additional exterior view was generated using the built-in image tool and
saved as `assets/intro-house-rain-v2.png`. Reference images: the original rainy
window and original screening room. No API/CLI fallback was used.

## Exact generation prompt

Use case: photorealistic-natural. Create one cinematic 16:9 wide establishing photograph for the opening of a film, using the attached original photographs as strict art-direction references. Image 1 is the EXACT house window, weather, warm interior and aged architectural materials to preserve; image 2 is the original interior design reference. Show the exterior of this same modest old coastal Indian house at rainy night, viewed from the garden about five metres away, at window height with a slight elevated descending-camera perspective. The recognizable timber-framed window from image 1 is prominently centered-right, amber lamp glow and a glimpse of that same wooden retro CRT television inside. Surround it with weathered plaster, wet climbing leaves, old tiled roof edge, rain-slick path leading toward the window. Blue moonlit rain outside, tungsten amber inside. Frame with dark wet leaves in the upper left for foreground parallax; the path is in the lower foreground. True photographic surface detail: peeling plaster, water beads on old wood, natural foliage, restrained film grain, realistic shadows. Preserve the original rich brown/amber/black palette and photographic quality; do not redesign or modernize the room or television. The house feels lived-in and small, never a mansion. No text, no watermark, no cartoon, no stylized 3D, no toy-like geometry, no plastic surfaces, no oversharpened CGI. This is one uninterrupted full-frame photograph, not a storyboard or collage. Deliver the highest available detail.

## Motion approach

Original photographs are projected onto gently depth-shaped meshes. Virtual
camera movement creates restrained parallax; foreground rain has separate motion.
Matched dissolves connect the available angles. This is a photographic projection
film, not a newly reconstructed photorealistic house or a continuous drone take.
The earlier modeled-room export is superseded because it changed the user's style.

## Rebuilding the active opening

Start `node server.mjs` on port 4174, then run:

```powershell
node intro-production/render-photographic.mjs --preview
node intro-production/render-photographic.mjs
& ./intro-production/encode-photographic.ps1
npm run check
npm run build
node qa/intro-playback.mjs ./tmp/browser-check/node_modules/playwright/index.mjs
```

The renderer uses the existing local Playwright installation and installed Chrome.
Its render-only HTML is injected into a private browser route; it is not deployed.
The mesh contains approximate artistic depth, not measured geometry. Camera moves
are deliberately limited to avoid revealing unseen surfaces or distorting faces.
Only the new wide exterior was generated; all five old photographs stay unchanged.

Output: `assets/intro-photographic-v3.mp4` (1600 × 900, 24 fps, 30 seconds)
and `assets/intro-photographic-v3-poster.jpg`. JPEG intermediate frames use quality
97; the final H.264 encode uses CRF 20 and fast-start metadata. The existing score
and six original narration recordings are mixed with quiet rain ambience during
the exterior. Captions and player controls still use the single video clock.
Phones and data-saver connections receive the same film at 1280 × 720 from
`assets/intro-photographic-v3-mobile.mp4`; the audio is copied without another encode.

The original model and its previous movie remain available as archived source;
`build.mjs` ships only the active photographic opening and poster.

## Motion and colour revision (v3)

All shot moves travel in a consistent direction, with 85% linear progression and
15% easing so the camera does not stop at every dissolve. Camera roll is removed.
The window, counter and television use rigid image planes; the exterior and seated
foreground retain only 22% of the previous depth displacement to reduce bending.
The original photographs are unchanged. The movie grade uses saturation 0.84,
gamma 1.08, contrast 0.98 and brightness +0.012, with no added vignette.

## Previous export checks (v2)

The desktop export is 10,848,846 bytes; mobile is 4,687,573 bytes. FFprobe verifies
720 frames and 30-second video/audio streams. All 21 local browser assertions
passed, including selection of the 1280 × 720 phone version. The build, syntax
checks, and whitespace checks passed. The final six-scene contact sheet was
visually checked against the original photographs.
