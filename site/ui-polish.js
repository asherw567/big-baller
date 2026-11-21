/* Wells Fargo v1.4: refined cinematic banking UI. Financial state remains unchanged. */
'use strict';
state.depositAmount = '';
state.depositFront = false;
state.depositBack = false;

function subHeader(title) {
  const topLevel = ['Deposit','Pay & Transfer','Explore','Menu'].includes(title);
  return `<header class="sub-header ${topLevel?'top-level':''}">
    <div class="utility-row">
      <button class="utility-search" data-action="search" aria-label="Search and help">${icon('search','sm')}<span>Need help?</span>${icon('chat','md')}</button>
      <div class="utility-controls"><button class="mini-icon-btn" data-action="notifications" aria-label="Notifications">${icon('bell','lg')}${!state.notificationsRead?'<span class="bubble">8</span>':''}</button><button class="signoff" data-action="signoff">Sign off</button></div>
    </div>
    <div class="sub-heading-row">${!topLevel?`<button class="back-btn" data-action="back" aria-label="Back">${icon('left','md')}</button>`:''}<h1>${esc(title)}</h1>${title==='Deposit'?`<button class="mini-icon-btn deposit-info-btn" data-action="deposit-info" aria-label="Deposit information">${icon('info','md')}</button>`:''}</div>
  </header>`;
}
function depositScreen() {return `<div class="sub-content deposit-page">
  <section class="deposit-surface">
    <div class="deposit-account"><span class="deposit-overline">To</span><strong>Everyday Checking ••••8787</strong><span>Available balance ${money(SCENE_BALANCE_CENTS)}</span></div>
    <div class="deposit-amount-zone"><label for="deposit-amount">Amount</label><div class="deposit-amount-field"><span>$</span><input id="deposit-amount" inputmode="decimal" autocomplete="off" aria-label="Check amount" placeholder="0.00" value="${esc(state.depositAmount)}" /></div><p>30-day deposit limit $15,000.00</p></div>
    <div class="deposit-photos"><span class="deposit-overline">Photos ${icon('info','xs')}</span><div class="deposit-photo-grid">
      <button class="deposit-photo ${state.depositFront?'captured':''}" data-action="deposit-photo-front"><span class="photo-symbol">${icon(state.depositFront?'check':'camera','lg')}</span><span>${state.depositFront?'Front image ready':'Front of check'}</span></button>
      <button class="deposit-photo ${state.depositBack?'captured':''}" data-action="deposit-photo-back"><span class="photo-symbol">${icon(state.depositBack?'check':'camera','lg')}</span><span>${state.depositBack?'Back image ready':'Back of check'}</span></button>
    </div></div>
    <p class="deposit-availability">Deposits submitted after 9 p.m. PT on business days are generally reviewed the next business day. <button data-action="deposit-info">About availability</button></p>
    <div class="deposit-action-row"><button class="outline-btn" data-action="deposit-cancel">Cancel</button><button id="deposit-submit" class="primary-btn" data-action="deposit-complete" ${Number(state.depositAmount)>0&&Number(state.depositAmount)<=15000&&state.depositFront&&state.depositBack?'':'disabled'}>Deposit</button></div>
  </section>
</div>`;}
function transferScreen() {const tiles=[
  ['open-transfer-form','transfer','Transfer',''],['send-money','wallet','Send money','purple'],['pay-bills','card','Pay bills',''],['wire-money','deposit','Wire money',''],['international-transfer','compass','Transfer internationally','']
];return `<div class="sub-content transfer-page">
  <section class="transfer-surface"><div class="transfer-grid">${tiles.map(([a,i,t,c])=>`<button class="transfer-tile" data-action="${a}"><span class="transfer-orb ${c}">${icon(i,'lg')}</span><span>${t}</span></button>`).join('')}</div></section>
  <div class="insight-heading">Insights <button class="insight-info" data-action="activity-forecast" aria-label="About insights">${icon('info','xs')}</button></div>
  <button class="forecast-card" data-action="activity-forecast"><span>Activity forecast</span><span class="forecast-icon">${icon('calendar','xl')}</span><strong>0 upcoming transfers</strong><small>Review account activity</small></button>
</div>`;}
function menuRow(title, note, target) {return `<button class="menu-option" data-action="${target}"><span><strong>${esc(title)}</strong>${note?`<small>${esc(note)}</small>`:''}</span>${icon('chevron','sm')}</button>`;}
function menuScreen() {return `<div class="sub-content menu-page">
  <button class="menu-profile" data-action="edit-name"><span class="menu-avatar">${icon('user','xl')}</span><span><strong>${esc(getName())}</strong><small>Profile & settings</small></span>${icon('chevron','md')}</button>
  <section class="menu-surface">
    ${menuRow('Security Center','Manage sign-on and Face ID','security')}
    ${menuRow('Card Settings','','debit-card')}
    ${menuRow('Account Services','','account-details')}
    ${menuRow('Statements & Documents','','statement')}
    ${menuRow('Help & Support','','chat')}
    ${menuRow('Settings','','settings')}
  </section>
  <button class="menu-feedback" data-action="share-feedback">Share feedback</button>
  <button class="menu-legal" data-action="about">Legal and privacy information ${icon('chevron','sm')}</button>
</div>`;}
function transferFormSheet() {showSheet(`<h2>Transfer money</h2><p>Choose the account and amount to transfer.</p><form id="transfer-form">
  <div class="form-group"><label class="form-label" for="from-account">From account</label><select class="form-control" id="from-account"><option>Everyday Checking ••••8787 — ${money(SCENE_BALANCE_CENTS)}</option></select></div>
  <div class="form-group"><label class="form-label" for="to-account">To account</label><select class="form-control" id="to-account"><option value="savings">Wells Fargo Savings ••••2204</option><option value="external">External account</option></select></div>
  <div class="form-group"><label class="form-label" for="transfer-amount">Transfer amount</label><input class="form-control" id="transfer-amount" inputmode="decimal" type="number" min="0.01" step="0.01" placeholder="0.00" required/><div class="form-help">Available to transfer: ${money(SCENE_BALANCE_CENTS)}</div></div>
  <div class="form-group"><label class="form-label">Transfer date</label><div class="form-control" style="background:#f9f7f8">Today</div></div>
  <button class="primary-btn" type="submit">Review transfer</button></form>`);}
const polishedActions = {
  'deposit-cancel': () => {state.depositAmount='';state.depositFront=false;state.depositBack=false;navigate('accounts');},
  'deposit-info': () => infoSheet('Mobile deposit','Enter an amount and provide the front and back of a check to review a deposit.'),
  'deposit-photo-front': () => {state.depositFront=!state.depositFront;render();toast(state.depositFront?'Image added':'Image removed');},
  'deposit-photo-back': () => {state.depositBack=!state.depositBack;render();toast(state.depositBack?'Image added':'Image removed');},
  'open-transfer-form': transferFormSheet,
  'send-money': () => infoSheet('Send money','Choose a recipient to get started. Your checking balance is currently ' + money(SCENE_BALANCE_CENTS) + '.'),
  'pay-bills': () => infoSheet('Pay bills','View scheduled payments or set up a new bill payment.'),
  'wire-money': () => infoSheet('Wire money','Set up a domestic wire transfer.'),
  'international-transfer': () => infoSheet('International transfers','Review international transfer options.'),
  'activity-forecast': () => showSheet(`<h2>Activity forecast</h2><p>No transfers are currently scheduled.</p><div class="info-block">${icon('calendar')} ${ledger.length} transactions posted over the last 14 days.</div><button class="primary-btn" data-action="sheet-close">Done</button>`),
  'share-feedback': () => infoSheet('Share feedback','For assistance, contact Ask Fargo through Help & Support.')
};
app.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action]');if(!btn||!app.contains(btn))return;
  const callback=polishedActions[btn.dataset.action];if(typeof callback!=='function')return;
  e.preventDefault();e.stopImmediatePropagation();callback();
},true);
app.addEventListener('input',e=>{
  if(e.target.id!=='deposit-amount')return;
  state.depositAmount=e.target.value;
  const btn=$('#deposit-submit');if(btn)btn.disabled=!(Number(state.depositAmount)>0&&Number(state.depositAmount)<=15000&&state.depositFront&&state.depositBack);
},true);


/* Wells Fargo v1.6 — editorial account overview and bank-statement activity. */
state.accountTab = 'overview';
state.accountTransactionFilter = 'all';
state.accountTransactionQuery = '';
state.accountSearchOpen = false;
state.accountFilterOpen = false;

const existingBankSubHeader = subHeader;
subHeader = function(title) {
  if (title !== 'Account details') return existingBankSubHeader(title);
  return `<header class="account-detail-toolbar">
    <button class="account-detail-back" data-action="back" aria-label="Back to accounts">${icon('left','lg')}</button>
    <button class="account-toolbar-help" data-action="search" aria-label="Help and search">${icon('search','sm')}<span>Need help?</span>${icon('chat','md')}</button>
    <div class="account-toolbar-spacer"></div>
    <button class="mini-icon-btn" data-action="notifications" aria-label="Notifications">${icon('bell','lg')}${!state.notificationsRead?'<span class="bubble">8</span>':''}</button>
    <button class="signoff" data-action="signoff">Sign off</button>
  </header>`;
};
function statementDescription(t) {
  const merchant = String(t.merchant).toLocaleUpperCase('en-US');
  if(t.kind==='card') return 'PURCHASE ' + merchant + ' CARD8787';
  if(t.kind==='deposit') return 'DIRECT DEPOSIT ' + merchant;
  if(t.kind==='credit') return merchant;
  return merchant;
}
function statementRow(t, compact=false) {
  const price=t.amount>0? '+'+money(t.amount):money(Math.abs(t.amount));
  return `<button class="bank-statement-row ${compact?'compact':''}" data-action="transaction-${t.id}" aria-label="${esc(t.merchant)}, ${esc(money(t.amount,true))}, ${esc(dateDisplay(t))}, posted">
    <span class="bank-statement-description"><span class="bank-statement-date">${esc(transactionDate(t).toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'}))}</span><span class="bank-statement-merchant">${esc(statementDescription(t))}</span></span>
    <span class="bank-statement-amount"><strong class="${t.amount>0?'credit':''}">${price}</strong><small>Posted</small></span>
  </button>`;
}
transactionRow = function(t, compact=false) {return statementRow(t,compact);};

function visibleBankTransactions() {
  const q=state.accountTransactionQuery.trim().toLocaleLowerCase('en-US');
  return ledger.filter(t=>{
    const kind=state.accountTransactionFilter;
    if(kind==='debits' && t.amount>=0)return false;
    if(kind==='credits' && t.amount<=0)return false;
    return !q || [t.merchant,t.detail,statementDescription(t),dateDisplay(t),money(t.amount,true)].some(v=>String(v).toLocaleLowerCase('en-US').includes(q));
  });
}
function bankTransactionList() {
  const entries=visibleBankTransactions();
  if(!entries.length)return '<div class="bank-statement-empty">No matching transactions. Try a different search or filter.</div>';
  return entries.map(t=>statementRow(t)).join('');
}
function updateBankTransactionList() {
  const list=$('#bank-statement-results');
  if(list)list.innerHTML=bankTransactionList();
  const count=$('#bank-statement-count');
  if(count)count.textContent=visibleBankTransactions().length + ' transactions';
}
function bankAccountOverview() {
  return `<div class="bank-transactions-header">
    <h2>Transactions <button class="bank-info" data-action="statement" aria-label="About transaction history">${icon('info','sm')}</button></h2>
    <div class="bank-activity-tools">
      <button data-action="bank-search-toggle" aria-expanded="${state.accountSearchOpen?'true':'false'}">${icon('search','sm')} Search</button>
      <button data-action="bank-filter">${icon('settings','sm')} Filter</button>
    </div>
  </div>
  ${state.accountSearchOpen?`<div class="bank-search-box"><input id="bank-transaction-query" autocomplete="off" type="search" aria-label="Search transactions" placeholder="Search transactions" value="${esc(state.accountTransactionQuery)}"></div>`:''}
  ${state.accountFilterOpen?`<div class="bank-filter-options"><button data-action="bank-filter-all">All transactions</button><button data-action="bank-filter-debits">Money out</button><button data-action="bank-filter-credits">Money in</button></div>`:''}
  ${state.accountTransactionFilter!=='all'?`<div class="bank-active-filter"><span>${state.accountTransactionFilter==='credits'?'Money in':'Money out'}</span><button data-action="bank-filter-clear">Clear filter</button></div>`:''}
  <div class="bank-statement-list" id="bank-statement-results">${bankTransactionList()}</div>
  <div class="bank-statement-bottom"><span id="bank-statement-count">${visibleBankTransactions().length} transactions</span><button data-action="statement">Activity summary ${icon('chevron','xs')}</button></div>`;
}
function bankAccountManage() {
  return `<div class="bank-secondary-content">
    <h2>Manage your account</h2>
    <button class="bank-manage-item" data-action="transfer">${icon('transfer','md')}<span>Transfer money</span>${icon('chevron','sm')}</button>
    <button class="bank-manage-item" data-action="deposit">${icon('deposit','md')}<span>Mobile deposit</span>${icon('chevron','sm')}</button>
    <button class="bank-manage-item" data-action="debit-card">${icon('card','md')}<span>Card settings</span>${icon('chevron','sm')}</button>
    <button class="bank-manage-item" data-action="statement">${icon('calendar','md')}<span>Statements & documents</span>${icon('chevron','sm')}</button>
  </div>`;
}
function bankAccountRouting() {
  return `<div class="bank-secondary-content">
    <h2>Routing & balance info</h2>
    <div class="bank-balance-info-row"><span>Account</span><strong>Everyday Checking ••••8787</strong></div>
    <div class="bank-balance-info-row"><span>Available balance</span><strong>${money(SCENE_BALANCE_CENTS)}</strong></div>
    <div class="bank-balance-info-row"><span>Current balance</span><strong>${money(SCENE_BALANCE_CENTS)}</strong></div>
    <div class="bank-balance-info-row"><span>Account status</span><strong>Active</strong></div>
    <button class="bank-info-link" data-action="account-details">View account information ${icon('chevron','sm')}</button>
  </div>`;
}
accountScreen = function() {
  const tab=state.accountTab;
  return `<div class="bank-account-page">
    <section class="bank-account-overview">
      <div class="bank-account-name">Everyday Checking ••••8787</div>
      <div class="bank-account-balance">${money(SCENE_BALANCE_CENTS)}</div>
      <div class="bank-account-balance-label">Available balance ${icon('info','xs')}</div>
      <button class="bank-info-link" data-action="account-details">Account & routing numbers ${icon('chevron','sm')}</button>
    </section>
    <section class="bank-account-sheet">
      <div class="bank-account-tabs" role="tablist" aria-label="Checking account sections">
        <button role="tab" aria-selected="${tab==='overview'}" class="${tab==='overview'?'active':''}" data-action="bank-tab-overview">Overview</button>
        <button role="tab" aria-selected="${tab==='manage'}" class="${tab==='manage'?'active':''}" data-action="bank-tab-manage">Manage</button>
        <button role="tab" aria-selected="${tab==='routing'}" class="${tab==='routing'?'active':''}" data-action="bank-tab-routing">Routing &amp;<br> balance info</button>
      </div>
      <div class="bank-account-sheet-content">${tab==='overview'?bankAccountOverview():tab==='manage'?bankAccountManage():bankAccountRouting()}</div>
    </section>
  </div>`;
};

Object.assign(polishedActions, {
  'bank-tab-overview':()=>{state.accountTab='overview';render();},
  'bank-tab-manage':()=>{state.accountTab='manage';render();},
  'bank-tab-routing':()=>{state.accountTab='routing';render();},
  'bank-search-toggle':()=>{state.accountSearchOpen=!state.accountSearchOpen;if(!state.accountSearchOpen)state.accountTransactionQuery='';render();},
  'bank-filter':()=>{state.accountFilterOpen=!state.accountFilterOpen;render();},
  'bank-filter-clear':()=>{state.accountTransactionFilter='all';render();},
  'bank-filter-all':()=>{state.accountTransactionFilter='all';state.accountFilterOpen=false;render();},
  'bank-filter-debits':()=>{state.accountTransactionFilter='debits';state.accountFilterOpen=false;render();},
  'bank-filter-credits':()=>{state.accountTransactionFilter='credits';state.accountFilterOpen=false;render();}
});
app.addEventListener('input',e=>{
  if(e.target.id!=='bank-transaction-query')return;
  state.accountTransactionQuery=e.target.value.slice(0,100);
  updateBankTransactionList();
},true);
