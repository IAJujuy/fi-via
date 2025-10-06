const fileInput=document.getElementById('file');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
const exportRow=document.getElementById('exportRow');
const controls=document.getElementById('controls');
const hint=document.getElementById('hint');
const dl1200=document.getElementById('dl1200');
const dl1080=document.getElementById('dl1080');
const zoom=document.getElementById('zoom');
const expo=document.getElementById('expo');
const cont=document.getElementById('cont');

let currentImg=null;
let faceBox=null;

async function detectFace(imageBitmap){
  if('FaceDetector' in window){
    try{
      const detector=new FaceDetector({fastMode:true, maxDetectedFaces:1});
      const faces=await detector.detect(imageBitmap);
      if(faces && faces[0]){ return faces[0].boundingBox; }
    }catch(_){}
  }
  return null;
}

function drawBackground(w,h){
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0b1626'); g.addColorStop(1,'#0c1725');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
}

function toneMapStart(){
  const e=parseFloat(expo.value||'0');
  const c=parseFloat(cont.value||'1');
  ctx.filter=`brightness(${1+e}) contrast(${c})`;
}
function toneMapEnd(){ ctx.filter='none'; }

function render(size=1200, wm=true){
  if(!currentImg) return;
  canvas.width=size; canvas.height=size;
  const w=size,h=size; drawBackground(w,h);

  const img=currentImg; const z=parseFloat(zoom.value||'1.15');
  let cx=img.width/2, cy=img.height*0.42, d=Math.min(img.width,img.height);
  if(faceBox){
    cx=faceBox.x+faceBox.width/2;
    cy=faceBox.y+faceBox.height/2 - faceBox.height*0.10;
    d=Math.max(faceBox.width, faceBox.height)*3.0;
    d=Math.min(d, Math.min(img.width,img.height));
  }
  d=d/z;
  const sx=Math.max(0, Math.min(img.width-d, cx - d/2));
  const sy=Math.max(0, Math.min(img.height-d, cy - d/2));
  const swh=Math.min(d, img.width, img.height);

  ctx.save(); ctx.filter='blur(24px)'; ctx.globalAlpha=0.28;
  ctx.drawImage(img, sx, sy, swh, swh, 40, 40, w-80, h-80); ctx.restore();

  ctx.save(); ctx.beginPath();
  const r=w*0.40, ccx=w*0.50, ccy=h*0.50;
  ctx.arc(ccx, ccy, r, 0, Math.PI*2); ctx.closePath(); ctx.clip();
  toneMapStart();
  ctx.drawImage(img, sx, sy, swh, swh, ccx-r, ccy-r, r*2, r*2);
  toneMapEnd();
  ctx.restore();

  ctx.lineWidth=Math.max(4,Math.round(w*0.005)); ctx.strokeStyle='#fff';
  ctx.beginPath(); ctx.arc(ccx, ccy, r+ctx.lineWidth/2, 0, Math.PI*2); ctx.stroke();

  if(wm){
    const pad=Math.round(w*0.04); const fontSize=Math.round(w*0.06);
    ctx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.fillStyle='rgba(255,255,255,0.85)'; const text='VIA';
    const tw=ctx.measureText(text).width; ctx.fillText(text, w-pad-tw, h-pad);
  }

  exportRow.classList.remove('hidden'); controls.classList.remove('hidden');
  hint.textContent='Listo: exportá tu avatar o ajustá zoom/exposición/contraste.';
}

fileInput?.addEventListener('change', async (e)=>{
  const file=e.target.files?.[0]; if(!file) return;
  const url=URL.createObjectURL(file);
  const img=new Image(); img.src=url; await img.decode();
  currentImg=img;
  try{ const bmp=await createImageBitmap(img); faceBox=await detectFace(bmp); }catch(_){ faceBox=null; }
  render(1200,true);
});

zoom?.addEventListener('input',()=>render(1200,true));
expo?.addEventListener('input',()=>render(1200,true));
cont?.addEventListener('input',()=>render(1200,true));

function downloadCanvas(filename,targetW,targetH,wm=true){
  const prevZ=zoom.value, prevE=expo.value, prevC=cont.value;
  render(Math.min(targetW,targetH), wm);
  const off=document.createElement('canvas'); off.width=targetW; off.height=targetH;
  const octx=off.getContext('2d');
  const g=octx.createLinearGradient(0,0,0,targetH); g.addColorStop(0,'#0b1626'); g.addColorStop(1,'#0c1725');
  octx.fillStyle=g; octx.fillRect(0,0,targetW,targetH);
  const size=Math.min(targetW,targetH); const cx=targetW/2, cy=targetH/2; const r=size*0.40;
  octx.save(); octx.filter='blur(24px)'; octx.globalAlpha=0.28;
  octx.drawImage(canvas,40,40,canvas.width-80,canvas.height-80,40,40,targetW-80,targetH-80); octx.restore();
  octx.save(); octx.beginPath(); octx.arc(cx,cy,r,0,Math.PI*2); octx.closePath(); octx.clip();
  octx.drawImage(canvas,0,0,canvas.width,canvas.height,cx-r,cy-r,r*2,r*2); octx.restore();
  octx.lineWidth=Math.max(4,Math.round(size*0.005)); octx.strokeStyle='#fff';
  octx.beginPath(); octx.arc(cx,cy,r+octx.lineWidth/2,0,Math.PI*2); octx.stroke();
  if(wm){ const pad=Math.round(size*0.04); const fontSize=Math.round(size*0.06);
    octx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`; octx.fillStyle='rgba(255,255,255,0.85)';
    const text='VIA'; const tw=octx.measureText(text).width; octx.fillText(text, targetW-pad-tw, targetH-pad);}
  const a=document.createElement('a'); a.href=off.toDataURL('image/png'); a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  zoom.value=prevZ; expo.value=prevE; cont.value=prevC; render(1200,wm);
}
dl1200?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1200.png',1200,1200,true));
dl1080?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1080x1350.png',1080,1350,true));
