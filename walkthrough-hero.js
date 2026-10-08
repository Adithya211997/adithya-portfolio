/* =========================================================
   CINEMATIC WALKTHROUGH HERO — MSR City film
   Runs inside #filmHero on index.html. Requires three.js r128.
   ========================================================= */
(function(){
'use strict';
var hero = document.getElementById('filmHero');
if(!hero) return;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= CHAPTERS ================= */
var CH = [
  {lab:'Cover', dur:9, k:'Architect \u00b7 BIM Coordinator \u2014 RIBA Part 2 \u00b7 Dubai',
   h:'Adithya<br>Prasanna<span>.</span>',
   p:'6+ years across residential, commercial & sports infrastructure \u2014 India, the Middle East and the UK.'},
  {lab:'Arrival', dur:10, k:'Live delivery \u00b7 Sculpt Space',
   h:'MSR City',
   p:'A 62-acre integrated township at Devanahalli, Bengaluru \u2014 3,200+ residences in phased delivery.'},
  {lab:'Towers', dur:10, k:'2 & 3 BHK residences',
   h:'The towers',
   p:'Coordinated structure and services \u2014 clash-free models feeding construction-ready documentation.'},
  {lab:'Amenities', dur:10, k:'The social heart',
   h:'Club & pool',
   p:'Clubhouse, resort pool and landscaped gardens \u2014 masterplan to amenity detail in one federated model.'},
  {lab:'Register', dur:9, k:'Revit \u00b7 Dynamo \u00b7 Navisworks \u00b7 ACC',
   h:'Built to<br>coordinate<span>.</span>',
   p:'Explore the full drawing register \u2014 12 projects across four countries.',
   cta:{href:'work.html', label:'View the drawing register \u2192'}}
];
var CYCLE = CH.reduce(function(s,c){return s+c.dur;},0);

var chWrap = hero.querySelector('.fh-chs');
CH.forEach(function(c,i){
  var d=document.createElement('button');
  d.className='fh-ch'; d.type='button'; d.setAttribute('aria-label',c.lab);
  d.innerHTML='<span class="lab">'+c.lab+'</span><span class="tr"><span class="fl"></span></span>';
  d.addEventListener('click',function(){ jumpTo(i); });
  chWrap.appendChild(d);
});
var chEls=[].slice.call(chWrap.children);
var shotLab=hero.querySelector('#fhShot'), tcEl=hero.querySelector('#fhTc');
var cardEl=hero.querySelector('.fh-card'),
    cK=hero.querySelector('.fh-card .k'),
    cH=hero.querySelector('.fh-card h1'),
    cP=hero.querySelector('.fh-card p'),
    cC=hero.querySelector('.fh-card .fh-cta');

/* ================= THREE GUARD ================= */
if(typeof THREE==='undefined'){ hero.classList.add('no3d'); setCard(0); return; }

var mobile = window.innerWidth < 760;
function heroSize(){ var r=hero.getBoundingClientRect();
  return {w:Math.max(r.width,1), h:Math.max(r.height,1)}; }

var renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true}); }
catch(e){ hero.classList.add('no3d'); setCard(0); return; }
var S=heroSize();
renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile?1.5:2));
renderer.setSize(S.w,S.h);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
hero.insertBefore(renderer.domElement, hero.firstChild);

var scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xcfe0ee,0.0028);
var camera=new THREE.PerspectiveCamera(46,S.w/S.h,.1,900);

/* ---------- sky + env ---------- */
var skyMat=new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{cT:{value:new THREE.Color(0x2f6fd8)},cM:{value:new THREE.Color(0x7db4ea)},cB:{value:new THREE.Color(0xe9f2f6)}},
  vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vP;uniform vec3 cT,cM,cB;void main(){float h=normalize(vP).y;'
    +'vec3 c=h>.3?mix(cM,cT,smoothstep(.3,.95,h)):mix(cB,cM,smoothstep(0.,.3,h));gl_FragColor=vec4(c,1.);}'
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(700,24,16),skyMat));
var envScene=new THREE.Scene();
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(60,16,12),skyMat.clone()));
var sunBall=new THREE.Mesh(new THREE.SphereGeometry(5,8,8),new THREE.MeshBasicMaterial({color:0xfff4dc}));
sunBall.position.set(35,42,20);envScene.add(sunBall);
var pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(envScene,.05).texture;

scene.add(new THREE.HemisphereLight(0xbdd7f0,0x6f7d5e,.75));
var sun=new THREE.DirectionalLight(0xfff1d6,2.1);
sun.position.set(120,150,70);
sun.castShadow=true;
sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
sun.shadow.camera.left=-160;sun.shadow.camera.right=160;
sun.shadow.camera.top=160;sun.shadow.camera.bottom=-160;
sun.shadow.camera.far=500;sun.shadow.bias=-0.0008;
scene.add(sun);

/* ---------- textures ---------- */
function cTex(w,h,fn,srgb,rep){
  var c=document.createElement('canvas');c.width=w;c.height=h;
  fn(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c);
  if(srgb)t.encoding=THREE.sRGBEncoding;
  if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}
  t.anisotropy=8;return t;
}
function noise(x,w,h,amt){var img=x.getImageData(0,0,w,h),d=img.data;
  for(var i=0;i<d.length;i+=4){var n=(Math.random()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
  x.putImageData(img,0,0);}
var stucco=cTex(512,512,function(x,w,h){
  x.fillStyle='#f0e9db';x.fillRect(0,0,w,h);noise(x,w,h,9);
  x.strokeStyle='rgba(120,105,85,.25)';x.lineWidth=2;
  for(var j=0;j<=6;j++){x.beginPath();x.moveTo(0,j*h/6);x.lineTo(w,j*h/6);x.stroke();}
},true);
var stucco2=cTex(512,512,function(x,w,h){
  x.fillStyle='#e5d9c4';x.fillRect(0,0,w,h);noise(x,w,h,9);},true);
var grass=cTex(512,512,function(x,w,h){
  x.fillStyle='#4f7a34';x.fillRect(0,0,w,h);
  for(var i=0;i<5000;i++){x.fillStyle='rgba('+(58+Math.random()*50)+','+(105+Math.random()*60)+','+(38+Math.random()*30)+',.55)';
    x.fillRect(Math.random()*w,Math.random()*h,1.6,3);}
  for(i=0;i<24;i++){x.fillStyle='rgba(40,60,25,.12)';
    x.beginPath();x.arc(Math.random()*w,Math.random()*h,10+Math.random()*40,0,7);x.fill();}
},true,[24,24]);
var paver=cTex(512,512,function(x,w,h){
  x.fillStyle='#c9beab';x.fillRect(0,0,w,h);noise(x,w,h,10);
  x.strokeStyle='rgba(90,80,66,.5)';x.lineWidth=2;
  for(var j=0;j<=8;j++){x.beginPath();x.moveTo(0,j*h/8);x.lineTo(w,j*h/8);x.stroke();
    x.beginPath();x.moveTo(j*w/8,0);x.lineTo(j*w/8,h);x.stroke();}
},true,[30,3]);
var asph=cTex(512,512,function(x,w,h){
  x.fillStyle='#5c6068';x.fillRect(0,0,w,h);noise(x,w,h,12);},true,[26,2]);
var terr=cTex(256,256,function(x,w,h){
  x.fillStyle='#b8623c';x.fillRect(0,0,w,h);noise(x,w,h,12);
  x.strokeStyle='rgba(80,35,20,.5)';x.lineWidth=3;
  for(var j=0;j<=8;j++){x.beginPath();x.moveTo(0,j*h/8);x.lineTo(w,j*h/8);x.stroke();}
},true);
var waterBump=cTex(256,256,function(x,w,h){
  x.fillStyle='#808080';x.fillRect(0,0,w,h);
  for(var i=0;i<300;i++){var g=x.createRadialGradient(Math.random()*w,Math.random()*h,1,Math.random()*w,Math.random()*h,14);
    g.addColorStop(0,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(0,0,w,h);}
});
waterBump.wrapS=waterBump.wrapT=THREE.RepeatWrapping;waterBump.repeat.set(6,6);
var frond=cTex(128,256,function(x,w,h){
  x.clearRect(0,0,w,h);x.translate(w/2,h);x.fillStyle='#3f6d2c';
  x.beginPath();x.moveTo(0,0);
  x.quadraticCurveTo(-w*.38,-h*.55,-2,-h*.98);
  x.quadraticCurveTo(w*.38,-h*.55,0,0);x.fill();
  x.strokeStyle='rgba(28,48,18,.8)';x.lineWidth=3;
  x.beginPath();x.moveTo(0,0);x.lineTo(0,-h*.96);x.stroke();
  for(var s=0;s<12;s++){var yy=-h*.1-s*h*.07;
    x.beginPath();x.moveTo(0,yy);x.lineTo(-w*.3*(1-s/14),yy-14);x.stroke();
    x.beginPath();x.moveTo(0,yy);x.lineTo(w*.3*(1-s/14),yy-14);x.stroke();}
},true);
var signTex=cTex(1024,256,function(x,w,h){
  x.fillStyle='#efe7d6';x.fillRect(0,0,w,h);noise(x,w,h,6);
  x.fillStyle='#22354c';x.font='900 130px Arial, sans-serif';
  x.textAlign='center';x.textBaseline='middle';
  x.fillText('MSR CITY',w/2,h/2+6);
  x.fillStyle='#b8623c';x.fillRect(w*.2,h-30,w*.6,8);
},true);
var haloTex=cTex(128,128,function(x,w,h){
  var g=x.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,w,h);});
var cloudTex=cTex(256,128,function(x,w,h){
  x.clearRect(0,0,w,h);
  for(var i=0;i<16;i++){
    var g=x.createRadialGradient(w*.2+Math.random()*w*.6,h*.35+Math.random()*h*.3,4,
      w*.2+Math.random()*w*.6,h*.4,30+Math.random()*26);
    g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,w,h);}
});
var birdTex=cTex(64,32,function(x,w,h){x.strokeStyle='#1c2126';x.lineWidth=4;x.lineCap='round';
  x.beginPath();x.moveTo(4,24);x.quadraticCurveTo(18,4,32,20);x.quadraticCurveTo(46,4,60,24);x.stroke();});

/* ---------- materials ---------- */
function M_ST(rep){var t=stucco.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);
  return new THREE.MeshStandardMaterial({map:t,roughness:.9,envMapIntensity:.35});}
function M_ST2(rep){var t=stucco2.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);
  return new THREE.MeshStandardMaterial({map:t,roughness:.92,envMapIntensity:.3});}
var GLASS=new THREE.MeshPhysicalMaterial({color:0x27455e,metalness:.1,roughness:.12,envMapIntensity:1.7});
var TERRM=new THREE.MeshStandardMaterial({map:terr,roughness:.85,envMapIntensity:.4});
var RAILW=new THREE.MeshStandardMaterial({color:0xf2efe8,roughness:.6,envMapIntensity:.5});
var METALD=new THREE.MeshStandardMaterial({color:0x3a3f46,metalness:.7,roughness:.4,envMapIntensity:1});

var world=new THREE.Group();scene.add(world);
var tmp=new THREE.Object3D();

/* ---------- ground & drives ---------- */
var ground=new THREE.Mesh(new THREE.PlaneGeometry(900,900),
  new THREE.MeshStandardMaterial({map:grass,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;world.add(ground);
var blvd=new THREE.Mesh(new THREE.PlaneGeometry(14,120),new THREE.MeshStandardMaterial({map:asph,roughness:.95}));
blvd.rotation.x=-Math.PI/2;blvd.position.set(0,.03,72);blvd.receiveShadow=true;world.add(blvd);
var walkL=new THREE.Mesh(new THREE.PlaneGeometry(5,120),new THREE.MeshStandardMaterial({map:paver,roughness:.9}));
walkL.rotation.x=-Math.PI/2;walkL.position.set(-9.5,.035,72);walkL.receiveShadow=true;world.add(walkL);
var walkR=walkL.clone();walkR.position.x=9.5;world.add(walkR);
var ring=new THREE.Mesh(new THREE.RingGeometry(9,17,40),new THREE.MeshStandardMaterial({map:asph.clone(),roughness:.95}));
ring.material.map.needsUpdate=true;ring.material.map.repeat.set(6,2);
ring.rotation.x=-Math.PI/2;ring.position.set(0,.032,12);ring.receiveShadow=true;world.add(ring);
var rlawn=new THREE.Mesh(new THREE.CircleGeometry(9,32),new THREE.MeshStandardMaterial({map:grass.clone(),roughness:1}));
rlawn.material.map.needsUpdate=true;rlawn.material.map.repeat.set(3,3);
rlawn.rotation.x=-Math.PI/2;rlawn.position.set(0,.05,12);world.add(rlawn);
var basin=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.4,.7,28),M_ST([4,1]));
basin.position.set(0,.35,12);basin.castShadow=true;world.add(basin);
var fwater=new THREE.Mesh(new THREE.CircleGeometry(3.8,28),
  new THREE.MeshPhysicalMaterial({color:0x2a7fa8,roughness:.05,envMapIntensity:2,bumpMap:waterBump,bumpScale:.02}));
fwater.rotation.x=-Math.PI/2;fwater.position.set(0,.72,12);world.add(fwater);
var jet=new THREE.Mesh(new THREE.ConeGeometry(.5,3,10),
  new THREE.MeshPhysicalMaterial({color:0xbfe8f5,transparent:true,opacity:.5,roughness:.1}));
jet.position.set(0,2.2,12);world.add(jet);
var drive2=new THREE.Mesh(new THREE.PlaneGeometry(120,10),new THREE.MeshStandardMaterial({map:asph.clone(),roughness:.95}));
drive2.material.map.needsUpdate=true;drive2.material.map.repeat.set(24,2);
drive2.rotation.x=-Math.PI/2;drive2.position.set(0,.028,-4);drive2.receiveShadow=true;world.add(drive2);

/* ---------- entrance ---------- */
function pylon(x){
  var p=new THREE.Mesh(new THREE.BoxGeometry(2.6,9,2.6),M_ST([1,3]));
  p.position.set(x,4.5,96);p.castShadow=true;p.receiveShadow=true;world.add(p);
  var cap=new THREE.Mesh(new THREE.BoxGeometry(3.2,.5,3.2),TERRM);
  cap.position.set(x,9.25,96);cap.castShadow=true;world.add(cap);
}
pylon(-10.5);pylon(10.5);
var beam=new THREE.Mesh(new THREE.BoxGeometry(24,2.6,1.6),M_ST([6,1]));
beam.position.set(0,10.6,96);beam.castShadow=true;world.add(beam);
var sign=new THREE.Mesh(new THREE.PlaneGeometry(14,3.5),
  new THREE.MeshStandardMaterial({map:signTex,roughness:.7,envMapIntensity:.3}));
sign.position.set(0,10.6,96.85);world.add(sign);
var sign2=sign.clone();sign2.rotation.y=Math.PI;sign2.position.z=95.15;world.add(sign2);

/* ---------- towers ---------- */
function tower(x,z,floors,rotY){
  var g=new THREE.Group(),W=13,D=13,FH=3,H=floors*FH;
  var shaft=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),M_ST([3,floors/2]));
  shaft.position.y=H/2;shaft.castShadow=true;shaft.receiveShadow=true;g.add(shaft);
  [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]].forEach(function(c){
    var fin=new THREE.Mesh(new THREE.BoxGeometry(1,H,1),TERRM);
    fin.position.set(c[0],H/2,c[1]);fin.castShadow=true;g.add(fin);});
  var cor=new THREE.Mesh(new THREE.BoxGeometry(W+1.6,.8,D+1.6),M_ST2([4,1]));
  cor.position.y=H+.4;cor.castShadow=true;g.add(cor);
  var visor=new THREE.Mesh(new THREE.ConeGeometry((W+2.6)*.72,1.8,4),TERRM);
  visor.rotation.y=Math.PI/4;visor.position.y=H+1.7;visor.castShadow=true;g.add(visor);
  var winG=new THREE.PlaneGeometry(1.7,1.5);
  var perFace=Math.floor(W/2.6);
  var wins=new THREE.InstancedMesh(winG,GLASS,floors*perFace*4);
  var wi=0;
  [[0,D/2+.02,0],[0,-D/2-.02,Math.PI],[W/2+.02,0,Math.PI/2],[-W/2-.02,0,-Math.PI/2]].forEach(function(f){
    for(var fl=0;fl<floors;fl++){
      for(var c=0;c<perFace;c++){
        var off=-W/2+(c+.5)*(W/perFace);
        var px=(f[2]===0||f[2]===Math.PI)?off:f[0];
        var pz=(f[2]===0||f[2]===Math.PI)?f[1]:off;
        tmp.position.set(px,fl*FH+1.9,pz);
        tmp.rotation.set(0,f[2],0);tmp.scale.set(1,1,1);
        tmp.updateMatrix();wins.setMatrixAt(wi++,tmp.matrix);
      }
    }
  });
  g.add(wins);
  var bC=floors*4;
  var slabs=new THREE.InstancedMesh(new THREE.BoxGeometry(3.6,.22,1.5),M_ST2([2,1]),bC);
  var rails=new THREE.InstancedMesh(new THREE.BoxGeometry(3.6,.9,.08),RAILW,bC);
  var si=0;
  [D/2+.75,-D/2-.75].forEach(function(bz,fi){
    for(var fl=1;fl<floors&&si<bC;fl++){
      var bx=(fl%2?-2.9:2.9);
      tmp.rotation.set(0,0,0);tmp.scale.set(1,1,1);
      tmp.position.set(bx,fl*FH+1.05,bz);tmp.updateMatrix();slabs.setMatrixAt(si,tmp.matrix);
      tmp.position.set(bx,fl*FH+1.6,bz+(fi?-.71:.71));tmp.updateMatrix();rails.setMatrixAt(si,tmp.matrix);
      si++;
    }
  });
  for(;si<bC;si++){tmp.position.set(0,-50,0);tmp.updateMatrix();slabs.setMatrixAt(si,tmp.matrix);rails.setMatrixAt(si,tmp.matrix);}
  slabs.castShadow=true;
  g.add(slabs);g.add(rails);
  g.position.set(x,0,z);g.rotation.y=rotY||0;
  world.add(g);
}
tower(-26,-34,18,.06);
tower(0,-44,22,0);
tower(26,-34,18,-.06);
tower(-44,-14,15,.18);
tower(44,-14,15,-.18);

/* ---------- villas ---------- */
function villa(x,z,ry){
  var g=new THREE.Group();
  var b=new THREE.Mesh(new THREE.BoxGeometry(7,5.4,8),M_ST([2,1]));
  b.position.y=2.7;b.castShadow=true;b.receiveShadow=true;g.add(b);
  var w1=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.4),GLASS);
  w1.position.set(-1.6,2.4,4.02);g.add(w1);
  var w2=w1.clone();w2.position.x=1.6;g.add(w2);
  var roof=new THREE.Mesh(new THREE.ConeGeometry(6.4,2.6,4),TERRM);
  roof.rotation.y=Math.PI/4;roof.position.y=6.7;roof.scale.set(1,1,1.12);roof.castShadow=true;g.add(roof);
  g.position.set(x,0,z);g.rotation.y=ry;world.add(g);
}
[[-30,44,.2],[-42,36,.35],[-34,62,.1],[-48,54,.3],[30,44,-.2],[42,36,-.35],[34,62,-.1],[48,54,-.3]]
.forEach(function(v){villa(v[0],v[1],v[2]);});

/* ---------- clubhouse + pool ---------- */
var club=new THREE.Mesh(new THREE.BoxGeometry(22,7,14),M_ST([5,2]));
club.position.set(56,3.5,10);club.castShadow=true;club.receiveShadow=true;world.add(club);
var clubRoof=new THREE.Mesh(new THREE.ConeGeometry(15.5,3.4,4),TERRM);
clubRoof.rotation.y=Math.PI/4;clubRoof.scale.set(1.25,1,.85);
clubRoof.position.set(56,8.7,10);clubRoof.castShadow=true;world.add(clubRoof);
var clubGlass=new THREE.Mesh(new THREE.PlaneGeometry(18,4.4),GLASS);
clubGlass.position.set(56,2.9,17.05);world.add(clubGlass);
var colG=new THREE.InstancedMesh(new THREE.CylinderGeometry(.32,.36,6.4,10),RAILW,6);
for(var pc=0;pc<6;pc++){tmp.position.set(47+pc*3.6,3.2,17.6);tmp.rotation.set(0,0,0);tmp.scale.set(1,1,1);
  tmp.updateMatrix();colG.setMatrixAt(pc,tmp.matrix);}
colG.castShadow=true;world.add(colG);
var deck=new THREE.Mesh(new THREE.PlaneGeometry(34,26),new THREE.MeshStandardMaterial({map:paver.clone(),roughness:.85}));
deck.material.map.needsUpdate=true;deck.material.map.repeat.set(10,8);
deck.rotation.x=-Math.PI/2;deck.position.set(56,.04,36);deck.receiveShadow=true;world.add(deck);
var poolWater=new THREE.Mesh(new THREE.PlaneGeometry(22,13),
  new THREE.MeshPhysicalMaterial({color:0x1f86b8,roughness:.04,envMapIntensity:2.4,bumpMap:waterBump,bumpScale:.03}));
poolWater.rotation.x=-Math.PI/2;poolWater.position.set(56,.09,36);world.add(poolWater);
var kerb=new THREE.Mesh(new THREE.BoxGeometry(23.4,.24,14.4),M_ST2([6,2]));
kerb.position.set(56,.1,36);world.add(kerb);
var lounge=new THREE.InstancedMesh(new THREE.BoxGeometry(.8,.35,2),RAILW,10);
for(var li=0;li<10;li++){tmp.position.set(45.5+li*2.3,.24,45.5);tmp.rotation.set(-.12,0,0);tmp.scale.set(1,1,1);
  tmp.updateMatrix();lounge.setMatrixAt(li,tmp.matrix);}
lounge.castShadow=true;world.add(lounge);
for(var ui=0;ui<5;ui++){
  var up=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,2.6,6),METALD);
  up.position.set(46.6+ui*4.6,1.3,47.6);world.add(up);
  var uc=new THREE.Mesh(new THREE.ConeGeometry(1.7,.7,10),
    new THREE.MeshStandardMaterial({color:ui%2?0xd8a24a:0xf2efe8,roughness:.7}));
  uc.position.set(46.6+ui*4.6,2.75,47.6);uc.castShadow=true;world.add(uc);
}

/* ---------- palms + hedges ---------- */
var palmSpots=[];
for(var pz2=104;pz2>=28;pz2-=9){ palmSpots.push([-8.6,pz2]); palmSpots.push([8.6,pz2]); }
[[20,16],[-20,16],[14,-2],[-14,-2],[44,26],[68,26],[44,46],[68,46],[56,52],[-34,30],[34,30],[0,26]]
.forEach(function(p){palmSpots.push(p);});
if(mobile) palmSpots=palmSpots.filter(function(_,i){return i%2===0;});
var trunkI=new THREE.InstancedMesh(new THREE.CylinderGeometry(.14,.22,6,8),
  new THREE.MeshStandardMaterial({color:0x8a6a48,roughness:1}),palmSpots.length);
var frondMat=new THREE.MeshStandardMaterial({map:frond,side:THREE.DoubleSide,alphaTest:.45,roughness:.9});
var frondI=new THREE.InstancedMesh(new THREE.PlaneGeometry(2.2,3.4),frondMat,palmSpots.length*7);
var fi2=0;
palmSpots.forEach(function(p,i){
  var s=.85+Math.random()*.4;
  tmp.position.set(p[0],3*s,p[1]);tmp.rotation.set(0,0,0);tmp.scale.set(s,s,s);
  tmp.updateMatrix();trunkI.setMatrixAt(i,tmp.matrix);
  for(var f=0;f<7;f++){
    var ang=f/7*Math.PI*2+Math.random()*.4;
    tmp.position.set(p[0],6*s,p[1]);
    tmp.rotation.order='YXZ';
    tmp.rotation.set(-1.05,ang,0);
    tmp.scale.set(s,s,s);
    tmp.updateMatrix();frondI.setMatrixAt(fi2++,tmp.matrix);
  }
});
trunkI.castShadow=true;frondI.castShadow=true;
world.add(trunkI);world.add(frondI);
var hedge=new THREE.InstancedMesh(new THREE.BoxGeometry(6,1,1.2),
  new THREE.MeshStandardMaterial({color:0x2e5a24,roughness:1}),30);
var hi=0;
for(var hz=100;hz>=32;hz-=8){ tmp.rotation.set(0,0,0);tmp.scale.set(1,1,1);
  tmp.position.set(-13.4,.5,hz);tmp.updateMatrix();hedge.setMatrixAt(hi++,tmp.matrix);
  tmp.position.set(13.4,.5,hz);tmp.updateMatrix();hedge.setMatrixAt(hi++,tmp.matrix); }
while(hi<30){tmp.position.set(0,-9,0);tmp.updateMatrix();hedge.setMatrixAt(hi++,tmp.matrix);}
hedge.castShadow=true;world.add(hedge);

/* ---------- sky props ---------- */
function sprite(x,y,z,sx,sy,tex,op,color){
  var m=new THREE.SpriteMaterial({map:tex,transparent:true,opacity:op,depthWrite:false,color:color||0xffffff,fog:false});
  var s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(sx,sy,1);scene.add(s);return s;}
sprite(180,190,80,140,70,cloudTex,.9);
sprite(-220,160,-60,180,80,cloudTex,.85);
sprite(60,210,-220,200,90,cloudTex,.8);
sprite(-120,140,180,150,70,cloudTex,.75);
sprite(300,330,180,260,260,haloTex,.85,0xfff3d8);
var birds=[];
for(var bd=0;bd<5;bd++){ birds.push(sprite(-60+bd*14,55+Math.random()*14,40-bd*8,5,2.5,birdTex,.85)); }

/* ================= FILM ================= */
function V(x,y,z){return new THREE.Vector3(x,y,z);}
function lerpV(a,b,t){return a.clone().lerp(b,t);}
function smooth(t){return t*t*(3-2*t);}
var mx=0,my=0;
window.addEventListener('pointermove',function(e){
  mx=e.clientX/window.innerWidth-.5;my=e.clientY/window.innerHeight-.5;},{passive:true});

var PATHS=[
  function(u){ var a=2.2+u*.5,r=180-u*30;
    return {p:V(Math.sin(a)*r,95-u*18,60+Math.cos(a)*r),l:V(0,10,10)}; },
  function(u){ return {p:lerpV(V(0,2.3,132),V(0,2.5,34),smooth(u)),l:V(0,7,-6)}; },
  function(u){ return {p:lerpV(V(20,3,16),V(34,52,-2),smooth(u)),l:lerpV(V(0,14,-38),V(0,32,-40),u)}; },
  function(u){ var a=-.6+u*1.9,r=24-u*4;
    return {p:V(56+Math.sin(a)*r,4.5+u*5,36+Math.cos(a)*r),l:V(56,3.2,33)}; },
  function(u){ return {p:lerpV(V(30,18,70),V(110,85,150),smooth(u)),l:V(0,14,0)}; }
];

var playing=true, filmT=0, last=performance.now(), lastCh=-1;
var playBtn=hero.querySelector('.fh-play');
var icoPlay=playBtn.querySelector('.ip'), icoPause=playBtn.querySelector('.iq');
playBtn.addEventListener('click',function(){
  playing=!playing;
  icoPlay.style.display=playing?'none':'block';
  icoPause.style.display=playing?'block':'none';
  playBtn.setAttribute('aria-label',playing?'Pause':'Play');
});
function jumpTo(i){var acc=0;for(var k=0;k<i;k++)acc+=CH[k].dur;filmT=acc+.02;lastCh=-1;}
function chapterAt(t){var tc=t%CYCLE,acc=0;
  for(var i=0;i<CH.length;i++){
    if(tc<acc+CH[i].dur)return{i:i,u:(tc-acc)/CH[i].dur,local:tc-acc};
    acc+=CH[i].dur;}
  return{i:0,u:0,local:0};}
function fmt(t){var s=Math.floor(t%CYCLE);return '0'+Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
var BLEND=1.6;
function poseAt(t){
  var c=chapterAt(t);
  var cur=PATHS[c.i](c.u);
  var rem=CH[c.i].dur-c.local;
  if(rem<BLEND){
    var n=(c.i+1)%CH.length;
    var nxt=PATHS[n](0);
    var w=smooth(1-rem/BLEND);
    cur.p.lerp(nxt.p,w);cur.l.lerp(nxt.l,w);
  }
  return cur;
}
function setCard(i){
  var c=CH[i];
  cardEl.classList.remove('show');
  setTimeout(function(){
    cK.textContent=c.k; cH.innerHTML=c.h; cP.textContent=c.p;
    if(c.cta){cC.textContent=c.cta.label;cC.setAttribute('href',c.cta.href);cC.style.display='inline-block';}
    else cC.style.display='none';
    cardEl.classList.add('show');
  },350);
  if(shotLab) shotLab.textContent='CH 0'+(i+1)+' \u2014 '+c.lab;
  chEls.forEach(function(el,k){el.classList.toggle('on',k===i);});
}

function onResize(){
  var S2=heroSize();
  camera.aspect=S2.w/S2.h;camera.updateProjectionMatrix();
  renderer.setSize(S2.w,S2.h);
}
window.addEventListener('resize',onResize);

var inView=true;
new IntersectionObserver(function(es){
  es.forEach(function(en){ inView=en.isIntersecting; last=performance.now(); if(inView)loop(); });
},{threshold:.02}).observe(hero);
var visible=true;
document.addEventListener('visibilitychange',function(){visible=!document.hidden;last=performance.now();if(visible&&inView)loop();});

var camPos=V(150,95,160),camLook=V(0,10,10);
var raf=false;
function loop(){
  if(!visible||!inView){raf=false;return;}
  raf=true;
  requestAnimationFrame(loop);
  var now=performance.now(),dt=Math.min((now-last)/1000,.1);last=now;
  if(playing&&!reduced)filmT+=dt;

  var c=chapterAt(filmT);
  if(c.i!==lastCh){lastCh=c.i;setCard(c.i);}
  chEls.forEach(function(el,k){
    el.querySelector('.fl').style.transform='scaleX('+(k<c.i?1:k===c.i?c.u:0)+')';
  });
  if(tcEl)tcEl.textContent=fmt(filmT);

  waterBump.offset.x+=dt*.05;waterBump.offset.y+=dt*.032;
  jet.scale.y=1+Math.sin(now*.004)*.12;
  birds.forEach(function(b,i){
    b.position.x+=dt*(2.6+i*.3);
    b.position.y+=Math.sin(now*.002+i)*dt*1.2;
    if(b.position.x>160)b.position.x=-160;
  });

  var pose=reduced?PATHS[c.i](.45):poseAt(filmT);
  var tp=pose.p,tl=pose.l;
  if(!reduced){tp=tp.clone();tp.x+=mx*3;tp.y+=-my*2;}
  camPos.lerp(tp,reduced?1:.08);
  camLook.lerp(tl,reduced?1:.09);
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  renderer.render(scene,camera);
}
setCard(0);
loop();
})();
