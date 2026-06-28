// VBook Plugin — Truyện VN All-in-One (Chapter Content)
(function() {
  var url = BookUrl || '';
  var site = '';
  if (/lnmtl\.com/i.test(url)) site = 'lnmtl';
  else if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) site = 'foxtruyen';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var content = null;
      var title = '';
      var nextUrl = '';

      if (site === 'lnmtl') {
        content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content, article, main');
        title = query(doc, 'h1, .chapter-title, .title');
        nextUrl = getNext(doc, 'a[rel="next"], .next a, a.next-chapter');
      } else if (site === 'foxtruyen') {
        content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content, article, main, .story-detail');
        title = query(doc, 'h1, .chapter-title, .title');
        nextUrl = getNext(doc, 'a[rel="next"], .next a, a.next-chapter');
      } else {
        content = doc.querySelector('.chapter-content, .content, .reading-content, [itemprop="articleBody"], article');
        title = query(doc, 'h1');
        nextUrl = getNext(doc, 'a[rel="next"], .next a');
      }

      // Clean content: remove junk
      if (content) {
        var remove = content.querySelectorAll('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner');
        remove.forEach(function(el) { el.parentNode.removeChild(el); });
      }

      BookChapter({
        Name: title || 'Đang tải...',
        Content: content ? content.innerHTML : '<p>Nội dung đang được tải...</p>',
        NextUrl: nextUrl || ''
      });
    })
    .catch(function() {
      BookChapter({
        Name: 'Lỗi',
        Content: '<p>Không thể tải nội dung chương.</p>',
        NextUrl: ''
      });
    });

  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }
  function getNext(doc, sel) {
    var a = doc.querySelector(sel);
    return a ? a.href : '';
  }
})();
