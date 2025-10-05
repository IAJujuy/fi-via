// app.js — HÍBRIDO: Free con marca de agua + 5 créditos limpios + 10/día
const WELCOME_CLEAN = 5;     // créditos sin marca de bienvenida
const FREE_DAILY = 10;       // límite diario en Free
const CANVAS_SIZE = 960;

const KEYS = {
  usesDay: 'via_free_day_count',
  usesDayDate: 'via_free_day_date',
  clean: 'via_clean_credits',
  plan: 'via_plan', // 'free' | 'pro' | 'creator'
};

function todayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function initDefaults(){
  if (!localStorage.getItem(KEYS.clean)){
    localStorage.setItem(KEYS.clean, String(WELCOME_CLEAN));
  }
  if (!localStorage.getItem(KEYS.plan)){
    localStorage.setItem(KEYS.plan, 'free');
  }
  const d = localStorage.getItem(KEYS.usesDayDate);
  if (d !== todayStr()){
    localStorage.setItem(KEYS.usesDayDate, todayStr());
    localStorage.setItem(KEYS.usesDay, '0');
  }
}

function isPro(){
  const p = localStorage.getItem(KEYS.plan);
  return p === 'pro' || p === 'creator';
}

function getDailyLeft(){
  const used = parseInt(localStorage.getItem(KEYS.usesDay) || '0', 10);
  return Math.max(0, FREE_DAILY - used);
}

function consumeDaily(){
  const used = parseInt(localStorage.getItem(KEYS.usesDay) || '0', 10) + 1;
  localStorage.setItem(KEYS.usesDay, String(used));
}

function getCleanCredits(){
  return parseInt(localStorage.getItem(KEYS.clean) || '0', 10);
}
function consumeClean(){
  const left = Math.max(0, getCleanCredits()-1);
  localStorage.setItem(KEYS.clean, String(left));
}

function setPlan(p){
  localStorage.setItem(KEYS.plan, p);
  const tag = document.getElementById('planTag');
  tag.textContent = p === 'pro' ? 'PRO' : (p === 'creator' ? 'Creator+' : 'Free');
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(()=> t.style.display='none', 2200);
}

function updateUI(){
  document.getElementById('dailyLeft').textContent = String(getDailyLeft());
  document.getElementById('cleanLeft').textContent = String(getCleanCredits());
  const plan = localStorage.getItem(KEYS.plan);
  document.getElementById('planTag').textContent = plan === 'pro' ? 'PRO' : (plan === 'creator' ? 'Creator+' : 'Free');
}

function blockedFree(){
  if (isPro()) return false;
  if (getDailyLeft() <= 0){
    showToast('Límite diario Free alcanzado. Suscribite para más.');
    return true;
  }
  return false;
}

function applyAvatarEffect(ctx, canvas, img){
  // Fondo
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(0,0,canvas.width, canvas.height);

  // Fit image square
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size)/2;
  const sy = (img.height - size)/2;

  // Marco redondeado
  const r = canvas.width * 0.18;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, r);
  ctx.arcTo(0,0,r,0,r);
  ctx.arcTo(canvas.width,0,canvas.width,r,r);
  ctx.arcTo(canvas.width,canvas.height,canvas.width-r,canvas.height,r);
  ctx.arcTo(0,canvas.height,0,canvas.height-r,r);
  ctx.closePath();
  ctx.clip();

  // Imagen
  ctx.drawImage(img, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

  // Bloom suave
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height*0.4, canvas.width*0.1, canvas.width/2, canvas.height/2, canvas.width*0.7);
  grad.addColorStop(0, 'rgba(90,150,255,0.12)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.restore();

  // Borde blanco
  ctx.lineWidth = 12;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeRect(6,6,canvas.width-12, canvas.height-12);
}

function drawWatermark(ctx, canvas){
  // Marca diagonal VIA + URL
  const text = 'VIA • iajujuy.github.io/fi-via';
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(-Math.PI/6);
  ctx.font = 'bold 64px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // Mini sello abajo
  ctx.save();
  ctx.font = '600 28px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('VIA', 24, canvas.height - 28);
  ctx.restore();
}

function renderFromFile(file){
  const reader = new FileReader();
  reader.onload = e=>{
    const img = new Image();
    img.onload = ()=>{
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      applyAvatarEffect(ctx, canvas, img);

      let withoutWatermark = false;
      if (isPro()){
        withoutWatermark = true;
      } else if (getCleanCredits() > 0){
        withoutWatermark = true;
        consumeClean();
      } else {
        withoutWatermark = false;
      }

      if (!withoutWatermark){
        drawWatermark(ctx, canvas);
      }

      if (!isPro()){
        consumeDaily();
      }
      updateUI();
      showToast('Avatar generado.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


function downloadCanvas(){
  const canvas = document.getElementById('canvas');
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'via-avatar.png';
  a.click();
}

function setup(){
  initDefaults();
  updateUI();

  // Instalación
  if (window.matchMedia('(display-mode: standalone)').matches){
    document.getElementById('installedBadge').hidden = false;
  }

  // File input
  const input = document.getElementById('file');
  input.addEventListener('change', ()=>{
    if (!isPro() && blockedFree()) return;
    const file = input.files && input.files[0];
    if (file) renderFromFile(file);
  });

  // Download buttons
  const canvas = document.getElementById('canvas');
  canvas.addEventListener('click', downloadCanvas);
  const dl = document.getElementById('dl');
  if (dl) dl.addEventListener('click', (e)=>{ e.preventDefault(); downloadCanvas(); });
  const dl2 = document.getElementById('dl2');
  if (dl2) dl2.addEventListener('click', (e)=>{ e.preventDefault(); downloadCanvas(); });
}

window.addEventListener('DOMContentLoaded', setup);
