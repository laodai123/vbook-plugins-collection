// Truyện VN All-in-One — Home Page Handler
// Hỗ trợ: LNMTL (lnmtl.com) + FoxTruyen (foxtruyen2.com, truyenggg.com)
(function() {
  var url = BookUrl || '';
  var LNMTL_PREFETCH = 'https://lnmtl.com/build/storage/novels-942e52eede.json';
  var FOXTRUYEN_BASE = 'https://foxtruyen2.com';

  function detectSite() {
    if (/lnmtl\.com/i.test(url)) return 'lnmtl';
    if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
    return 'unknown';
  }

  var site = detectSite();

  // ========== LNMTL ==========
  function lnmtlHome() {
    fetch(LNMTL_PREFETCH)
      .then(function(r) { return r.json(); })
      .then(function(novels) {
        if (!Array.isArray(novels)) { BookList([]); return; }
        var result = [];
        var count = 0;
        novels.forEach(function(n) {
          if (count >= 100) return;
          var name = n.name || '';
          var slug = n.slug || '';
          var img = n.image || '';
          var original = n.name_original || '';
          var alt = n.name_alternative || '';
          if (!name || !slug) return;
          result.push({
            Name: name,
            Url: 'https://lnmtl.com/novel/' + slug,
            Thumb: img,
            Description: alt || original || name
          });
          count++;
        });
        BookList(result);
      })
      .catch(function() { BookList([]); });
  }

  // ========== FoxTruyen ==========
  function foxtruyenHome() {
    fetch(FOXTRUYEN_BASE + '/truyen-moi-cap-nhat.html')
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        
        // Lấy URL từ JSON-LD
        var ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
        var urls = [];
        ldScripts.forEach(function(script) {
          try {
            var data = JSON.parse(script.textContent);
            if (data.itemListElement && Array.isArray(data.itemListElement)) {
              data.itemListElement.forEach(function(item) {
                if (item.url && item.url.indexOf('/truyen-tranh/') > -1) {
                  urls.push(item.url);
                }
              });
            }
          } catch(e) {}
        });
        
        // Lấy title từ img alt
        var imgs = doc.querySelectorAll('img[alt]');
        var titles = [];
        imgs.forEach(function(img) {
          var alt = (img.getAttribute('alt') || '').trim();
          if (alt && alt.length > 5 && alt.toLowerCase() !== 'foxtruyen') {
            titles.push(alt);
          }
        });
        
        // Ghép title với URL theo thứ tự
        var result = [];
        for (var i = 0; i < titles.length && i < urls.length; i++) {
          var thumb = '';
          var imgEl = imgs[i];
          if (imgEl) {
            thumb = imgEl.getAttribute('data-src') || imgEl.src || '';
          }
          result.push({
            Name: titles[i],
            Url: urls[i],
            Thumb: thumb,
            Description: 'FoxTruyen - ' + titles[i]
          });
        }
        BookList(result.length > 0 ? result : [{Name: 'FoxTruyen', Url: FOXTRUYEN_BASE, Thumb: '', Description: 'Đọc truyện trên FoxTruyen'}]);
      })
      .catch(function() { BookList([]); });
  }

  // ========== Route ==========
  switch(site) {
    case 'lnmtl': lnmtlHome(); break;
    case 'foxtruyen': foxtruyenHome(); break;
    default:
      // Unknown site — try generic fetch
      fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item, article, .item');
          var result = [];
          items.forEach(function(item) {
            var a = item.querySelector('a');
            var img = item.querySelector('img');
            var title = item.querySelector('h3 a, h2 a, .title, a.title, .name a');
            if (!title && a) title = a;
            result.push({
              Name: title ? title.textContent.trim() : 'Không rõ',
              Url: a ? a.href : '',
              Thumb: img ? (img.src || img.getAttribute('data-src') || '') : '',
              Description: ''
            });
          });
          BookList(result);
        })
        .catch(function() { BookList([]); });
      break;
  }
})();
