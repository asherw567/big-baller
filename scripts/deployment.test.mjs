import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { validateProject } from './project.mjs';
const read = file => readFile(new URL(`../${file}`, import.meta.url), 'utf8');
test('deploy only to the existing hostname and production branch', () => {
  assert.equal(validateProject({ name: 'bank', subdomain: 'bank-3za.pages.dev', production_branch: 'production' }, 'bank'), 'production');
  assert.throws(() => validateProject({ name: 'bank', subdomain: 'bank.pages.dev', production_branch: 'main' }, 'bank'));
  assert.throws(() => validateProject({ name: 'bank', subdomain: 'bank-3za.pages.dev', production_branch: 'main\nOTHER=value' }, 'bank'));
  assert.throws(() => validateProject(null, 'bank'));
});
test('build contains real hashed assets, a version, and syntactically valid scripts', async () => {
  const index = await read('dist/index.html');
  for (const match of index.matchAll(/(?:src|href)="([^"]+)"/g)) await access(new URL(`../dist/${match[1]}`, import.meta.url));
  assert.match(index, /app\.[a-f0-9]{16}\.js/);
  assert.match(index, /styles\.[a-f0-9]{16}\.css/);
  assert.match(JSON.parse(await read('dist/version.json')).version, /^[a-f0-9]{20}$/);
  new vm.Script(await read('dist/app.js'));
  new vm.Script(await read('dist/sw.js'));
});
async function worker({ offline = false, cached, mode = 'cors' } = {}) {
  const handlers = {}, deleted = [], stored = [];
  const cache = { addAll: async files => { for (const file of files) await access(new URL(`../dist/${file}`, import.meta.url)); }, match: async key => key === './index.html' ? new Response('<html>offline</html>') : cached, put: async (...args) => stored.push(args) };
  vm.runInNewContext(await read('dist/sw.js'), {
    self: { location: { origin: 'https://bank-3za.pages.dev' }, addEventListener: (name, handler) => handlers[name] = handler, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches: { open: async () => cache, keys: async () => ['unrelated-cache', 'bbb-prop-v1.3.0'], delete: async name => deleted.push(name) },
    fetch: async () => { if (offline) throw Error('offline'); return new Response('fresh'); }, URL, Response
  });
  let pending;
  handlers.install({ waitUntil: promise => pending = promise }); await pending;
  handlers.activate({ waitUntil: promise => pending = promise }); await pending;
  return { deleted, stored, async request(path) {
    let result;
    handlers.fetch({ request: { method: 'GET', url: `https://bank-3za.pages.dev${path}`, mode }, respondWith: promise => result = promise });
    return result;
  } };
}
test('precache files exist, old app cache is cleaned, unrelated caches survive', async () => {
  const sw = await worker();
  assert.deepEqual(sw.deleted, ['bbb-prop-v1.3.0']);
  assert.equal(await (await sw.request('/app.js')).text(), 'fresh');
  assert.equal(sw.stored.length, 1);
  assert.equal(await sw.request('/version.json'), undefined);
});
test('offline navigation falls back to HTML, missing scripts fail without HTML', async () => {
  const nav = await worker({ offline: true, mode: 'navigate' });
  assert.match(await (await nav.request('/')).text(), /offline/);
  const asset = await worker({ offline: true });
  assert.equal((await asset.request('/missing.js')).type, 'error');
  const saved = await worker({ offline: true, cached: new Response('cached script') });
  assert.equal(await (await saved.request('/app.js')).text(), 'cached script');
});
