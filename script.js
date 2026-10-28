const $=id=>document.getElementById(id);
const cv=$('gameCanvas'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;

// ===== Lưu trữ & dữ liệu cửa hàng =====
const DEF={coins:0,up:{dmg:0,rate:0,hp:0},inv:{medkit:1,shield:1,bomb:1},skins:['alpha'],skin:'alpha',diff:'normal'};
let save=(()=>{try{const s=JSON.parse(localStorage.getItem('cc_save'));if(s&&s.up&&s.inv){s.skins=s.skins||['alpha'];s.skin=s.skin||'alpha';s.diff=s.diff||'normal';return s}}catch(e){}return JSON.parse(JSON.stringify(DEF))})();
const persist=()=>{try{localStorage.setItem('cc_save',JSON.stringify(save))}catch(e){}};
const MAXLV=5;
const UPS=[{id:'dmg',name:'Đạn mạnh',desc:'Tăng sát thương và số nòng súng',base:150},
 {id:'rate',name:'Tốc độ bắn',desc:'Bắn nhanh hơn',base:120},
 {id:'hp',name:'Giáp thân',desc:'+20 máu tối đa',base:100}];
const ITEMS=[{id:'medkit',name:'Cứu thương',key:1,desc:'Hồi 40 máu',cost:60},
 {id:'shield',name:'Khiên',key:2,desc:'Miễn sát thương 6 giây',cost:90},
 {id:'bomb',name:'Bom',key:3,desc:'Xóa đạn địch, gây sát thương lớn',cost:120}];

// ===== Giao diện chiến cơ (skin) =====
const SKINS=[
 {id:'alpha',name:'Alpha',desc:'Mẫu tiêu chuẩn, màu thép xanh',cost:0,c1:'#38bdf8',c2:'#0c4a6e',flame:'#ff9a3c',glow:'#38e1ff',eng:[20],
  body:[[20,0],[26,14],[40,36],[28,32],[20,40],[12,32],[0,36],[14,14]],acc:[[[20,8],[16,24],[24,24]]]},
 {id:'phoenix',name:'Phoenix',desc:'Cánh quét sau, sắc lửa',cost:400,c1:'#ff5a36',c2:'#ffd166',flame:'#ffd166',glow:'#ff7a4d',eng:[20],
  body:[[20,0],[25,12],[34,8],[40,30],[26,28],[20,40],[14,28],[0,30],[6,8],[15,12]],acc:[[[20,6],[16,26],[24,26]],[[34,8],[40,30],[36,26]],[[6,8],[0,30],[4,26]]]},
 {id:'viper',name:'Viper',desc:'Thân hẹp, cánh nhỏ, màu độc',cost:600,c1:'#4ade80',c2:'#14532d',flame:'#a3e635',glow:'#4ade80',eng:[20],
  body:[[20,0],[24,16],[24,38],[20,34],[16,38],[16,16]],acc:[[[24,20],[40,36],[24,30]],[[16,20],[0,36],[16,30]],[[20,6],[18,20],[22,20]]]},
 {id:'nova',name:'Nova',desc:'Cánh tam giác rộng, hai động cơ',cost:900,c1:'#c084fc',c2:'#fde047',flame:'#67e8f9',glow:'#c084fc',eng:[11,29],
  body:[[20,2],[40,38],[30,36],[20,28],[10,36],[0,38]],acc:[[[20,10],[15,26],[25,26]],[[8,30],[14,30],[11,38]],[[26,30],[32,30],[29,38]]]}];
function drawShip(c,x,y,k,f){
  const P=(pts,fill,glow)=>{c.fillStyle=fill;c.shadowColor=glow||'transparent';c.shadowBlur=glow?10:0;
    c.beginPath();pts.forEach((p,i)=>i?c.lineTo(x+p[0],y+p[1]):c.moveTo(x+p[0],y+p[1]));c.closePath();c.fill();c.shadowBlur=0};
  const fl=6+(f%4)*2;
  k.eng.forEach(e=>P([[e-4,34],[e+4,34],[e,40+fl]],k.flame,k.flame));
  P(k.body,k.c1,k.glow);
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1;c.stroke();
  k.acc.forEach(a=>P(a,k.c2));
}

// ===== Cấp độ chơi =====
const DIFFS={
 easy:{desc:'Địch yếu, thưa, sát thương thấp · xu ×0,8',hp:.7,spawn:1.3,dmg:.7,spd:.85,coin:.8,boss:.7},
 normal:{desc:'Cân bằng · xu ×1',hp:1,spawn:1,dmg:1,spd:1,coin:1,boss:1},
 hard:{desc:'Địch trâu, nhanh, đông, đau · xu ×1,5',hp:1.5,spawn:.75,dmg:1.4,spd:1.2,coin:1.5,boss:1.5}};
const D=()=>DIFFS[save.diff]||DIFFS.normal;
// Nhịp độ game: bắt đầu chậm (×0,6), tăng dần theo điểm tới tối đa ×2,0 (khoảng 4200 điểm)
let pace=1;
const calcPace=()=>Math.min(2,.6+score/3000);
const waveTxt=()=>wave()+' · ×'+pace.toFixed(1);
function renderDiff(){
  document.querySelectorAll('.diff-pick button').forEach(b=>b.classList.toggle('on',b.dataset.diff===save.diff));
  document.querySelectorAll('.diff-desc').forEach(p=>p.textContent=D().desc)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-diff]');if(b){save.diff=b.dataset.diff;persist();renderDiff()}});

// ===== Co giãn màn hình =====
const box=document.querySelector('.game-container');
function fit(){box.style.transform='scale('+Math.min((innerWidth-16)/W,(innerHeight-16)/H,2.4)+')'}
addEventListener('resize',fit);fit();

// ===== Vật phẩm rơi ngẫu nhiên =====
const PUPS=[
 {id:'shield',name:'Khiên',ico:'K',col:'#38e1ff',w:18},
 {id:'bomb',name:'+1 Bom',ico:'B',col:'#ff9a3c',w:9},
 {id:'heal',name:'Hồi máu',ico:'+',col:'#4ade80',w:16},
 {id:'spread',name:'Đạn tỏa',ico:'Y',col:'#fca5a5',w:15},
 {id:'pierce',name:'Đạn xuyên',ico:'I',col:'#67e8f9',w:12},
 {id:'rapid',name:'Bắn nhanh',ico:'»',col:'#ffe066',w:14},
 {id:'x2',name:'Điểm ×2',ico:'2',col:'#f0abfc',w:7}];
let pickups=[],buffs={spread:0,pierce:0,rapid:0,x2:0},dryKills=0,lastPup='';
// Chọn loại vật phẩm có trọng số: hợp tình huống hơn, ít trùng lặp
function pickPup(){
  const low=hp<maxHp()*.35,full=hp>maxHp()*.8;
  const ws=PUPS.map(p=>{let w=p.w;
    if(p.id==='heal')w*=low?3:full?.15:1;
    if(p.id==='shield'&&player.shield>0)w*=.2;
    if(buffs[p.id]>0)w*=.25;
    if(p.id===lastPup)w*=.3;
    return w});
  let r=Math.random()*ws.reduce((a,b)=>a+b,0);
  for(let i=0;i<PUPS.length;i++)if((r-=ws[i])<=0)return PUPS[i];
  return PUPS[0]}
// Tỉ lệ rơi: 6% + 1,2% mỗi lần hạ địch mà không rơi (tối đa 45%)
function maybeDrop(x,y,bonus){
  dryKills++;
  if(Math.random()<Math.min(.45,.06+dryKills*.012+(bonus||0))){
    dryKills=0;const p=pickPup();lastPup=p.id;pickups.push({x,y,p,vy:1.4,a:0})}}
function toast(m){const el=$('toast');el.textContent=m;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}
function renderBuffs(){$('buffs').innerHTML=PUPS.filter(p=>buffs[p.id]>0)
  .map(p=>`<span style="--c:${p.col}">${p.name} ${Math.ceil(buffs[p.id]/60)}s</span>`).join('')}
function applyPup(p){
  if(p.id==='shield')player.shield=Math.max(player.shield,300);
  else if(p.id==='bomb'){save.inv.bomb++;persist()}
  else if(p.id==='heal')hp=Math.min(maxHp(),hp+30);
  else buffs[p.id]=p.id==='x2'?720:600;
  toast(p.name);burst(player.x+20,player.y+20,16,p.col,3.5);renderBuffs();hud()}

// ===== Trạng thái game =====
let state='menu',paused=false,t=0,score=0,hp=100,runCoins=0,shake=0,nextBoss=1500,bossCount=0;
let enemies=[],bullets=[],eBullets=[],coins=[],parts=[],stars=[],boss=null;
const player={x:0,y:0,w:40,h:40,speed:5,shield:0,inv:0};
const keys={};
const maxHp=()=>100+20*save.up.hp;
const wave=()=>1+Math.floor(score/800);

stars=Array.from({length:70},()=>{const l=Math.random();return{x:Math.random()*W,y:Math.random()*H,l,size:l*2+.5,sp:l*2.2+.4}});

// ===== Điều khiển =====
addEventListener('keydown',e=>{
  keys[e.key.toLowerCase()]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();
  if(e.key==='1')useItem('medkit');if(e.key==='2')useItem('shield');
  if(e.key==='3'||e.key===' ')useItem('bomb');
  if(e.key.toLowerCase()==='n'||e.key==='4')useNuke();
  if(e.key.toLowerCase()==='p'&&state==='play')paused=!paused;
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function pointTo(cx,cy){if(state!=='play'||paused)return;const r=cv.getBoundingClientRect(),k=W/r.width;
  player.x=(cx-r.left)*k-player.w/2;player.y=(cy-r.top)*k-player.h/2}
let lastTouch=0,tch=null;
cv.addEventListener('mousemove',e=>{if(Date.now()-lastTouch>800)pointTo(e.clientX,e.clientY)});
cv.addEventListener('touchstart',e=>{lastTouch=Date.now();const f=e.touches[0];tch={x:f.clientX,y:f.clientY,px:player.x,py:player.y}},{passive:true});
cv.addEventListener('touchmove',e=>{e.preventDefault();lastTouch=Date.now();
  if(state!=='play'||paused||!tch)return;const f=e.touches[0],k=W/cv.getBoundingClientRect().width;
  player.x=tch.px+(f.clientX-tch.x)*k*1.2;player.y=tch.py+(f.clientY-tch.y)*k*1.2},{passive:false});
cv.addEventListener('touchend',()=>lastTouch=Date.now());
$('nuke-btn').onclick=useNuke;
$('pause-btn').onclick=()=>{if(state==='play')paused=!paused};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')paused=true});

// ===== HUD, kho đồ =====
function hud(){
  $('score').textContent=score;$('wave').textContent=waveTxt();$('coins').textContent=save.coins;
  renderNuke();$('hp').textContent=Math.max(0,Math.ceil(hp))+' / '+maxHp();
  $('hpbar').style.width=Math.max(0,hp/maxHp()*100)+'%';
  $('inv').innerHTML=ITEMS.map(i=>`<div class="slot ${save.inv[i.id]?'':'empty'}" data-use="${i.id}">${i.name}<b>${save.inv[i.id]}</b>[${i.key}]</div>`).join('');
}
$('inv').addEventListener('click',e=>{const s=e.target.closest('[data-use]');if(s)useItem(s.dataset.use)});
function useItem(id){
  if(state!=='play'||paused||save.inv[id]<=0)return;
  if(id==='medkit'){if(hp>=maxHp())return;hp=Math.min(maxHp(),hp+40);burst(player.x+20,player.y+20,20,'#4ade80',3)}
  if(id==='shield')player.shield=360;
  if(id==='bomb'){
    eBullets.length=0;shake=18;
    for(const e of enemies.slice())damageEnemy(e,6);
    if(boss)damageBoss(20);
    ring(player.x+20,player.y+20,'#38e1ff');
  }
  save.inv[id]--;persist();hud();
}

// ===== Bom nguyên tử: tốn xu, có hồi chiêu =====
// Giá 300 xu (mỗi ván thường nhặt 150–400 xu), hồi 25 giây, boss mất 35% máu tối đa
const NUKE={cost:300,cd:1500,boss:.35};
let nukeCd=0,flash=0;
function renderNuke(){
  $('nuke-cost').textContent=nukeCd>0?Math.ceil(nukeCd/60)+'s':NUKE.cost;
  $('nuke-btn').classList.toggle('off',nukeCd>0||save.coins<NUKE.cost)}
function useNuke(){
  if(state!=='play'||paused)return;
  if(nukeCd>0){toast('Đang hồi: '+Math.ceil(nukeCd/60)+' giây');return}
  if(save.coins<NUKE.cost){toast('Cần '+NUKE.cost+' xu để kích hoạt');return}
  save.coins-=NUKE.cost;persist();nukeCd=NUKE.cd;
  flash=1;shake=40;player.inv=Math.max(player.inv,90);eBullets.length=0;
  const cx=player.x+20,cy=player.y+20;
  ring(cx,cy,'#ffffff',7);ring(cx,cy,'#ffc83d',11);ring(cx,cy,'#ff6b35',15);
  burst(W/2,H/2,80,'#ffb347',9);
  for(const e of enemies.slice())damageEnemy(e,999);
  if(boss)damageBoss(Math.ceil(boss.max*NUKE.boss));
  toast('BOM NGUYÊN TỬ!');hud()}

// ===== Cửa hàng =====
let prevOverlay=$('menu-screen');
function renderShop(){
  $('shop-coins').textContent=save.coins;
  $('shop-list').innerHTML=
   UPS.map(u=>{const lv=save.up[u.id],cost=u.base*(lv+1),max=lv>=MAXLV;
     return `<div class="item"><div><strong>${u.name} (Cấp ${lv}/${MAXLV})</strong><small>${u.desc}</small></div>
     <button data-up="${u.id}" ${max||save.coins<cost?'disabled':''}>${max?'Tối đa':'◉ '+cost}</button></div>`}).join('')+
   ITEMS.map(i=>`<div class="item"><div><strong>${i.name} (có ${save.inv[i.id]})</strong><small>${i.desc}</small></div>
     <button data-item="${i.id}" ${save.coins<i.cost?'disabled':''}>◉ ${i.cost}</button></div>`).join('');
  document.querySelectorAll('[data-prev]').forEach(c=>{const g=c.getContext('2d');g.clearRect(0,0,44,62);
    drawShip(g,2,6,SKINS.find(k=>k.id===c.dataset.prev),0)});
}
$('shop-list').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.up){const u=UPS.find(x=>x.id===b.dataset.up),c=u.base*(save.up[u.id]+1);
    if(save.coins>=c&&save.up[u.id]<MAXLV){save.coins-=c;save.up[u.id]++}}
  if(b.dataset.item){const i=ITEMS.find(x=>x.id===b.dataset.item);
    if(save.coins>=i.cost){save.coins-=i.cost;save.inv[i.id]++}}
  if(b.dataset.skin){const k=SKINS.find(x=>x.id===b.dataset.skin);
    if(save.skins.includes(k.id))save.skin=k.id;
    else if(save.coins>=k.cost){save.coins-=k.cost;save.skins.push(k.id);save.skin=k.id}}
  persist();renderShop();hud();
});
document.querySelectorAll('.open-shop').forEach(b=>b.onclick=()=>{
  prevOverlay=b.closest('.overlay');prevOverlay.classList.add('hidden');$('shop-screen').classList.remove('hidden');renderShop()});
$('close-shop').onclick=()=>{$('shop-screen').classList.add('hidden');prevOverlay.classList.remove('hidden')};

// ===== Hiệu ứng hạt =====
function burst(x,y,n,color,sp=4){
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=Math.random()*sp+.5,l=20+Math.random()*25;
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:l,max:l,color,size:Math.random()*3+1})}}
function ring(x,y,color,sp=9){for(let i=0;i<60;i++){const a=i/60*6.283;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:30,max:30,color,size:3})}}

// ===== Bắt đầu / kết thúc =====
function startGame(){
  state='play';paused=false;t=0;document.body.classList.add('playing');score=0;runCoins=0;hp=maxHp();nextBoss=1500;bossCount=0;boss=null;
  enemies=[];bullets=[];eBullets=[];coins=[];parts=[];pickups=[];buffs={spread:0,pierce:0,rapid:0,x2:0};dryKills=0;lastPup='';renderBuffs();nukeCd=0;flash=0;renderNuke();
  player.x=W/2-20;player.y=H-120;player.shield=0;player.inv=0;
  document.querySelectorAll('.overlay').forEach(o=>o.classList.add('hidden'));
  hud();
}
function gameOver(){
  state='over';document.body.classList.remove('playing');persist();burst(player.x+20,player.y+20,60,'#38e1ff',6);shake=20;
  $('final-score').textContent=score;$('final-coins').textContent=runCoins;
  setTimeout(()=>$('gameover-screen').classList.remove('hidden'),700);
}
function hurt(d){
  if(player.shield>0||player.inv>0||state!=='play')return;
  hp-=Math.max(1,Math.round(d*D().dmg));player.inv=45;shake=10;burst(player.x+20,player.y+20,14,'#ff4d6d');hud();
  if(hp<=0){hp=0;hud();gameOver()}
}
$('start-btn').onclick=startGame;$('restart-btn').onclick=startGame;

// ===== Địch & Boss =====
function spawnEnemy(){
  const w=wave(),shooter=Math.random()<Math.min(.15+w*.06,.5),s=36,hpv=Math.max(1,Math.round(((shooter?3:2)+Math.floor(w/2))*D().hp));
  enemies.push({x:Math.random()*(W-s),y:-s,w:s,h:s,type:shooter?1:0,
    sp:(shooter?1.2:2+Math.random()*1.5+w*.1)*D().spd*pace,hp:hpv,max:hpv,ph:Math.random()*6,cd:60+Math.random()*60});
}
function spawnBoss(){
  const hpMax=Math.round((70+bossCount*40)*D().boss);
  boss={x:W/2-50,y:-120,w:100,h:70,hp:hpMax,max:hpMax,cd:60,dir:1,flash:0};
}
function eShot(x,y,a,sp,r=5){sp*=.75+pace*.25;eBullets.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r})}
function aimAt(x,y){return Math.atan2(player.y+20-y,player.x+20-x)}
function dropCoins(x,y,n){for(let i=0;i<n;i++)coins.push({x:x+(Math.random()-.5)*24,y:y+(Math.random()-.5)*24,v:Math.max(1,Math.round(5*D().coin)),vy:-1.5})}
function damageEnemy(e,d){
  e.hp-=d;burst(e.x+e.w/2,e.y+e.h/2,4,'#ffd27a',2);
  if(e.hp<=0){const i=enemies.indexOf(e);if(i<0)return;enemies.splice(i,1);
    score+=(e.type?150:100)*(buffs.x2>0?2:1);burst(e.x+e.w/2,e.y+e.h/2,24,e.type?'#c084fc':'#fb923c',4.5);
    if(Math.random()<.6)dropCoins(e.x+e.w/2,e.y+e.h/2,1+(Math.random()<.3?1:0));maybeDrop(e.x+e.w/2,e.y+e.h/2,e.type?.06:0);hud()}
}
function damageBoss(d){
  if(!boss)return;boss.hp-=d;boss.flash=4;
  if(boss.hp<=0){
    for(let i=0;i<6;i++)setTimeout(()=>burst(boss?boss.x:W/2,60+Math.random()*60,40,['#ff4d6d','#ffc83d','#fff'][i%3],7),i*120);
    shake=25;score+=1000*(buffs.x2>0?2:1);dropCoins(boss.x+50,boss.y+35,12);for(let i=0;i<3;i++){const p=pickPup();lastPup=p.id;pickups.push({x:boss.x+20+i*30,y:boss.y+40,p,vy:1.2,a:0})}bossCount++;nextBoss=score+2000;boss=null;eBullets.length=0;hud()}
}
function bossAttack(){
  const cx=boss.x+boss.w/2,cy=boss.y+boss.h,rage=boss.hp<boss.max/2;
  boss.cd=Math.round((rage?42:68)/(.6+pace*.4));
  const n=rage?9:5,base=1.5708;
  for(let i=0;i<n;i++)eShot(cx,cy,base+(i-(n-1)/2)*.28,3.2);
  if(rage)for(let k=-1;k<=1;k++)eShot(cx,cy,aimAt(cx,cy)+k*.12,4.5,6);
}

// ===== Cập nhật logic =====
function update(){
  pace=state==='play'?calcPace():1;
  for(const s of stars){s.y+=s.sp*(.6+pace*.4);if(s.y>H){s.y=0;s.x=Math.random()*W}}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy*=.97;if(--p.life<=0)parts.splice(i,1)}
  shake*=.88;flash*=.9;
  if(state!=='play')return;
  t++;
  if(t%20===0)$('wave').textContent=waveTxt();
  if(nukeCd>0)nukeCd--;if(t%10===0)renderNuke();
  if(keys.arrowleft||keys.a)player.x-=player.speed;if(keys.arrowright||keys.d)player.x+=player.speed;
  if(keys.arrowup||keys.w)player.y-=player.speed;if(keys.arrowdown||keys.s)player.y+=player.speed;
  player.x=Math.max(0,Math.min(W-player.w,player.x));player.y=Math.max(0,Math.min(H-player.h,player.y));
  if(player.shield>0)player.shield--;if(player.inv>0)player.inv--;
  if(t%2===0)parts.push({x:player.x+20+(Math.random()-.5)*6,y:player.y+40,vx:(Math.random()-.5)*.6,vy:2+Math.random()*2,life:14,max:14,color:'#ff9a3c',size:2.5});

  // Bắn đạn
  const L=save.up,rate=Math.max(4,Math.round(Math.max(5,14-L.rate*2)*(buffs.rapid>0?.55:1))),shots=1+Math.floor(L.dmg/2),dmg=1+Math.floor(L.dmg/3);
  if(t%rate===0){
    const pr=buffs.pierce>0;
    for(let i=0;i<shots;i++)bullets.push({x:player.x+20-3+(i-(shots-1)/2)*12,y:player.y,w:pr?5:6,h:pr?22:14,vy:-9,dmg,pierce:pr,hit:pr?new Set():null});
    if(buffs.spread>0)for(const vx of[-2.4,2.4])bullets.push({x:player.x+17,y:player.y+6,w:6,h:12,vx,vy:-8.5,dmg,pierce:pr,hit:pr?new Set():null});
  }

  // Sinh địch
  const gap=Math.max(10,Math.round(Math.max(16,44-wave()*3)*(boss?3:1)*D().spawn/pace));
  if(t%Math.round(gap)===0)spawnEnemy();
  if(!boss&&score>=nextBoss)spawnBoss();

  // Boss
  if(boss){
    if(boss.y<70)boss.y+=1.2;else{boss.x+=boss.dir*(boss.hp<boss.max/2?2.6:1.6)*(.6+pace*.4);if(boss.x<10||boss.x>W-boss.w-10)boss.dir*=-1;
      if(--boss.cd<=0)bossAttack()}
    if(boss.flash>0)boss.flash--;
  }

  // Đạn người chơi
  for(let j=bullets.length-1;j>=0;j--){
    const b=bullets[j];b.y+=b.vy;b.x+=b.vx||0;let hit=false;
    if(b.y<-20||b.x<-20||b.x>W+20){bullets.splice(j,1);continue}
    for(const e of enemies.slice()){
      if(b.hit&&b.hit.has(e))continue;
      if(b.x<e.x+e.w&&b.x+b.w>e.x&&b.y<e.y+e.h&&b.y+b.h>e.y){damageEnemy(e,b.dmg);if(b.pierce)b.hit.add(e);else{hit=true;break}}}
    if(!hit&&boss&&!(b.hit&&b.hit.has(boss))&&b.x<boss.x+boss.w&&b.x+b.w>boss.x&&b.y<boss.y+boss.h&&b.y+b.h>boss.y){
      const bs=boss;damageBoss(b.dmg);burst(b.x,b.y,3,'#ffd27a',2);if(b.pierce)b.hit.add(bs);else hit=true}
    if(hit)bullets.splice(j,1);
  }

  // Địch
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(e.type){e.y+=e.sp*(e.y>120?.2:1);e.x+=Math.sin(t*.03+e.ph)*1.2*pace;
      if(--e.cd<=0){e.cd=Math.max(35,Math.round(95/pace));eShot(e.x+e.w/2,e.y+e.h,aimAt(e.x,e.y),3)}}
    else e.y+=e.sp;
    if(player.x<e.x+e.w&&player.x+player.w>e.x&&player.y<e.y+e.h&&player.y+player.h>e.y){
      burst(e.x+18,e.y+18,16,'#fb923c');enemies.splice(i,1);hurt(20);continue}
    if(e.y>H)enemies.splice(i,1);
  }
  if(boss&&player.x<boss.x+boss.w&&player.x+player.w>boss.x&&player.y<boss.y+boss.h&&player.y+player.h>boss.y)hurt(30);

  // Đạn địch
  for(let i=eBullets.length-1;i>=0;i--){
    const b=eBullets[i];b.x+=b.vx;b.y+=b.vy;
    if(b.x<-20||b.x>W+20||b.y<-20||b.y>H+20){eBullets.splice(i,1);continue}
    if(Math.hypot(b.x-(player.x+20),b.y-(player.y+22))<b.r+11){eBullets.splice(i,1);hurt(12)}
  }

  // Xu
  for(let i=coins.length-1;i>=0;i--){
    const c=coins[i],dx=player.x+20-c.x,dy=player.y+20-c.y,d=Math.hypot(dx,dy);
    c.vy=Math.min(c.vy+.06,1.8);c.y+=c.vy;
    if(d<100){c.x+=dx/d*5;c.y+=dy/d*5}
    if(d<24){save.coins+=c.v;runCoins+=c.v;coins.splice(i,1);persist();hud();continue}
    if(c.y>H+10)coins.splice(i,1);
  }
  for(let i=pickups.length-1;i>=0;i--){
    const u=pickups[i],dx=player.x+20-u.x,dy=player.y+20-u.y,d=Math.hypot(dx,dy);
    u.y+=u.vy;u.a+=.08;u.x+=Math.sin(u.a)*.6;
    if(d<70){u.x+=dx/d*2.5;u.y+=dy/d*2.5}
    if(d<26){applyPup(u.p);pickups.splice(i,1);continue}
    if(u.y>H+20)pickups.splice(i,1);
  }
  for(const k in buffs)if(buffs[k]>0)buffs[k]--;
  if(t%10===0)renderBuffs();
}

// ===== Vẽ =====
function poly(pts,fill,glow){
  ctx.fillStyle=fill;if(glow){ctx.shadowColor=glow;ctx.shadowBlur=12}
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.shadowBlur=0}
function bar(x,y,w,r){r=Math.max(0,Math.min(1,r));y=Math.max(2,y);
  ctx.fillStyle='#0b1325';ctx.fillRect(x-1,y-1,w+2,5);
  ctx.fillStyle=r>.5?'#4ade80':r>.25?'#fbbf24':'#ff4d6d';ctx.fillRect(x,y,w*r,3)}
function draw(){
  ctx.clearRect(0,0,W,H);ctx.save();
  if(shake>.5)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  for(const s of stars){ctx.globalAlpha=.25+s.l*.7;ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.size,s.size*(1+s.l*2))}
  ctx.globalAlpha=1;

  for(const c of coins){ctx.fillStyle='#ffc83d';ctx.shadowColor='#ffc83d';ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(c.x,c.y,5,0,6.283);ctx.fill();ctx.shadowBlur=0}
  for(const u of pickups){const r=13+Math.sin(u.a*2)*1.5;
    ctx.save();ctx.translate(u.x,u.y);ctx.shadowColor=u.p.col;ctx.shadowBlur=14;
    ctx.fillStyle='#0b1325';ctx.strokeStyle=u.p.col;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*6.283+u.a;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
    ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle=u.p.col;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(u.p.ico,0,1);ctx.restore()}

  for(const e of enemies){const x=e.x,y=e.y,w=e.w,h=e.h;
    if(e.type){
      poly([[x+w/2,y+h],[x,y+h*.45],[x+w*.2,y],[x+w*.8,y],[x+w,y+h*.45]],'#a855f7','#c084fc');
      ctx.fillStyle='#581c87';ctx.fillRect(x+2,y+h*.25,5,14);ctx.fillRect(x+w-7,y+h*.25,5,14);
      poly([[x+w*.3,y+4],[x+w*.7,y+4],[x+w/2,y+h*.75]],'#3b0764');
      ctx.fillStyle='#f0abfc';ctx.shadowColor='#f0abfc';ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(x+w/2,y+h*.38,3+Math.sin(t*.15)*1.5,0,6.283);ctx.fill();ctx.shadowBlur=0;
    }else{
      poly([[x+w/2,y+h],[x+w*.15,y+h*.55],[x,y],[x+w*.35,y+h*.2],[x+w*.65,y+h*.2],[x+w,y],[x+w*.85,y+h*.55]],'#fb923c','#fb923c');
      poly([[x,y],[x+w*.2,y+h*.35],[x+w*.08,y+h*.05]],'#9a3412');poly([[x+w,y],[x+w*.8,y+h*.35],[x+w*.92,y+h*.05]],'#9a3412');
      poly([[x+w/2,y+h*.75],[x+w*.38,y+h*.3],[x+w*.62,y+h*.3]],'#431407');
      ctx.fillStyle='#fde68a';ctx.fillRect(x+w/2-2,y+h*.38,4,4);
    }
    bar(x,y-7,w,e.hp/e.max);}

  if(boss){const x=boss.x,y=boss.y,w=boss.w,h=boss.h,c=boss.flash?'#fff':(boss.hp<boss.max/2?'#ff4d6d':'#e11d48');
    poly([[x+w/2,y+h],[x,y+h*.3],[x+w*.2,y],[x+w*.8,y],[x+w,y+h*.3]],c,'#ff4d6d');
    poly([[x,y+h*.3],[x+w*.2,y],[x+w*.3,y+h*.45],[x+w*.12,y+h*.55]],'#9f1239');
    poly([[x+w,y+h*.3],[x+w*.8,y],[x+w*.7,y+h*.45],[x+w*.88,y+h*.55]],'#9f1239');
    ctx.fillStyle='#4c0519';ctx.fillRect(x+w*.1,y+h*.5,9,18);ctx.fillRect(x+w*.9-9,y+h*.5,9,18);
    poly([[x+w*.35,y+h*.3],[x+w*.65,y+h*.3],[x+w/2,y+h*.7]],'#1a0a14');
    ctx.fillStyle='#ffc83d';ctx.shadowColor='#ffc83d';ctx.shadowBlur=10;
    ctx.beginPath();ctx.arc(x+w/2,y+h*.42,4+Math.sin(t*.2)*1.5,0,6.283);ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#ffc83d';ctx.fillRect(x+w*.2,y+h*.15,8,6);ctx.fillRect(x+w*.8-8,y+h*.15,8,6);
    ctx.fillStyle='#0b1325';ctx.fillRect(40,52,W-80,8);
    ctx.fillStyle='#ff4d6d';ctx.fillRect(40,52,(W-80)*Math.max(0,boss.hp/boss.max),8);
    ctx.strokeStyle='#fff';ctx.strokeRect(40,52,W-80,8);bar(x,y-8,w,boss.hp/boss.max)}

  ctx.fillStyle='#ffe066';ctx.shadowColor='#ffe066';ctx.shadowBlur=8;
  for(const b of bullets){ctx.fillStyle=b.pierce?'#67e8f9':b.vx?'#fca5a5':'#ffe066';ctx.fillRect(b.x,b.y,b.w,b.h)}
  ctx.fillStyle='#ff6b9d';ctx.shadowColor='#ff4d6d';
  for(const b of eBullets){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.283);ctx.fill()}
  ctx.shadowBlur=0;

  if(state==='play'||state==='menu'){
    const p=player,x=p.x,y=p.y;
    if(!(p.inv>0&&t%6<3)){
      drawShip(ctx,x,y,SKINS.find(k=>k.id===save.skin)||SKINS[0],t);
    }
    if(state==='play')bar(x,y-8,40,hp/maxHp());
    if(p.shield>0){ctx.strokeStyle='rgba(56,225,255,'+(p.shield<90&&t%10<5?.2:.7)+')';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x+20,y+22,30,0,6.283);ctx.stroke()}
  }
  for(const p of parts){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size)}
  ctx.globalAlpha=1;ctx.restore();
  if(flash>.02){ctx.fillStyle='rgba(255,250,230,'+Math.min(1,flash)+')';ctx.fillRect(0,0,W,H)}
  if(paused){ctx.fillStyle='rgba(2,6,23,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';
    ctx.textAlign='center';ctx.fillText('TẠM DỪNG',W/2,H/2);ctx.font='14px sans-serif';ctx.fillText('Bấm P hoặc nút ❚❚ để tiếp tục',W/2,H/2+30)}
}

// ===== Màn hình chọn chiến cơ =====
let hi=0,fr=0;
const hg=$('hangar-canvas').getContext('2d');
function renderHangar(){
  const k=SKINS[hi],own=save.skins.includes(k.id),on=save.skin===k.id;
  $('hg-name').textContent=k.name;$('hg-desc').textContent=k.desc;$('hg-coins').textContent=save.coins;
  $('hg-stat').textContent='Máu tối đa '+maxHp()+' · Sát thương '+(1+Math.floor(save.up.dmg/3))+' · '+(1+Math.floor(save.up.dmg/2))+' nòng';
  $('hg-dots').innerHTML=SKINS.map((s,i)=>`<i class="${i===hi?'on':''}"></i>`).join('');
  const b=$('hg-action');b.textContent=on?'Đang dùng':own?'Chọn chiến cơ':'Mua ◉ '+k.cost;
  b.disabled=on||(!own&&save.coins<k.cost);
}
function drawHangar(){hg.clearRect(0,0,200,230);hg.save();hg.scale(3,3);drawShip(hg,13,12,SKINS[hi],fr>>2);hg.restore()}
$('hg-prev').onclick=()=>{hi=(hi+SKINS.length-1)%SKINS.length;renderHangar()};
$('hg-next').onclick=()=>{hi=(hi+1)%SKINS.length;renderHangar()};
$('hg-action').onclick=()=>{const k=SKINS[hi];
  if(save.skins.includes(k.id))save.skin=k.id;
  else if(save.coins>=k.cost){save.coins-=k.cost;save.skins.push(k.id);save.skin=k.id}
  persist();hud();renderHangar()};
document.querySelectorAll('.open-hangar').forEach(b=>b.onclick=()=>{
  prevOverlay=b.closest('.overlay');prevOverlay.classList.add('hidden');
  hi=Math.max(0,SKINS.findIndex(k=>k.id===save.skin));$('hangar-screen').classList.remove('hidden');renderHangar()});
$('hg-back').onclick=()=>{$('hangar-screen').classList.add('hidden');prevOverlay.classList.remove('hidden')};

function loop(){if(!paused)update();draw();fr++;
  if(!$('hangar-screen').classList.contains('hidden'))drawHangar();requestAnimationFrame(loop)}
player.x=W/2-20;player.y=H-120;
hud();renderDiff();loop();
