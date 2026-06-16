const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// Simple keyboard focus for nav links for accessibility
document.querySelectorAll('.nav-link').forEach(link=>{
  link.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' ') link.click();
  });
});

// Products dropdown toggle
const prodTrigger = document.querySelector('.nav-products .btn-trigger');
const prodMenu = document.getElementById('products-menu');

if(prodTrigger && prodMenu){
  function openMenu(){
    prodTrigger.setAttribute('aria-expanded','true');
    prodMenu.setAttribute('aria-hidden','false');
    prodMenu.classList.add('open');
  }
  function closeMenu(){
    prodTrigger.setAttribute('aria-expanded','false');
    prodMenu.setAttribute('aria-hidden','true');
    prodMenu.classList.remove('open');
  }

  prodTrigger.addEventListener('click', (e)=>{
    const expanded = prodTrigger.getAttribute('aria-expanded') === 'true';
    if(expanded) closeMenu(); else openMenu();
  });

  // close when clicking outside
  document.addEventListener('click', (e)=>{
    if(!prodMenu.contains(e.target) && !prodTrigger.contains(e.target)){
      closeMenu();
    }
  });

  // keyboard handling
  prodTrigger.addEventListener('keydown',(e)=>{
    if(e.key === 'Escape') closeMenu();
    if(e.key === 'ArrowDown'){ e.preventDefault(); prodMenu.querySelector('button')?.focus(); }
  });

  prodMenu.addEventListener('keydown',(e)=>{
    const items = Array.from(prodMenu.querySelectorAll('button'));
    const idx = items.indexOf(document.activeElement);
    if(e.key === 'ArrowDown'){ e.preventDefault(); items[(idx+1)%items.length].focus(); }
    if(e.key === 'ArrowUp'){ e.preventDefault(); items[(idx-1+items.length)%items.length].focus(); }
    if(e.key === 'Escape'){ closeMenu(); prodTrigger.focus(); }
  });

  // simple placeholder behavior for product buttons
  prodMenu.querySelectorAll('.product-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      // placeholder action: brief focus ring then close
      btn.focus();
      setTimeout(()=> closeMenu(), 140);
    });
  });
}