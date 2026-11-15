/* eslint-env node */
/**
 * Parity check — the offline filter against the API (module-docs/apps/animecream/SPEC.md v0.8, G2).
 * Doc: docs/changes/20261115-animecream-gaps.md
 *
 * Offline, Home filters the cached catalog with `applyCatalogQuery` (src/helpers/catalogStorage.js), a copy of
 * the API's rules. This script sends the same search bodies the app sends to `POST /api/series/` and to the
 * offline filter (over the catalog that `POST {}` returns, as the app caches it), and compares the ids in order.
 *
 * Requires: module-api on PARITY_API (default http://localhost:3001) with the LOCAL database. Read-only: it only
 * sends searches. Refuses a non-local host unless PARITY_ALLOW_REMOTE=1.
 * Usage: node scripts/offline-parity.mjs [--verbose]
 * Exit code: 0 when every case matches, 1 otherwise.
 */
import { applyCatalogQuery } from '../src/helpers/catalogStorage.js';

const API = process.env.PARITY_API || 'http://localhost:3001';
const verbose = process.argv.includes('--verbose');
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(API) && process.env.PARITY_ALLOW_REMOTE !== '1') {
  console.error(`Refusing to run against ${API}. Set PARITY_ALLOW_REMOTE=1 after approval.`);
  process.exit(2);
}

const post = async (body) => {
  const res = await fetch(`${API}/api/series/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : null;
  return { status: res.status, list };
};

/** Builds the cases from the catalog itself, so they hit real rows; no catalog text is printed. */
const buildCases = (catalog) => {
  const pick = (n) => catalog[Math.floor((n * catalog.length) / 7) % catalog.length];
  const words = (s) => String(s ?? '').split(/\s+/).filter((w) => w.length >= 4);
  const accented = catalog.find((s) => /[áéíóúñü]/i.test(s.production_name ?? ''));
  const accentedWord = accented ? words(accented.production_name).find((w) => /[áéíóúñü]/i.test(w)) : null;
  const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const genres = [...new Set(catalog.flatMap((s) => String(s.genre_names ?? '').split(',').map((g) => g.trim())))].filter(Boolean);
  const demos = [...new Set(catalog.map((s) => s.demographic_name).filter(Boolean))];
  const years = catalog.map((s) => parseInt(s.production_year, 10)).filter((y) => !isNaN(y)).sort();
  const midYear = years[Math.floor(years.length / 2)];
  const chapters = pick(3).production_number_chapters;
  const nameWord = words(pick(1).production_name)[0] ?? String(pick(1).production_name).slice(0, 4);
  const descWord = words(pick(2).production_description)[0];
  const descEnWord = words(pick(4).production_description_en)[0];
  const asc = { production_ranking_number: 'ASC' };

  const cases = [
    ['all, ranking ASC', { ...asc }],
    ['all, ranking DESC', { production_ranking_number: 'DESC' }],
    ['top 100', { limit: 100, ...asc }],
    ['top 250', { limit: 250, ...asc }],
    ['name, as typed', { production_name: nameWord, ...asc }],
    ['name, upper case', { production_name: nameWord.toUpperCase(), ...asc }],
    ['year, one', { production_year: String(midYear), ...asc }],
    ['year, range', { production_year: `${midYear - 3},${midYear}`, ...asc }],
    ['chapters, one', { production_number_chapters: String(chapters), ...asc }],
    ['chapters, range', { production_number_chapters: '10,13', ...asc }],
    ['genre, one', { genre_names: genres[0], ...asc }],
    ['genres, two', { genre_names: `${genres[1]},${genres[2]}`, ...asc }],
    ['genre, lower case', { genre_names: String(genres[3]).toLowerCase(), ...asc }],
    ['demographic', { demographic_name: demos[0], ...asc }],
    ['demographic, lower case', { demographic_name: String(demos[0]).toLowerCase(), ...asc }],
    ['ids, in the order sent', { id: [pick(5).id, pick(1).id, pick(3).id] }],
    ['no order sent', { production_name: nameWord }],
    ['year + genre + limit', { production_year: `${midYear - 10},${midYear}`, genre_names: genres[0], limit: 5, ...asc }],
  ];
  if (descWord) cases.push(['description', { production_description: descWord, ...asc }]);
  if (descEnWord) cases.push(['description (en)', { production_description_en: descEnWord, ...asc }]);
  if (accentedWord) {
    cases.push(['name with an accent', { production_name: accentedWord, ...asc }]);
    cases.push(['name without its accent', { production_name: strip(accentedWord), ...asc }]);
  }
  const accentedGenre = genres.find((g) => /[áéíóúñü]/i.test(g));
  if (accentedGenre) cases.push(['genre without its accent', { genre_names: strip(accentedGenre).toLowerCase(), ...asc }]);
  const accentedDescWord = catalog
    .flatMap((s) => words(s.production_description))
    .find((w) => /[áéíóúñü]/i.test(w));
  if (accentedDescWord) cases.push(['description without its accent', { production_description: strip(accentedDescWord), ...asc }]);
  const accentedDemo = demos.find((d) => /[áéíóúñü]/i.test(d));
  if (accentedDemo) cases.push(['demographic without its accent', { demographic_name: strip(accentedDemo), ...asc }]);
  const enyeWord = catalog.flatMap((s) => [...words(s.production_name), ...words(s.production_description)]).find((w) => /ñ/i.test(w));
  if (enyeWord) {
    cases.push(['ñ as typed', { production_description: enyeWord, ...asc }]);
    cases.push(['ñ written as n (its own letter: no match)', { production_description: enyeWord.replace(/ñ/gi, 'n'), ...asc }]);
  }
  cases.push(['genre, no order sent', { genre_names: genres[0] }]);
  cases.push(['year range, no order sent', { production_year: `${midYear - 3},${midYear}` }]);
  cases.push(['name with spaces around', { production_name: `  ${nameWord}  `, ...asc }]);
  cases.push(['year with spaces', { production_year: ` ${midYear - 3} , ${midYear} `, ...asc }]);
  return cases;
};

const main = async () => {
  const full = await post({});
  if (!full.list?.length) {
    console.error(`No catalog from ${API} (status ${full.status}).`);
    process.exit(2);
  }
  const catalog = full.list;
  console.log(`Catalog: ${catalog.length} series from POST {}`);

  let failed = 0;
  for (const [label, body] of buildCases(catalog)) {
    const api = await post(body);
    const offline = applyCatalogQuery(catalog, body).map((s) => s.id);
    const online = api.list ? api.list.map((s) => s.id) : null;
    const same = online !== null && online.length === offline.length && online.every((id, i) => id === offline[i]);
    const sameSet = online !== null && online.length === offline.length && online.every((id) => offline.includes(id));
    if (same) {
      console.log(`  ✅  ${label} (${online.length})`);
      continue;
    }
    failed++;
    const why =
      online === null
        ? `API answered ${api.status} with no list`
        : sameSet
          ? 'same series, different order'
          : `API ${online.length} vs offline ${offline.length}; only API: ${online.filter((id) => !offline.includes(id)).length}, only offline: ${offline.filter((id) => !online.includes(id)).length}`;
    console.log(`  ❌  ${label}: ${why}`);
    if (verbose) console.log(`      body keys: ${Object.keys(body).join(', ')}; first ids API ${online?.slice(0, 5)} / offline ${offline.slice(0, 5)}`);
  }
  console.log(failed === 0 ? '\nRESULT: every case matches' : `\nRESULT: ${failed} case(s) differ`);
  process.exit(failed === 0 ? 0 : 1);
};

main();
