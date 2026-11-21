import { readFile, writeFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const at = path => new URL(path, root);
const hash = data => createHash('sha256').update(data).digest('hex').slice(0, 16);
await rm(at('dist/'), { recursive: true, force: true });
await mkdir(at('dist/'), { recursive: true });
await cp(at('site/'), at('dist/'), { recursive: true });
let index = await readFile(at('site/index.html'), 'utf8');
for (const name of ['app.js', 'styles.css', 'ui-polish.js', 'ui-polish.css']) {
  const data = await readFile(at(`site/${name}`));
  const target = name.replace('.', `.${hash(data)}.`);
  await writeFile(at(`dist/${target}`), data);
  index = index.replaceAll(name, target);
}
await writeFile(at('dist/index.html'), index);
const files = (await readdir(at('dist/'), { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile()).map(entry => {
    const directory = entry.parentPath ?? entry.path;
    return `${directory}/${entry.name}`.replaceAll('\\', '/').split('/dist/')[1];
  }).filter(name => !['sw.js', '_headers', 'version.json'].includes(name)).sort();
const digest = createHash('sha256');
for (const name of [...files, 'sw.js', '_headers']) digest.update(await readFile(at(`dist/${name}`)));
const version = digest.digest('hex').slice(0, 20);
await writeFile(at('dist/sw.js'), (await readFile(at('site/sw.js'), 'utf8'))
  .replace('__BUILD_VERSION__', version).replace('__PRECACHE__', JSON.stringify(files.map(name => `./${name}`))));
await writeFile(at('dist/version.json'), JSON.stringify({ version, commit: process.env.GITHUB_SHA || 'local' }) + '\n');
console.log(`Built BigBallerBank ${version}`);
