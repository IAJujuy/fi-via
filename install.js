// install.js — robust install with fallback
let deferredPrompt = null;

function showHelp(show){
  const el = document.getElementById('installHelp');
  if (el) el.style.display = show ? 'inline' : 'none';
}
function hideInstallButton(){
  const btn = document.getElementById('install');
  if (btn){
    btn.disabled = true;
    btn.style.opacity = 0.65;
  }
}
function showInstalledBadge(){
  const b = document.getElementById('installedBadge');
  if (b) b.hidden = false;
}
function maybeStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
window.addEventListener('DOMContentLoaded', ()=>{
  if (maybeStandalone()){ hideInstallButton(); showInstalledBadge(); }
});
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('install');
  if (btn){
    btn.disabled = false;
    btn.style.opacity = 1;
    btn.addEventListener('click', async ()=>{
      if (!deferredPrompt){ showHelp(true); return; }
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted'){ showInstalledBadge(); hideInstallButton(); }
      deferredPrompt = null;
    }, { once:true });
  }
  showHelp(false);
});
window.addEventListener('click', (ev)=>{
  if (ev.target && ev.target.id === 'install' && !deferredPrompt && !maybeStandalone()){
    showHelp(true);
  }
});
window.addEventListener('appinstalled', ()=>{ showInstalledBadge(); hideInstallButton(); });
