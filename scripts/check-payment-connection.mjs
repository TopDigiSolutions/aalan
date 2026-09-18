import Stripe from 'stripe';
import { randomUUID } from 'node:crypto';
const origin = process.argv[2];
if (!origin || new URL(origin).protocol !== 'https:') throw new Error('Pass the HTTPS deployment origin.');
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { secretKey, webhookSecret } = JSON.parse(input);
if (!secretKey?.startsWith('sk_test_') || !webhookSecret?.startsWith('whsec_')) throw new Error('This check requires test-mode credentials through stdin.');
const stripe = new Stripe(secretKey,{timeout:15000,maxNetworkRetries:0});
try {
  const balance = await stripe.balance.retrieve();
  console.log(JSON.stringify({stripeAuthenticated:true,testMode:balance.livemode === false}));
  // An intentionally unhandled event checks signatures without creating orders or payments.
  const payload = JSON.stringify({id:`evt_connection_${randomUUID()}`,object:'event',type:'aalan.connection_check',data:{object:{}},livemode:false});
  const signature = stripe.webhooks.generateTestHeaderString({payload,secret:webhookSecret});
  const response = await fetch(new URL('/api/stripe/webhook',origin),{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':signature},body:payload,signal:AbortSignal.timeout(15000)});
  const body = await response.json();
  console.log(JSON.stringify({signedWebhookStatus:response.status,received:body.received === true}));
  if (!response.ok) process.exitCode=1;
} catch (error) {
  console.error(JSON.stringify({checkFailed:true,type:error.type ?? error.name,status:error.statusCode ?? null}));
  process.exitCode=1;
}
