# Connected-room opening

**Archived prototype:** this modeled-room version was superseded at the user's
request because it changed the original photographic style. The active film is
documented in `photographic-prompts.md` and rendered by `render-photographic.mjs`.

This is an original stylized Blender scene, not generated drone footage. The camera
travels through one connected set with physical walls, a window, a kitchen counter,
coffee cup, doorway, armchair, anonymous seated figure, and a retro television.
Existing portfolio photographs appear as framed artwork. Materials and furnishings
are procedural; no third-party model downloads are required.

## Deliverables

- `../assets/intro-flight.mp4`: 30 seconds, 24 fps, 960 × 540, H.264 / AAC.
- `../assets/intro-flight-poster.jpg`: lightweight opening poster.
- `build-flight.py`: scene geometry, materials, lighting and animated camera.
- `opening-flight.blend`: editable scene with its artwork textures packed inside.
- `encode-flight.ps1`: score / six narration tracks mixed into the video.
- `../qa/intro-playback.mjs`: browser checks for the actual player.

## Rebuild

From the repository root, using the locally installed Blender and FFmpeg:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.3\blender.exe' --background --threads 8 --python intro-production/build-flight.py -- --preview
& 'C:\Program Files\Blender Foundation\Blender 5.3\blender.exe' --background --threads 8 --python intro-production/build-flight.py
& ./intro-production/encode-flight.ps1
npm run check
npm run build
```

The `.blend` file and intermediate frames are written to `tmp/intro-flight/`;
they are not copied into the public website. For higher-resolution exports,
change the render resolution percentage in `build-flight.py`. The current 75%
setting is intentional to reduce transfer size on the portfolio.

The render uses Eevee, eight samples, followed by a mild spatial/temporal denoise
in encoding. The original score begins at zero; dialogue starts at 2, 7, 12, 18,
23 and 27 seconds. The combined track is loudness-normalized. Exact captions are
drawn by `intro.js` using `video.currentTime`.

## Playback and deployment

The film starts only after Play with sound or Play silently. A single media clock
controls picture and audio; buffering, pause, seeking and replay keep them together.
The tab pauses when hidden. Skip always releases the portfolio, including after a
load error. Returning visitors and reduced-motion users can open it from Opening
Film. On narrow screens the full frame is retained rather than cropping the room.

No Blender or FFmpeg installation is required on Vercel: it serves the encoded
MP4 and poster. `build.mjs` explicitly includes both. The old large still-image
sequence is no longer downloaded for this intro.
The page versions its intro script and style URLs to avoid mixing cached player
code with the new markup. When replacing immutable media, use a new asset name.

Run the browser checks against a local server:

```powershell
node server.mjs
# In another terminal with Playwright available:
node qa/intro-playback.mjs ./tmp/browser-check/node_modules/playwright/index.mjs
```

The browser check uses installed Chrome and stores screenshots in `tmp/intro-qa`.
Set `INTRO_TEST_URL` to check another deployment. Failed-media and reduced-motion
checks use fresh browser contexts, so no real admin data is modified.

## Validation of this export

- FFprobe: 720 video frames, 24 fps, 960 × 540; video and AAC audio both 30 seconds.
- Encoded file size: 3,163,450 bytes; audio decoding confirms a non-silent track.
- 20 local Chrome playback assertions passed, including a delayed-loading replay
  and missing-video recovery. Desktop and 390 × 844 screenshots were inspected.
- `npm run check`, `npm run build`, and `git diff --check` passed.
