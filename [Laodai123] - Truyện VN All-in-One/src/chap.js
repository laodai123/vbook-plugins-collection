// VBook Plugin — Truyện VN All-in-One (Chapter Content)
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

  var isStvProxy = /14\.225\.254\.182/i.test(url);

  // ========== Helper functions ==========
  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }

  function getNext(doc, sel) {
    var a = doc.querySelector(sel);
    return a ? a.href : '';
  }

  function cleanHtml(html) {
    if (!html) return '';
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<br>\s*){2,}/gm, '<br>');
    html = html.replace(/<!--[^>]*-->/gm, '');
    html = html.replace(/&nbsp;/g, '');
    html = html.replace(/(^(\s*<br>\s*)+|(<br>\s*)+$)/gm, '');
    // Remove ads/junk
    html = html.replace(/本书源属于大灰狼独有公益书源.*?（企鹅：\d+）/g, '')
              .replace(/本书源属于.*?书源防失联：[^\s]+/g, '')
              .replace(/提供免费阅读服务.*?企鹅：\d+\)/g, '')
              .replace(/发现有倒狗盗用本接口.*?谨防上当受骗/g, '')
              .replace(/书源防失联：https:\/\/[^\s]+.*?企鹅：\d+\)/g, '')
              .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
              .replace(/本书[\s\S]*?（qq：.*?）\s*/g, '');
    return html.trim();
  }

  // ========== LNMTL Chapter ==========
  function lnmtlChap() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content, article, main');
        var title = query(doc, 'h1, .chapter-title, .title');
        var nextUrl = getNext(doc, 'a[rel="next"], .next a, a.next-chapter');
        if (content) {
          var remove = content.querySelectorAll('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner');
          remove.forEach(function(el) { el.parentNode.removeChild(el); });
        }
        BookChapter({
          Name: title || 'Đang tải...',
          Content: content ? cleanHtml(content.innerHTML) : '<p>Nội dung đang được tải...</p>',
          NextUrl: nextUrl || ''
        });
      })
      .catch(function() {
        BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải nội dung chương.</p>', NextUrl: ''});
      });
  }

  // ========== FoxTruyen Chapter ==========
  function foxtruyenChap() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content, article, main, .story-detail');
        var title = query(doc, 'h1, .chapter-title, .title');
        var nextUrl = getNext(doc, 'a[rel="next"], .next a, a.next-chapter');
        if (content) {
          var remove = content.querySelectorAll('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner');
          remove.forEach(function(el) { el.parentNode.removeChild(el); });
        }
        BookChapter({
          Name: title || 'Đang tải...',
          Content: content ? cleanHtml(content.innerHTML) : '<p>Nội dung đang được tải...</p>',
          NextUrl: nextUrl || ''
        });
      })
      .catch(function() {
        BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải nội dung chương.</p>', NextUrl: ''});
      });
  }

  // ========== Qidian Chapter ==========
  function qidianChap() {
    // Try to get chapter ID from URL
    var chapterId = null;
    var bookId = null;
    if (isStvProxy) {
      // STV proxy: http://14.225.254.182/truyen/qidian/1/{bookId}/{chapterId}/
      var m = url.match(/\/truyen\/qidian\/1\/(\d+)\/(\d+)\//);
      if (m) { bookId = m[1]; chapterId = m[2]; }
    } else {
      // Direct Qidian: https://m.qidian.com/chapter/{bookId}/{chapterId}/
      var m = url.match(/\/chapter\/(\d+)\/(\d+)\//);
      if (m) { bookId = m[1]; chapterId = m[2]; }
    }

    if (!bookId || !chapterId) {
      BookChapter({Name: 'Lỗi', Content: '<p>Không xác định được Book ID / Chapter ID</p>', NextUrl: ''});
      return;
    }

    // Use STV proxy API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapter&h=qidian&bookid=' + bookId + '&chapterid=' + chapterId;
    var referer = 'http://14.225.254.182/truyen/qidian/1/' + bookId + '/' + chapterId + '/';

    fetch(apiUrl, {
      headers: {'referer': referer}
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var content = '';
        var title = '';
        var nextUrl = '';
        if (json && json.content) {
          content = json.content;
        }
        if (json && json.prev_next) {
          nextUrl = json.prev_next.next_url || '';
          if (nextUrl && !nextUrl.startsWith('http')) {
            nextUrl = 'http://14.225.254.182' + nextUrl;
          }
        }
        BookChapter({
          Name: title || 'Chương ' + chapterId,
          Content: cleanHtml(content) || '<p>Nội dung trống</p>',
          NextUrl: nextUrl
        });
      })
      .catch(function() {
        // Fallback to direct Qidian mobile
        fetch('https://m.qidian.com/chapter/' + bookId + '/' + chapterId + '/', {
          headers: {'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'}
        })
          .then(function(r) { return r.text(); })
          .then(function(html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var content = doc.querySelector('.content, .chapter-content, #chapter-content');
            var title = query(doc, 'h1, .chapter-title');
            var nextUrl = getNext(doc, 'a[rel="next"], .next a');
            BookChapter({
              Name: title || 'Chương ' + chapterId,
              Content: content ? cleanHtml(content.innerHTML) : '<p>Nội dung trống</p>',
              NextUrl: nextUrl || ''
            });
          })
          .catch(function() {
            BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương Qidian</p>', NextUrl: ''});
          });
      });
  }

  // ========== Fanqie Chapter ==========
  function fanqieChap() {
    // Fanqie uses app API with AES encryption
    var chapterId = null;
    var bookId = null;
    if (isStvProxy) {
      var m = url.match(/\/truyen\/fanqie\/1\/(\d+)\/(\d+)\//);
      if (m) { bookId = m[1]; chapterId = m[2]; }
    } else {
      // Direct Fanqie URL pattern
      var m = url.match(/\/(\d+)\/(\d+)\//);
      if (m) { bookId = m[1]; chapterId = m[2]; }
    }

    if (!chapterId) {
      BookChapter({Name: 'Lỗi', Content: '<p>Không xác định được Chapter ID</p>', NextUrl: ''});
      return;
    }

    // Use STV proxy API
    var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapter&h=fanqie&bookid=' + (bookId || chapterId) + '&chapterid=' + chapterId;
    var referer = 'http://14.225.254.182/truyen/fanqie/1/' + (bookId || chapterId) + '/' + chapterId + '/';

    fetch(apiUrl, {
      headers: {'referer': referer}
    })
      .then(function(r) { return r.json(); })
      .then(function(json) {
        var content = '';
        var title = '';
        var nextUrl = '';
        if (json && json.content) {
          content = json.content;
        }
        if (json && json.prev_next) {
          nextUrl = json.prev_next.next_url || '';
          if (nextUrl && !nextUrl.startsWith('http')) {
            nextUrl = 'http://14.225.254.182' + nextUrl;
          }
        }
        BookChapter({
          Name: title || 'Chương ' + chapterId,
          Content: cleanHtml(content) || '<p>Nội dung trống</p>',
          NextUrl: nextUrl
        });
      })
      .catch(function() {
        BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương Fanqie</p>', NextUrl: ''});
      });
  }

  // ========== 69shu Chapter ==========
  function shu69Chap() {
    // 69shu uses GBK, browser recommended
    if (isStvProxy) {
      var m = url.match(/\/truyen\/69shu\/1\/(\d+)\/(\d+)\//);
      if (m) {
        var bookId = m[1];
        var chapterId = m[2];
        var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapter&h=69shu&bookid=' + bookId + '&chapterid=' + chapterId;
        var referer = 'http://14.225.254.182/truyen/69shu/1/' + bookId + '/' + chapterId + '/';
        fetch(apiUrl, {headers: {'referer': referer}})
          .then(function(r) { return r.json(); })
          .then(function(json) {
            var content = json && json.content ? json.content : '';
            BookChapter({
              Name: 'Chương ' + chapterId,
              Content: cleanHtml(content) || '<p>Nội dung trống</p>',
              NextUrl: ''
            });
          })
          .catch(function() {
            BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương 69shu</p>', NextUrl: ''});
          });
        return;
      }
    }

    // Fallback: direct 69shu with browser
    try {
      var browser = Engine.newBrowser();
      var html = browser.launch(url, 8000);
      browser.close();
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var content = doc.querySelector('div.txtnav');
      if (content) {
        var htm = content.innerHTML;
        htm = cleanHtml(htm)
          .replace(/^ *第\d+章.*?<br>/, '')
          .replace('(本章完)', '')
          .replace(/无错版本在.*?吧首发本小说。/gmi, '')
          .replace(/本作品由六九.*?理上传~~/gmi, '');
        BookChapter({
          Name: query(doc, 'h1, .chapter-title') || 'Chương',
          Content: htm,
          NextUrl: ''
        });
      } else {
        BookChapter({Name: 'Lỗi', Content: '<p>Không tìm thấy nội dung</p>', NextUrl: ''});
      }
    } catch(e) {
      BookChapter({Name: 'Lỗi', Content: '<p>Lỗi tải 69shu: ' + e.message + '</p>', NextUrl: ''});
    }
  }

  // ========== Ptwxz Chapter ==========
  function ptwxzChap() {
    if (isStvProxy) {
      var m = url.match(/\/truyen\/ptwxz\/1\/(\d+)\/(\d+)\//);
      if (m) {
        var bookId = m[1];
        var chapterId = m[2];
        var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapter&h=ptwxz&bookid=' + bookId + '&chapterid=' + chapterId;
        var referer = 'http://14.225.254.182/truyen/ptwxz/1/' + bookId + '/' + chapterId + '/';
        fetch(apiUrl, {headers: {'referer': referer}})
          .then(function(r) { return r.json(); })
          .then(function(json) {
            var content = json && json.content ? json.content : '';
            BookChapter({
              Name: 'Chương ' + chapterId,
              Content: cleanHtml(content) || '<p>Nội dung trống</p>',
              NextUrl: ''
            });
          })
          .catch(function() {
            BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương Ptwxz</p>', NextUrl: ''});
          });
        return;
      }
    }

    // Fallback direct (GB2312)
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('body');
        if (content) {
          var htm = content.innerHTML;
          // Remove h1, div, table, script, center
          var remove = content.querySelectorAll('h1, div, table, script, center');
          remove.forEach(function(el) { el.parentNode.removeChild(el); });
          htm = cleanHtml(content.innerHTML);
        }
        BookChapter({
          Name: query(doc, 'h1') || 'Chương',
          Content: content ? cleanHtml(content.innerHTML) : '<p>Nội dung trống</p>',
          NextUrl: ''
        });
      })
      .catch(function() {
        BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương Ptwxz</p>', NextUrl: ''});
      });
  }

  // ========== Qimao Chapter ==========
  function qimaoChap() {
    if (isStvProxy) {
      var m = url.match(/\/truyen\/qimao\/1\/(\d+)\/(\d+)\//);
      if (m) {
        var bookId = m[1];
        var chapterId = m[2];
        var apiUrl = 'http://14.225.254.182/index.php?ngmar=chapter&h=qimao&bookid=' + bookId + '&chapterid=' + chapterId;
        var referer = 'http://14.225.254.182/truyen/qimao/1/' + bookId + '/' + chapterId + '/';
        fetch(apiUrl, {headers: {'referer': referer}})
          .then(function(r) { return r.json(); })
          .then(function(json) {
            var content = json && json.content ? json.content : '';
            BookChapter({
              Name: 'Chương ' + chapterId,
              Content: cleanHtml(content) || '<p>Nội dung trống</p>',
              NextUrl: ''
            });
          })
          .catch(function() {
            BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải chương Qimao</p>', NextUrl: ''});
          });
        return;
      }
    }

    BookChapter({Name: 'Lỗi', Content: '<p>Qimao cần dùng STV proxy</p>', NextUrl: ''});
  }

  // ========== Generic Chapter ==========
  function genericChap() {
    fetch(url)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('.chapter-content, .content, .reading-content, [itemprop="articleBody"], article');
        var title = query(doc, 'h1');
        var nextUrl = getNext(doc, 'a[rel="next"], .next a');
        if (content) {
          var remove = content.querySelectorAll('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner');
          remove.forEach(function(el) { el.parentNode.removeChild(el); });
        }
        BookChapter({
          Name: title || 'Đang tải...',
          Content: content ? cleanHtml(content.innerHTML) : '<p>Nội dung đang được tải...</p>',
          NextUrl: nextUrl || ''
        });
      })
      .catch(function() {
        BookChapter({Name: 'Lỗi', Content: '<p>Không thể tải nội dung chương.</p>', NextUrl: ''});
      });
  }

  // ========== Route ==========
  switch(site) {
    case 'lnmtl':    lnmtlChap(); break;
    case 'foxtruyen': foxtruyenChap(); break;
    case 'qidian':   qidianChap(); break;
    case 'fanqie':   fanqieChap(); break;
    case '69shu':    shu69Chap(); break;
    case 'ptwxz':    ptwxzChap(); break;
    case 'qimao':    qimaoChap(); break;
    default:
      if (isStvProxy) {
        if (/qidian/i.test(url)) qidianChap();
        else if (/fanqie/i.test(url)) fanqieChap();
        else if (/69shu/i.test(url)) shu69Chap();
        else if (/ptwxz/i.test(url)) ptwxzChap();
        else if (/qimao/i.test(url)) qimaoChap();
        else genericChap();
      } else {
        genericChap();
      }
      break;
  }
})();