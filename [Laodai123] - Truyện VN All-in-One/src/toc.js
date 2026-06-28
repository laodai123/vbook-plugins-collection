// VBook Plugin — Truyện VN All-in-One (Table of Contents)
(function() {
  var url = BookUrl || '';
  var site = '';
  if (/lnmtl\.com/i.test(url)) site = 'lnmtl';
  else if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) site = 'foxtruyen';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var result = [];
      var links = [];

      if (site === 'lnmtl') {
        links = doc.querySelectorAll('a[href*="chapter"], a[href*="chuong"], .chapter-list a, .list-chap a, ul.chapters a, .chapters a');
      } else if (site === 'foxtruyen') {
        links = doc.querySelectorAll('.chapter-list a, .list-chap a, .list-chapter a, a[href*="chap-"], a[href*="chapter"], a[href*="chuong"], ul.chapters a');
      } else {
        links = doc.querySelectorAll('.list-chapter a, .chapter-list a, a[href*="chuong"], a[href*="chapter"], a[href*="chap"]');
      }

      links.forEach(function(a) {
        var href = a.href || '';
        var text = (a.textContent || '').trim();
        if (href && text && text.length > 1) {
          result.push({Name: text, Url: href});
        }
      });

      // Fallback: if no chapters found, try generic <ul><li><a>
      if (result.length === 0) {
        doc.querySelectorAll('ul li a, ol li a').forEach(function(a) {
          var href = a.href;
          var text = (a.textContent || '').trim();
          if (href && text && (text.toLowerCase().indexOf('chương') > -1 || text.toLowerCase().indexOf('chapter') > -1 || text.toLowerCase().indexOf('chap') > -1 || /^\d+$/.test(text))) {
            result.push({Name: text, Url: href});
          }
        });
      }

      BookList(result.length > 0 ? result : [{Name: 'Chương 1', Url: url}]);
    })
    .catch(function() {
      BookList([{Name: 'Không thể tải danh sách chapter', Url: url}]);
    });
})();
