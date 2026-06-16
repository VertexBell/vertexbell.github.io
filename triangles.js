const cfg = {
  count: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tri-count')) || 20,
  minSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tri-min-size')) || 4,
  maxSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tri-max-size')) || 40,
  minSpeed: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tri-speed-min')) || 3500,
  maxSpeed: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tri-speed-max')) || 8500,
  baseOpacity: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tri-opacity')) || 0.12
};

const container = document.getElementById('bg-triangles');
if(!container) throw new Error('bg-triangles container not found');

const vw = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = () => Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

/* create triangle elements and store them */
const pool = [];
for(let i=0;i<cfg.count;i++){
  const el = document.createElement('div');
  el.className = 'triangle';
  // randomize base size
  const size = Math.floor(Math.random()*(cfg.maxSize - cfg.minSize)) + cfg.minSize;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  // initial position (will be randomized on show)
  el.style.left = `-100px`;
  el.style.top = `-100px`;
  // set CSS variable for opacity so animations use it
  el.style.setProperty('--tri-opacity', cfg.baseOpacity);
  container.appendChild(el);
  pool.push(el);
}

/* pick a triangle from the pool (the one not currently animating) */
function pick() {
  for(const t of pool){
    if(!t.classList.contains('active')) return t;
  }
  // if all busy, reuse a random one
  return pool[Math.floor(Math.random()*pool.length)];
}

/* show a triangle with randomized properties and schedule hide */
function showOne() {
  const el = pick();
  const w = vw(), h = vh();
  const size = parseInt(el.style.width,10);
  // random position inside hero area (avoid edges a bit)
  const padding = 12;
  const x = Math.max(padding, Math.floor(Math.random()*(w - size - padding*2)));
  const y = Math.max(padding, Math.floor(Math.random()*(h - size - padding*2)));
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  // random rotation for variety
  const rot = Math.floor(Math.random()*360);
  el.style.transform = `rotate(${rot}deg)`;
  // random duration between min and max
  const dur = Math.floor(Math.random()*(cfg.maxSpeed - cfg.minSpeed)) + cfg.minSpeed;
  el.style.animationDuration = `${dur}ms`;
  // start animation
  el.classList.add('active');
  // remove active after duration so it can be reused
  setTimeout(()=> {
    el.classList.remove('active');
    // small delay to let animation-fill-mode finish before repositioning next time
    setTimeout(()=> {
      el.style.left = `-100px`;
      el.style.top = `-100px`;
      el.style.animationDuration = '';
    }, 120);
  }, dur);
}

/* loop: spawn triangles at staggered intervals */
let running = true;
function loop() {
  if(!running) return;
  showOne();
  const gap = Math.floor(Math.random()*800) + 250; // 250-1050ms between spawns
  setTimeout(loop, gap);
}

/* restart on resize to keep positions sensible */
let resizeTimer;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(()=>{
    // nothing heavy: future spawns will recalc vw/vh
  }, 200);
});

/* start */
loop();

/* export simple API on window for runtime tweaks */
window.VBTriangles = {
  stop: ()=> { running = false; },
  start: ()=> { if(!running){ running = true; loop(); } },
  showOne,
  config: cfg
};