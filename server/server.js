// Civilizaciones 3000 a.C.–2026 · servidor en línea (relé WebSocket, anfitrión autoritativo)
// Salas con código, reconexión al mismo asiento (lo resuelve el anfitrión por pid), espectadores,
// último estado guardado en disco para que la sala sobreviva a caídas del anfitrión o reinicios.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {WebSocketServer}=require('ws');
const PORT=+(process.env.PORT||8080),DATA_DIR=process.env.DATA_DIR||path.join(__dirname,'rooms');fs.mkdirSync(DATA_DIR,{recursive:true});
const TTL=7*864e5;const rooms={};const T0=Date.now();
const file=c=>path.join(DATA_DIR,c.replace(/[^A-Z0-9]/g,'')+'.json');
function load(c){if(rooms[c])return rooms[c];try{const o=JSON.parse(fs.readFileSync(file(c),'utf8'));if(Date.now()-o.updated>TTL)return null;return rooms[c]={code:c,hostPid:o.hostPid,last:o.last,updated:o.updated,host:null,guests:new Map()};}catch(e){return null;}}
const dirty=new Set();setInterval(()=>{for(const c of dirty){const R=rooms[c];if(!R)continue;try{fs.writeFileSync(file(c)+'.tmp',JSON.stringify({code:c,hostPid:R.hostPid,last:R.last,updated:R.updated}));fs.renameSync(file(c)+'.tmp',file(c));}catch(e){console.error('persist',e.message);}}dirty.clear();},2000);
setInterval(()=>{for(const c in rooms){const R=rooms[c];if(!R.host&&!R.guests.size&&Date.now()-R.updated>TTL){delete rooms[c];try{fs.unlinkSync(file(c))}catch(e){}}}},36e5);
const send=(ws,o)=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));};
const server=http.createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');
 if(req.url.startsWith('/health')){let g=0,h=0;for(const c in rooms){g+=rooms[c].guests.size;if(rooms[c].host)h++;}res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,service:'civilizaciones-online',rooms:Object.keys(rooms).length,hosts:h,guests:g,uptime:Math.round((Date.now()-T0)/1000)}));}
 res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('Servidor en línea de Civilizaciones 3000 a.C.–2026. Juega en https://poeta745.github.io/civilizaciones-juego/');});
const wss=new WebSocketServer({server,path:'/ws',maxPayload:16*1024*1024});
wss.on('connection',ws=>{ws.alive=true;ws.on('pong',()=>ws.alive=true);
 ws.on('message',buf=>{let m;try{m=JSON.parse(buf);}catch(e){return;}const code=String(m.room||ws.room||'').toUpperCase().slice(0,12);
  if(m.t==='hosthello'){let R=load(code);if(R&&R.host&&R.host!==ws&&R.host.readyState===1&&R.hostPid!==m.pid)return send(ws,{t:'err',k:'unavailable-id',m:'Ese código de sala ya está en uso.'});
   if(!R)R=rooms[code]={code,hostPid:m.pid,last:null,updated:Date.now(),host:null,guests:new Map()};
   if(R.host&&R.host!==ws){try{R.host.close()}catch(e){}}R.host=ws;R.hostPid=m.pid;R.updated=Date.now();ws.room=code;ws.role='host';dirty.add(code);send(ws,{t:'ok'});
   for(const [cid,g] of R.guests){send(ws,{t:'join',cid});send(g,{t:'hostup'});}return;}
  if(m.t==='join'){const R=load(code);if(!R||(!R.host&&!R.last))return send(ws,{t:'err',k:'peer-unavailable',m:'No existe la sala '+code+'.'});
   if(ws.cid&&R.guests.get(ws.cid)===ws){R.guests.delete(ws.cid);if(R.host)send(R.host,{t:'leave',cid:ws.cid});}
   const cid=crypto.randomBytes(6).toString('hex');ws.cid=cid;ws.room=code;ws.role='guest';R.guests.set(cid,ws);send(ws,{t:'ok',cid,host:!!R.host});
   if(R.host){send(R.host,{t:'join',cid});send(ws,{t:'hostup'});}else{if(R.last&&ws.gotLast!==R.updated){ws.gotLast=R.updated;send(ws,{t:'msg',d:R.last});}send(ws,{t:'hostdown'});}return;}
  const R=rooms[ws.room];if(!R)return;
  if(ws.role==='host'&&R.host===ws){if(m.t==='to'){if(typeof m.d==='string'&&m.d.startsWith('{"t":"state"')){R.last=m.d;R.updated=Date.now();dirty.add(R.code);}send(R.guests.get(m.cid),{t:'msg',d:m.d});}else if(m.t==='kick'){const g=R.guests.get(m.cid);if(g)try{g.close()}catch(e){}}return;}
  if(ws.role==='guest'&&m.t==='msg'&&R.guests.get(ws.cid)===ws){if(R.host)send(R.host,{t:'msg',cid:ws.cid,d:m.d});else send(ws,{t:'hostdown'});}
 });
 ws.on('close',()=>{const R=rooms[ws.room];if(!R)return;if(ws.role==='host'&&R.host===ws){R.host=null;for(const g of R.guests.values())send(g,{t:'hostdown'});}
  if(ws.role==='guest'&&R.guests.get(ws.cid)===ws){R.guests.delete(ws.cid);if(R.host)send(R.host,{t:'leave',cid:ws.cid});}});
});
setInterval(()=>wss.clients.forEach(ws=>{if(!ws.alive)return ws.terminate();ws.alive=false;try{ws.ping()}catch(e){}}),25000);
server.listen(PORT,()=>console.log('civilizaciones-online en puerto',PORT,'datos',DATA_DIR));
