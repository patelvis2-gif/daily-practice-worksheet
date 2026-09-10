const CACHE='practice-v72-assets';
const SHELL=['./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const req=event.request;
  const url=new URL(req.url);
  const isMain=req.mode==='navigate' || url.pathname.endsWith('/index.html') || url.pathname==='/' || url.pathname.endsWith('/');
  if(isMain){
    event.respondWith(fetch(req,{cache:'no-store'}).then(resp=>resp).catch(()=>caches.match('./index.html').then(r=>r||Response.error())));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached || fetch(req).then(resp=>{
    if(resp && resp.ok){ const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
    return resp;
  })));
});
