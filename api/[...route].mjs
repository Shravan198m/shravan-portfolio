import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { del, list, put } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { validateContent } from '../server.mjs';

const contentPrefix = 'svm-portfolio/content/';
const mediaPrefix = 'svm-portfolio/uploads/';
const sessionLife = 8 * 60 * 60;
const uploadLimit = 128 * 1024 * 1024;
const uploadTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'application/pdf']);
const extensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.mp4', '.webm', '.pdf']);
const bundledMedia = [
  '01-exterior-rain.png', '02-viewer-remote.png', '03-tv-reveal.png', '04-kitchen-coffee.png', 'intro-details.png', 'intro-rain.png', 'screening-room-opening.png', 'retro-room.png', 'photographic-tv.png', 'hero-campaign-v2.png', 'signature-transparent-v2.png', 'Shravan-V-Moodlu-Resume.pdf',
  'project-aarogya.svg', 'project-glaucoma.svg', 'project-interview.svg', 'project-labcode.svg', 'project-underwater.svg',
  'film-01-offline.mp4', 'film-01-offline-poster.jpg', 'film-02-stage.mp4', 'film-02-stage-poster.jpg', 'film-03-kitchen.mp4', 'film-03-kitchen-poster.jpg', 'film-04-field.mp4', 'film-04-field-corrected-poster.jpg', 'film-05-exhausted.mp4', 'film-05-exhausted-poster.jpg', 'film-06-corrected.mp4', 'film-06-corrected.jpg', 'film-07-corrected.mp4', 'film-07-corrected.jpg'
];

function send(res, status, value) { res.setHeader('Cache-Control', 'no-store'); res.status(status).json(value); }
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(part => part.trim().split(/=(.*)/s)).filter(([key]) => key)); }
function secret() { const value = process.env.ADMIN_SESSION_SECRET; if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.'); return value; }
function sign(value) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function secureEqual(left, right) { const a = Buffer.from(String(left)); const b = Buffer.from(String(right)); return a.length === b.length && timingSafeEqual(a, b); }
function readSession(req) {
  const value = cookies(req).svm_admin; if (!value) return null;
  const [encoded, signature] = value.split('.');
  if (!encoded || !signature || !secureEqual(sign(encoded), signature)) return null;
  try { const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')); return session && session.exp > Math.floor(Date.now() / 1000) && typeof session.token === 'string' ? session : null; } catch { return null; }
}
function setSession(res, session) { const encoded = Buffer.from(JSON.stringify(session)).toString('base64url'); res.setHeader('Set-Cookie', `svm_admin=${encoded}.${sign(encoded)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${sessionLife}`); }
function clearSession(res) { res.setHeader('Set-Cookie', 'svm_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'); }
function origin(req, mutation = false) {
  const host = req.headers['x-forwarded-host'] || req.headers.host; const protocol = req.headers['x-forwarded-proto'] || 'https'; const expected = `${protocol}://${host}`;
  if (req.headers['sec-fetch-site'] === 'cross-site') throw Object.assign(new Error('Cross-site requests are not allowed.'), { status: 403 });
  if ((mutation || req.headers.origin) && req.headers.origin !== expected) throw Object.assign(new Error('A same-origin request is required.'), { status: 403 });
}
function requireAdmin(req) { const session = readSession(req); if (!session) throw Object.assign(new Error('Please sign in to the control room.'), { status: 401 }); if (!secureEqual(req.headers['x-admin-token'], session.token)) throw Object.assign(new Error('The editor session expired. Reload the editor and try again.'), { status: 403 }); return session; }
async function jsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { throw Object.assign(new Error('Content must be valid JSON.'), { status: 400 }); } }
  if (Buffer.isBuffer(req.body)) { try { return JSON.parse(req.body.toString('utf8')); } catch { throw Object.assign(new Error('Content must be valid JSON.'), { status: 400 }); } }
  const chunks = []; for await (const part of req) chunks.push(part);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('Content must be valid JSON.'), { status: 400 }); }
}
async function seed() { return validateContent(JSON.parse(await readFile(path.join(process.cwd(), 'storage', 'content.json'), 'utf8'))); }
async function latestContent() {
  const result = await list({ prefix: contentPrefix });
  if (!result.blobs.length) return { document: await seed(), blob: null };
  const blob = result.blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  const response = await fetch(blob.url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Saved portfolio content could not be loaded.');
  return { document: validateContent(await response.json()), blob };
}
function assetName(pathname) { return (pathname.split('/').pop() || 'media').replace(/^[a-f0-9-]+-/, ''); }
function contentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.pdf') return 'application/pdf';
  if (['.mp4', '.webm'].includes(extension)) return `video/${extension.slice(1)}`;
  if (extension === '.svg') return 'image/svg+xml';
  return `image/${extension === '.jpg' ? 'jpeg' : extension.slice(1)}`;
}
async function dynamicMedia() {
  const result = await list({ prefix: mediaPrefix });
  const uploads = result.blobs.map(blob => ({ url: blob.url, name: assetName(blob.pathname), type: blob.contentType || 'application/octet-stream', size: blob.size, uploaded: true }));
  return [...bundledMedia.map(name => ({ url: `/assets/${name}`, name, type: contentType(name), size: 0, uploaded: false })), ...uploads];
}
function allowableUpload(pathname, type) { return pathname.startsWith(mediaPrefix) && extensions.has(path.extname(pathname).toLowerCase()) && uploadTypes.has(type); }

export default async function handler(req, res) {
  try {
    const requestUrl = new URL(req.url, `https://${req.headers.host}`); const pathname = requestUrl.pathname;
    if (pathname === '/api/content' && req.method === 'GET') { origin(req); return send(res, 200, (await latestContent()).document); }
    if (pathname === '/api/content' && req.method === 'PUT') {
      origin(req, true); requireAdmin(req); const doc = await jsonBody(req); validateContent(doc); const current = await latestContent();
      if (doc.revision !== current.document.revision) return send(res, 409, { error: `Content changed in another editor (current revision ${current.document.revision}). Reload before saving.` });
      const next = { ...doc, revision: current.document.revision + 1 };
      await put(`${contentPrefix}${next.revision}-${Date.now()}.json`, JSON.stringify(next), { access: 'public', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 0 });
      return send(res, 200, next);
    }
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      origin(req, true); const body = await jsonBody(req); const configuredEmail = process.env.ADMIN_EMAIL; const configuredPassword = process.env.ADMIN_PASSWORD;
      if (!configuredEmail || !configuredPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in Vercel.');
      if (!secureEqual(String(body?.email || '').trim().toLowerCase(), configuredEmail.trim().toLowerCase()) || !secureEqual(body?.password || '', configuredPassword)) return send(res, 401, { error: 'Email or password is incorrect.' });
      const session = { exp: Math.floor(Date.now() / 1000) + sessionLife, token: randomBytes(32).toString('hex') }; setSession(res, session); return send(res, 200, { ok: true });
    }
    if (pathname === '/api/admin/session' && req.method === 'GET') { origin(req); const session = readSession(req); if (!session) return send(res, 401, { error: 'Please sign in to the control room.' }); return send(res, 200, { token: session.token }); }
    if (pathname === '/api/admin/logout' && req.method === 'POST') { origin(req, true); requireAdmin(req); clearSession(res); return send(res, 200, { ok: true }); }
    if (pathname === '/api/media' && req.method === 'GET') { origin(req); requireAdmin(req); return send(res, 200, { files: await dynamicMedia() }); }
    if (pathname === '/api/media/upload' && req.method === 'POST') {
      origin(req, true); requireAdmin(req); const body = await jsonBody(req);
      const result = await handleUpload({ request: req, body, onBeforeGenerateToken: async (uploadPath, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}'); if (!allowableUpload(uploadPath, payload.type)) throw new Error('Unsupported upload type or path.');
        return { allowedContentTypes: [...uploadTypes], maximumSizeInBytes: uploadLimit, addRandomSuffix: false, tokenPayload: JSON.stringify({ type: payload.type }) };
      }});
      return send(res, 200, result);
    }
    if (pathname === '/api/media' && req.method === 'DELETE') {
      origin(req, true); requireAdmin(req); const mediaUrl = requestUrl.searchParams.get('url') || ''; const files = await dynamicMedia(); const file = files.find(entry => entry.url === mediaUrl);
      if (!file) return send(res, 404, { error: 'Uploaded file not found.' });
      if (JSON.stringify((await latestContent()).document).includes(mediaUrl)) return send(res, 409, { error: 'This upload is still used by saved content. Remove its references and save first.' });
      await del(mediaUrl); return send(res, 200, { deleted: true, url: mediaUrl });
    }
    return send(res, 404, { error: 'API route not found.' });
  } catch (error) {
    console.error('Vercel API error:', error.message);
    return send(res, error.status || 500, { error: error.status ? error.message : 'Unable to complete this request. Check Vercel environment variables and Blob storage.' });
  }
}
