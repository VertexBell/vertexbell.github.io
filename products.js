/*
  Load a categorized YAML of products and render grouped buttons into #products-menu.
  Expected format (products.yml):
  free:
    1:
      name: "Free Item"
      link: "..."
  paid:
    1:
      name: "Paid Item"
      link: "..."
*/

const prodMenu = document.getElementById('products-menu');

function parseCategorizedYaml(text){
  const lines = text.split(/\r?\n/);
  const out = {};
  let curCat = null;
  let curItem = null;
  let curItemIndent = 0;

  for(const raw of lines){
    if(raw.trim() === '') continue;
    const line = raw.replace(/\t/g, '  ');
    const mCat = line.match(/^(\s*)([A-Za-z0-9_\-]+)\s*:\s*$/);
    const mNum = line.match(/^(\s*)(\d+)\s*:\s*$/);
    const mKV = line.match(/^(\s*)([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);

    if(mCat && mCat[1].length === 0){
      // top-level category
      curCat = mCat[2];
      out[curCat] = out[curCat] || [];
      curItem = null;
      curItemIndent = 0;
      continue;
    }

    if(mNum && curCat){
      curItem = { name: 'Untitled', link: '#' };
      out[curCat].push(curItem);
      curItemIndent = mNum[1].length;
      continue;
    }

    if(mKV && curItem){
      const indent = mKV[1].length;
      if(indent > curItemIndent){
        const key = mKV[2];
        let val = mKV[3].trim();
        if(val.startsWith('"') && val.endsWith('"')) val = val.slice(1,-1);
        if(val.startsWith("'") && val.endsWith("'")) val = val.slice(1,-1);
        curItem[key] = val;
      }
    }
  }

  return out;
}

function ensureUrl(url){
  if(!url) return '#';
  // absolute URLs or protocol-relative or root-relative paths -> return as-is
  if(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(url) || url.startsWith('//') || url.startsWith('/') ){
    return url;
  }
  // explicit relative paths or file names (including .html) or any path containing a slash -> keep as relative
  if(url.startsWith('./') || url.startsWith('../') || url.endsWith('.html') || url.indexOf('/') !== -1){
    return url;
  }
  // otherwise treat as a bare hostname and prepend https://
  if(url.includes('.')) return 'https://' + url;
  return url;
}

function renderProducts(categorized){
  if(!prodMenu) return;
  prodMenu.innerHTML = '';

  const cats = Object.keys(categorized);
  if(!cats.length){
    prodMenu.textContent = 'No products.';
    return;
  }

  cats.forEach(cat=>{
    const items = categorized[cat] || [];
    // category header
    const wrap = document.createElement('div');
    wrap.className = 'product-category';
    const h = document.createElement('div');
    h.className = 'product-cat-title';
    // human-friendly label
    h.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    wrap.appendChild(h);

    // items
    const list = document.createElement('div');
    list.className = 'product-cat-list';
    items.forEach(it=>{
      const btn = document.createElement('button');
      btn.className = 'product-btn';
      btn.setAttribute('role','menuitem');
      btn.type = 'button';
      btn.textContent = it.name || 'Untitled';
      const href = ensureUrl(it.link);
      btn.addEventListener('click', ()=>{
        try{
          const u = new URL(href, location.href);
          const isSameOrigin = u.origin === location.origin;
          if(isSameOrigin){
            location.href = u.href;
          } else {
            window.open(u.href, '_blank', 'noopener');
          }
        }catch(err){
          window.open(href, '_blank');
        }
      });
      list.appendChild(btn);
    });

    wrap.appendChild(list);
    prodMenu.appendChild(wrap);
  });
}

async function loadProducts(){
  if(!prodMenu) return;
  try{
    const res = await fetch('products.yml', { cache: 'no-cache' });
    const txt = await res.text();
    const categorized = parseCategorizedYaml(txt);
    renderProducts(categorized);
  }catch(err){
    console.error('Failed to load products.yml', err);
    prodMenu.textContent = 'Failed to load products.';
  }
}

loadProducts();

// expose for runtime
window.VBProducts = { load: loadProducts };