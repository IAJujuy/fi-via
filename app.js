// app.js — Reinicio: efecto avatar visible + límites + Share Target
const WELCOME_CLEAN = 5;
const FREE_DAILY = 10;
const INSTALL_SEEN_KEY = 'via_install_seen';

const KEYS = {
  usesDay: 'via_free_day_count',
  usesDayDate: 'via_free_day_date',
  clean: 'via_clean_credits',
  plan: 'via_plan',
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
  const d = document.getElementById('dailyLeft'); if (d) d.textContent = String(getDailyLeft());
  const c = document.getElementById('cleanLeft'); if (c) c.textContent = String(getCleanCredits());
  const plan = localStorage.getItem(KEYS.plan);
  const pt = document.getElementById('planTag'); if (pt) pt.textContent = plan === 'pro' ? 'PRO' : (plan === 'creator' ? 'Creator+' : 'Free');
}

/** Avatar effect: posterize + sobel edges overlay */
function avatarize(img, canvas){
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size)/2;
  const sy = (img.height - size)/2;

  // Draw image to offscreen
  const off = document.createElement('canvas');
  off.width = 512; off.height = 512;
  const octx = off.getContext('2d');
  octx.drawImage(img, sx, sy, size, size, 0,0, off.width, off.height);

  // Posterize
  const imgData = octx.getImageData(0,0,off.width, off.height);
  const data = imgData.data;
  const levels = 6; // reduce to 6 tones
  for (let i=0; i<data.length; i+=4){
    for (let c=0; c<3; c++){
      const v = data[i+c];
      const q = Math.round((v/255)*(levels-1))*(255/(levels-1));
      data[i+c] = q;
    }
    // soft saturation boost
    const r=data[i], g=data[i+1], b=data[i+2];
    const maxc = Math.max(r,g,b), minc = Math.min(r,g,b);
    const sat = maxc - minc;
    data[i]   = Math.min(255, r + sat*0.05);
    data[i+1] = Math.min(255, g + sat*0.05);
    data[i+2] = Math.min(255, b + sat*0.05);
  }
  octx.putImageData(imgData, 0,0);

  // Sobel edge detection on grayscale
  const gray = octx.getImageData(0,0,off.width, off.height);
  const gd = gray.data;
  const w = off.width, h = off.height;
  const gxK = [-1,0,1,-2,0,2,-1,0,1];
  const gyK = [-1,-2,-1,0,0,0,1,2,1];
  const mag = new Uint8ClampedArray(w*h);
  for (let y=1; y<h-1; y++){
    for (let x=1; x<w-1; x++){
      let gx=0, gy=0, idx=0;
      for (let ky=-1; ky<=1; ky++){
        for (let kx=-1; kx<=1; kx++){
          const px = ((y+ky)*w + (x+kx)) * 4;
          const lum = (gd[px]*0.299 + gd[px+1]*0.587 + gd[px+2]*0.114);
          gx += lum * gxK[idx];
          gy += lum * gyK[idx];
          idx++;
        }
      }
      const m = Math.sqrt(gx*gx + gy*gy);
      mag[y*w + x] = m>255?255:m;
    }
  }

  // Draw to target canvas
  const ctx = canvas.getContext('2d');
  canvas.width = 960; canvas.height = 960;
  // background
  ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0,0,canvas.width, canvas.height);
  // rounded mask
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

  // scaled posterized
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0,0, off.width, off.height, 0,0, canvas.width, canvas.height);

  // edge overlay
  const edge = ctx.getImageData(0,0,canvas.width, canvas.height);
  const ed = edge.data;
  const scaleX = canvas.width / w;
  const scaleY = canvas.height / h;
  for (let y=0; y<canvas.height; y++){
    for (let x=0; x<canvas.width; x++){
      const sx2 = Math.floor(x/scaleX);
      const sy2 = Math.floor(y/scaleY);
      const m = mag[sy2*w + sx2];
      if (m > 100){
        const i = (y*canvas.width + x)*4;
        ed[i]   = Math.max(0, ed[i]-m*0.5);
        ed[i+1] = Math.max(0, ed[i+1]-m*0.5);
        ed[i+2] = Math.max(0, ed[i+2]-m*0.5);
      }
    }
  }
  ctx.putImageData(edge, 0,0);

  // vignette / bloom
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height*0.4, canvas.width*0.1, canvas.width/2, canvas.height/2, canvas.width*0.7);
  grad.addColorStop(0, 'rgba(90,150,255,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.restore();

  // border
  ctx.lineWidth = 12;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeRect(6,6,canvas.width-12, canvas.height-12);
}

function drawWatermark(ctx, canvas){
  const text = 'VIA • iajujuy.github.io/fi-via';
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(-Math.PI/6);
  ctx.font = 'bold 64px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, 0);
  ctx.restore();

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
      avatarize(img, canvas);

      const ctx = canvas.getContext('2d');
      let noWM = false;
      if (isPro()) noWM = true;
      else if (getCleanCredits()>0){ noWM = true; consumeClean(); }
      if (!noWM) drawWatermark(ctx, canvas);

      if (!isPro()) consumeDaily();
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

function hideInstallUI(){
  const btn = document.getElementById('install');
  if (btn){ btn.disabled = true; btn.style.opacity = 0.65; }
  const b = document.getElementById('installedBadge');
  if (b) b.hidden = false;
  localStorage.setItem(INSTALL_SEEN_KEY, '1');
}

function setup(){
  initDefaults();
  updateUI();

  if (window.matchMedia('(display-mode: standalone)').matches){ hideInstallUI(); }
  if (localStorage.getItem(INSTALL_SEEN_KEY) === '1'){
    const btn = document.getElementById('install');
    if (btn) { btn.style.display = 'none'; }
  }

  const input = document.getElementById('file');
  input.addEventListener('change', ()=>{
    if (!isPro() && getDailyLeft() <= 0){ showToast('Límite diario Free.'); return; }
    const file = input.files && input.files[0];
    if (file) renderFromFile(file);
  });

  // Download
  const canvas = document.getElementById('canvas');
  const dl = document.getElementById('dl');
  const dl2 = document.getElementById('dl2');
  canvas.addEventListener('click', downloadCanvas);
  if (dl) dl.addEventListener('click', (e)=>{ e.preventDefault(); downloadCanvas(); });
  if (dl2) dl2.addEventListener('click', (e)=>{ e.preventDefault(); downloadCanvas(); });

  // Receive file from Share Target (SW posts a message with blob URL)
  navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', (event)=>{
    if (event.data && event.data.type === 'share-image'){
      fetch(event.data.url).then(r=>r.blob()).then(blob=>{
        renderFromFile(new File([blob], 'shared.jpg', {type: blob.type}));
      });
    }
  });

  // Android 13+ launchQueue consumer (backup)
  if ('launchQueue' in window && 'files' in window){
    window.launchQueue.setConsumer(launchParams => {
      if (!launchParams.files?.length) return;
      launchParams.files[0].getFile().then(file => renderFromFile(file));
    });
  }
}

window.addEventListener('DOMContentLoaded', setup);
