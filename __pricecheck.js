function toCents(raw){
  const m=/^(\d+)(?:\.(\d{1,2}))?$/.exec(raw.trim());
  if(!m) throw new Error('rejected');
  const [,w,f='']=m;
  return Number(w)*100+Number(f.padEnd(2,'0'));
}
const cases=['150','150.00','150.10','0.50','0.001','0.1','.5','1e2','abc','15000.999',' 150 '];
for(const c of cases){
  let out; try{ out=toCents(c)+' cents'; }catch{ out='REJECTED'; }
  console.log(JSON.stringify(c).padEnd(12),'->',out);
}
