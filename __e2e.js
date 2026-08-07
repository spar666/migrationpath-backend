const url=require('url'); const orig=url.parse; const hits=[];
url.parse=function(...a){hits.push(a[0]);return orig.apply(this,a);};
const {installRequestUrlNormalizer}=require('/tmp/nrm/normalize-request-url.middleware.js');
const net=require('net'),http=require('http'),express=require('express'),helmet=require('helmet'),compression=require('compression');
const app=express(); app.use(helmet()); app.use(compression());
app.get('/health',(req,res)=>res.json({ok:true}));
app.use((req,res)=>res.status(200).json({path:req.path,url:req.url,orig:req.originalUrl,raw:req.rawRequestUrl??null}));
const server=http.createServer(app);
installRequestUrlNormalizer(server);           // <-- the fix, as shipped
server.listen(3995,async()=>{
  const cases=['/health','/api/v1/users?page=2','http://evil.example/admin','/x#frag','*','','//a\tb','/ok'];
  for(const t of cases){
    await new Promise(r=>{const c=net.connect(3995,'127.0.0.1',()=>c.write(`GET ${t} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
      let b='';c.on('data',d=>b+=d);c.on('close',()=>{const st=b.split('\r\n')[0];const body=(b.split('\r\n\r\n')[1]||'').trim();
        console.log(JSON.stringify(t).padEnd(28),st.padEnd(24),body.slice(0,110));r();});c.on('error',e=>{console.log(JSON.stringify(t),'ERR',e.message);r();});});
  }
  console.log('\n>>> url.parse invocations:',hits.length,hits);
  server.close();
});
