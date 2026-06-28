// VBook Plugin — Truyện VN All-in-One (Home)
// Hỗ trợ: LNMTL, FoxTruyen2
(function() {
  var url = BookUrl || '';

  function detectSite() {
    if (/lnmtl\.com/i.test(url)) return 'lnmtl';
    if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
    return 'unknown';
  }

  var site = detectSite();

  // ========== LNMTL ==========
  function lnmtlHome() {
    fetch('https://lnmtl.com/build/storage/novels-942e52eede.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var result = [];
        if (!Array.isArray(data)) { BookList([]); return; }
        var count = 0;
        data.forEach(function(n) {
          if (count >= 50) return;
          var name = n.name || '';
          var slug = n.slug || '';
          var img = n.image || '';
          var altName = n.name_alternative || n.name_original || '';
          if (!name || !slug) return;
          result.push({
            Name: name,
            Url: 'https://lnmtl.com/novel/' + slug,
            Thumb: img,
            Description: altName || name
          });
          count++;
        });
        BookList(result);
      })
      .catch(function() { BookList([]); });
  }

  // ========== FoxTruyen ==========
  function foxtruyenHome() {
    fetch('https://foxtruyen2.com/truyen-moi-cap-nhat.html')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');

        // Get URLs from JSON-LD
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

        // Get titles + thumbs from <img alt>
        var result = [];
        doc.querySelectorAll('img[alt]').forEach(function(img, i) {
          var title = (img.getAttribute('alt') || '').trim();
          if (!title || title.length < 5 || title.toLowerCase() === 'foxtruyen') return;
          var thumb = img.getAttribute('data-src') || img.src || '';
          result.push({
            Name: title,
            Url: urls[i] || '',
            Thumb: thumb,
            Description: 'Truyện tranh - FoxTruyen2'
          });
        });
        BookList(result);
      })
      .catch(function() { BookList([]); });
  }

  // ========== Unknown ==========
  function genericHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item, article, .item');
        var result = [];
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          result.push({
            Name: title.textContent.trim(),
            Url: a ? a.href : '',
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : '',
            Description: ''
          });
        });
        BookList(result);
      })
      .catch(function() { BookList([]); });
  }

  // ========== Route ==========
  switch(site) {
    case 'lnmtl':    lnmtlHome(); break;
    case 'foxtruyen': foxtruyenHome(); break;
    default:          genericHome(); break;
  }
})();
