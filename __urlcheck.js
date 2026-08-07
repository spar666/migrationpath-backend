const WEBHOOK_PATH='/api/v1/webhooks/stripe';
function urlProblems(raw){
  const problems=[]; let url;
  try{ url=new URL(raw); }catch{ return [`"${raw}" is not a valid URL.`]; }
  if(url.pathname.endsWith('/')&&url.pathname!=='/') problems.push('TRAILING SLASH -> 308, deliveries fail');
  if(url.protocol!=='https:') problems.push('not https');
  const path=url.pathname.replace(/\/+$/,'');
  if(path!==WEBHOOK_PATH) problems.push(`wrong path "${path}"`);
  return problems;
}
const cases=[
 'https://migrationpath-backend.vercel.app/api/v1/webhooks/stripe',
 'https://migrationpath-backend.vercel.app/api/v1/webhooks/stripe/',
 'http://migrationpath-backend.vercel.app/api/v1/webhooks/stripe',
 'https://migrationpath.vercel.app/api/v1/webhooks/stripe',
 'https://migrationpath-backend.vercel.app/webhooks/stripe',
 'not a url',
];
for(const c of cases){ const p=urlProblems(c); console.log((p.length?'BAD ':'ok  ')+c); p.forEach(x=>console.log('       - '+x)); }
