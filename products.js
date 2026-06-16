/*
  Load a simple numeric-keyed YAML of products and render buttons into #products-menu.
  Expected format (products.yml):
  1:
    name: "Animal Song"
    link: "anso.html"
  2:
    name: "crazy dave"
    link: "www.crazydave.com"
*/

const prodMenu = document.getElementById('products-menu');

function parseNumberedMapYaml(text){
  const lines = text.split(/\r?\n/);
  const items = [];
  let cur = null;
  let curIndent = 0;
  for(let raw of lines){
    if(raw.trim() === '') continue;
    const m = raw.match(/^(\s*)(\d+):\s*$/);
    if(m){
      cur = { name:'Untitled', link:'#' };
      items.push(cur);
      curIndent = m[1].length;
      continue;
    }
    const kv = raw.match(/^(\s*)([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if(kv && cur){
      const indent = kv[1].length;
      if(indent > curIndent){
        const k = kv[2].trim();
        let v = kv[3].trim();
        if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1);
        if(v.startsWith("'") && v.endsWith("'")) v = v.slice(1,-1);
        cur[k] = v;
      }
    }
  }
  return items;
}

function ensureUrl(url){
  if(!url) return '#';
  // treat absolute http(s) or protocol-relative or relative
  if(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(url) || url.startsWith('//') || url.startsWith('/') ){
    return url;
  }
  // add https:// if it looks like external (contains a dot and no slash at start)
  if(url.includes('.') && !url.includes('/')) return 'https://' + url;
  return url;
}

function renderProducts(items){
  if(!prodMenu) return;
  prodMenu.innerHTML = '';
  if(!items.length) {
    prodMenu.textContent = 'No products.';
    return;
  }
  items.forEach(it=>{
    const btn = document.createElement('button');
    btn.className = 'product-btn';
    btn.setAttribute('role','menuitem');
    btn.type = 'button';
    btn.textContent = it.name || 'Untitled';
    const href = ensureUrl(it.link);
    btn.addEventListener('click', (e)=>{
      // close menu if app.js expects that behavior by focusing/closing
      // navigate: same-origin relative links open in current tab, external open new tab
      try{
        const u = new URL(href, location.href);
        const isSameOrigin = u.origin === location.origin;
        if(isSameOrigin){
          location.href = u.href;
        } else {
          window.open(u.href, '_blank', 'noopener');
        }
      }catch(err){
        // fallback
        window.open(href, '_blank');
      }
    });
    prodMenu.appendChild(btn);
  });
}

// load products.yml
async function loadProducts(){
  if(!prodMenu) return;
  try{
    const res = await fetch('products.yml', { cache: 'no-cache' });
    const txt = await res.text();
    const items = parseNumberedMapYaml(txt);
    renderProducts(items);
  }catch(err){
    console.error('Failed to load products.yml', err);
    prodMenu.textContent = 'Failed to load products.';
  }
}

loadProducts();

// expose for runtime
window.VBProducts = { load: loadProducts };