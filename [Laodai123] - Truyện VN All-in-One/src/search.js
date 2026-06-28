// VBook Plugin — Truyện VN All-in-One (Search)
// Format: VBook Legado
// Search từ LNMTL + FoxTruyen2 + STV proxy (cho nguồn TQ)

var STVHOST = "http://14.225.254.182";

function lnmtlSearch(key) {
  var response = fetch('https://lnmtl.com/build/storage/novels-942e52eede.json');
  if (!response.ok) return [];
  var data = response.json();
  var result = [];
  if (!Array.isArray(data)) return result;
  var ql = key.toLowerCase();
  data.forEach(function(n) {
    var name = n.name || '';
    var haystack = (name + ' ' + (n.name_original||'') + ' ' + (n.name_alternative||'') + ' ' + (n.name_spelling||'')).toLowerCase();
    if (haystack.indexOf(ql) > -1) {
      if (result.length >= 30) return;
      result.push({
        name: name,
        link: 'https://lnmtl.com/novel/' + n.slug,
        cover: n.image || '',
        description: name,
        host: 'https://lnmtl.com'
      });
    }
  });
  return result;
}

function foxtruyenSearch(key) {
  var response = fetch('https://foxtruyen2.com/search?q=' + encodeURIComponent(key));
  if (!response.ok) return [];
  var html = response.text();
  var result = [];
  try {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var urls = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function(script) {
      try {
        var data = JSON.parse(script.textContent);
        if (data.itemListElement) {
          data.itemListElement.forEach(function(item) {
            if (item.url && item.url.indexOf('/truyen-tranh/') > -1) {
              urls.push(item.url);
            }
          });
        }
      } catch(e) {}
    });
    doc.querySelectorAll('img[alt]').forEach(function(img, i) {
      var title = (img.getAttribute('alt') || '').trim();
      if (!title || title.length < 5 || title.toLowerCase() === 'foxtruyen') return;
      result.push({
        name: title,
        link: urls[i] || 'https://foxtruyen2.com',
        cover: img.getAttribute('data-src') || img.src || '',
        description: 'FoxTruyen2',
        host: 'https://foxtruyen2.com'
      });
    });
  } catch(e) {}
  return result;
}

function stvSearch(key, source) {
  // STV search: https://sangtacviet.vip/?s={key}
  var url = STVHOST + '/?s=' + encodeURIComponent(key) + '&paged=1';
  var response = fetch(url);
  if (!response.ok) return [];
  var html = response.text();
  var result = [];

  // Extract books from STV search results
  // STV search structure: div.row > a.booksearch
  try {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('div.row').forEach(function(e) {
      var a = e.querySelector('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.indexOf('/truyen/') === -1) return;
      var img = e.querySelector('img');
      var cover = img ? (img.getAttribute('src') || '') : '';
      var titleEl = e.querySelector('h1,h2,h3,h4,.title,.name');
      var title = (titleEl ? titleEl.textContent : '') || a.getAttribute('title') || a.textContent;
      result.push({
        name: (title || '').trim(),
        link: href.startsWith('http') ? href : STVHOST + href,
        cover: cover.startsWith('//') ? 'https:' + cover : cover,
        description: source + ' - SangTacViet',
        host: STVHOST
      });
    });
  } catch(e) {}

  return result;
}

function execute(key, page) {
  if (!key) return Response.success([], '');
  if (!page) page = '1';

  // Run all searches
  var all = [];
  try { all = all.concat(lnmtlSearch(key)); } catch(e) {}
  try { all = all.concat(foxtruyenSearch(key)); } catch(e) {}
  try { all = all.concat(stvSearch(key, 'qidian')); } catch(e) {}
  try { all = all.concat(stvSearch(key, 'fanqie')); } catch(e) {}
  try { all = all.concat(stvSearch(key, '69shu')); } catch(e) {}

  if (all.length === 0) {
    return Response.success([{name: 'Không tìm thấy "' + key + '"', link: '', cover: '', description: '', host: ''}], '');
  }
  return Response.success(all, '');
}