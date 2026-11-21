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
    // Read-only diagnostics: expose only allowlisted status words, never token IDs or raw bodies.
    if (response.status === 401 || response.status === 403) {
      for (const [kind, path] of [['user', 'user/tokens/verify'], ['account', `accounts/${account}/tokens/verify`]]) {
        try {
          const verification = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
            headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000)
          });
          const data = await verification.json().catch(() => ({}));
          const status = ['active', 'disabled', 'expired'].includes(data.result?.status) ? data.result.status : 'not-verified';
          console.log(`Token verification (${kind}): HTTP ${verification.status}, status ${status}`);
          if (verification.ok && data.success && status === 'active') {
            console.log('Token is active; check Pages permission and owning account scope against repository account ID.');
            break;
          }
        } catch { console.log(`Token verification (${kind}): unavailable`); }
      }
    }
    const codes = (Array.isArray(body.errors) ? body.errors : []).map(error => error.code).filter(Number.isInteger).slice(0, 5);
    throw new Error(`Unable to read existing Cloudflare project (HTTP ${response.status}; Cloudflare codes: ${codes.join(',') || 'none'}).`);
  }
  if (!body.success) throw new Error('Cloudflare rejected project lookup.');
  const branch = validateProject(body.result, name);
  await appendFile(process.env.GITHUB_ENV, `PAGES_PRODUCTION_BRANCH=${branch}\n`);
  console.log('Verified existing project and production hostname.');
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/project.mjs')) await checkProject();
