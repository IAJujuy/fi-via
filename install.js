// install.js — controla el prompt de instalación una sola vez
let deferredPrompt = null;

// Helpers de estado
const KEY_DISMISSED = 'via_install_dismissed';
const KEY_INSTALLED = 'via_installed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

// Mostrar la tarjeta si corresponde
function maybeShowInstallCard() {
  const card = document.getElementById('installCard');
  const installedMsg = document.getElementById('installedMsg');
  const dismissed = localStorage.getItem(KEY_DISMISSED) === '1';

  if (isStandalone() || localStorage.getItem(KEY_INSTALLED) === '1') {
    installedMsg.classList.remove('hidden');
    card.classList.add('hidden');
    return;
  }
  if (dismissed) {
    card.classList.add('hidden');
    return;
  }
  if (deferredPrompt) {
    card.classList.remove('hidden');
  }
}

// Captura del evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  maybeShowInstallCard();
});

// Detectar app instalada
window.addEventListener('appinstalled', () => {
  localStorage.setItem(KEY_INSTALLED, '1');
  const card = document.getElementById('installCard');
  const installedMsg = document.getElementById('installedMsg');
  card.classList.add('hidden');
  installedMsg.classList.remove('hidden');
});

// Botones
window.addEventListener('DOMContentLoaded', () => {
  const btnInstall = document.getElementById('btnInstall');
  const btnLater = document.getElementById('btnLater');

  btnInstall?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    // Se haya aceptado o no, no volver a mostrar
    localStorage.setItem(KEY_DISMISSED, '1');
    document.getElementById('installCard').classList.add('hidden');
  });

  btnLater?.addEventListener('click', () => {
    localStorage.setItem(KEY_DISMISSED, '1');
    document.getElementById('installCard').classList.add('hidden');
  });

  // Fallback en iOS: mostrar instrucciones una sola vez si no hay beforeinstallprompt
  setTimeout(() => {
    if (!deferredPrompt && !isStandalone() && !localStorage.getItem(KEY_DISMISSED)) {
      // En iOS no hay prompt; se podría mostrar una hoja con instrucciones.
      // Acá respetamos “no volver a mostrar” sin forzar instrucciones.
      // Dejar oculto por defecto para no molestar.
    }
  }, 1500);

  maybeShowInstallCard();
});
