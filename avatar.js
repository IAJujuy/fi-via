const fileInput=document.getElementById('file');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
const exportRow=document.getElementById('exportRow');
const hint=document.getElementById('hint');
const dl1200=document.getElementById('dl1200');
const dl1080=document.getElementById('dl1080');
function drawBackground(w,h){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b1626');g.addColorStop(1,'#0c1725');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function drawAvatar(img,size=1200,wm=true){
  canvas.width=size;canvas.height=size;const w=size,h=size;drawBackground(w,h);
  const minSide=Math.min(img.width,img.height);const sx=(img.width-minSide)/2;const sy=(img.height-minSide)/2;
  ctx.save();ctx.filter='blur(24px)';ctx.globalAlpha=0.28;ctx.drawImage(img,sx,sy,minSide,minSide,40,40,w-80,h-80);ctx.restore();
  ctx.save();ctx.beginPath();const r=w*0.40;const cx=w*0.50;const cy=h*0.50;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.closePath();ctx.clip();
  ctx.drawImage(img,sx,sy,minSide,minSide,cx-r,cy-r,r*2,r*2);ctx.restore();
  ctx.lineWidth=Math.max(4,Math.round(w*0.005));ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,r+ctx.lineWidth/2,0,Math.PI*2);ctx.stroke();
  if(wm){const pad=Math.round(w*0.04);const fontSize=Math.round(w*0.06);ctx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`;ctx.fillStyle='rgba(255,255,255,0.85)';const text='VIA';const tw=ctx.measureText(text).width;ctx.fillText(text,w-pad-tw,h-pad);}
  exportRow.classList.remove('hidden');hint.textContent='Listo: exportá tu avatar. Todo se procesó localmente.';
}
fileInput?.addEventListener('change',(e)=>{const file=e.target.files?.[0];if(!file)return;const img=new Image();img.onload=()=>drawAvatar(img,1200,true);img.onerror=()=>alert('No pude abrir esa imagen.');img.src=URL.createObjectURL(file);});
function downloadCanvas(filename,targetW,targetH,wm=true){
  const src=canvas;const off=document.createElement('canvas');off.width=targetW;off.height=targetH;const octx=off.getContext('2d');
  const g=octx.createLinearGradient(0,0,0,targetH);g.addColorStop(0,'#0b1626');g.addColorStop(1,'#0c1725');octx.fillStyle=g;octx.fillRect(0,0,targetW,targetH);
  const size=Math.min(targetW,targetH);const cx=targetW/2,cy=targetH/2;const r=size*0.40;
  octx.save();octx.filter='blur(24px)';octx.globalAlpha=0.28;octx.drawImage(src,40,40,src.width-80,src.height-80,40,40,targetW-80,targetH-80);octx.restore();
  octx.save();octx.beginPath();octx.arc(cx,cy,r,0,Math.PI*2);octx.closePath();octx.clip();octx.drawImage(src,0,0,src.width,src.height,cx-r,cy-r,r*2,r*2);octx.restore();
  octx.lineWidth=Math.max(4,Math.round(size*0.005));octx.strokeStyle='#fff';octx.beginPath();octx.arc(cx,cy,r+octx.lineWidth/2,0,Math.PI*2);octx.stroke();
  if(wm){const pad=Math.round(size*0.04);const fontSize=Math.round(size*0.06);octx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`;octx.fillStyle='rgba(255,255,255,0.85)';const text='VIA';const tw=octx.measureText(text).width;octx.fillText(text,targetW-pad-tw,targetH-pad);}
  const a=document.createElement('a');a.href=off.toDataURL('image/png');a.download=filename;document.body.appendChild(a);a.click();a.remove();
}
dl1200?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1200.png',1200,1200,true));
dl1080?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1080x1350.png',1080,1350,true));
