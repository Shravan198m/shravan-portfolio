import { readFileSync } from 'node:fs';
import path from 'node:path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'storage', 'content.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read content: ' + error.message });
  }
}
