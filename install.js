let deferredPrompt=null;
const KEY_DISMISSED='via_install_dismissed';
const KEY_INSTALLED='via_installed';
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone;}
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;});
window.addEventListener('appinstalled',()=>{localStorage.setItem(KEY_INSTALLED,'1');document.getElementById('installedMsg')?.classList.remove('hidden');});
window.addEventListener('DOMContentLoaded',()=>{
  const installBtn=document.getElementById('btnInstall');
  if(isStandalone()||localStorage.getItem(KEY_INSTALLED)==='1'){document.getElementById('installedMsg')?.classList.remove('hidden');}
  installBtn?.addEventListener('click',async()=>{
    if(!deferredPrompt){localStorage.setItem(KEY_DISMISSED,'1');return;}
    deferredPrompt.prompt();await deferredPrompt.userChoice;localStorage.setItem(KEY_DISMISSED,'1');deferredPrompt=null;
  });
});