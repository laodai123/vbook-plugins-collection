// VBook Plugin — Truyện VN All-in-One (Home)
// Format: VBook Legado
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian (qua STV proxy), Fanqie (qua STV proxy)

var STVHOST = "http://14.225.254.182";

// ========== LNMTL Home ==========
function lnmtlHome() {
  var response = fetch('https://lnmtl.com/build/storage/novels-942e52eede.json');
  if (!response.ok) return Response.error('LNMTL fetch failed');
  var data = response.json();
  var result = [];
  if (!Array.isArray(data)) return Response.success(result, '');
  var count = 0;
  data.forEach(function(n) {
    if (count >= 50) return;
    var name = n.name || '';
    var slug = n.slug || '';
    var img = n.image || '';
    var altName = n.name_alternative || n.name_original || '';
    if (!name || !slug) return;
    result.push({
      name: name,
      link: 'https://lnmtl.com/novel/' + slug,
      cover: img,
      description: altName || name,
      host: 'https://lnmtl.com'
    });
    count++;
  });
  return Response.success(result, '');
}

// ========== FoxTruyen Home ==========
function foxtruyenHome() {
  var response = fetch('https://foxtruyen2.com/truyen-moi-cap-nhat.html');
  if (!response.ok) return Response.error('FoxTruyen fetch failed');
  var html = response.text();

  // Try DOMParser
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
      var thumb = img.getAttribute('data-src') || img.src || '';
      result.push({
        name: title,
        link: urls[i] || '',
        cover: thumb,
        description: 'Truyện tranh - FoxTruyen2',
        host: 'https://foxtruyen2.com'
      });
    });
  } catch(e) {
    // Fallback: regex extraction
    var titleRegex = /<img[^>]+alt="([^"]+)"[^>]+(?:data-src|src)="([^"]+)"/g;
    var urlRegex = /"url":"(https:\/\/foxtruyen2\.com\/truyen-tranh\/[^"]+)"/g;
    var urls = [];
    var match;
    while ((match = urlRegex.exec(html)) !== null) urls.push(match[1]);
    while ((match = titleRegex.exec(html)) !== null) {
      var title = match[1].trim();
      if (title.length < 5 || title.toLowerCase() === 'foxtruyen') continue;
      result.push({
        name: title,
        link: urls[result.length] || '',
        cover: match[2].startsWith('//') ? 'https:' + match[2] : match[2],
        description: 'Truyện tranh - FoxTruyen2',
        host: 'https://foxtruyen2.com'
      });
    }
  }
  return Response.success(result, '');
}

// ========== Generic (show source list) ==========
function genericHome() {
  // Return list of categories/sources for user to pick
  return Response.success([
    {
      title: '📚 LNMTL - Light Novel (891+)',
      input: 'https://lnmtl.com/',
      script: 'home.js'
    },
    {
      title: '🦊 FoxTruyen2 - Truyện tranh (10K+)',
      input: 'https://foxtruyen2.com/truyen-moi-cap-nhat.html',
      script: 'home.js'
    },
    {
      title: '🇨🇳 Qidian - Tiếng Trung (qua STV)',
      input: STVHOST + '/?find=&host=qidian&minc=0&sort=viewweek&step=1&tag=',
      script: 'home.js'
    },
    {
      title: '🍅 Fanqie/番茄 - Tiếng Trung (qua STV)',
      input: STVHOST + '/?find=&host=fanqie&minc=0&sort=viewweek&step=1&tag=',
      script: 'home.js'
    },
    {
      title: '📖 69shu/69书吧 - Tiếng Trung (qua STV)',
      input: STVHOST + '/?find=&host=69shu&minc=0&sort=viewweek&step=1&tag=',
      script: 'home.js'
    },
    {
      title: '📚 Ptwxz/飘天 - Tiếng Trung (qua STV)',
      input: STVHOST + '/?find=&host=ptwxz&minc=0&sort=viewweek&step=1&tag=',
      script: 'home.js'
    },
    {
      title: '🐱 Qimao/七猫 - Tiếng Trung (qua STV)',
      input: STVHOST + '/?find=&host=qimao&minc=0&sort=viewweek&step=1&tag=',
      script: 'home.js'
    }
  ], '');
}

// ========== Entry Point ==========
function execute(url) {
  if (!url || url === '' || url === 'about:blank' || url.indexOf('about:') === 0) {
    return genericHome();
  }
  if (/lnmtl\.com/i.test(url)) return lnmtlHome();
  if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return foxtruyenHome();
  return genericHome();
}