// VBook Plugin — Truyện VN All-in-One (Search)
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian, Fanqie, 69shu, Ptwxz, Qimao
(function() {
  var url = BookUrl || '';
  var searchUrl = url;

  // ========== Helper functions ==========
  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }

  function getImg(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? (el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || '') : '';
  }

  function getLink(link) {
    var m = link.match(/(?:book|m)?\.qidian\.(com|cn)\/(?:info|book)\/(\d+)/);
    return m && m[2];
  }

  // ========== LNMTL Search ==========
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

  // ========== FoxTruyen Search ==========
  function foxtruyenSearch(query) {
    return fetch('https://foxtruyen2.com/search?q=' + encodeURIComponent(query))
      .then(function(r) { return r.text(); })
      .then(function(html) {
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

  // ========== Qidian Search (via STV proxy) ==========
  function qidianSearch(query) {
    // Use STV search endpoint
    var searchUrl = 'http://14.225.254.182/search?qidian/1/' + encodeURIComponent(query);
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item, .search-result .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? a.href : '';
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Fanqie Search (via STV proxy) ==========
  function fanqieSearch(query) {
    var searchUrl = 'http://14.225.254.182/search/fanqie/1/' + encodeURIComponent(query);
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item, .search-result .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? a.href : '';
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== 69shu Search ==========
  function shu69Search(query) {
    // 69shu uses GBK encoding, try STV proxy
    var searchUrl = 'http://14.225.254.182/search/69shu/1/' + encodeURIComponent(query);
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item, .search-result .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? a.href : '';
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Ptwxz Search ==========
  function ptwxzSearch(query) {
    var searchUrl = 'http://14.225.254.182/search/ptwxz/1/' + encodeURIComponent(query);
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item, .search-result .item, .centent li');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? a.href : '';
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Qimao Search ==========
  function qimaoSearch(query) {
    var searchUrl = 'http://14.225.254.182/search/qimao/1/' + encodeURIComponent(query);
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item, .search-result .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? a.href : '';
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Generic Search Fallback ==========
  function genericSearch(query) {
    return fetch(searchUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item, .item, .search-search-result .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          result.push({
            Name: title.textContent.trim(),
            Url: a ? a.href : '',
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : ''
          });
        });
        return result;
      })
      .catch(function() { return []; });
  }

  // ========== Extract query from URL ==========
  var params = searchUrl.split('?')[1] || '';
  var q = '';
  params.split('&').forEach(function(p) {
    var kv = p.split('=');
    if (kv[0] === 'q' || kv[0] === 'search' || kv[0] === 'keyword') {
      q = decodeURIComponent(kv[1] || '');
    }
  });

  if (!q) {
    BookList([{Name: 'Nhập từ khóa tìm kiếm (q=...)', Url: '', Thumb: ''}]);
    return;
  }

  // ========== Run all searches in parallel ==========
  Promise.all([
    lnmtlSearch(q),
    foxtruyenSearch(q),
    qidianSearch(q),
    fanqieSearch(q),
    shu69Search(q),
    ptwxzSearch(q),
    qimaoSearch(q)
  ])
    .then(function(results) {
      var all = [];
      results.forEach(function(r) { all = all.concat(r); });
      BookList(all.length > 0 ? all : [{Name: 'Không tìm thấy "' + q + '"', Url: '', Thumb: ''}]);
    })
    .catch(function() { BookList([]); });
})();