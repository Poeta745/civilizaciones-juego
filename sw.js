// Caché persistente: motor de voz Piper (cache-first) y página (red primero, caché si no hay internet)
const C="civ-v1";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
 const p=u.pathname;const piper=p.includes("/piper/")&&!/\.onnx(\.part\d+)?$/.test(p);
 if(piper){e.respondWith(caches.open(C).then(async c=>{const h=await c.match(e.request,{ignoreSearch:true});if(h)return h;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r;}));return;}
 if(e.request.mode==="navigate"||p.endsWith("/")||p.endsWith("index.html")){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const rc=r.clone();caches.open(C).then(c=>c.put(new Request(u.origin+u.pathname),rc));}return r;}).catch(()=>caches.match(new Request(u.origin+u.pathname)).then(h=>h||caches.match(u.origin+u.pathname.replace(/index\.html$/,"")))));}
});
