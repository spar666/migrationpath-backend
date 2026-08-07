const url = require('url'); const orig = url.parse;
url.parse = function(...a){ console.log('\n>>> url.parse:', JSON.stringify(a[0])); console.log(new Error().stack.split('\n').slice(1,8).join('\n')); return orig.apply(this,a); };
const net=require('net');
const express=require('express'); const app=express();
app.use((req,res)=>res.json({p:req.path}));
const s=app.listen(3998, ()=>{
  // absolute-form request URI (proxy style) -> does not start with "/"
  const c=net.connect(3998,'127.0.0.1',()=>{ c.write('GET http://example.com/foo HTTP/1.1\r\nHost: x\r\n\r\n'); });
  c.on('data',()=>{ c.end(); s.close(); });
});
