// VBook Plugin — Truyện VN All-in-One (Table of Contents)
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian, Fanqie, 69shu, Ptwxz, Qimao
(function() {
  var url = BookUrl || '';
  var site = '';

  if (/lnmtl\.com/i.test(url)) site = 'lnmtl';
  else if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) site = 'foxtruyen';
  else if (/qidian\.(com|cn)/i.test(url)) site = 'qidian';
  else if (/fanqie|fanqienovel/i.test(url)) site = 'fanqie';
  else if (/69shu|69shuba/i.test(url)) site = '69shu';
  else if (/ptwxz|piaotia|piaotian/i.test(url)) site = 'ptwxz';
  else if (/qimao|7mao/i.test(url)) site = 'qimao';

  // Check if URL is STV proxy
  var isStvProxy = /14\.225\.254\.182/i.test(url);

  // ========== Helper functions ==========
  function getLink(link) {
    var m = link.match(/(?:book|m)?\.qidian\.(com|cn)\/(?:info|book)\/(\d+)/);
    return m && m[2];
  }

  // ========== LNMTL TOC ==========
  function lnmtlToc() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var links = doc.querySelectorAll('a[href*="chapter"], a[href*="chuong"], .chapter-list a, .list-chap a, ul.chapters a, .chapters a');
        links.forEach(function(a) {
          var href = a.href || '';
          var text = (a.textContent || '').trim();
          if (href && text && text.length > 1) {
            result.push({Name: text, Url: href});
          }
        });
        // Fallback
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
  }

  // ========== FoxTruyen TOC ==========
  function foxtruyenToc() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var links = doc.querySelectorAll('.chapter-list a, .list-chap a, .list-chapter a, a[href*="chap-"], a[href*="chapter"], a[href*="chuong"], ul.chapters a');
        links.forEach(function(a) {
          var href = a.href || '';
          var text = (a.textContent || '').trim();
          if (href && text && text.length > 1) {
            result.push({Name: text, Url: href});
          }
        });
        // Fallback
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
  }

  // ========== Qidian TOC ==========
  function qidianToc() {
    // Check if it's STV proxy URL
    var bookId = null;
    if (isStvProxy) {
      // STV proxy format: http://14.225.254.182/truyen/qidian/1/{bookId}/
      var m = url.match(/\/truyen\/qidian\/1\/(\d+)\//);
      if (m) bookId = m[1];
    } else {
      // Direct Qidian URL
      bookId = getLink(url);
    }

    if (!bookId) {
      BookList([{Name: 'Không xác định được Book ID', Url: url}]);
      return;
    }

    // Use STV API for chapter list
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapterlist&h=qidian&bookid=' + bookId + '&sajax=getchapterlist';
    var referer = 'http://14.225.254.182/truyen/qidian/1/' + bookId + '/';

    fetch(apiUrl, {
      headers: {
        'referer': referer
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var chapters = [];
        if (json && json.oridata) {
          var data = json.oridata;
          var cacheChapter = data.split('-//-');
          for (var i = 0; i < cacheChapter.length; i++) {
            var da = cacheChapter[i].split('-/-');
            if (da.length >= 3) {
              chapters.push({
                name: da[2],
                url: 'https://m.qidian.com/chapter/' + bookId + '/' + da[1] + '/'
              });
            }
          }
        }
        if (chapters.length === 0) {
          // Fallback to direct Qidian mobile
          return fetch('https://m.qidian.com/book/' + bookId + '/catalog/', {
            headers: {'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'}
          })
            .then(function(r) { return r.text(); })
            .then(function(html) {
              var chapters2 = [];
              try {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var text = doc.querySelector('#vite-plugin-ssr_pageContext')?.textContent || '';
                if (text) {
                  text = text.replace(/<\/?script.*?>/g, '');
                  var json = JSON.parse(text);
                  var q_list = json.pageContext?.pageProps?.pageData?.vs;
                  if (q_list) {
                    q_list.forEach(function(q) {
                      q.cs.forEach(function(e) {
                        chapters2.push({
                          name: e.cN,
                          url: 'https://m.qidian.com/chapter/' + bookId + '/' + e.id + '/',
                          pay: e.sS == 1 ? false : true
                        });
                      });
                    });
                  }
                }
              } catch(e) {}
              return chapters2;
            });
        }
        return chapters;
      })
      .then(function(chapters) {
        BookList(chapters.length > 0 ? chapters : [{Name: 'Chương 1', Url: url}]);
      })
      .catch(function() {
        BookList([{Name: 'Không thể tải danh sách chapter Qidian', Url: url}]);
      });
  }

  // ========== Fanqie TOC ==========
  function fanqieToc() {
    // Fanqie uses STV proxy
    var bookId = null;
    if (isStvProxy) {
      var m = url.match(/\/truyen\/fanqie\/1\/(\d+)\//);
      if (m) bookId = m[1];
    }
    if (!bookId) {
      // Try to extract from URL
      var m = url.match(/\/(\d+)\/(\d+)\//);
      if (m) bookId = m[1];
    }
    if (!bookId) {
      BookList([{Name: 'Không xác định được Book ID', Url: url}]);
      return;
    }

    // Use STV API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapterlist&h=fanqie&bookid=' + bookId + '&sajax=getchapterlist';
    var referer = 'http://14.225.254.182/truyen/fanqie/1/' + bookId + '/';

    fetch(apiUrl, {
      headers: {
        'referer': referer
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var chapters = [];
        if (json && json.oridata) {
          var data = json.oridata;
          var cacheChapter = data.split('-//-');
          for (var i = 0; i < cacheChapter.length; i++) {
            var da = cacheChapter[i].split('-/-');
            if (da.length >= 3) {
              chapters.push({
                name: da[2],
                url: 'http://14.225.254.182/truyen/fanqie/1/' + bookId + '/' + da[1] + '/'
              });
            }
          }
        }
        BookList(chapters.length > 0 ? chapters : [{Name: 'Chương 1', Url: url}]);
      })
      .catch(function() {
        BookList([{Name: 'Không thể tải danh sách chapter Fanqie', Url: url}]);
      });
  }

  // ========== 69shu TOC ==========
  function shu69Toc() {
    var bookId = null;
    if (isStvProxy) {
      var m = url.match(/\/truyen\/69shu\/1\/(\d+)\//);
      if (m) bookId = m[1];
    } else {
      // Direct 69shu URL: https://69shuba.com/book/{id}/
      var m = url.match(/\/book\/(\d+)\//);
      if (m) bookId = m[1];
    }

    if (!bookId) {
      BookList([{Name: 'Không xác định được Book ID', Url: url}]);
      return;
    }

    // Use STV API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapterlist&h=69shu&bookid=' + bookId + '&sajax=getchapterlist';
    var referer = 'http://14.225.254.182/truyen/69shu/1/' + bookId + '/';

    fetch(apiUrl, {
      headers: {
        'referer': referer
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var chapters = [];
        if (json && json.oridata) {
          var data = json.oridata;
          var cacheChapter = data.split('-//-');
          for (var i = 0; i < cacheChapter.length; i++) {
            var da = cacheChapter[i].split('-/-');
            if (da.length >= 3) {
              chapters.push({
                name: da[2].replace(/^(\d+)\.第(\d+)章/, '第$2章'),
                url: 'https://69shuba.com/txt/' + bookId + '/' + da[1]
              });
            }
          }
        }
        BookList(chapters.length > 0 ? chapters : [{Name: 'Chương 1', Url: url}]);
      })
      .catch(function() {
        // Fallback to direct 69shu (GBK)
        fetch('https://69shuba.com/book/' + bookId + '/')
          .then(function(r) { return r.text(); })
          .then(function(html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var chapters = [];
            var links = doc.querySelectorAll('div.catalog > ul > li > a:not(#bookcase)');
            links.forEach(function(a) {
              chapters.push({
                name: a.textContent.trim().replace(/^(\d+)\.第(\d+)章/, '第$2章'),
                url: a.href
              });
            });
            BookList(chapters.length > 0 ? chapters.reverse() : [{Name: 'Chương 1', Url: url}]);
          })
          .catch(function() {
            BookList([{Name: 'Không thể tải danh sách chapter 69shu', Url: url}]);
          });
      });
  }

  // ========== Ptwxz TOC ==========
  function ptwxzToc() {
    var bookId = null;
    if (isStvProxy) {
      var m = url.match(/\/truyen\/ptwxz\/1\/(\d+)\//);
      if (m) bookId = m[1];
    } else {
      // Direct Ptwxz URL: https://www.piaotia.com/bookinfo/{id1}/{id2}.html
      var m = url.match(/bookinfo\/(\d+)\/(\d+)\.html/);
      if (m) bookId = m[2];
    }

    if (!bookId) {
      BookList([{Name: 'Không xác định được Book ID', Url: url}]);
      return;
    }

    // Use STV API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapterlist&h=ptwxz&bookid=' + bookId + '&sajax=getchapterlist';
    var referer = 'http://14.225.254.182/truyen/ptwxz/1/' + bookId + '/';

    fetch(apiUrl, {
      headers: {
        'referer': referer
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var chapters = [];
        if (json && json.oridata) {
          var data = json.oridata;
          var cacheChapter = data.split('-//-');
          for (var i = 0; i < cacheChapter.length; i++) {
            var da = cacheChapter[i].split('-/-');
            if (da.length >= 3) {
              chapters.push({
                name: da[2],
                url: 'https://www.piaotia.com/html/' + Math.floor(bookId/1000) + '/' + bookId + '/' + da[1] + '.html'
              });
            }
          }
        }
        BookList(chapters.length > 0 ? chapters : [{Name: 'Chương 1', Url: url}]);
      })
      .catch(function() {
        BookList([{Name: 'Không thể tải danh sách chapter Ptwxz', Url: url}]);
      });
  }

  // ========== Qimao TOC ==========
  function qimaoToc() {
    var bookId = null;
    if (isStvProxy) {
      var m = url.match(/\/truyen\/qimao\/1\/(\d+)\//);
      if (m) bookId = m[1];
    }

    if (!bookId) {
      BookList([{Name: 'Không xác định được Book ID', Url: url}]);
      return;
    }

    // Use STV API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapterlist&h=qimao&bookid=' + bookId + '&sajax=getchapterlist';
    var referer = 'http://14.225.254.182/truyen/qimao/1/' + bookId + '/';

    fetch(apiUrl, {
      headers: {
        'referer': referer
      }
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var chapters = [];
        if (json && json.oridata) {
          var data = json.oridata;
          var cacheChapter = data.split('-//-');
          for (var i = 0; i < cacheChapter.length; i++) {
            var da = cacheChapter[i].split('-/-');
            if (da.length >= 3) {
              chapters.push({
                name: da[2],
                url: 'http://14.225.254.182/truyen/qimao/1/' + bookId + '/' + da[1] + '/'
              });
            }
          }
        }
        BookList(chapters.length > 0 ? chapters : [{Name: 'Chương 1', Url: url}]);
      })
      .catch(function() {
        BookList([{Name: 'Không thể tải danh sách chapter Qimao', Url: url}]);
      });
  }

  // ========== Generic TOC ==========
  function genericToc() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var result = [];
        var links = doc.querySelectorAll('.list-chapter a, .chapter-list a, a[href*="chuong"], a[href*="chapter"], a[href*="chap"]');
        links.forEach(function(a) {
          var href = a.href || '';
          var text = (a.textContent || '').trim();
          if (href && text && text.length > 1) {
            result.push({Name: text, Url: href});
          }
        });
        // Fallback
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
  }

  // ========== Route ==========
  switch(site) {
    case 'lnmtl':    lnmtlToc(); break;
    case 'foxtruyen': foxtruyenToc(); break;
    case 'qidian':   qidianToc(); break;
    case 'fanqie':   fanqieToc(); break;
    case '69shu':    shu69Toc(); break;
    case 'ptwxz':    ptwxzToc(); break;
    case 'qimao':    qimaoToc(); break;
    default:
      // Check STV proxy for other sources
      if (isStvProxy) {
        if (/qidian/i.test(url)) qidianToc();
        else if (/fanqie/i.test(url)) fanqieToc();
        else if (/69shu/i.test(url)) shu69Toc();
        else if (/ptwxz/i.test(url)) ptwxzToc();
        else if (/qimao/i.test(url)) qimaoToc();
        else genericToc();
      } else {
        genericToc();
      }
      break;
  }
})();