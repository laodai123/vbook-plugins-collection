// VBook All-in-One Plugin — Home Page Handler
// Hỗ trợ: TruyệnFull, MTC (Mê Truyện CV), WikiDich, TruyệnTR

(function() {
  // --- Site Detection ---
  var url = BookUrl || '';

  function detectSite() {
    if (/truyenfull\.(today|vn|net|io|bio|vision)/i.test(url)) return 'truyenfull';
    if (/metruyen(chu|cv)\./i.test(url) || /mtccv\./i.test(url)) return 'mtc';
    if (/wikicv\.net/i.test(url)) return 'wikidich';
    if (/truyenazz\.vn/i.test(url)) return 'truyenazz';
    return 'unknown';
  }

  var site = detectSite();

  // --- TruyenFull ---
  function truyenfullHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.list-truyen-item-wrap');
        var result = [];
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, .truyen-title a, a.title');
          var desc = item.querySelector('.truyen-info, .book-desc, p');
          if (!title && a) title = a;
          result.push({
            Name: title ? title.textContent.trim() : 'Không rõ',
            Url: a ? a.href : '',
            Thumb: img ? img.src : '',
            Description: desc ? desc.textContent.trim() : ''
          });
        });
        BookList(result);
      });
  }

  // --- MTC (Mê Truyện Chữ) ---
  function mtcHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.list-story-item, .book-item, .truyen-list .item');
        var result = [];
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('.truyen-title, h3 a, .name a, a.name');
          var desc = item.querySelector('.truyen-info, .info, .book-desc');
          if (!title && a) title = a;
          result.push({
            Name: title ? title.textContent.trim() : 'Không rõ',
            Url: a ? a.href : '',
            Thumb: img ? img.src : '',
            Description: desc ? desc.textContent.trim() : ''
          });
        });
        BookList(result);
      });
  }

  // --- WikiDich ---
  function wikidichHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.book-item, .truyen-item, .item-truyen');
        var result = [];
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('.book-title, h3 a, .title a');
          var desc = item.querySelector('.book-desc, .intro, .description');
          if (!title && a) title = a;
          result.push({
            Name: title ? title.textContent.trim() : 'Không rõ',
            Url: a ? a.href : '',
            Thumb: img ? img.src : '',
            Description: desc ? desc.textContent.trim() : ''
          });
        });
        BookList(result);
      });
  }

  // --- TruyenTR (TruyenAZ) ---
  function truyenazzHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item');
        var result = [];
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('.truyen-title, h3 a, a.title');
          if (!title && a) title = a;
          result.push({
            Name: title ? title.textContent.trim() : 'Không rõ',
            Url: a ? a.href : '',
            Thumb: img ? img.src : ''
          });
        });
        BookList(result);
      });
  }

  // --- Route ---
  switch(site) {
    case 'truyenfull': truyenfullHome(); break;
    case 'mtc':        mtcHome(); break;
    case 'wikidich':   wikidichHome(); break;
    case 'truyenazz':  truyenazzHome(); break;
    default:
      // Try generic parsing for unknown site
      fetch(url)
        .then(function(r) { return r.text(); })
        .then(function(html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item, article');
          var result = [];
          items.forEach(function(item) {
            var a = item.querySelector('a');
            var img = item.querySelector('img');
            var title = item.querySelector('h3 a, h2 a, .title, a.title');
            if (!title && a) title = a;
            result.push({
              Name: title ? title.textContent.trim() : 'Không rõ',
              Url: a ? a.href : '',
              Thumb: img ? img.src : ''
            });
          });
          BookList(result);
        });
      break;
  }
})();
