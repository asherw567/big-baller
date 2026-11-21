import { appendFile } from 'node:fs/promises';
export function validateProject(project, name) {
  if (!project || project.name !== name || project.subdomain !== 'bank-3za.pages.dev')
    throw new Error('Refusing deployment: the existing project must own bank-3za.pages.dev.');
  if (!project.production_branch || /[\r\n]/.test(project.production_branch))
    throw new Error('Existing production branch is missing or invalid.');
  return project.production_branch;
}
export async function checkProject() {
  const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_PROJECT_NAME: name } = process.env;
  if (!account || !token || !name) throw new Error('Configure all three Cloudflare repository secrets first.');
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-z0-9][a-z0-9-]*$/.test(name))
    throw new Error('Invalid account ID or project name.');
  if (token !== token.trim() || /\s/.test(token)) throw new Error('API token contains whitespace; copy only the token value into the repository secret.');
  if (token === account || token === name || token.length < 30) throw new Error('API token secret does not appear to contain a full API token value.');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const codes = (Array.isArray(body.errors) ? body.errors : []).map(error => error.code).filter(Number.isInteger).slice(0, 5);
    throw new Error(`Unable to read existing Cloudflare project (HTTP ${response.status}; Cloudflare codes: ${codes.join(',') || 'none'}).`);
  }
  if (!body.success) throw new Error('Cloudflare rejected project lookup.');
  const branch = validateProject(body.result, name);
  await appendFile(process.env.GITHUB_ENV, `PAGES_PRODUCTION_BRANCH=${branch}\n`);
  console.log('Verified existing project and production hostname.');
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/project.mjs')) await checkProject();
