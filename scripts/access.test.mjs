import test from 'node:test';
import assert from 'node:assert/strict';

const addresses = [
  'https://bank-3za.pages.dev/',
  'https://514d89b0.bank-3za.pages.dev/'
];

test('film app Pages URLs require Cloudflare Access before serving any UI', async () => {
  for (const address of addresses) {
    const res = await fetch(address, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(18000)
    });
    const location = res.headers.get('location') ?? '';
    const body = (await res.text()).slice(0, 20000);
    const accessLogin = /cdn-cgi.*access|cloudflareaccess[.]com|Cloudflare Access|one-time PIN|Check your email/i.test(location + '\n' + body);
    const notSite = !body.includes('<title>BigBallerBank</title>') && !body.includes('<title>Wells Fargo</title>') && !body.includes('src="app.');
    console.log('Anonymous request:', new URL(address).hostname, 'status:', res.status, 'protected-login:', accessLogin);
    assert.ok(accessLogin && notSite,
      'The URL does not clearly require Cloudflare Access; verify the email-only policy covers production and preview hostnames before deploying the branded film app.');
  }
});
