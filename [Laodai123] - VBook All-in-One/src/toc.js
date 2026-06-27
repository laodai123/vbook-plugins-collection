// VBook All-in-One — Table of Contents Handler
(function(){
  var url = BookUrl || '';
  var site = '';
  if (/truyenfull\.(today|vn|net|io|bio|vision)/i.test(url)) site = 'truyenfull';
  else if (/metruyen(chu|cv)\./i.test(url) || /mtccv\./i.test(url)) site = 'mtc';
  else if (/wikicv\.net/i.test(url)) site = 'wikidich';
  else if (/truyenazz\.vn/i.test(url)) site = 'truyenazz';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var items = doc.querySelectorAll('.list-chapter a, .chapter-list a, .list-chap a, .chapters a, a[href*="chuong"], a[href*="chapter"]');
      var result = [];
      items.forEach(function(a, idx) {
        var href = a.href;
        var text = a.textContent.trim();
        if (href && text) {
          result.push({Name: text, Url: href});
        }
      });
      // Fallback: sometimes chapters are in <ul><li><a>...
      if (result.length === 0) {
        doc.querySelectorAll('ul li a, ol li a').forEach(function(a) {
          var href = a.href;
          var text = a.textContent.trim();
          if (href && text && /chương|chapter|chap/i.test(text)) {
            result.push({Name: text, Url: href});
          }
        });
      }
      BookList(result.length > 0 ? result : [{Name: 'Chương 1', Url: url}]);
    });
})();