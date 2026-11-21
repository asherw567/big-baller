import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const expected = JSON.parse(await readFile(new URL('../dist/version.json', import.meta.url)));
let lastError;
for (let attempt = 0; attempt < 18; attempt++) {
  try {
    const response = await fetch(`https://bank-3za.pages.dev/version.json?check=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200);
    const actual = await response.json();
    assert.equal(actual.version, expected.version);
    assert.equal(actual.commit, expected.commit);
    assert.match(response.headers.get('cache-control') || '', /no-store/);
    const index = await fetch('https://bank-3za.pages.dev/', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    assert.equal(await index.text(), await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
    console.log('Verified production version, commit, HTML, and cache policy at the preserved URL.');
    process.exit(0);
  } catch (error) { lastError = error; }
  await new Promise(resolve => setTimeout(resolve, 10000));
}
throw new Error('Production verification failed after retries.', { cause: lastError });
