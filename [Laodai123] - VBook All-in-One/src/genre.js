// VBook All-in-One — Genre/TOC Page Handler (pages beyond first are loaded "page‑wise")
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
      var items = doc.querySelectorAll('.list-page a, .list-chapter a, .pagination a, .page-item a, a[href*="page"], a[href*="trang"]');
      var pages = [];
      items.forEach(function(a) {
        var href = a.href;
        var text = a.textContent.trim();
        if (href && text && /^\d+$/.test(text)) {
          pages.push({Name: 'Trang ' + text, Url: href});
        }
      });
      // fallback: also count items on current page
      if (pages.length === 0) {
        var totalPages = 1;
        // Try to extract total pages from "1/xxx" text
        var pageInfo = doc.querySelector('.page-info, .page-status, .total-page');
        if (pageInfo) {
          var m = pageInfo.textContent.match(/(\d+)/g);
          if (m && m.length > 0) totalPages = parseInt(m[m.length-1]) || 1;
        }
        // Only add next pages if >1
        if (totalPages > 1) {
          for (var i = 2; i <= totalPages; i++) {
            var base = url.split('?')[0];
            pages.push({Name: 'Trang ' + i, Url: base + '?page=' + i});
          }
        }
      }
      BookList(pages.length > 0 ? pages : [{Name: 'Trang 1', Url: url}]);
    });
})();
