let deferredPrompt=null;
const KEY_INSTALLED='via_installed';
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;}
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;});
window.addEventListener('appinstalled',()=>{localStorage.setItem(KEY_INSTALLED,'1');document.getElementById('installedMsg')?.classList.remove('hidden');});
window.addEventListener('DOMContentLoaded',()=>{
  const btnInstall=document.getElementById('btnInstall');
  const btnReset=document.getElementById('btnReset');
  if(isStandalone()||localStorage.getItem(KEY_INSTALLED)==='1'){document.getElementById('installedMsg')?.classList.remove('hidden');}
  btnInstall?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;});
  btnReset?.addEventListener('click',async()=>{
    if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs){await r.unregister();}}
    if('caches' in window){const keys=await caches.keys();for(const k of keys){await caches.delete(k);}}
    location.reload();
  });
});