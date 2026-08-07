const url=require('url'); const orig=url.parse; let hits=[];
url.parse=function(...a){ hits.push(a[0]); return orig.apply(this,a); };
const net=require('net'), express=require('express');
const NEEDS=/^[^/]|[\t\n\f\r # ﻿]/;
function normalizeRequestUrl(req,_res,next){
  const raw=req.url;
  if(typeof raw!=='string'||raw.length===0){req.url='/';return next();}
  if(!NEEDS.test(raw))return next();
  req.rawRequestUrl=raw; let n;
  try{const p=new URL(raw,'http://localhost'); n=`${p.pathname}${p.search}`;}catch{n='/';}
  req.url=n; req.originalUrl=n; next();
}
const app=express();
app.use(normalizeRequestUrl);
app.use((req,res)=>res.json({path:req.path,url:req.url,raw:req.rawRequestUrl??null}));
const s=app.listen(3997,async()=>{
  const targets=['http://example.com/foo','/ok?a=1','/bad path','/frag#x','*','/n bsp'];
  for(const t of targets){
    await new Promise(r=>{const c=net.connect(3997,'127.0.0.1',()=>c.write(`GET ${t} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
      let b='';c.on('data',d=>b+=d);c.on('close',()=>{console.log(JSON.stringify(t).padEnd(26),'->',b.split('\r\n\r\n')[1]||b.split('\n')[0]);r();});c.on('error',e=>{console.log(t,'ERR',e.message);r();});});
  }
  console.log('\nurl.parse calls:',hits.length, hits);
  s.close();
});
