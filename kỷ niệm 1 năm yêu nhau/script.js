// ============================================================
// script.js — Toàn bộ logic tương tác
// (Không cần chỉnh sửa file này — hãy sửa config.js)
// ============================================================


// ─── ÁP DỤNG CONFIG VÀO HTML ───
document.getElementById('bgMusic').setAttribute('src', MUSIC_SRC);
document.getElementById('portraitName').textContent = PORTRAIT_NAME;
document.getElementById('heroTitle').innerHTML = HERO_TITLE;
document.getElementById('heroSubtitle').textContent = HERO_SUBTITLE;
document.getElementById('letterSign').textContent = LETTER_SIGN;
document.getElementById('giftMessage').textContent = GIFT_MESSAGE;
document.getElementById('footerText').textContent = FOOTER_TEXT;
document.getElementById('footerSub').textContent = FOOTER_SUB;


// ─── MÀN 1: MẬT KHẨU ───

// Sao trắng nhỏ nền
const passStarsBg = document.getElementById('passStarsBg');
for (let i = 0; i < 120; i++) {
  const s = document.createElement('div');
  s.className = 'pass-star';
  const size = 1 + Math.random() * 2.5;
  s.style.cssText = `
    left:${Math.random()*100}%;top:${Math.random()*100}%;
    width:${size}px;height:${size}px;
    background:${Math.random()>0.7?'#fff':'rgba(255,255,255,0.7)'};
    opacity:${0.1+Math.random()*0.9};
    animation-duration:${1.5+Math.random()*3}s;
    animation-delay:${Math.random()*3}s;
  `;
  passStarsBg.appendChild(s);
}

// Sao màu sparkle
const sparkleData = [
  {top:'8%', left:'8%',  icon:'⭐', delay:'0s',   dur:'2.2s'},
  {top:'6%', left:'25%', icon:'✦',  delay:'0.4s',  dur:'1.8s', color:'#c084fc'},
  {top:'12%',left:'60%', icon:'⭐', delay:'0.8s',  dur:'2.5s'},
  {top:'5%', left:'78%', icon:'✦',  delay:'0.2s',  dur:'2s',   color:'#60a5fa'},
  {top:'18%',left:'90%', icon:'⭐', delay:'1.1s',  dur:'1.9s'},
  {top:'30%',left:'5%',  icon:'✦',  delay:'0.6s',  dur:'2.3s', color:'#fb7185'},
  {top:'45%',left:'92%', icon:'⭐', delay:'0.3s',  dur:'2.1s'},
  {top:'60%',left:'88%', icon:'✦',  delay:'0.9s',  dur:'1.7s', color:'#a78bfa'},
  {top:'22%',left:'45%', icon:'⭐', delay:'1.3s',  dur:'2.4s'},
  {top:'15%',left:'15%', icon:'💫', delay:'0.5s',  dur:'3s'},
  {top:'10%',left:'50%', icon:'✦',  delay:'1.6s',  dur:'2.2s', color:'#fbbf24'},
];
const sparklesEl = document.getElementById('passSparkles');
sparkleData.forEach(d => {
  const el = document.createElement('div');
  el.className = 'pass-sparkle';
  el.textContent = d.icon;
  el.style.cssText = `top:${d.top};left:${d.left};animation-delay:${d.delay};animation-duration:${d.dur};${d.color?'color:'+d.color+';':''}`;
  sparklesEl.appendChild(el);
});

let passInput = '';

function pressKey(k) {
  if (k === 'clr') { passInput = ''; updateDots(); return; }
  if (k === 'del') { passInput = passInput.slice(0, -1); updateDots(); return; }
  if (passInput.length >= 4) return;
  passInput += k;
  updateDots();
  if (passInput.length === 4) setTimeout(checkPass, 200);
}

function updateDots() {
  for (let i = 0; i < 4; i++)
    document.getElementById('d' + i).classList.toggle('filled', i < passInput.length);
}

function checkPass() {
  if (passInput === SECRET_CODE) {
    document.getElementById('screenPass').classList.add('hidden');
    document.getElementById('screenGalaxy').classList.remove('hidden');
    startGalaxyScreen();
  } else {
    const err = document.getElementById('passError');
    err.classList.add('show');
    setTimeout(() => { err.classList.remove('show'); passInput = ''; updateDots(); }, 1600);
  }
}

// Nhập bàn phím vật lý
document.addEventListener('keydown', (e) => {
  if (document.getElementById('screenPass').classList.contains('hidden')) return;
  if (/^[0-9]$/.test(e.key)) pressKey(e.key);
  else if (e.key === 'Backspace') pressKey('del');
});


// ─── MÀN 2: GALAXY (THREE.JS 3D INTERACTIVE SATURN GALAXY) ───

const galaxyCanvas = document.getElementById('galaxyBigCanvas');
let scene, camera, renderer;
let spherePoints, ringPoints, nebulaPoints;
let galaxyRunning = false;
let galaxyAssemblyProgress = 0;

// 3D Controls and Dragging with Inertia
let isDraggingG = false;
let prevMouseX = 0, prevMouseY = 0;
let gSpinXSpeed = 0, gSpinYSpeed = 0;
let gRotY = 0.45, gRotX = 0.28;

// Camera Position variables
let currentRotY = 0.45, currentRotX = 0.28;
let distance = 26; // Distance from origin
const minDistance = 5;
const maxDistance = 70;

// 3D Orbiting Photo Cards for Couple Photos
let galaxyPhotos = [];

// Resize WebGL viewport
function resizeGalaxy() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  galaxyCanvas.width = w;
  galaxyCanvas.height = h;
  if (renderer && camera) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener('resize', resizeGalaxy);

// Programmatically generate a glowing stardust radial texture
function createGlowingParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// Generate the beautiful Polaroid graphic on a 2D canvas and load as Three.js texture
function createPolaroidTexture(c) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  
  // Clear with transparent bg
  ctx.clearRect(0, 0, 256, 320);
  
  // Draw card white background with soft outline
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, 256, 320, 16);
  else ctx.rect(0, 0, 256, 320);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 133, 179, 0.2)';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Photo frame dimensions
  const px = 16, py = 16, pw = 224, ph = 224;
  
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 8);
  else ctx.rect(px, py, pw, ph);
  ctx.clip();
  
  const img = c.img;
  const imgAspect = img.width / img.height;
  const slotAspect = pw / ph;
  let dx = px, dy = py, dw = pw, dh = ph;
  if (imgAspect > slotAspect) {
    dw = ph * imgAspect;
    dx = px - (dw - pw) / 2;
  } else {
    dh = pw / imgAspect;
    dy = py - (dh - ph) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  
  // Polaroid Caption Text
  ctx.fillStyle = '#7d495d';
  ctx.font = '20px "Itim"';
  ctx.textAlign = 'center';
  ctx.fillText(c.caption, 128, 288);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function updatePhotoSprite(c) {
  if (c.sprite) {
    const oldTexture = c.sprite.material.map;
    c.sprite.material.map = createPolaroidTexture(c);
    c.sprite.material.needsUpdate = true;
    if (oldTexture) oldTexture.dispose();
  }
}

// Initializing WebGL Space Scene
function initThreeGalaxy() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  scene = new THREE.Scene();
  
  // Perspective Camera
  camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 1000);
  
  renderer = new THREE.WebGLRenderer({
    canvas: galaxyCanvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const particleTexture = createGlowingParticleTexture();
  
  // 1. Dense Hollow Sphere
  const sphereGeometry = new THREE.BufferGeometry();
  const sphereCount = 15000;
  const spherePositions = new Float32Array(sphereCount * 3);
  const sphereTargetPositions = new Float32Array(sphereCount * 3);
  const sphereColors = new Float32Array(sphereCount * 3);
  
  for (let i = 0; i < sphereCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    // Target surface sphere + slight noise
    const r = 12 + (Math.random() - 0.5) * 1.5; 
    const tx = r * Math.sin(phi) * Math.cos(theta);
    const ty = r * Math.sin(phi) * Math.sin(theta);
    const tz = r * Math.cos(phi);
    
    // Initial Scattered Position
    const initR = 50 + Math.random() * 50;
    const ix = initR * Math.sin(phi) * Math.cos(theta);
    const iy = initR * Math.sin(phi) * Math.sin(theta);
    const iz = initR * Math.cos(phi);
    
    sphereTargetPositions[i*3] = tx;
    sphereTargetPositions[i*3+1] = ty;
    sphereTargetPositions[i*3+2] = tz;
    
    spherePositions[i*3] = ix;
    spherePositions[i*3+1] = iy;
    spherePositions[i*3+2] = iz;
    
    const color = new THREE.Color();
    // Colors from the image: mostly purple with some pinks
    color.setHSL(0.82 + Math.random() * 0.08, 0.9, 0.65 + Math.random() * 0.15);
    sphereColors[i*3] = color.r;
    sphereColors[i*3+1] = color.g;
    sphereColors[i*3+2] = color.b;
  }
  
  sphereGeometry.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
  sphereGeometry.setAttribute('color', new THREE.BufferAttribute(sphereColors, 3));
  
  const sphereMaterial = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  spherePoints = new THREE.Points(sphereGeometry, sphereMaterial);
  spherePoints.userData.targetPositions = sphereTargetPositions;
  scene.add(spherePoints);
  
  // 2. Massive Flat Disc (Ocean of particles)
  const ringGeometry = new THREE.BufferGeometry();
  const ringCount = 25000;
  const ringPositions = new Float32Array(ringCount * 3);
  const ringTargetPositions = new Float32Array(ringCount * 3);
  const ringColors = new Float32Array(ringCount * 3);
  
  for (let i = 0; i < ringCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    // Massive flat disc, denser near the center
    const r = 10 + Math.pow(Math.random(), 1.5) * 50; 
    
    const tx = Math.cos(theta) * r;
    const tz = Math.sin(theta) * r;
    // Flat with slight wave/noise
    const ty = (Math.random() - 0.5) * 1.2 + Math.sin(r * 0.2) * 0.5;
    
    // Initial Scattered Position
    const initR = 50 + Math.random() * 50;
    const ix = Math.cos(theta) * initR;
    const iz = Math.sin(theta) * initR;
    const iy = (Math.random() - 0.5) * 60;
    
    ringTargetPositions[i*3] = tx;
    ringTargetPositions[i*3+1] = ty;
    ringTargetPositions[i*3+2] = tz;
    
    ringPositions[i*3] = ix;
    ringPositions[i*3+1] = iy;
    ringPositions[i*3+2] = iz;
    
    const color = new THREE.Color();
    // Colors from the image: bright pink for the disc
    color.setHSL(0.88 + Math.random() * 0.05, 0.95, 0.7 + Math.random() * 0.15); 
    ringColors[i*3] = color.r;
    ringColors[i*3+1] = color.g;
    ringColors[i*3+2] = color.b;
  }
  
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
  
  const ringMaterial = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  ringPoints = new THREE.Points(ringGeometry, ringMaterial);
  ringPoints.userData.targetPositions = ringTargetPositions;
  scene.add(ringPoints);
  
  // 4. Create floating Plane Geometry Billboard Cards
  galaxyPhotos.forEach(c => {
    const texture = createPolaroidTexture(c);
    const geometry = new THREE.PlaneGeometry(3.6, 4.5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    c.sprite = mesh; // Keep property name "sprite" for existing code compatibility
    scene.add(mesh);
  });
}

// 3D dragging & rotation inertia listeners
galaxyCanvas.addEventListener('mousedown', (e) => {
  isDraggingG = true;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
  gSpinXSpeed = 0; gSpinYSpeed = 0;
});

window.addEventListener('mousemove', (e) => {
  if (!isDraggingG) return;
  const deltaX = e.clientX - prevMouseX;
  const deltaY = e.clientY - prevMouseY;
  
  gRotY += deltaX * 0.005;
  gRotX += deltaY * 0.005;
  gRotX = Math.max(-Math.PI/3, Math.min(Math.PI/3, gRotX));
  
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
  
  gSpinYSpeed = deltaX * 0.001;
  gSpinXSpeed = deltaY * 0.001;
});

window.addEventListener('mouseup', () => {
  isDraggingG = false;
});

// Touch controls for iPad/Mobile and Pinch Zoom
let initialPinchDist = null;

galaxyCanvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDraggingG = true;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
    gSpinXSpeed = 0; gSpinYSpeed = 0;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    initialPinchDist = Math.sqrt(dx*dx + dy*dy);
  }
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && isDraggingG) {
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;
    
    gRotY += deltaX * 0.005;
    gRotX += deltaY * 0.005;
    gRotX = Math.max(-Math.PI/3, Math.min(Math.PI/3, gRotX));
    
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;
    
    gSpinYSpeed = deltaX * 0.001;
    gSpinXSpeed = deltaY * 0.001;
  } else if (e.touches.length === 2 && initialPinchDist) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const currentDist = Math.sqrt(dx*dx + dy*dy);
    const zoomDelta = initialPinchDist - currentDist;
    distance += zoomDelta * 0.1;
    distance = Math.max(minDistance, Math.min(maxDistance, distance));
    initialPinchDist = currentDist;
  }
});

window.addEventListener('touchend', () => {
  isDraggingG = false;
  initialPinchDist = null;
});

// PC Mouse Wheel Zoom
galaxyCanvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  distance += e.deltaY * 0.05;
  distance = Math.max(minDistance, Math.min(maxDistance, distance));
}, { passive: false });

// Interactive Raycasting and Click Handlers
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

galaxyCanvas.addEventListener('click', (e) => {
  if (Math.abs(gSpinXSpeed) > 0.005 || Math.abs(gSpinYSpeed) > 0.005) return;
  
  const rect = galaxyCanvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const targets = galaxyPhotos.map(c => c.sprite).filter(Boolean);
  const intersects = raycaster.intersectObjects(targets);
  
  if (intersects.length > 0) {
    const clickedSprite = intersects[0].object;
    const idx = galaxyPhotos.findIndex(c => c.sprite === clickedSprite);
    if (idx !== -1) {
      triggerPhotoCardAction(idx);
    }
  }
});

galaxyCanvas.addEventListener('touchend', (e) => {
  if (Math.abs(gSpinXSpeed) > 0.005 || Math.abs(gSpinYSpeed) > 0.005) return;
  if (e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    const rect = galaxyCanvas.getBoundingClientRect();
    mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const targets = galaxyPhotos.map(c => c.sprite).filter(Boolean);
    const intersects = raycaster.intersectObjects(targets);
    
    if (intersects.length > 0) {
      const clickedSprite = intersects[0].object;
      const idx = galaxyPhotos.findIndex(c => c.sprite === clickedSprite);
      if (idx !== -1) {
        triggerPhotoCardAction(idx);
      }
    }
  }
});

function triggerPhotoCardAction(idx) {
  const c = galaxyPhotos[idx];
  openGalaxyPhotoModal(c);
}

// POPUP MODAL CONTROL
function openGalaxyPhotoModal(c) {
  let modal = document.getElementById('galaxyPhotoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'galaxyPhotoModal';
    modal.className = 'galaxy-modal';
    modal.innerHTML = `
      <div class="galaxy-modal-content">
        <button class="galaxy-modal-close" onclick="closeGalaxyPhotoModal()">✕</button>
        <div class="galaxy-modal-img-wrap">
          <img class="galaxy-modal-img" id="galaxyModalImg" src="" alt="">
        </div>
        <div class="galaxy-modal-caption" id="galaxyModalCaption"></div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGalaxyPhotoModal();
    });
  }
  
  document.getElementById('galaxyModalImg').src = c.img.src;
  document.getElementById('galaxyModalCaption').textContent = c.caption;
  modal.classList.add('active');
  spawnModalBurst();
}

function closeGalaxyPhotoModal() {
  const modal = document.getElementById('galaxyPhotoModal');
  if (modal) modal.classList.remove('active');
}

// Particle burst from center
function spawnModalBurst() {
  const hearts = ['💕','💝','🌸','✨','💖','💗','⭐','💘'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: fixed; pointer-events: none; z-index: 2100;
      left: 50vw; top: 50vh;
      font-size: ${12 + Math.random() * 18}px;
      animation: modalParticle 1.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    `;
    p.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 70 + Math.random() * 110;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

// Render loop for WebGL Space scene
function drawGalaxyBig() {
  if (!renderer || !camera) return;
  
  // Smooth camera yaw/pitch interpolation with damping
  currentRotY += (gRotY - currentRotY) * 0.08;
  currentRotX += (gRotX - currentRotX) * 0.08;
  
  camera.position.x = Math.sin(currentRotY) * Math.cos(currentRotX) * distance;
  camera.position.y = Math.sin(currentRotX) * distance;
  camera.position.z = Math.cos(currentRotY) * Math.cos(currentRotX) * distance;
  camera.lookAt(0, 0, 0);
  
  // Falling photo cards
  galaxyPhotos.forEach(c => {
    if (!isDraggingG) {
      c.y -= c.speedY;
      // Reset to top if it falls too low
      if (c.y < -25) {
        c.y = 25 + Math.random() * 15;
        c.x = (Math.random() - 0.5) * 40;
        c.z = (Math.random() - 0.5) * 40;
      }
    }
    
    if (c.sprite) {
      c.sprite.position.set(c.x, c.y, c.z);
      // Make the photo always face the camera for best visibility
      c.sprite.lookAt(camera.position);
    }
  });
  
  // Cinematic Assembly Animation!
  if (galaxyAssemblyProgress < 1) {
    galaxyAssemblyProgress += 0.006; // Takes ~2.5 seconds to fully assemble
    if (galaxyAssemblyProgress > 1) galaxyAssemblyProgress = 1;
    
    if (spherePoints) {
      const pos = spherePoints.geometry.attributes.position.array;
      const target = spherePoints.userData.targetPositions;
      for (let i = 0; i < pos.length; i++) {
        pos[i] += (target[i] - pos[i]) * 0.06; // Spring towards target
      }
      spherePoints.geometry.attributes.position.needsUpdate = true;
    }
    
    if (ringPoints) {
      const pos = ringPoints.geometry.attributes.position.array;
      const target = ringPoints.userData.targetPositions;
      for (let i = 0; i < pos.length; i++) {
        pos[i] += (target[i] - pos[i]) * 0.06; // Spring towards target
      }
      ringPoints.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Rotate system components slowly for extra ambient animation
  if (spherePoints) spherePoints.rotation.y += 0.0006;
  if (ringPoints) ringPoints.rotation.y += 0.001;
  
  renderer.render(scene, camera);
}


function galaxyLoop() { 
  drawGalaxyBig(); 
  
  if (!isDraggingG) {
    gRotY += 0.003 + gSpinYSpeed;
    gRotX += gSpinXSpeed;
    gSpinYSpeed *= 0.94;
    gSpinXSpeed *= 0.94;
  }
  
  if (galaxyRunning) requestAnimationFrame(galaxyLoop); 
}

// Countdown timer on galaxy screen
let timerVal = TIMER_TOTAL, timerInterval = null;
const circumference = 377;

function startGalaxyScreen() {
  // Initialize Three.js WebGL Galaxy
  initThreeGalaxy();
  resizeGalaxy();
  galaxyAssemblyProgress = 0;
  
  galaxyRunning = true;
  galaxyLoop();
  
  loadGalaxyPhotos();
  
  timerVal = TIMER_TOTAL;
  document.getElementById('timerText').textContent = timerVal;
  document.getElementById('timerRingFg').style.strokeDashoffset = '0';

  timerInterval = setInterval(() => {
    timerVal--;
    document.getElementById('timerText').textContent = timerVal;
    const offset = circumference * (1 - timerVal/TIMER_TOTAL);
    document.getElementById('timerRingFg').style.strokeDashoffset = offset;
    if (timerVal % 3 === 0) for (let i = 0; i < 3; i++) setTimeout(() => spawnGalaxyHeart(), i*200);
    if (timerVal <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timerWrap').style.display = 'none';
      document.getElementById('letterRevealBtn').classList.add('visible');
    }
  }, 1000);

  setInterval(() => { if (timerVal > 0) spawnGalaxyHeart(); }, 1200);
}

function spawnGalaxyHeart() {
  const hearts = ['💕','💝','🌸','✨','💖','🌷','💗','⭐','🌌'];
  const el = document.createElement('div');
  el.className = 'floating-heart';
  el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
  el.style.left = (10+Math.random()*80) + 'vw';
  el.style.top  = (60+Math.random()*30) + 'vh';
  el.style.fontSize = (12+Math.random()*20) + 'px';
  el.style.animationDuration = (3+Math.random()*3) + 's';
  document.getElementById('screenGalaxy').appendChild(el);
  setTimeout(() => el.remove(), 7000);
}

// Upload couple portraits
function loadPortrait(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('portraitImg');
    img.src = e.target.result; img.classList.add('loaded');
    document.getElementById('portraitPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}


// ─── CHUYỂN SANG MÀN HỒNG ───
function goToPink() {
  galaxyRunning = false;
  document.getElementById('screenGalaxy').classList.add('hidden');
  const pink = document.getElementById('screenPink');
  pink.style.display   = 'block'; // Make it visible in layout!
  pink.style.position  = 'relative';
  pink.style.transform = 'translateY(0)';
  document.body.style.background = 'linear-gradient(135deg,#fff0f5 0%,#fce4ec 30%,#f3e5f5 60%,#ffd6e7 100%)';
  document.body.style.overflow = 'auto'; // Re-enable body scroll!
  initPinkPage();
  for (let i = 0; i < 20; i++) setTimeout(() => spawnPinkHeart(Math.random()*window.innerWidth, window.innerHeight*0.8), i*80);
}


// ─── MÀN 3: TRANG HỒNG ───

function initPinkPage() {
  buildAlbum();
  buildTimeline();
  typeWriter(document.getElementById('letterText'), LETTER_TEXT, 28);
  updateCountdown();
  setInterval(updateCountdown, 1000);
  startPetalCanvas();

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#giftBox') && !e.target.closest('.music-player'))
      spawnPinkHeart(e.clientX, e.clientY);
  });

  document.addEventListener('click', () => {
    if (!musicPlaying) {
      document.getElementById('bgMusic').play().then(() => {
        musicPlaying = true;
        document.getElementById('musicLabel').textContent = 'Đang phát';
        document.querySelectorAll('.wave-bar').forEach(b => b.classList.remove('paused'));
      }).catch(() => {});
    }
  }, { once: true });
}

// Hiệu ứng đánh máy cho thư
function typeWriter(el, text, speed) {
  let i = 0; el.innerHTML = '';
  function type() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
      i++; setTimeout(type, speed);
    }
  }
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { type(); obs.disconnect(); }
  });
  obs.observe(el);
}

// Tạo album ảnh
function buildAlbum() {
  const grid = document.getElementById('albumGrid');
  ALBUM_PHOTOS.forEach((photo, i) => {
    const f = document.createElement('div');
    f.className = 'photo-frame';
    f.innerHTML = `
      <div class="photo-placeholder">
        <img id="photo-${i}" src="${photo.src}" alt="${photo.caption}" class="loaded" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><text x=\\'50\\' y=\\'50\\' font-family=\\'Arial\\' font-size=\\'14\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\'>Chưa có ảnh</text></svg>'">
      </div>
      <div class="photo-caption">${photo.caption}</div>`;
    grid.appendChild(f);
  });
}

function loadPhoto(input, idx) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById(`photo-${idx}`);
    img.src = e.target.result; img.classList.add('loaded');
    img.previousElementSibling.previousElementSibling.style.display = 'none';
    img.previousElementSibling.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Tạo timeline
function buildTimeline() {
  const tl = document.getElementById('timeline');
  TIMELINE_EVENTS.forEach((ev, i) => {
    const item = document.createElement('div');
    item.className = 'tl-item';
    item.innerHTML = `
      <div class="tl-content">
        <div class="tl-date">${ev.date}</div>
        <div class="tl-event">${ev.event}</div>
        <div class="tl-desc">${ev.desc}</div>
      </div>
      <div class="tl-dot">${ev.emoji || '💖'}</div>`;
    item.style.transitionDelay = (i * 0.1) + 's';
    tl.appendChild(item);
  });
  const obs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.2 }
  );
  document.querySelectorAll('.tl-item').forEach(el => obs.observe(el));
}

// Đếm thời gian yêu nhau
function updateCountdown() {
  const diff = new Date() - START_DATE;
  document.getElementById('cnt-days').textContent  = Math.floor(diff / 86400000);
  document.getElementById('cnt-hours').textContent = Math.floor((diff % 86400000) / 3600000);
  document.getElementById('cnt-mins').textContent  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  document.getElementById('cnt-secs').textContent  = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
}

// Nhạc nền
let musicPlaying = false;
function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('musicIcon');
  const label = document.getElementById('musicLabel');
  const bars  = document.querySelectorAll('.wave-bar');
  if (musicPlaying) {
    audio.pause(); musicPlaying = false;
    icon.classList.add('paused'); label.textContent = 'Bật nhạc';
    bars.forEach(b => b.classList.add('paused'));
  } else {
    audio.play().catch(() => {}); musicPlaying = true;
    icon.classList.remove('paused'); label.textContent = 'Đang phát';
    bars.forEach(b => b.classList.remove('paused'));
  }
}

// Mở hộp quà
let giftOpened = false;
function openGift() {
  if (giftOpened) return; giftOpened = true;
  document.getElementById('giftLid').classList.add('open');
  document.getElementById('giftInner').classList.add('opened');
  document.getElementById('giftMessage').classList.add('revealed');
  for (let i = 0; i < 18; i++) setTimeout(() => spawnPinkHeart(), i*80);
}

// Trái tim bay màn hồng
function spawnPinkHeart(x, y) {
  const hearts = ['💕','💝','🌸','✨','💖','🌷','💗','🫶'];
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    font-size:${14+Math.random()*18}px;
    left:${x||Math.random()*window.innerWidth}px;
    top:${y||window.innerHeight*0.8}px;
    animation:floatUp ${2.5+Math.random()*2.5}s linear forwards;
  `;
  el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

// Canvas cánh hoa rơi
function startPetalCanvas() {
  const canvas = document.getElementById('petalCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

  const EMOJIS = ['🌸','🌷','🌹','💮','✿','❀'];
  class Petal {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : -30;
      this.size = 10 + Math.random() * 14;
      this.vy = 0.5 + Math.random() * 1.2;
      this.vx = (Math.random()-0.5) * 0.6;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random()-0.5) * 0.04;
      this.emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
      this.opacity = 0.55 + Math.random() * 0.45;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.01 + Math.random() * 0.02;
    }
    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * 0.4;
      this.y += this.vy;
      this.rot += this.rotSpeed;
      if (this.y > canvas.height + 40) this.reset(false);
    }
    draw() {
      ctx.save(); ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      ctx.font = this.size + 'px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0); ctx.restore();
    }
  }

  const petals = [];
  for (let i = 0; i < 32; i++) petals.push(new Petal());
  function loop() { ctx.clearRect(0,0,canvas.width,canvas.height); petals.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(loop); }
  loop();
}

// Inject keyframe floatUp
const style = document.createElement('style');
style.textContent = '@keyframes floatUp{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:0.85;}100%{transform:translateY(-90vh) rotate(360deg) scale(0.4);opacity:0;}}';
document.head.appendChild(style);

function loadGalaxyPhotos() {
  const photosToLoad = (typeof GALAXY_PHOTOS !== 'undefined' && GALAXY_PHOTOS.length > 0) ? GALAXY_PHOTOS : ALBUM_PHOTOS;
  
  photosToLoad.forEach((photo, index) => {
    const img = new Image();
    img.onload = () => {
      const c = {
        img: img,
        hasImage: true,
        caption: photo.caption || '',
        x: (Math.random() - 0.5) * 40,
        y: 10 + Math.random() * 30,
        z: (Math.random() - 0.5) * 40,
        speedY: 0.015 + Math.random() * 0.02
      };
      
      galaxyPhotos.push(c);
      
      const texture = createPolaroidTexture(c);
      const geometry = new THREE.PlaneGeometry(3.6, 4.5);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      c.sprite = mesh;
      scene.add(mesh);
    };
    img.onerror = () => {
      console.warn('Không tải được ảnh vũ trụ:', photo.src);
    };
    img.src = photo.src;
  });
}