import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CapacitorPluginMlKitTextRecognition } from '@pantrist/capacitor-plugin-ml-kit-text-recognition';

type OcrLine={text:string; boundingBox:{left:number;top:number;right:number;bottom:number}; elements?:any[]; recognizedLanguage?:string};

function $(s:string){return document.querySelector(s) as HTMLElement|null}

function cleanText(s:string){
  return String(s||'').replace(/[ \t]+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
}

function loadImage(src:string){
  return new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src});
}

function rgbToHsv(r:number,g:number,b:number){
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}
  const s=max===0?0:d/max;return {h,s,v:max};
}

async function highlightScore(dataUrl:string,box:OcrLine['boundingBox']){
  const img=await loadImage(dataUrl);
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(img,0,0);
  const left=Math.max(0,Math.floor(box.left)),top=Math.max(0,Math.floor(box.top));
  const right=Math.min(canvas.width,Math.ceil(box.right)),bottom=Math.min(canvas.height,Math.ceil(box.bottom));
  if(right<=left||bottom<=top)return 0;
  const step=Math.max(2,Math.floor(Math.min(right-left,bottom-top)/22));
  let hit=0,total=0;
  for(let y=top;y<bottom;y+=step){
    for(let x=left;x<right;x+=step){
      const p=ctx.getImageData(x,y,1,1).data;const {h,s,v}=rgbToHsv(p[0],p[1],p[2]);
      total++;
      const yellow=h>=35&&h<=80&&s>=.18&&v>=.60;
      const blue=h>=175&&h<=260&&s>=.16&&v>=.48;
      const purple=(h>=260&&h<=330)&&s>=.16&&v>=.48;
      if(yellow||blue||purple)hit++;
    }
  }
  return total?hit/total:0;
}

function ensureStyles(){
  if(document.getElementById('nativeQuoteScanStyles'))return;
  const style=document.createElement('style');style.id='nativeQuoteScanStyles';style.textContent=`
  .nativeScanBtn{width:100%;margin-top:10px}
  .nativeScanModal{position:fixed;inset:0;z-index:99999;background:rgba(12,20,34,.72);display:flex;align-items:flex-end;justify-content:center;padding:12px}
  .nativeScanSheet{width:min(680px,100%);max-height:92vh;overflow:auto;background:#fffdf8;border-radius:24px 24px 18px 18px;padding:18px;box-shadow:0 20px 70px #0006}
  .nativeScanHead{display:flex;justify-content:space-between;gap:12px;align-items:center;position:sticky;top:-18px;background:#fffdf8;padding:12px 0;z-index:2}
  .nativeScanPreview{width:100%;max-height:230px;object-fit:contain;border-radius:16px;background:#eee7da;margin:4px 0 12px}
  .nativeScanLine{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid #ded4c3;border-radius:14px;margin:8px 0;background:white}
  .nativeScanLine[data-selected="true"]{border-color:#b58a36;background:#fff7e5;box-shadow:0 0 0 1px #b58a36 inset}
  .nativeScanLine input{width:20px;height:20px;flex:0 0 auto;margin-top:2px}
  .nativeScanLineText{font-family:Georgia,serif;font-size:17px;line-height:1.45;color:#182640}
  .nativeScanMeta{font-size:11px;color:#81796d;margin-top:4px}
  .nativeScanActions{position:sticky;bottom:-18px;background:#fffdf8;padding:12px 0 2px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  `;document.head.appendChild(style);
}

function showModal(dataUrl:string,lines:OcrLine[],autoSelected:Set<number>){
  ensureStyles();
  const modal=document.createElement('div');modal.className='nativeScanModal';
  modal.innerHTML=`<div class="nativeScanSheet">
    <div class="nativeScanHead"><div><div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9b7c3b">Kitaplığım</div><h2 style="margin:3px 0 0;font-family:Georgia,serif;color:#182640">Alıntıyı seç</h2></div><button type="button" id="nativeScanClose" class="btn secondary">Kapat</button></div>
    <img class="nativeScanPreview" src="${dataUrl}" alt="Taranan kitap sayfası">
    <div style="font-size:13px;color:#71695d;margin-bottom:10px">Fosforlu görünen satırları otomatik seçmeye çalıştım. Gerekirse satırlara dokunarak seçimleri düzelt.</div>
    <div id="nativeScanLines"></div>
    <div class="nativeScanActions"><button id="nativeScanCancel" class="btn secondary">Vazgeç</button><button id="nativeScanUse" class="btn">Seçilenleri alıntıya ekle</button></div>
  </div>`;
  document.body.appendChild(modal);
  const wrap=modal.querySelector('#nativeScanLines')!;
  lines.forEach((line,i)=>{
    const row=document.createElement('label');row.className='nativeScanLine';const selected=autoSelected.has(i);
    row.dataset.selected=String(selected);
    row.innerHTML=`<input type="checkbox" ${selected?'checked':''}><div><div class="nativeScanLineText"></div><div class="nativeScanMeta">${selected?'Fosfor izi algılandı':'Dokunarak seç'}</div></div>`;
    (row.querySelector('.nativeScanLineText') as HTMLElement).textContent=cleanText(line.text);
    const cb=row.querySelector('input') as HTMLInputElement;cb.onchange=()=>row.dataset.selected=String(cb.checked);
    wrap.appendChild(row);
  });
  const close=()=>modal.remove();
  (modal.querySelector('#nativeScanClose') as HTMLButtonElement).onclick=close;
  (modal.querySelector('#nativeScanCancel') as HTMLButtonElement).onclick=close;
  (modal.querySelector('#nativeScanUse') as HTMLButtonElement).onclick=()=>{
    const chosen=[...wrap.querySelectorAll<HTMLInputElement>('input')].map((cb,i)=>cb.checked?cleanText(lines[i].text):'').filter(Boolean);
    if(!chosen.length){alert('En az bir satır seçin.');return}
    const target=document.querySelector<HTMLTextAreaElement>('#ocrText');
    const panel=document.querySelector<HTMLElement>('#ocrPanel');
    if(!target||!panel){alert('Alıntı kontrol ekranı bulunamadı.');return}
    target.value=chosen.join('\n\n');panel.classList.remove('hidden');close();panel.scrollIntoView({behavior:'smooth',block:'start'});
  };
}

async function scanQuote(){
  try{
    const photo=await Camera.getPhoto({source:CameraSource.Camera,resultType:CameraResultType.DataUrl,quality:95,correctOrientation:true,saveToGallery:false});
    if(!photo.dataUrl)throw new Error('Kamera fotoğraf döndürmedi.');
    const base64=photo.dataUrl.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/,'');
    const result=await CapacitorPluginMlKitTextRecognition.detectText({base64Image:base64,rotation:0});
    const lines:OcrLine=[];(result.blocks||[]).forEach((b:any)=>(b.lines||[]).forEach((l:any)=>{if(cleanText(l.text))lines.push(l)}));
    if(!lines.length)throw new Error('Bu sayfada okunabilir metin bulunamadı.');
    const scored=await Promise.all(lines.map(l=>highlightScore(photo.dataUrl!,l.boundingBox).catch(()=>0)));
    const auto=new Set<number>();scored.forEach((v,i)=>{if(v>=.055)auto.add(i)});
    showModal(photo.dataUrl,lines,auto);
  }catch(err:any){
    if(String(err?.message||err).toLowerCase().includes('cancel'))return;
    console.error('Native quote scan failed',err);
    alert('Alıntı tarama başarısız oldu: '+(err?.message||String(err)));
  }
}

function install(){
  if(!Capacitor.isNativePlatform())return;
  const scanView=document.querySelector('#scanView .card');
  if(!scanView||document.getElementById('nativeQuoteScanBtn'))return;
  const btn=document.createElement('button');btn.id='nativeQuoteScanBtn';btn.className='btn gold nativeScanBtn';btn.type='button';btn.textContent='📷 Alıntı Tara';
  btn.onclick=scanQuote;scanView.appendChild(btn);
  const note=document.createElement('div');note.className='muted';note.style.cssText='font-size:12px;margin-top:8px;line-height:1.4';
  note.textContent='Mobil tarayıcı: kamera fotoğrafını cihaz üzerinde okur; fosforlu satırları otomatik seçmeye çalışır.';
  scanView.appendChild(note);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
(window as any).KitapligimNativeQuoteScanner={scanQuote};
