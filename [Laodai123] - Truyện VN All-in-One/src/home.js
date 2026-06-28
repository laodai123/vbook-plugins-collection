// VBook Plugin — Truyện VN All-in-One (Home)
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian, Fanqie, 69shu, Ptwxz, Qimao
(function() {
  var url = BookUrl || '';
  var page = 1;

  function detectSite() {
    if (/lnmtl\.com/i.test(url)) return 'lnmtl';
    if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
    if (/qidian\.(com|cn)/i.test(url)) return 'qidian';
    if (/fanqie|fanqienovel/i.test(url)) return 'fanqie';
    if (/69shu|69shuba/i.test(url)) return '69shu';
    if (/ptwxz|piaotia|piaotian/i.test(url)) return 'ptwxz';
    if (/qimao|7mao/i.test(url)) return 'qimao';
    return 'unknown';
  }

  var site = detectSite();

  // ========== Helper: querySelector wrapper ==========
  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }

  function getImg(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? (el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || '') : '';
  }

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

  // ========== Qidian (mobile web + browser fallback) ==========
  function qidianHome() {
    // Qidian uses JS rendering, need browser
    try {
      var browser = Engine.newBrowser();
      var html = browser.launch(url, 8000);
      browser.close();

      var doc = new DOMParser().parseFromString(html, 'text/html');
      var result = [];
      var elems = doc.querySelectorAll('#rank-view-list > div > ul > li');
      elems.forEach(function(e, index) {
        var link = e.querySelector('.book-mid-info h2 a');
        var img = e.querySelector('div a img');
        var update = e.querySelector('.book-mid-info p.update');
        if (link) {
          var href = link.href || link.getAttribute('href');
          // Convert to STV proxy
          var bookId = getLink(href);
          var newLink = 'http://14.225.254.182/truyen/qidian/1/' + bookId + '/';
          result.push({
            Name: '<' + (index + 1) + '>' + link.textContent.trim(),
            Url: newLink,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '').replace('//', 'https://') : '',
            Description: update ? update.textContent.replace('最新更新', '').trim() : ''
          });
        }
      });

      // Next page detection
      var next = doc.querySelector('#rank-view-list .rank-tag');
      var nextPage = next ? parseInt(next.textContent) / 20 + 1 : null;

      BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy truyện', Url: '', Thumb: ''}]);
    } catch(e) {
      BookList([{Name: 'Lỗi tải Qidian: ' + e.message, Url: '', Thumb: ''}]);
    }
  }

  function getLink(link) {
    var m = link.match(/(?:book|m)?\.qidian\.(com|cn)\/(?:info|book)\/(\d+)/);
    return m && m[2];
  }

  // ========== Fanqie (番茄小说) - via SangTacViet proxy ==========
  function fanqieHome() {
    // Fanqie requires app API, use STV proxy
    var stvUrl = 'http://14.225.254.182/truyen/fanqie/1/';
    fetch(stvUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item');
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
            Description: 'Fanqie/番茄小说'
          });
        });
        BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy truyện Fanqie', Url: '', Thumb: ''}]);
      })
      .catch(function() { BookList([]); });
  }

  // ========== 69shu ==========
  function shu69Home() {
    // 69shu uses GBK encoding, browser recommended
    try {
      var browser = Engine.newBrowser();
      var html = browser.launch(url, 8000);
      browser.close();

      var doc = new DOMParser().parseFromString(html, 'text/html');
      var result = [];
      var items = doc.querySelectorAll('.list-story-item, .book-item, .truyen-item, .item');
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
          Description: '69shu'
        });
      });
      BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy truyện 69shu', Url: '', Thumb: ''}]);
    } catch(e) {
      BookList([{Name: 'Lỗi tải 69shu: ' + e.message, Url: '', Thumb: ''}]);
    }
  }

  // ========== Ptwxz / PiaoTian ==========
  function ptwxzHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        // Ptwxz uses GB2312, but fetch returns UTF-8, may have garbled text
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-story-item, .book-item, .truyen-item, .centent li, .item');
        items.forEach(function(item) {
          var a = item.querySelector('a');
          var img = item.querySelector('img');
          var title = item.querySelector('h3 a, h2 a, .title a, a.title, .name a');
          if (!title && a) title = a;
          if (!title) return;
          var href = a ? (a.href || a.getAttribute('href')) : '';
          if (href && !href.startsWith('http')) {
            href = 'https://www.piaotia.com' + href;
          }
          result.push({
            Name: title.textContent.trim(),
            Url: href,
            Thumb: img ? (img.src || img.getAttribute('data-src') || '') : '',
            Description: 'PiaoTian/飘天文学'
          });
        });
        BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy truyện Ptwxz', Url: '', Thumb: ''}]);
      })
      .catch(function() { BookList([]); });
  }

  // ========== Qimao / 七猫 ==========
  function qimaoHome() {
    // Qimao uses app API, use STV proxy
    var stvUrl = 'http://14.225.254.182/truyen/qimao/1/';
    fetch(stvUrl)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var items = doc.querySelectorAll('.list-truyen .truyen-item, .book-item, .item');
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
            Description: 'Qimao/七猫'
          });
        });
        BookList(result.length > 0 ? result : [{Name: 'Không tìm thấy truyện Qimao', Url: '', Thumb: ''}]);
      })
      .catch(function() { BookList([]); });
  }

  // ========== Unknown (generic fallback) ==========
  function genericHome() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var items = doc.querySelectorAll('.truyen-item, .book-item, .list-story-item, article, .item, .centent li');
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
    case 'qidian':   qidianHome(); break;
    case 'fanqie':   fanqieHome(); break;
    case '69shu':    shu69Home(); break;
    case 'ptwxz':    ptwxzHome(); break;
    case 'qimao':    qimaoHome(); break;
    default:         genericHome(); break;
  }
})();