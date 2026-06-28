// Truyện VN All-in-One — Search Handler
// Tìm kiếm truyện trên LNMTL và FoxTruyen
(function() {
  var url = BookUrl || '';
  var params = new URLSearchParams(url);
  var q = params.get('q') || params.get('search') || '';

  if (!q) {
    BookList([{Name: 'Nhập từ khóa tìm kiếm', Url: '', Thumb: ''}]);
    return;
  }

  var LNMTL_PREFETCH = 'https://lnmtl.com/build/storage/novels-942e52eede.json';
  var FOX_BASE = 'https://foxtruyen2.com';

  // Search both sources in parallel
  var p1 = fetch(LNMTL_PREFETCH).then(function(r) { return r.json(); }).catch(function() { return []; });
  var p2 = fetch(FOX_BASE + '/search?q=' + encodeURIComponent(q))
    .then(function(r) { return r.text(); })
    .catch(function() { return ''; });

  Promise.all([p1, p2]).then(function(results) {
    var novels = results[0];
    var foxHtml = results[1];
    var result = [];

    // LNMTL results (filter JSON by query)
    if (Array.isArray(novels)) {
      var ql = q.toLowerCase();
      novels.forEach(function(n) {
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
    }

    // FoxTruyen results (parse HTML)
    if (foxHtml) {
      var doc = new DOMParser().parseFromString(foxHtml, 'text/html');
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
      var imgs = doc.querySelectorAll('img[alt]');
      imgs.forEach(function(img, i) {
        var alt = (img.getAttribute('alt') || '').trim();
        if (alt && alt.length > 5 && alt.toLowerCase() !== 'foxtruyen') {
          if (result.length >= 50) return;
          var thumb = img.getAttribute('data-src') || img.src || '';
          result.push({
            Name: alt,
            Url: urls[i] || FOX_BASE,
            Thumb: thumb
          });
        }
      });
    }

    BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy "' + q + '"', Url: '', Thumb: ''}]);
  }).catch(function() { BookList([]); });
})();
