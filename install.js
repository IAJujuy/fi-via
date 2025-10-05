// install.js — prompt de instalación PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('install');
  btn.disabled = false;
  btn.addEventListener('click', async ()=>{
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
});

window.addEventListener('appinstalled', ()=>{
  const b = document.getElementById('installedBadge');
  if (b) b.hidden = false;
});
