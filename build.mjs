import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
const publicFiles = [
  'index.html', 'tv.js', 'tv.css', 'intro.js', 'intro.css', 'sound-engine.js',
  'photographic.css', 'admin.html', 'admin.js', 'admin.css', 'login.html',
  'login.js', 'login.css', 'favicon.svg'
];
const publicAssets = [
  '01-exterior-rain.png', '02-viewer-remote.png', '03-tv-reveal.png',
  '04-kitchen-coffee.png', 'intro-details.png', 'intro-rain.png',
  'screening-room-opening.png', 'retro-room.png', 'photographic-tv.png',
  'intro-photographic-v3.mp4', 'intro-photographic-v3-mobile.mp4', 'intro-photographic-v3-poster.jpg',
  'hero-campaign-v2.png', 'signature-transparent-v2.png',
  'Shravan-V-Moodlu-Resume.pdf',
  'project-aarogya.svg', 'project-glaucoma.svg', 'project-interview.svg',
  'project-labcode.svg', 'project-underwater.svg',
  'film-01-offline.mp4', 'film-01-offline-poster.jpg',
  'film-02-stage.mp4', 'film-02-stage-poster.jpg',
  'film-03-kitchen.mp4', 'film-03-kitchen-poster.jpg',
  'film-04-field.mp4', 'film-04-field-corrected-poster.jpg',
  'film-05-exhausted.mp4', 'film-05-exhausted-poster.jpg',
  'film-06-corrected.mp4', 'film-06-corrected.jpg',
  'film-07-corrected.mp4', 'film-07-corrected.jpg',
  'audio/intro-score.m4a', 'audio/voice-01.m4a', 'audio/voice-02.m4a',
  'audio/voice-03.m4a', 'audio/voice-04.m4a', 'audio/voice-05.m4a', 'audio/voice-06.m4a',
  'fonts/display.ttf', 'fonts/serif.ttf', 'fonts/typewriter.ttf'
];

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
await Promise.all(publicFiles.map(file => cp(path.join(root, file), path.join(output, file))));
await Promise.all(publicAssets.map(async file => {
  const destination = path.join(output, 'assets', file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, 'assets', file), destination);
}));
console.log(`Vercel build complete: ${publicFiles.length} application files and ${publicAssets.length} production assets.`);
