// VBook Plugin — Truyện VN All-in-One (Search)
(function() {
  var url = BookUrl || '';
  // VBook provides the search query via URL
  var searchUrl = url;

  // ========== LNMTL ==========
  function lnmtlSearch(query) {
    return fetch('https://lnmtl.com/build/storage/novels-942e52eede.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var result = [];
        if (!Array.isArray(data)) return [];
        var ql = query.toLowerCase();
        data.forEach(function(n) {
          var name = n.name || '';
          var haystack = (name + ' ' + (n.name_original||'') + ' ' + (n.name_alternative||'') + ' ' + (n.name_spelling||'')).toLowerCase();
          if (haystack.indexOf(ql) > -1) {
            if (result.length >= 30) return;
            result.push({
              Name: name,
              Url: 'https://lnmtl.com/novel/' + n.slug,
              Thumb: n.image || ''
            });
          }
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== FoxTruyen ==========
  function foxtruyenSearch(query) {
    return fetch('https://foxtruyen2.com/search?q=' + encodeURIComponent(query))
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
        // Get titles from img alt
        var result = [];
        doc.querySelectorAll('img[alt]').forEach(function(img, i) {
          var title = (img.getAttribute('alt') || '').trim();
          if (!title || title.length < 5 || title.toLowerCase() === 'foxtruyen') return;
          result.push({
            Name: title,
            Url: urls[i] || 'https://foxtruyen2.com',
            Thumb: img.getAttribute('data-src') || img.src || ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Main ==========
  // Try to extract query from URL
  var params = searchUrl.split('?')[1] || '';
  var q = '';
  params.split('&').forEach(function(p) {
    var kv = p.split('=');
    if (kv[0] === 'q' || kv[0] === 'search') {
      q = decodeURIComponent(kv[1] || '');
    }
  });

  if (!q) {
    BookList([{Name: 'Nhập từ khóa tìm kiếm (q=...)', Url: '', Thumb: ''}]);
    return;
  }

  Promise.all([lnmtlSearch(q), foxtruyenSearch(q)])
    .then(function(results) {
      var all = results[0].concat(results[1]);
      BookList(all.length > 0 ? all : [{Name: 'Không tìm thấy "' + q + '"', Url: '', Thumb: ''}]);
    })
    .catch(function() { BookList([]); });
})();
