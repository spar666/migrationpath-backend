const url=require('url'); const orig=url.parse; let hits=[];
url.parse=function(...a){ hits.push(a[0]); return orig.apply(this,a); };
const net=require('net'), http=require('http'), express=require('express');
const NEEDS=/^[^/]|[\t\n\f\r # ﻿]/;
function normalize(req){
  const raw=req.url;
  if(typeof raw!=='string'||raw.length===0){req.url='/';return;}
  if(!NEEDS.test(raw))return;
  req.rawRequestUrl=raw; let n;
  try{const p=new URL(raw,'http://localhost'); n=`${p.pathname}${p.search}`;}catch{n='/';}
  req.url=n;
}
const app=express();
app.use((req,res)=>res.json({path:req.path,url:req.url,orig:req.originalUrl,raw:req.rawRequestUrl??null}));
const server=http.createServer(app);          // mirrors what Nest does
server.prependListener('request',(req)=>normalize(req));
server.listen(3996,async()=>{
  for(const t of ['http://example.com/foo','/ok?a=1','/frag#x','*','/plain']){
    await new Promise(r=>{const c=net.connect(3996,'127.0.0.1',()=>c.write(`GET ${t} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
      let b='';c.on('data',d=>b+=d);c.on('close',()=>{console.log(JSON.stringify(t).padEnd(26),'->',(b.split('\r\n\r\n')[1]||b.split('\n')[0]).trim());r();});c.on('error',e=>{console.log(t,'ERR',e.message);r();});});
  }
  console.log('\nurl.parse calls:',hits.length,hits);
  server.close();
});
