/*
  Simple YAML loader for a minimal news.yml format.
  Expected format:
  - title: Some title
    date: 2026-06-01
    body: Short text or HTML
  (a YAML list of mappings)
*/
const listEl = document.getElementById('news-list');

function parseSimpleYamlList(text){
  // Very small parser for list of maps (no nesting expected).
  const lines = text.split(/\r?\n/);
  const items = [];
  let cur = null;
  for(let raw of lines){
    const line = raw.trim();
    if(line === '' ) continue;
    if(line.startsWith('- ')){
      // start new item, may have "- key: value" first or "- key: value" followed by lines
      const after = line.slice(2);
      cur = {};
      items.push(cur);
      if(after){
        const idx = after.indexOf(':');
        if(idx !== -1){
          const k = after.slice(0,idx).trim();
          let v = after.slice(idx+1).trim();
          if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1);
          cur[k] = v;
        }
      }
    } else if(cur && line.includes(':')){
      const idx = line.indexOf(':');
      const k = line.slice(0,idx).trim();
      let v = line.slice(idx+1).trim();
      if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1);
      cur[k] = v;
    }
  }
  return items;
}

async function loadNews(){
  try{
    const res = await fetch('news.yml', {cache: "no-cache"});
    const txt = await res.text();
    const items = parseSimpleYamlList(txt);
    render(items);
  }catch(err){
    console.error('Failed to load news.yml', err);
    if(listEl) listEl.textContent = 'Failed to load news.';
  }
}

function render(items){
  if(!listEl) return;
  listEl.innerHTML = '';
  if(!items.length){
    listEl.textContent = 'No news yet.';
    return;
  }
  items.forEach(it=>{
    const wrap = document.createElement('article');
    wrap.className = 'news-item';
    const h = document.createElement('h3');
    h.textContent = it.title || 'Untitled';
    const d = document.createElement('div');
    d.className = 'news-meta';
    d.textContent = it.date || '';
    const p = document.createElement('p');
    p.className = 'news-body';
    p.innerHTML = it.body || '';
    wrap.appendChild(h);
    wrap.appendChild(d);
    wrap.appendChild(p);
    listEl.appendChild(wrap);
  });
}

// expose refresh API
window.News = { load: loadNews };

loadNews();