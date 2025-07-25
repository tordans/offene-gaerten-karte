import { writeFile, readFile, mkdir, access, readdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/';
const GARDEN_URL_REGEX = /https:\/\/www\.xn--offene-grten-ncb\.de\/garten-nummer-(\d+)(?:\/)?/g;
const URLS_JSON = join(import.meta.dir, '../../data/garden-urls.json');
const CACHE_DIR = join(import.meta.dir, '../../data/cache');
const PARSED_JSON = join(import.meta.dir, '../../data/gardens-parsed.json');

async function fetchHTML(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

async function ensureCacheDir() {
  try {
    await access(CACHE_DIR);
  } catch {
    await mkdir(CACHE_DIR, { recursive: true });
  }
}

async function fetchUrls() {
  const html = await fetchHTML(BASE_URL);
  const urls = [];
  let match;
  while ((match = GARDEN_URL_REGEX.exec(html))) {
    urls.push(`https://www.xn--offene-grten-ncb.de/garten-nummer-${match[1]}/`);
  }
  // Remove duplicates
  const unique = Array.from(new Set(urls));
  await writeFile(URLS_JSON, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`Saved ${unique.length} garden URLs to ${URLS_JSON}`);
}

async function fetchPages() {
  await ensureCacheDir();
  const raw = await readFile(URLS_JSON, 'utf-8');
  const urls = JSON.parse(raw);
  for (const url of urls) {
    const id = url.match(/garten-nummer-(\d+)\/?/)?.[1];
    if (!id) continue;
    const cacheFile = join(CACHE_DIR, `garten-${id}.html`);
    try {
      await access(cacheFile);
      console.log(`Cache hit: ${cacheFile}`);
      continue;
    } catch {}
    try {
      const html = await fetchHTML(url);
      await writeFile(cacheFile, html, 'utf-8');
      console.log(`Downloaded and cached: ${url}`);
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Failed to download ${url}:`, e);
    }
  }
}

async function parsePages() {
  await ensureCacheDir();
  const files = await readdir(CACHE_DIR);
  const gardens = [];
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const html = await readFile(join(CACHE_DIR, file), 'utf-8');
    // TODO: Implement actual parsing logic here
    gardens.push({
      id: file.replace('garten-', '').replace('.html', ''),
      raw: html.slice(0, 200) // For now, just store a preview
    });
  }
  await writeFile(PARSED_JSON, JSON.stringify(gardens, null, 2), 'utf-8');
  console.log(`Parsed ${gardens.length} gardens to ${PARSED_JSON}`);
}

async function main() {
  const step = process.argv[2] || 'fetch-urls';
  if (step === 'fetch-urls') {
    await fetchUrls();
  } else if (step === 'fetch-pages') {
    await fetchPages();
  } else if (step === 'parse-pages') {
    await parsePages();
  } else {
    console.error('Unknown step. Use fetch-urls, fetch-pages, or parse-pages.');
    process.exit(1);
  }
}

main();
