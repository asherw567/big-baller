import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const read = name => readFile(new URL('../site/'+name,import.meta.url),'utf8');
test('mobile UI preserves balance, transactions and working navigation',async()=>{
  const app={innerHTML:'',listeners:{},contains:()=>true,addEventListener(name,callback,capture){(this.listeners[name]??=[]).push({callback,capture})}};
  const store={};
  const localStorage={getItem:key=>store[key]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:key=>delete store[key]};
  const context=vm.createContext({
    document:{querySelector:key=>key==='#app'?app:key==='#toast'?{classList:{add(){},remove(){}},textContent:''}:null,addEventListener(){},body:{append(){}}},
    window:{scrollTo(){}},localStorage,sessionStorage:{getItem(){return null},setItem(){}},
    navigator:{},crypto:{getRandomValues:arr=>arr},TextEncoder,TextDecoder,console,
    setTimeout(){},clearTimeout(){},requestAnimationFrame(){},Date,Intl,Uint8Array,Array,Number,String,Map,Set,JSON,Math,Error,Promise,atob,btoa
  });
  vm.runInContext(await read('app.js'),context,{filename:'app.js'});
  vm.runInContext(await read('ui-polish.js'),context,{filename:'ui-polish.js'});
  const js=code=>vm.runInContext(code,context);
  assert.match(js('subHeader("Deposit")'),/Need help/);
  assert.ok(js('depositScreen()').includes('Available balance $0.00'));
  assert.match(js('transferScreen()'),/Send money/);
  assert.match(js('menuScreen()'),/Security Center/);
  js('state.unlocked=true;state.view="accounts";render()');
  assert.ok(app.innerHTML.includes('$0.00'));
  assert.ok(app.innerHTML.includes('Everyday Checking ••••8787'));
  assert.ok(!app.innerHTML.includes('section-eyebrow">Your accounts'));
  assert.match(app.innerHTML, /<button class="account-title"[^>]*aria-label="View Everyday Checking account ending in 8787"/);
  assert.match(app.innerHTML,/Recent transactions/);
  const ui=(await read('ui-polish.css'));
  assert.match(ui,/\.greeting\{[^}]*margin:0 0 20px/);
  assert.match(ui,/\.account-outer \.balance\{font:300 32px/);
  assert.ok(app.innerHTML.indexOf('Open an account') < app.innerHTML.indexOf('Recent transactions'), 'product module should follow checking card before transaction list');
  assert.ok(app.innerHTML.indexOf('Everyday Checking ••••8787') < app.innerHTML.indexOf('Open an account'));

  for(const [view,selector] of [['deposit','deposit-photos'],['transfer','transfer-grid'],['menu','menu-profile']]){
    js('state.view='+JSON.stringify(view)+';render()');
    assert.match(app.innerHTML,new RegExp(selector));
  }
  js('state.view="deposit";render()');
  const click=app.listeners.click.find(listener=>listener.capture===true).callback;
  for(const action of ['deposit-photo-front','deposit-photo-back']){
    click({target:{closest:()=>({dataset:{action}})},preventDefault(){},stopImmediatePropagation(){}});
  }
  assert.equal(js('state.depositFront&&state.depositBack'),true);
  js('state.depositAmount="10";render()');
  assert.match(app.innerHTML,/id="deposit-submit"[^>]*>Deposit/);
  assert.doesNotMatch(app.innerHTML,/id="deposit-submit"[^>]*disabled/);
  assert.equal(js('TRANSACTIONS.reduce((sum,t)=>sum+t.amount,0)'),0);
});
