/* BigBallerBank — film-prop web app. Absolutely no real financial accounts or money movement. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app');
const STORE = { credential: 'bbb_demo_passkey_v1', name: 'bbb_demo_name_v1', offer: 'bbb_offer_dismissed', username: 'bbb_saved_username_v1' };
const state = { view: 'accounts', unlocked: false, busy: false, sheet: null, notificationsRead: false, searchTerm: '', registrationError: '', isSplash: true, showPassword: false, saveUsername: Boolean(localStorage.getItem('bbb_saved_username_v1')) };
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getName = () => (localStorage.getItem(STORE.name) || 'Denise').trim().slice(0, 36) || 'Denise';
const getCredential = () => { try { return JSON.parse(localStorage.getItem(STORE.credential) || 'null'); } catch { return null; } };
const setCredential = c => localStorage.setItem(STORE.credential, JSON.stringify(c));
const randomBytes = n => crypto.getRandomValues(new Uint8Array(n));
const base64url = arr => btoa(String.fromCharCode(...new Uint8Array(arr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
const concat = (...arrays) => { let length = arrays.reduce((a, b) => a + b.length, 0), out = new Uint8Array(length), off = 0; for (const a of arrays) { out.set(a, off); off += a.length; } return out; };
const encode = s => new TextEncoder().encode(s);
const decoder = new TextDecoder();
const icons = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  card:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/>',
  deposit:'<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M12 15V3m0 0-4 4m4-4 4 4M3 15h18"/>',
  transfer:'<path d="M7 7h13m-4-4 4 4-4 4M17 17H4m4-4-4 4 4 4"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5 4-1z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9ZM10 21h4"/>',
  search:'<circle cx="10.7" cy="10.7" r="7.4"/><path d="m16.1 16.1 5 5"/>',
  chat:'<path d="M20 11a7.7 7.7 0 0 1-8 8 9 9 0 0 1-3-.5L4 21l1.4-4.6A8 8 0 1 1 20 11z"/><path d="M8 10h8m-8 4h5"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  left:'<path d="m15 5-7 7 7 7"/>',
  x:'<path d="M5 5 19 19M19 5 5 19"/>',
  face:'<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M9 9v2m6-2v2m-5 5q2 2 4 0"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check:'<path d="m4 13 5 5L20 6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  settings:'<path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3h.01"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  shield:'<path d="M12 2 4 5v6c0 6 4 9 8 11 4-2 8-5 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
  scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M4 12h16"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  pie:'<path d="M21 12a9 9 0 1 1-9-9v9z"/><path d="M15 3a9 9 0 0 1 6 6h-6z"/>',
  gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9C5 9 6 2 9 3c2 0 3 3 3 6Zm0 0c7 0 6-7 3-6-2 0-3 3-3 6Z"/>',
  eye:'<path d="M2 12q10-13 20 0-10 13-20 0Z"/><circle cx="12" cy="12" r="3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  arrowup:'<path d="m7 14 5-5 5 5m-5-5v11"/>',
  arrowdown:'<path d="m7 10 5 5 5-5m-5 5V4"/>',
  camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',
  logout:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m4-4 4-4-4-4m4 4H9"/>',
  alert:'<path d="m12 2 10 19H2z"/><path d="M12 9v4m0 4h.01"/>',
  refresh:'<path d="M20 7V3h-4M4 17v4h4M4 10a8 8 0 0 1 14-5l2 2M20 14A8 8 0 0 1 6 19l-2-2"/>'
};
function icon(name, cls = '') { return `<span class="icon ${cls}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${icons[name] || icons.info}</svg></span>`; }
function brand(extra = '') { return `<span class="brand-mark ${extra}">B<span>3</span></span>`; }
function goodTime() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function toast(message) { const el = $('#toast'); el.className = 'toast-message'; el.textContent = message; requestAnimationFrame(() => el.classList.add('show')); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3300); }
function supportLabel() { return 'Need help? Ask Baller'; }
function showSheet(html) { state.sheet = html; renderSheet(); }
function closeSheet() { state.sheet = null; const back = $('#sheet-backdrop'); if (back) back.remove(); }
function renderSheet() { const old = $('#sheet-backdrop'); if (old) old.remove(); if (!state.sheet) return; const d = document.createElement('div'); d.className = 'sheet-backdrop'; d.id = 'sheet-backdrop'; d.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grab"></div><button class="sheet-close" data-action="sheet-close" aria-label="Close">${icon('x','sm')}</button>${state.sheet}</div>`; d.addEventListener('click', e => { if (e.target === d) closeSheet(); }); document.body.append(d); }
function showProduct(title, emoji, detail) { showSheet(`<div style="font-size:48px;margin:0 0 12px">${emoji}</div><h2>${esc(title)}</h2><p>${esc(detail)}</p><div class="info-block">${icon('info')} Browse product features and benefits.</div><button class="primary-btn" data-action="sheet-close">Got it</button>`); }
function infoSheet(title, description) { showSheet(`<h2>${esc(title)}</h2><p>${esc(description)}</p><button class="primary-btn" data-action="sheet-close">Done</button>`); }

/* Standalone, local-verification passkey implementation for an on-camera prop.
   The device genuinely performs UV (Face ID or passcode), but this is NOT a
   substitute for a banking server that verifies challenges and credentials. */
function cborDecode(bytes, pos = 0) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const readLen = (ai, state) => { if (ai < 24) return ai; if (ai === 24) return b[state.i++]; if (ai === 25) { const v = (b[state.i] << 8) | b[state.i + 1]; state.i += 2; return v; } if (ai === 26) { const v = ((b[state.i] * 16777216) + (b[state.i + 1] << 16) + (b[state.i + 2] << 8) + b[state.i + 3]); state.i += 4; return v; } throw Error('Unsupported CBOR length'); };
  function item(st) { const tag = b[st.i++], major = tag >> 5, n = readLen(tag & 31, st); if (major === 0) return n; if (major === 1) return -1 - n; if (major === 2) { const x = b.slice(st.i, st.i + n); st.i += n; return x; } if (major === 3) { const x = decoder.decode(b.slice(st.i, st.i + n)); st.i += n; return x; } if (major === 4) { const out = []; for (let i=0;i<n;i++) out.push(item(st)); return out; } if (major === 5) { const out = new Map(); for (let i=0;i<n;i++) out.set(item(st), item(st)); return out; } if (major === 6) return item(st); if (major === 7) return n === 20 ? false : n === 21 ? true : null; throw Error('Unsupported CBOR data'); }
  const st = { i: pos }; return { value: item(st), offset: st.i };
}
async function publicKeyFromCredential(response) {
  if (typeof response.getPublicKey === 'function') { const bytes = response.getPublicKey(); if (bytes) return base64url(bytes); }
  const attObj = cborDecode(new Uint8Array(response.attestationObject)).value;
  const ad = attObj.get('authData');
  if (!ad || !(ad[32] & 0x40)) throw Error('Missing attested credential data');
  const length = (ad[53] << 8) | ad[54];
  const cose = cborDecode(ad, 55 + length).value;
  if (cose.get(3) !== -7 || cose.get(1) !== 2 || cose.get(-1) !== 1) throw Error('Unsupported passkey type');
  const raw = concat(new Uint8Array([4]), cose.get(-2), cose.get(-3));
  const key = await crypto.subtle.importKey('raw', raw, { name:'ECDSA', namedCurve:'P-256' }, true, ['verify']);
  return base64url(await crypto.subtle.exportKey('spki', key));
}
function derToRaw(der) {
  const b = new Uint8Array(der); let p = 0;
  if (b[p++] !== 0x30) throw Error('Invalid signature');
  let length = b[p++]; if (length & 0x80) { const count = length & 0x7f; length = 0; for (let i=0;i<count;i++) length = length*256+b[p++]; }
  const vals = []; for (let j=0;j<2;j++) { if(b[p++]!==2) throw Error('Invalid signature integer'); let l = b[p++]; const arr = b.slice(p,p+l); p+=l; let start = 0; while (arr.length-start>32 && arr[start]===0) start++; const trim = arr.slice(start); if(trim.length>32) throw Error('Invalid ECDSA value'); const v = new Uint8Array(32); v.set(trim, 32-trim.length); vals.push(v); }
  return concat(...vals);
}
async function verifyClientData(buf, type, challenge) {
  const data = JSON.parse(decoder.decode(buf));
  if (data.type !== type || data.challenge !== base64url(challenge) || data.origin !== location.origin) throw Error('Passkey response origin or challenge mismatch');
}
function passkeyAvailable() { return Boolean(window.isSecureContext && window.PublicKeyCredential && navigator.credentials?.create && navigator.credentials?.get); }
async function enrollPasskey() {
  if (state.busy) return;
  if (!passkeyAvailable()) { state.registrationError = 'Face ID requires HTTPS and a compatible device. Preview mode is available below.'; render(); return; }
  state.busy = true; state.registrationError = ''; render();
  const challenge = randomBytes(32);
  try {
    const credential = await navigator.credentials.create({ publicKey: {
      challenge,
      rp: { name: 'BigBallerBank', id: location.hostname },
      user: { id: randomBytes(16), name: 'BigBallerBank Cast', displayName: 'BigBallerBank Cast' },
      pubKeyCredParams: [{ type:'public-key', alg:-7 }],
      authenticatorSelection: { authenticatorAttachment:'platform', residentKey:'preferred', userVerification:'required' },
      attestation:'none', timeout:60000
    }});
    if (!credential) throw Error('No passkey was created');
    await verifyClientData(credential.response.clientDataJSON, 'webauthn.create', challenge);
    const publicKey = await publicKeyFromCredential(credential.response);
    setCredential({ id: base64url(credential.rawId), publicKey, rpId:location.hostname, version:1 });
    state.unlocked = true; state.view = 'accounts'; toast('Passkey created. Your iPhone authentication is ready.');
  } catch(e) { state.registrationError = e.name === 'NotAllowedError' ? 'Passkey setup was cancelled. Tap again to retry.' : `Passkey setup failed: ${e.message}`; console.error(e); }
  finally { state.busy = false; render(); }
}
async function unlockPasskey({ automatic = false } = {}) {
  if (state.busy) return;
  const saved = getCredential(); if (!saved) { state.registrationError='No passkey enrolled on this device. Set one up first.'; render(); return; }
  if (!passkeyAvailable()) { state.registrationError = 'Face ID requires HTTPS and a compatible browser.'; render(); return; }
  if (saved.rpId !== location.hostname) { state.registrationError = 'This passkey belongs to another web address. Reset it from this device to enroll here.'; render(); return; }
  state.busy = true; state.registrationError=''; render();
  const challenge = randomBytes(32);
  try {
    const result = await navigator.credentials.get({ publicKey: { challenge, rpId: saved.rpId, allowCredentials:[{type:'public-key',id:fromB64(saved.id)}], userVerification:'required', timeout:60000 } });
    if (!result || base64url(result.rawId) !== saved.id) throw Error('Unexpected passkey');
    await verifyClientData(result.response.clientDataJSON,'webauthn.get',challenge);
    const authData = new Uint8Array(result.response.authenticatorData);
    const rpHash = new Uint8Array(await crypto.subtle.digest('SHA-256',encode(saved.rpId)));
    if (authData.length < 37 || !rpHash.every((n,i)=>n===authData[i])) throw Error('Invalid authenticator identity');
    if (!(authData[32] & 0x01) || !(authData[32] & 0x04)) throw Error('Face ID or device passcode verification required');
    const signedBytes = concat(authData, new Uint8Array(await crypto.subtle.digest('SHA-256',result.response.clientDataJSON)));
    const key = await crypto.subtle.importKey('spki',fromB64(saved.publicKey),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const verified = await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'}, key, derToRaw(result.response.signature), signedBytes);
    if (!verified) throw Error('Passkey signature did not verify');
    state.unlocked = true; state.view='accounts';
  } catch(e) { state.registrationError = e.name === 'NotAllowedError' ? (automatic ? 'Your iPhone may require you to tap Unlock with Face ID before the system can authenticate. Please tap below to retry.' : 'Authentication was cancelled or timed out. Tap Unlock with Face ID to retry.') : `Could not verify Face ID/passcode: ${e.message}`; console.error(e); }
  finally { state.busy=false; render(); }
}
function lockScreen() {
  const enrolled = Boolean(getCredential());
  const remembered = localStorage.getItem(STORE.username) || '';
  return `<div class="login-page">
    <div class="login-photo" aria-hidden="true"></div>
    <div class="login-main">
      <header class="login-brandbar"><span class="login-wordmark">BIG BALLER<span class="login-wordmark-small">BANK</span></span><button class="login-location" aria-label="Locations" data-action="locations">${icon('compass','lg')}</button></header>
      <h1 class="login-greeting">${goodTime()}</h1>
      <div class="login-bottom">
        <section class="login-card">
          <form id="login-form" autocomplete="off">
            <label class="sr-only" for="login-username">Username</label>
            <div class="login-field"><input id="login-username" name="username" type="text" autocomplete="username" value="${esc(remembered)}" placeholder="Username" maxlength="48" required /><button class="login-field-action" type="button" data-action="${enrolled?'unlock':'enroll'}" aria-label="Use Face ID">${icon('face','md')}</button></div>
            <label class="sr-only" for="login-password">Password</label>
            <div class="login-field"><input id="login-password" name="password" type="${state.showPassword?'text':'password'}" placeholder="Password" autocomplete="off" required /><button class="login-show" type="button" data-action="show-password">${state.showPassword?'Hide':'Show'}</button></div>
            <label class="login-save"><input type="checkbox" id="login-save" ${state.saveUsername?'checked':''} /><span>Save username</span></label>
            <button class="login-signin" type="submit">${icon('lock','sm')} Sign On</button>
          </form>
          ${state.registrationError ? `<div class="login-error" role="alert">${esc(state.registrationError)}</div>`:''}
          <button class="login-textlink" data-action="${enrolled?'unlock':'enroll'}" ${state.busy?'disabled':''}>
            ${icon('arrowup','sm')} ${state.busy?'Waiting for iPhone…':enrolled?'Sign on with a passkey':'Set up Face ID / passkey'}
          </button>
          <button class="login-textlink" data-action="login-help">${icon('arrowup','sm')} Forgot username or password?</button>
        </section>
        <div class="login-promo-grid">
          <button class="login-promo" data-action="product-checking"><span class="promo-icon">${icon('compass','md')}</span><b>Explore our products</b><span>Find your fit ${icon('chevron','sm')}</span></button>
          <button class="login-promo" data-action="offer"><span class="promo-icon">${icon('card','md')}</span><b>Introducing the BigBaller Black Card</b><span>Learn more ${icon('chevron','sm')}</span></button>
        </div>
      </div>
    </div>
  </div>`;
}
const products = {
  checking: {title:'Checking accounts',emoji:'💳',detail:'A checking account designed around everyday spending.'},
  savings: {title:'Savings & CDs',emoji:'🪙',detail:'Explore savings goals, savings accounts, and certificates of deposit.'},
  credit: {title:'Credit cards',emoji:'💎',detail:'Discover the BigBaller Black Card, designed for everyday perks.'},
  home: {title:'Mortgages & loans',emoji:'🏡',detail:'Explore home and personal lending products.'}
};
/* Fictional two-week transaction ledger. All amounts are integer cents and all
   dates are relative to the device's local date for repeatable filming. */
const TRANSACTIONS = [
  { id:'t01', daysAgo:13, merchant:'Suncrest Studios Payroll', detail:'Direct deposit', amount:128000, kind:'deposit', mark:'$', tone:'green' },
  { id:'t02', daysAgo:13, merchant:'Trader Joe’s', detail:'Groceries', amount:-7864, kind:'card', mark:'TJ', tone:'gold' },
  { id:'t03', daysAgo:12, merchant:'Starbucks', detail:'Coffee & dining', amount:-1125, kind:'card', mark:'S', tone:'green' },
  { id:'t04', daysAgo:12, merchant:'Chevron', detail:'Gas & fuel', amount:-5537, kind:'card', mark:'C', tone:'blue' },
  { id:'t05', daysAgo:11, merchant:'Target', detail:'Shopping', amount:-9822, kind:'card', mark:'T', tone:'red' },
  { id:'t06', daysAgo:10, merchant:'Chipotle Mexican Grill', detail:'Food & drink', amount:-1946, kind:'card', mark:'CM', tone:'red' },
  { id:'t07', daysAgo:10, merchant:'Uber', detail:'Transportation', amount:-2873, kind:'card', mark:'U', tone:'slate' },
  { id:'t08', daysAgo:9, merchant:'Netflix', detail:'Entertainment', amount:-1799, kind:'card', mark:'N', tone:'red' },
  { id:'t09', daysAgo:9, merchant:'CVS Pharmacy', detail:'Health & personal', amount:-2483, kind:'card', mark:'CV', tone:'red' },
  { id:'t10', daysAgo:8, merchant:'Whole Foods Market', detail:'Groceries', amount:-9152, kind:'card', mark:'WF', tone:'green' },
  { id:'t11', daysAgo:8, merchant:'Shell', detail:'Gas & fuel', amount:-5011, kind:'card', mark:'SH', tone:'gold' },
  { id:'t12', daysAgo:7, merchant:'Amazon Marketplace', detail:'Online shopping', amount:-4368, kind:'card', mark:'a', tone:'gold' },
  { id:'t13', daysAgo:7, merchant:'In-N-Out Burger', detail:'Food & drink', amount:-1692, kind:'card', mark:'IN', tone:'red' },
  { id:'t14', daysAgo:6, merchant:'Zelle from Jordan', detail:'Money received', amount:24000, kind:'credit', mark:'Z', tone:'violet' },
  { id:'t15', daysAgo:6, merchant:'Costco Wholesale', detail:'Groceries & shopping', amount:-13739, kind:'card', mark:'CO', tone:'blue' },
  { id:'t16', daysAgo:5, merchant:'Spotify Premium', detail:'Subscriptions', amount:-1299, kind:'card', mark:'SP', tone:'green' },
  { id:'t17', daysAgo:5, merchant:'Blue Bottle Coffee', detail:'Coffee & dining', amount:-975, kind:'card', mark:'BB', tone:'blue' },
  { id:'t18', daysAgo:4, merchant:'Uber Eats', detail:'Food delivery', amount:-3462, kind:'card', mark:'UE', tone:'slate' },
  { id:'t19', daysAgo:4, merchant:'AMC Theatres', detail:'Entertainment', amount:-2750, kind:'card', mark:'A', tone:'red' },
  { id:'t20', daysAgo:3, merchant:'Ralphs', detail:'Groceries', amount:-6782, kind:'card', mark:'R', tone:'blue' },
  { id:'t21', daysAgo:3, merchant:'City Parking', detail:'Parking', amount:-1200, kind:'card', mark:'P', tone:'slate' },
  { id:'t22', daysAgo:2, merchant:'Sephora', detail:'Shopping', amount:-8914, kind:'card', mark:'SE', tone:'slate' },
  { id:'t23', daysAgo:2, merchant:'Taco Bell', detail:'Food & drink', amount:-1528, kind:'card', mark:'TB', tone:'violet' },
  { id:'t24', daysAgo:1, merchant:'Apple.com/bill', detail:'Digital services', amount:-899, kind:'card', mark:'●', tone:'slate' },
  { id:'t25', daysAgo:1, merchant:'Sweetgreen', detail:'Food & drink', amount:-1936, kind:'card', mark:'SG', tone:'green' },
  { id:'t26', daysAgo:1, merchant:'Zelle to Alex · Rent', detail:'Money sent', amount:-51500, kind:'transfer', mark:'Z', tone:'violet' },
  { id:'t27', daysAgo:0, merchant:'Mobil', detail:'Gas & fuel', amount:-3344, kind:'card', mark:'M', tone:'blue' }
];
// Verify all visible transactions reconcile exactly to a zero-dollar balance.
if (TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0) !== 0) throw Error('Prop transaction activity must net to zero');
// Scene-specific opening/ending balance. The 27 existing transactions net to zero.
const SCENE_BALANCE_CENTS = 8836221;
const transactionById = new Map(TRANSACTIONS.map(t => [t.id, t]));
const ledger = (() => {
  let running = SCENE_BALANCE_CENTS;
  return TRANSACTIONS.map(t => {
    running += t.amount;
    if (running < 0) throw Error('A fictional transaction produces a negative balance');
    return {...t, runningBalance:running};
  }).reverse();
})();
function transactionDate(t) {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - t.daysAgo); return d;
}
function dateDisplay(t, long=false) {
  const d = transactionDate(t);
  const formatted = d.toLocaleDateString('en-US', long ? {weekday:'long',month:'long',day:'numeric',year:'numeric'} : {month:'short',day:'numeric'});
  return long ? formatted : (t.daysAgo===0 ? `Today · ${formatted}` : t.daysAgo===1 ? `Yesterday · ${formatted}` : formatted);
}
function money(cents, plus=false) {
  const sign = cents<0 ? '−' : (plus && cents>0 ? '+' : '');
  return sign + '$' + (Math.abs(cents)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function transactionRow(t, compact=false) {
  return `<button class="transaction-row ${compact?'compact':''}" data-action="transaction-${t.id}" aria-label="${esc(t.merchant)}, ${esc(money(t.amount,true))}, ${dateDisplay(t)}">
    <span class="txn-mark ${t.tone}">${esc(t.mark)}</span>
    <span class="txn-copy"><span class="txn-title">${esc(t.merchant)}</span><span class="txn-subtitle">${esc(compact?dateDisplay(t):t.detail)}</span></span>
    <span class="txn-money ${t.amount>0?'positive':''}">${money(t.amount,true)}</span>
    ${icon('chevron','xs')}
  </button>`;
}
function transactionList(items, grouped=true) {
  let last=-1;return items.map(t=>{
    const heading = grouped && t.daysAgo!==last ? `<div class="txn-date-heading">${esc(dateDisplay(t))}</div>` : '';
    last=t.daysAgo;
    return heading + transactionRow(t);
  }).join('');
}
function transactionSheet(t) {
  const incoming=t.amount>0;
  showSheet(`<div class="txn-detail-top"><span class="txn-mark ${t.tone} large">${esc(t.mark)}</span><h2>${esc(t.merchant)}</h2><div class="txn-detail-amount ${incoming?'positive':''}">${money(t.amount,true)}</div><span class="txn-posted">${icon('check','xs')} Posted</span></div>
    <div class="txn-detail-lines"><div><span>Date</span><b>${esc(dateDisplay(t,true))}</b></div><div><span>Category</span><b>${esc(t.detail)}</b></div><div><span>Transaction type</span><b>${t.kind==='card'?'Debit card purchase':t.kind==='deposit'?'Direct deposit':t.kind==='credit'?'Money received':'Money sent'}</b></div><div><span>Account</span><b>Checking ••••8787</b></div><div><span>Balance after transaction</span><b>${money(t.runningBalance)}</b></div></div>
    
    <button class="primary-btn" data-action="sheet-close">Done</button>`);
}
function statementSheet() {
  const credited=ledger.filter(t=>t.amount>0).reduce((a,t)=>a+t.amount,0);
  const spent=-ledger.filter(t=>t.amount<0).reduce((a,t)=>a+t.amount,0);
  const earliest=TRANSACTIONS[0],latest=ledger[0];
  showSheet(`<h2>Account activity summary</h2><p>${esc(dateDisplay(earliest,true))} – ${esc(dateDisplay(latest,true))}</p>
    <div class="statement-grid"><div><span>Money in</span><b class="positive">${money(credited)}</b></div><div><span>Money out</span><b>${money(spent)}</b></div><div><span>Ending balance</span><b>${money(SCENE_BALANCE_CENTS)}</b></div></div>
    <div class="txn-date-heading">${ledger.length} posted transactions</div>
    <div class="txn-list">${transactionList(ledger,false)}</div>
    `);
}

function homeScreen() {
  const offerVisible = sessionStorage.getItem(STORE.offer) !== 'yes';
  return `<section class="home-hero">
    <div class="hero-top"><span class="wordmark">${brand()}BigBallerBank</span><div class="hero-tools">
      <button class="mini-icon-btn" data-action="notifications" aria-label="Notifications">${icon('bell','lg')}${!state.notificationsRead?'<span class="bubble">8</span>':''}</button>
      <button class="signoff" data-action="signoff">Sign off</button></div></div>
    <h1 class="greeting">${goodTime()}, ${esc(getName())}</h1>
    <div class="search-row"><button class="search-pill" data-action="search">${icon('search','sm')}<span>${supportLabel()}</span></button><button class="chat-head" data-action="chat" aria-label="Ask Baller assistant">${icon('chat','lg')}<span class="bubble">2</span></button></div>
  </section>
  <main class="main-cards">
    <section class="panel account-outer"><div class="account-inner"><button class="account-title" data-action="account" aria-label="View Everyday Checking account ending in 8787">Everyday Checking ••••8787</button><div class="balance">${money(SCENE_BALANCE_CENTS)}</div><div class="balance-label">Available balance</div>
      ${offerVisible ? `<div class="account-offer"><div class="offer-art"><div class="mini-bank-card"><b>BigBallerBank</b><small>BLACK</small></div></div><div class="offer-copy"><button class="offer-dismiss" data-action="dismiss-offer" aria-label="Dismiss offer">${icon('x','sm')}</button><p>Introducing the BigBaller Black Card.</p><button class="link-button" data-action="offer">Learn more ${icon('chevron','sm')}</button></div></div>` : `<button class="link-button" data-action="account">View account details ${icon('chevron','sm')}</button>`}
      </div></section>
    <section class="panel pad"><div class="panel-header"><h2>Open an account</h2><button class="link-button" data-action="explore">Explore all ${icon('chevron','sm')}</button></div><div class="product-grid">
      <button class="product-option" data-action="product-checking"><span class="product-emoji">💳</span><span>Checking</span></button>
      <button class="product-option" data-action="product-savings"><span class="product-emoji">🪙</span><span>Savings & CDs</span></button>
      <button class="product-option" data-action="product-credit"><span class="product-emoji">💳</span><span>Credit cards</span></button>
      <button class="product-option" data-action="product-home"><span class="product-emoji">🏘️</span><span>Mortgages<br>& loans</span></button>
    </div></section>
    <button class="panel feature-panel" data-action="credit-score"><span class="feature-icon">${icon('pie','lg')}</span><span class="feature-copy">Monitor your <b>credit score and report</b> with BallerScore<span style="font-size:10px;vertical-align:super">™</span></span>${icon('chevron','sm')}</button>
    <button class="panel feature-panel accent-warm" data-action="financial-goals"><span class="feature-icon">${icon('wallet','lg')}</span><span class="feature-copy"><b>Take charge of your financial goals.</b> Build a personalized savings plan.</span>${icon('chevron','sm')}</button>
    <section class="panel pad recent-home"><div class="panel-header"><h2>Recent transactions</h2><button class="link-button" data-action="account">See all ${icon('chevron','sm')}</button></div><div class="txn-list">${ledger.slice(0,3).map(t=>transactionRow(t,true)).join('')}</div><button class="txn-view-all" data-action="account">View all transactions ${icon('chevron','xs')}</button></section>
    <button class="panel feature-panel accent-blue" data-action="rewards"><span class="feature-icon">${icon('gift','lg')}</span><span class="feature-copy"><b>BigBaller Rewards</b> Discover something extraordinary.</span>${icon('chevron','sm')}</button>
    <section class="panel rewards-panel"><div class="panel-header"><h2>Your BigBaller Deals</h2><button class="link-button" data-action="rewards">View all ${icon('chevron','sm')}</button></div><p class="small-print">Exclusive experiences and rewards, made for you.</p><div class="reward-chips"><span class="chip">✦ Lifestyle</span><span class="chip">✦ Travel</span><span class="chip">✦ Dining</span></div></section>
  </main>`;
}
function subHeader(title) { return `<header class="sub-header"><button class="back-btn" data-action="back" aria-label="Back">${icon('left','md')}</button><h1>${esc(title)}</h1><button class="mini-icon-btn" data-action="notifications" aria-label="Notifications">${icon('bell','md')}</button></header>`; }
function panel(content, classes='') {return `<section class="panel ${classes}">${content}</section>`;}
function detailRow(ico, title, sub, action, right='chevron') {return `<button class="detail-row" data-action="${action}"><span class="square">${icon(ico)}</span><span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span>${icon(right,'sm')}</button>`;}
function accountScreen() {return `<div class="sub-content">
  ${panel(`<span class="section-eyebrow">Everyday Checking ••••8787</span><div class="big-balance">${money(SCENE_BALANCE_CENTS)}</div><div class="muted small">Available balance</div><div class="quick-actions" style="margin-top:22px"><button class="quick-action" data-action="transfer"><span class="round">${icon('transfer')}</span>Transfer</button><button class="quick-action" data-action="deposit"><span class="round">${icon('deposit')}</span>Deposit</button><button class="quick-action" data-action="account-details"><span class="round">${icon('info')}</span>Details</button></div>`,'pad')}
  ${panel(`<div class="panel-header"><h2>Transaction history</h2><button class="link-button" data-action="statement">Activity summary ${icon('chevron','xs')}</button></div><div class="txn-activity-sub">Last 14 days · ${ledger.length} posted transactions</div><div class="txn-list">${transactionList(ledger)}</div>`,'pad')}
  ${panel(detailRow('card','Debit card','Card ending in 8787','debit-card')+detailRow('info','Account information','View account details','account-details')+detailRow('calendar','Statements & documents','View statements','statement'))}

  </div>`;}
function depositScreen() {return `<div class="sub-content">
  <h2 class="sub-title">Make a deposit</h2>
  ${panel(`<div class="row"><div><div class="section-eyebrow">Deposit to</div><h2 style="margin-top:6px">Everyday Checking ••••8787</h2></div>${icon('wallet','lg')}</div><div class="big-balance">${money(SCENE_BALANCE_CENTS)}</div><div class="muted small">Current balance</div>`,'pad')}
  ${panel(`<div class="empty-state"><span class="circle">${icon('camera','lg')}</span><h3>Mobile check deposit</h3><p>Use mobile deposit to add a check to your account.</p><button class="primary-btn" data-action="deposit-demo" style="margin-top:12px">Start deposit</button></div>`,'pad')}
</div>`;}
function transferScreen() {return `<div class="sub-content">
  <h2 class="sub-title">Move money</h2>
  ${panel(`<form id="transfer-form"><div class="form-group"><label class="form-label" for="from-account">From account</label><select class="form-control" id="from-account"><option>Everyday Checking ••••8787 — ${money(SCENE_BALANCE_CENTS)}</option></select></div><div class="form-group"><label class="form-label" for="to-account">To account</label><select class="form-control" id="to-account"><option value="savings">BigBaller Savings ••••2204</option><option value="external">External account</option></select></div><div class="form-group"><label class="form-label" for="transfer-amount">Transfer amount</label><input class="form-control" id="transfer-amount" inputmode="decimal" autocomplete="off" type="number" min="0.01" step="0.01" placeholder="$0.00" required/><div class="form-help">Available to transfer: ${money(SCENE_BALANCE_CENTS)}</div></div><div class="form-group"><label class="form-label">Transfer date</label><div class="form-control" style="background:#f9f7f8">Today</div></div><button type="submit" class="primary-btn">Review transfer</button></form>`,'pad')}
  <div class="info-block">${icon('info')} Your available balance is currently ${money(SCENE_BALANCE_CENTS)}.</div></div>`;}
function exploreScreen() {return `<div class="sub-content"><div><span class="section-eyebrow">For what's next</span><h2 class="sub-title">Discover more with BigBallerBank.</h2></div>
 ${panel(`<div class="product-banner"><div class="glyph">💳</div><div><h3>Checking that fits your life</h3><p>Explore everyday banking.</p></div></div>${detailRow('wallet','Checking accounts','Your money, your way','product-checking')+detailRow('pie','Savings & CDs','Plan for your future','product-savings')+detailRow('card','Credit cards','For the moments that matter','product-credit')+detailRow('home','Mortgages & loans','Find your next chapter','product-home')}`)}
 ${panel(`<div class="panel-header"><h2>BigBaller Rewards</h2><span class="pill-promo">Exclusive</span></div><p class="muted small">Lifestyle, travel, and experiences, selected for you.</p><button class="link-button" data-action="rewards">View rewards ${icon('chevron','sm')}</button>`,'pad')}</div>`;}
function menuScreen() {return `<div class="sub-content">
  ${panel(`<div class="row"><div style="display:flex;gap:13px;align-items:center"><div class="feature-icon">${icon('user','lg')}</div><div><h2>${esc(getName())}</h2><span class="muted small">BigBallerBank customer</span></div></div><button class="link-button" data-action="edit-name">Edit</button></div>`,'pad')}
  ${panel(detailRow('user','Profile & preferences','Change the display name','edit-name')+detailRow('card','My cards','View your debit card','debit-card')+detailRow('shield','Security & Face ID','Manage the passkey on this phone','security')+detailRow('bell','Notifications','View recent messages','notifications')+detailRow('help','Help & support','Ask Baller','chat'))}
  ${panel(detailRow('settings','Settings','Preferences, security & app information','settings')+detailRow('logout','Sign off','Lock the application','signoff'))}
  <div class="text-center muted small" style="padding-top:8px">BigBallerBank · v1.3</div></div>`;}
function settingsScreen() {return `<div class="sub-content">
  ${panel(detailRow('shield','Sign-in & security','Face ID and passkeys','security')+detailRow('user','Account preferences','Display name and profile','edit-name')+detailRow('info','About BigBallerBank','App information and disclosures','about'))}
  <div class="text-center muted small" style="padding-top:8px">BigBallerBank · Version 1.3</div>
</div>`;}
function notificationsScreen() {return `<div class="sub-content"><span class="section-eyebrow">Your messages</span>
  ${panel(detailRow('shield','Security update','Passkey authentication is available','message-security')+detailRow('gift','Welcome to BigBallerBank','Your account is ready','message-welcome')+detailRow('wallet','Account activity','27 posted transactions over the last 14 days','account')+detailRow('card','Your card dashboard','Explore your debit card','debit-card')+detailRow('pie','Meet BallerScore™','View the credit-score feature','credit-score')+detailRow('gift','BigBaller Rewards','Explore exclusive offers','rewards')+detailRow('info','Your account overview','Your available balance is ' + money(SCENE_BALANCE_CENTS),'account')+detailRow('help','Need some help?','Ask Baller is here for you','chat'))}
  <button class="secondary-btn" style="margin-top:0" data-action="clear-notifications">Mark all as read</button></div>`;}
function searchScreen() {return `<div class="sub-content">
  ${panel(`<label class="form-label" for="help-search">How can we help?</label><input class="form-control" id="help-search" value="${esc(state.searchTerm)}" placeholder="Search accounts, payments, cards…" autocomplete="off" /><div class="search-suggest"><button data-action="search-account">Account balance</button><button data-action="search-face">Face ID</button><button data-action="search-transfer">Transfers</button><button data-action="search-card">Card details</button></div>`,'pad')}
  <h2 class="sub-title">Popular questions</h2>
  ${panel(detailRow('wallet','Where is my balance?','Checking account balance','account')+detailRow('shield','How do I sign in?','Biometrics & passkeys','security')+detailRow('transfer','How can I transfer money?','Explore the simulation','transfer')+detailRow('help','Talk to the assistant','Ask Baller','chat'))}
  </div>`;}
function securityScreen() {return `<div class="sub-content">
  ${panel(`<div style="display:flex;align-items:center;gap:13px;margin-bottom:13px"><span class="feature-icon">${icon('face','lg')}</span><div><h2>Face ID & passkey</h2><span class="muted small">${getCredential()?'Passkey enrolled on this device':'No passkey enrolled'}</span></div></div><div class="info-block">${icon('shield')} The iPhone handles Face ID and passcode verification. BigBallerBank does not access or store any facial data.</div><button class="secondary-btn" data-action="signoff">Lock the app</button><button class="secondary-btn" data-action="reset-enrollment">Remove local enrollment</button>`,'pad')}
</div>`;}
function renderNav() {const items=[['accounts','home','Accounts'],['deposit','deposit','Deposit'],['transfer','transfer','Pay & Transfer'],['explore','compass','Explore'],['menu','menu','Menu']];const active = ['account','notifications','search','security','settings'].includes(state.view) ? (state.view==='account'?'accounts':'menu') : state.view; return `<nav class="footer-nav" aria-label="Main navigation">${items.map(([name,ico,label])=>`<button class="nav-btn ${active===name?'active':''}" data-action="${name}" aria-label="${label}" ${active===name?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></button>`).join('')}</nav>`;}
function syncDisplayChrome() {
  const login = !state.unlocked;
  // A page background alone cannot colour the iPhone Home Screen status bar:
  // keep root/body and iOS metadata aligned with the currently visible screen.
  document.documentElement?.classList?.toggle?.('bbb-login', login);
  document.body?.classList?.toggle?.('bbb-login', login);
  const theme = $('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', login ? '#56658f' : '#f8f5f3');
  const status = $('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (status) status.setAttribute('content', login ? 'black-translucent' : 'default');
}
function render() {
  syncDisplayChrome();
  if (!state.unlocked) { app.innerHTML=lockScreen(); const signIn=$('.login-signin');if(signIn)signIn.disabled=!($('#login-username')?.value.trim()&&$('#login-password')?.value); closeSheet(); return; }
  const titles={account:'Account details',deposit:'Deposit',transfer:'Pay & Transfer',explore:'Explore',menu:'Menu',notifications:'Notifications',search:'Ask Baller',security:'Security & Face ID',settings:'Settings'};
  const content = state.view==='accounts' ? homeScreen() : ({account:accountScreen,deposit:depositScreen,transfer:transferScreen,explore:exploreScreen,menu:menuScreen,notifications:notificationsScreen,search:searchScreen,security:securityScreen,settings:settingsScreen}[state.view] || homeScreen)();
  app.innerHTML=`<div class="app-shell">${state.view==='accounts'?'':subHeader(titles[state.view]||'BigBallerBank')}${content}${renderNav()}</div>`;
  renderSheet();
}
function navigate(view) {if (!state.unlocked) return; closeSheet(); state.view=view; render(); window.scrollTo({top:0,behavior:'instant'});}
function editName() {showSheet(`<h2>Personalize your screen</h2><p>Enter the name you want to see on your account dashboard.</p><form id="profile-form"><div class="form-group"><label class="form-label" for="profile-name">Display name</label><input class="form-control" id="profile-name" type="text" maxlength="36" value="${esc(getName())}" required></div><button class="primary-btn" type="submit">Save name</button></form>`);}
function debitCard() {showSheet(`<h2>Your debit card</h2><p>View your everyday debit card.</p><div class="fake-card"><div class="row"><strong>BigBallerBank</strong><span>✦</span></div><p>EVERYDAY CHECKING</p><div class="fake-card-number">•••• •••• •••• 8787</div><div class="row"><span>${esc(getName()).toUpperCase()}</span><b>BLACK</b></div></div><button class="primary-btn" data-action="sheet-close">Done</button>`);}
function assistantSheet() {showSheet(`<div class="row" style="justify-content:flex-start;margin-bottom:15px"><span class="feature-icon">${icon('chat','lg')}</span><div><h2 style="margin:0">Ask Baller</h2><span class="muted small">Your virtual banking assistant</span></div></div><div class="screen-simulation"><h3>Hi, ${esc(getName())}!</h3><p>Welcome to BigBallerBank. Your Everyday Checking balance is <strong>${money(SCENE_BALANCE_CENTS)}</strong>. What would you like to explore?</p></div><div class="search-suggest"><button data-action="account">View my balance</button><button data-action="transfer">Make a transfer</button><button data-action="security">Face ID settings</button></div><button class="secondary-btn" data-action="sheet-close">Close assistant</button>`);}
function demoDeposit() {showSheet(`<h2>Deposit a check</h2><p>Deposit to your checking account.</p><div class="screen-simulation"><h3>Checking ••••8787</h3><p>Available balance: <strong>${money(SCENE_BALANCE_CENTS)}</strong></p></div><button class="primary-btn" data-action="deposit-complete">Continue</button>`);}
function messageSheet(title, description) {showSheet(`<h2>${title}</h2><p>${description}</p><button class="primary-btn" data-action="sheet-close">Done</button>`);}
const action = async name => {
  if (name==='show-password') {const input=$('#login-password');if(input){const start=input.selectionStart;state.showPassword=!state.showPassword;input.type=state.showPassword?'text':'password';const b=$('[data-action="show-password"]');if(b)b.textContent=state.showPassword?'Hide':'Show';try{input.setSelectionRange(start,start);}catch{} } return;}
  if (name==='locations') {showSheet(`<h2>Locations</h2><p>Find BigBallerBank locations and services.</p><div class="screen-simulation"><h3>Location services</h3><p>Search is unavailable right now. Please try again later.</p></div><button class="primary-btn" data-action="sheet-close">Done</button>`);return;}
  if (name==='login-help') {showSheet(`<h2>Sign-on assistance</h2><p>Need help accessing your account?</p><div class="screen-simulation"><h3>Account recovery</h3><p>Please contact customer support for assistance with your username or password.</p></div><button class="primary-btn" data-action="sheet-close">Back to sign on</button>`);return;}
  if (name==='enroll') return enrollPasskey();
  if (name==='unlock') return unlockPasskey();
  if (name==='reset-enrollment') { showSheet(`<h2>Reset local passkey?</h2><p>This removes only the passkey reference saved on this browser. The iPhone's saved passkey can be removed separately from Apple Passwords. The next launch will offer setup again.</p><button class="primary-btn" data-action="confirm-reset">Reset local enrollment</button><button class="secondary-btn" data-action="sheet-close">Cancel</button>`); return; }
  if (name==='confirm-reset') { localStorage.removeItem(STORE.credential); state.unlocked=false; state.registrationError=''; closeSheet(); render(); toast('Local passkey enrollment reset.'); return; }
  if (name==='sheet-close') {closeSheet();return;}
  if (name.startsWith('transaction-')) {const t=ledger.find(t=>t.id===name.slice('transaction-'.length));if(t)transactionSheet(t);return;}
  if (name==='signoff') {state.unlocked=false;state.registrationError='';closeSheet();render();return;}
  if (['accounts','account','deposit','transfer','explore','menu','notifications','search','security','settings'].includes(name)) {if(name==='notifications')state.notificationsRead=true; navigate(name);return;}
  if (name==='back') {navigate('accounts');return;}
  if (name.startsWith('product-')) {const p=products[name.substring(8)];if(p)showProduct(p.title,p.emoji,p.detail);return;}
  if (name==='offer') {showProduct('The BigBaller Black Card','💳','A premium card with an unmistakable design and added benefits.');return;}
  if (name==='dismiss-offer') {sessionStorage.setItem(STORE.offer,'yes');render();return;}
  if (name==='credit-score') {infoSheet('BallerScore™','Monitor your credit profile with BallerScore™.');return;}
  if (name==='financial-goals') {infoSheet('Financial goals','Track your saving and spending goals in one place.');return;}
  if (name==='rewards') {showProduct('BigBaller Rewards','✦','A collection of exclusive dining, shopping, and travel experiences.');return;}
  if (name==='chat') {assistantSheet();return;}
  if (name==='edit-name') {editName();return;}
  if (name==='debit-card') {debitCard();return;}
  if (name==='account-details') {showSheet(`<h2>Account information</h2><p>Everyday Checking ••••8787</p><div class="stack"><div class="row"><b>Account type</b><span>Checking</span></div><div class="row"><b>Available balance</b><span>${money(SCENE_BALANCE_CENTS)}</span></div><div class="row"><b>Current balance</b><span>${money(SCENE_BALANCE_CENTS)}</span></div><div class="row"><b>Account status</b><span>Active</span></div></div><button class="primary-btn" data-action="sheet-close">Done</button>`);return;}
  if (name==='statement') {statementSheet();return;}
  if (name==='deposit-demo') {demoDeposit();return;}
  if (name==='deposit-complete') {showSheet(`<div class="text-center" style="font-size:48px;color:#5d9863">${icon('check','xl')}</div><h2>Deposit unavailable</h2><p>Mobile deposit is currently unavailable. Your available balance remains <strong>${money(SCENE_BALANCE_CENTS)}</strong>.</p><button class="primary-btn" data-action="sheet-close">Done</button>`);return;}
  if (name==='message-security') {messageSheet('Security update','Your iPhone can authenticate with Face ID or your device passcode when you use an enrolled passkey.');return;}
  if (name==='message-welcome') {messageSheet('Welcome to BigBallerBank','Thanks for joining BigBallerBank. Your account is ready.');return;}
  if (name==='clear-notifications') {state.notificationsRead=true;toast('All messages marked as read.');render();return;}
  if (name==='search-account') {navigate('account');return;}
  if (name==='search-face') {navigate('security');return;}
  if (name==='search-transfer') {navigate('transfer');return;}
  if (name==='search-card') {debitCard();return;}
  if (name==='about') {showSheet(`<h2>About BigBallerBank</h2><p>BigBallerBank is an entirely fictional banking interface produced solely as a movie prop. No financial institution, account, card, transaction, credit product, payment, or deposit shown in this app is real.</p><div class="info-block">${icon('shield')} The displayed balance is deliberately fixed at <strong>${money(SCENE_BALANCE_CENTS)}</strong>. Transaction history and other account information are scripted, and no financial services are provided.</div><p style="margin-top:18px">This experience can invoke the iPhone's genuine Face ID or device passcode through a locally verified passkey. It does not use bank-grade authentication or a banking server and must never be used for actual financial data or transactions.</p><button class="primary-btn" data-action="sheet-close">Done</button>`);return;}
};
app.addEventListener('click', e => {const btn=e.target.closest('[data-action]'); if(!btn || !app.contains(btn)) return; const result=action(btn.dataset.action); if(result?.catch)result.catch(err=>{console.error(err);toast('Something went wrong. Please try again.');});});
document.addEventListener('click',e=>{const target=e.target.closest('#sheet-backdrop [data-action]');if(target){const result=action(target.dataset.action);if(result?.catch)result.catch(console.error);}});
document.addEventListener('submit', e => {
  if (e.target.id==='login-form') {e.preventDefault();const username=$('#login-username')?.value.trim()||'';const password=$('#login-password')?.value||'';if(!username||!password){toast('Enter your username and password.');return;}if($('#login-save')?.checked){localStorage.setItem(STORE.username,username);}else{localStorage.removeItem(STORE.username);}state.saveUsername=Boolean($('#login-save')?.checked);state.registrationError='';state.unlocked=true;state.view='accounts';closeSheet();render();window.scrollTo(0,0);return;}
  if (e.target.id==='profile-form') {e.preventDefault();const name=$('#profile-name')?.value.trim();if(!name)return;localStorage.setItem(STORE.name,name.slice(0,36));closeSheet();render();toast('Your display name has been updated.');}
  if (e.target.id==='transfer-form') {
    e.preventDefault();
    const amt=Number($('#transfer-amount')?.value || 0);
    if(!Number.isFinite(amt)||amt<=0){toast('Enter a positive dollar amount.');return;}
    const amountCents=Math.round(amt*100);
    if(amountCents>SCENE_BALANCE_CENTS){
      showSheet(`<h2>Insufficient funds</h2><p>Available balance: <strong>${money(SCENE_BALANCE_CENTS)}</strong>.</p><p>The requested ${money(amountCents)} transfer exceeds your available balance.</p><div class="info-block">${icon('shield')} No transfer has been made.</div><button class="primary-btn" data-action="sheet-close">Okay</button>`);
      return;
    }
    showSheet(`<h2>Review transfer</h2><p>From Everyday Checking ••••8787</p><div class="statement-grid"><div><span>Amount</span><b>${money(amountCents)}</b></div><div><span>Available balance</span><b>${money(SCENE_BALANCE_CENTS)}</b></div></div><div class="info-block">${icon('shield')} Transfer preview only. No funds have moved.</div><button class="primary-btn" data-action="sheet-close">Done</button>`);
  }
});
app.addEventListener('input', e => {
  if(e.target.id==='help-search') state.searchTerm=e.target.value.slice(0,120);
  if(['login-username','login-password'].includes(e.target.id)) {const btn=$('.login-signin');if(btn)btn.disabled=!($('#login-username')?.value.trim()&&$('#login-password')?.value);}
});
app.addEventListener('change',e=>{if(e.target.id==='login-save')state.saveUsername=e.target.checked;});
app.addEventListener('keydown', e => { if (e.target.id !== 'help-search' || e.key !== 'Enter') return; e.preventDefault(); const q = state.searchTerm.toLowerCase(); if (/transfer|payment|pay/.test(q)) navigate('transfer'); else if (/balance|checking|account/.test(q)) navigate('account'); else if (/face|passkey|security|password/.test(q)) navigate('security'); else if (/card|debit/.test(q)) debitCard(); else if (/reward|offer|deal/.test(q)) action('rewards'); else assistantSheet(); });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
    refreshing = true;
    const reloadWhenIdle = () => {
      if (state.busy) { setTimeout(reloadWhenIdle, 1000); return; }
      location.reload();
    };
    reloadWhenIdle();
  });
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      const check = () => { if (!document.hidden) registration.update().catch(() => {}); };
      check();
      window.addEventListener('focus', check);
      document.addEventListener('visibilitychange', check);
    } catch { console.warn('Offline updates are temporarily unavailable.'); }
  });
}
// Request the real iPhone passkey automatically on a fresh Home Screen launch.
// Safari/WebKit may still require a user gesture or show its passkey confirmation:
// a website cannot dismiss, approve, or bypass Apple-controlled authentication UI.
// The Unlock button remains as a reliable manual fallback if auto-invocation is denied.
setTimeout(() => {
  state.isSplash = false;
  render();
  if (getCredential() && passkeyAvailable()) unlockPasskey({ automatic: true });
}, 480);
