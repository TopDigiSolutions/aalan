import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { createApp } from './app.mjs';
import { openStore } from './store.mjs';
const token=randomUUID();
const sessionId='cs_test_scenarios123456';
const cart=[{id:'men-1',size:'M',quantity:1}];
async function fixture(t, changes={}) {
  const store=openStore(':memory:');
  const state={session:{id:sessionId,client_reference_id:token,metadata:{store:'aalan'},mode:'payment',status:'open',payment_status:'unpaid',amount_total:12900,currency:'usd',url:'https://checkout.stripe.com/c/pay/example',...changes},creates:0,retrieves:0};
  const stripe={webhooks:new Stripe('sk_test_dummy').webhooks,checkout:{sessions:{
    retrieve:async () => {state.retrieves++;return state.session;},
    create:async () => {state.creates++;return {id:sessionId,url:'https://checkout.stripe.com/c/pay/cached'};},
    listLineItems:async () => ({data:[{description:'Oversized Bomber / M',quantity:1,amount_total:12900}],has_more:false}),
  }}};
  const secret='whsec_scenario';
  const server=createApp({stripe,store,origin:'http://localhost:5173',webhookSecret:secret}).listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  t.after(async () => {await new Promise(resolve => server.close(resolve));store.close();});
  const url=`http://127.0.0.1:${server.address().port}`;
  return {store,stripe,state,url,
    checkout:() => fetch(`${url}/api/checkout`,{method:'POST',headers:{Origin:'http://localhost:5173','Content-Type':'application/json','Idempotency-Key':token},body:JSON.stringify({items:cart})}),
    confirm:() => fetch(`${url}/api/orders/${sessionId}`,{headers:{'X-Checkout-Token':token}}),
    webhook:(type) => {const payload=JSON.stringify({id:`evt_${randomUUID()}`,type,data:{object:{id:sessionId}}});return fetch(`${url}/api/stripe/webhook`,{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':stripe.webhooks.generateTestHeaderString({payload,secret})},body:payload});},
  };
}
for (const [expected,change] of [
  ['pending',{}],
  ['pending',{status:'complete'}],
  ['pending',{payment_intent:{status:'processing'}}],
  ['failed',{payment_intent:{status:'requires_payment_method',last_payment_error:{code:'card_declined'}}}],
  ['requires_action',{payment_intent:{status:'requires_action'}}],
  ['canceled',{payment_intent:{status:'canceled'}}],
  ['expired',{status:'expired'}],
]) test(`confirmation: ${expected} (${JSON.stringify(change)}) preserves unpaid state`,async t => {
  const f=await fixture(t,change);
  const response=await f.confirm();
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.status,expected);assert.equal(body.order,null);assert.equal(f.store.order(sessionId),undefined);
});
test('completed paid session records once and survives repeated confirmation',async t => {
  const f=await fixture(t,{status:'complete',payment_status:'paid'});
  const first=await (await f.confirm()).json(),second=await (await f.confirm()).json();
  assert.equal(first.status,'paid');assert.equal(first.order.amount,12900);assert.deepEqual(first.order,second.order);
});
test('checkout retry checks current expiry instead of returning cached URL',async t => {
  const f=await fixture(t,{status:'expired'});
  const response=await f.checkout();assert.equal(response.status,409);
  assert.equal((await response.json()).code,'CHECKOUT_EXPIRED');
});
test('retry after completion returns confirmation instead of a second payment link',async t => {
  const f=await fixture(t,{status:'complete',payment_status:'paid'});
  const body=await (await f.checkout()).json();assert.equal(body.status,'complete');assert.equal(body.sessionId,sessionId);assert.equal(body.url,undefined);
});
test('active retry returns fresh current URL',async t => {
  const f=await fixture(t);const body=await (await f.checkout()).json();assert.equal(body.url,'https://checkout.stripe.com/c/pay/example');assert.equal(body.sessionId,sessionId);
});
test('database outage prevents creating a new checkout',async t => {
  const f=await fixture(t);f.store.order=async () => {throw new Error('offline');};
  assert.equal((await f.checkout()).status,500);assert.equal(f.state.creates,0);
});
test('Stripe API failures are retryable and do not expose provider messages',async t => {
  const f=await fixture(t);f.stripe.checkout.sessions.create=async () => {throw new Error('sensitive provider details');};
  const response=await f.checkout();assert.equal(response.status,500);assert.ok(!(await response.text()).includes('sensitive provider'));
});
test('unknown Stripe session becomes a not-found response',async t => {
  const f=await fixture(t);f.stripe.checkout.sessions.retrieve=async () => {throw Object.assign(new Error('missing'),{code:'resource_missing'});};
  assert.equal((await f.confirm()).status,404);
});
test('delayed completion and failure never create unpaid orders; later success records once',async t => {
  const f=await fixture(t,{status:'complete'});
  assert.equal((await f.webhook('checkout.session.completed')).status,200);assert.equal(f.store.order(sessionId),undefined);
  assert.equal((await f.webhook('checkout.session.async_payment_failed')).status,200);assert.equal(f.store.order(sessionId),undefined);
  f.state.session.payment_status='paid';
  const results=await Promise.all([f.webhook('checkout.session.async_payment_succeeded'),f.webhook('checkout.session.async_payment_succeeded')]);
  assert.ok(results.every(response => response.status===200));assert.equal(f.store.order(sessionId).amount,12900);
  assert.equal((await f.webhook('checkout.session.async_payment_failed')).status,200);assert.equal(f.store.order(sessionId).amount,12900);
});
test('database recovery allows webhook retry to save an order',async t => {
  const f=await fixture(t,{status:'complete',payment_status:'paid'});const save=f.store.saveOrder;
  f.store.saveOrder=async () => {throw new Error('temporary failure');};
  assert.equal((await f.webhook('checkout.session.completed')).status,500);assert.equal(f.store.order(sessionId),undefined);
  f.store.saveOrder=save;assert.equal((await f.webhook('checkout.session.completed')).status,200);assert.equal(f.store.order(sessionId).amount,12900);
});
test('unrelated events are harmless and do not call Stripe',async t => {
  const f=await fixture(t);assert.equal((await f.webhook('customer.created')).status,200);assert.equal(f.state.retrieves,0);
});
test('malformed JSON and oversized payloads are rejected',async t => {
  const f=await fixture(t);
  for(const body of ['{','"'+'x'.repeat(17000)+'"']) {const response=await fetch(`${f.url}/api/checkout`,{method:'POST',headers:{Origin:'http://localhost:5173','Content-Type':'application/json'},body});assert.equal(response.status,400);}
});
test('API rate limit returns 429 after the allowed request count',async t => {
  const f=await fixture(t);let response;
  for(let i=0;i<61;i++) response=await fetch(`${f.url}/api/not-found`);
  assert.equal(response.status,429);
});
