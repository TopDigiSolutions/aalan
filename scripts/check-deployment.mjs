const origin = process.argv[2];
if (!origin || new URL(origin).protocol !== 'https:') throw new Error('Pass the HTTPS deployment origin.');
for (const [path,method] of [['/api/health','GET'],['/api/stripe/webhook','POST'],['/','GET']]) {
  const response = await fetch(new URL(path,origin), {method,redirect:'manual',signal:AbortSignal.timeout(20000)});
  const body = await response.text();
  console.log(JSON.stringify({path,status:response.status,location:response.headers.get('location'),body:body.slice(0,300)}));
}
