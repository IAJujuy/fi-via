const fileInput=document.getElementById('file');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
const exportRow=document.getElementById('exportRow');
const hint=document.getElementById('hint');
const logEl=document.getElementById('log');
const dl1200=document.getElementById('dl1200');
const dl1080=document.getElementById('dl1080');
const retry=document.getElementById('retry');

let lastFile=null;

function log(msg){console.log(msg);logEl.classList.remove('hidden');logEl.textContent += (msg+'\n');}
function clearLog(){logEl.textContent='';logEl.classList.add('hidden');}

function drawBackground(w,h){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b1626');g.addColorStop(1,'#0c1725');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
}

function drawAvatar(img,size=1200,wm=true){
  canvas.width=size;canvas.height=size;const w=size,h=size;drawBackground(w,h);
  const minSide=Math.min(img.width,img.height);
  const sx=(img.width-minSide)/2;const sy=(img.height-minSide)/2;
  // sombra
  ctx.save();ctx.filter='blur(24px)';ctx.globalAlpha=0.28;
  ctx.drawImage(img,sx,sy,minSide,minSide,40,40,w-80,h-80);ctx.restore();
  // círculo
  ctx.save();ctx.beginPath();const r=w*0.40;const cx=w*0.50;const cy=h*0.50;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.closePath();ctx.clip();
  ctx.drawImage(img,sx,sy,minSide,minSide,cx-r,cy-r,r*2,r*2);ctx.restore();
  // borde
  ctx.lineWidth=Math.max(4,Math.round(w*0.005));ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,r+ctx.lineWidth/2,0,Math.PI*2);ctx.stroke();
  // marca agua
  if(wm){const pad=Math.round(w*0.04);const fontSize=Math.round(w*0.06);ctx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`;ctx.fillStyle='rgba(255,255,255,0.85)';const text='VIA';const tw=ctx.measureText(text).width;ctx.fillText(text,w-pad-tw,h-pad);}
  exportRow.classList.remove('hidden');hint.textContent='Listo: exportá tu avatar.';
}

async function loadWithObjectURL(file){
  return new Promise((resolve,reject)=>{
    try{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=(e)=>reject(new Error('onerror al cargar imagen (objectURL)'));
      img.src=URL.createObjectURL(file);
    }catch(err){reject(err);}
  });
}

async function loadWithFileReader(file){
  return new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onerror=()=>reject(new Error('FileReader error'));
    fr.onload=()=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('onerror al cargar imagen (dataURL)'));
      img.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}

async function handleFile(file){
  clearLog(); lastFile=file; if(!file){return;}
  try{
    let img=await loadWithObjectURL(file);
    try{ await img.decode(); }catch(_){ /* algunos navegadores no soportan decode(); continuamos */ }
    drawAvatar(img,1200,true);
    return;
  }catch(err){ log('Fallo objectURL: '+err.message); }
  // Fallback
  try{
    const img=await loadWithFileReader(file);
    drawAvatar(img,1200,true);
    return;
  }catch(err){ log('Fallo FileReader: '+err.message); }
  hint.textContent='No pude procesar la imagen. Probá con otro archivo.';
}

fileInput?.addEventListener('change', (e)=> handleFile(e.target.files?.[0]));

retry?.addEventListener('click',()=>{ if(lastFile){ handleFile(lastFile); }});

function downloadCanvas(filename,targetW,targetH,wm=true){
  const off=document.createElement('canvas');off.width=targetW;off.height=targetH;const octx=off.getContext('2d');
  const g=octx.createLinearGradient(0,0,0,targetH);g.addColorStop(0,'#0b1626');g.addColorStop(1,'#0c1725');octx.fillStyle=g;octx.fillRect(0,0,targetW,targetH);
  const size=Math.min(targetW,targetH);const cx=targetW/2,cy=targetH/2;const r=size*0.40;
  // sombra
  octx.save();octx.filter='blur(24px)';octx.globalAlpha=0.28;octx.drawImage(canvas,40,40,canvas.width-80,canvas.height-80,40,40,targetW-80,targetH-80);octx.restore();
  // círculo
  octx.save();octx.beginPath();octx.arc(cx,cy,r,0,Math.PI*2);octx.closePath();octx.clip();
  octx.drawImage(canvas,0,0,canvas.width,canvas.height,cx-r,cy-r,r*2,r*2);octx.restore();
  // borde
  octx.lineWidth=Math.max(4,Math.round(size*0.005));octx.strokeStyle='#fff';octx.beginPath();octx.arc(cx,cy,r+octx.lineWidth/2,0,Math.PI*2);octx.stroke();
  // marca
  if(wm){const pad=Math.round(size*0.04);const fontSize=Math.round(size*0.06);octx.font=`900 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto`;octx.fillStyle='rgba(255,255,255,0.85)';const text='VIA';const tw=octx.measureText(text).width;octx.fillText(text,targetW-pad-tw,targetH-pad);}
  const a=document.createElement('a');a.href=off.toDataURL('image/png');a.download=filename;document.body.appendChild(a);a.click();a.remove();
}
dl1200?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1200.png',1200,1200,true));
dl1080?.addEventListener('click',()=>downloadCanvas('VIA_avatar_1080x1350.png',1080,1350,true));
