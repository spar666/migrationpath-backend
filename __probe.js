const url = require('url');
const orig = url.parse;
url.parse = function (...a) {
  console.log('\n>>> url.parse CALLED with:', JSON.stringify(a[0]));
  console.log(new Error('here').stack.split('\n').slice(1,10).join('\n'));
  return orig.apply(this, a);
};
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const app = express();
app.use(helmet());
app.use(compression());
app.use('/docs', swaggerUi.serve, swaggerUi.setup({openapi:'3.0.0',info:{title:'t',version:'1'},paths:{}}));
app.get('/health', (req,res)=>res.json({ok:true}));
app.use((req,res)=>res.json({p:req.path}));
const s = app.listen(3999, async () => {
  for (const p of ['/health','/docs/','/api/v1/x?a=1','/docs/swagger-ui-init.js']) {
    try { await fetch('http://127.0.0.1:3999'+p); console.log('hit', p); } catch(e){ console.log('err',p,e.message); }
  }
  s.close();
});
