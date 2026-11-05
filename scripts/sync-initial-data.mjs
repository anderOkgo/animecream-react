// Brings the SEO seed (src/helpers/initialData.js) in step with the live catalog.
// Reads the public catalog only, and writes nothing but that file. Series are matched by name and
// year; only their image and ranking number change, so the sample stays the same. A seed entry the
// catalog no longer has is reported, not removed.
//
//   node scripts/sync-initial-data.mjs           apply
//   node scripts/sync-initial-data.mjs --check   report only; exit 1 if anything is stale
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API = process.env.SEED_API_URL ?? 'https://info.animecream.com/api/series/';
const IMAGE_BASE = /^https?:\/\/[^/]+/;

const key = (name, year) => `${String(name).trim().toLowerCase()}|${year}`;

export const updateSeed = (source, catalog) => {
  const byKey = new Map(catalog.map((s) => [key(s.production_name, s.production_year), s]));
  const changed = [];
  const missing = [];
  const text = source.replace(/\{\n[\s\S]*?\n {2}\},?/g, (entry) => {
    const name = /production_name: (['"])(.*?)\1,/.exec(entry)?.[2]?.replace(/\\'/g, "'");
    const year = /production_year: (\d+),/.exec(entry)?.[1];
    if (!name || !year) return entry;
    const live = byKey.get(key(name, year));
    if (!live) {
      missing.push(`${name} (${year})`);
      return entry;
    }
    const image = String(live.production_image_path).replace(IMAGE_BASE, '');
    const next = entry
      .replace(/production_image_path: '[^']*'/, `production_image_path: '${image}'`)
      .replace(/production_ranking_number: \d+/, `production_ranking_number: ${live.production_ranking_number}`);
    if (next !== entry) changed.push(`${name} (${year})`);
    return next;
  });
  return { text, changed, missing };
};

const main = async () => {
  const SEED = fileURLToPath(new URL('../src/helpers/initialData.js', import.meta.url));
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 10000 }),
  });
  if (!res.ok) throw new Error(`Catalog request failed: ${res.status}`);
  const body = await res.json();
  const catalog = Array.isArray(body) ? body : body.data;
  const source = await readFile(SEED, 'utf8');
  const { text, changed, missing } = updateSeed(source, catalog);

  console.log(`Catalog: ${catalog.length} series. Stale entries: ${changed.length}. Not in the catalog: ${missing.length}.`);
  changed.forEach((name) => console.log(`  stale: ${name}`));
  missing.forEach((name) => console.log(`  missing: ${name}`));

  if (process.argv.includes('--check')) {
    process.exitCode = changed.length > 0 ? 1 : 0;
    return;
  }
  if (changed.length > 0) await writeFile(SEED, text);
};

if (process.argv[1]?.endsWith('sync-initial-data.mjs')) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
