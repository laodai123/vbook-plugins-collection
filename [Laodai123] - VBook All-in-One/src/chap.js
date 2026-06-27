// VBook All-in-One — Chapter Content Handler
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
      var content = '';
      var title = '';
      var nextUrl = '';

      // --- Content extraction per site ---
      if (site === 'truyenfull') {
        content = doc.querySelector('#chapter-content, .chapter-c, .content, .reading-content');
        title = doc.querySelector('h1.chapter-title, .chapter-title, h1');
        nextUrl = getNext(doc, '.next-chapter a, a.next, a[rel="next"]');
      } else if (site === 'mtc') {
        content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content');
        title = doc.querySelector('h1.chapter-title, .chapter-title, h1');
        nextUrl = getNext(doc, '.next-chapter a, a.next, a[rel="next"]');
      } else if (site === 'wikidich') {
        content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content');
        title = doc.querySelector('h1.chapter-title, .chapter-title, h1');
        nextUrl = getNext(doc, '.next-chapter a, a.next, a[rel="next"]');
      } else if (site === 'truyenazz') {
        content = doc.querySelector('#chapter-content, .chapter-content, .content, .reading-content');
        title = doc.querySelector('h1.chapter-title, .chapter-title, h1');
        nextUrl = getNext(doc, '.next-chapter a, a.next, a[rel="next"]');
      } else {
        // Generic fallback
        content = doc.querySelector('.chapter-content, .content, [itemprop="articleBody"], article');
        title = doc.querySelector('h1');
        nextUrl = getNext(doc, 'a[rel="next"], .next a');
      }

      // Clean content
      if (content) {
        // Remove scripts, styles, ads
        content.querySelectorAll('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins').forEach(function(el){ el.remove(); });
        // Remove empty elements
        content.querySelectorAll('*').forEach(function(el){
          if (!el.textContent.trim() && !el.querySelector('img')) el.remove();
        });
      }

      BookChapter({
        Name: title ? title.textContent.trim() : 'Chương',
        Content: content ? content.innerHTML : '',
        NextUrl: nextUrl || ''
      });
    });

  function getNext(doc, selector) {
    var a = doc.querySelector(selector);
    return a ? a.href : '';
  }
})();