// VBook All-in-One — Search Page Handler (very simple, redirects to home)
(function(){
  // For search pages, we just forward to home implementation
  // VBook will call this script with BookUrl pointing to search results page
  var url = BookUrl || '';
  // If there is a query param "q" we can trigger a direct search on the detected site
  var params = new URLSearchParams(url.split('?')[1]||'');
  var q = params.get('q') || '';
  if (q) {
    // Construct site‑specific search URLs
    if (/truyenfull\./i.test(url)) {
      location.href = 'https://truyenfull.today/search?q=' + encodeURIComponent(q);
    } else if (/metruyen(chu|cv)\./i.test(url) || /mtccv\./i.test(url)) {
      location.href = 'https://metruyencv.com/search?q=' + encodeURIComponent(q);
    } else if (/wikicv\.net/i.test(url)) {
      location.href = 'https://wikicv.net/search?q=' + encodeURIComponent(q);
    } else if (/truyenazz\.vn/i.test(url)) {
      location.href = 'https://truyenazz.vn/search?q=' + encodeURIComponent(q);
    } else {
      // fallback – use generic search if the site supports it
      var form = document.querySelector('form');
      if (form) {
        var input = form.querySelector('input[name="q"], input[type="search"]');
        if (input) { input.value = q; form.submit(); }
      }
    }
  } else {
    // No query – just load home page of the site
    if (/truyenfull\./i.test(url)) location.href = 'https://truyenfull.today';
    else if (/metruyen(chu|cv)\./i.test(url) || /mtccv\./i.test(url)) location.href = 'https://metruyencv.com';
    else if (/wikicv\.net/i.test(url)) location.href = 'https://wikicv.net';
    else if (/truyenazz\.vn/i.test(url)) location.href = 'https://truyenazz.vn';
  }
})();
