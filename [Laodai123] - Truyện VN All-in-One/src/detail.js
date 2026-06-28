// VBook Plugin — Truyện VN All-in-One (Detail)
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

  // For Qidian/Fanqie/69shu/Ptwxz/Qimao, URL might be STV proxy
  var isStvProxy = /14\.225\.254\.182/i.test(url);

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var Title = '', Thumb = '', Author = '', Status = '', Genre = '', Description = '';

      if (site === 'lnmtl') {
        Title = query(doc, 'h1, [itemprop="name"], .novel-title');
        Thumb = getImg(doc, 'img.cover, img[itemprop="image"], .novel-cover img, .book img');
        Author = query(doc, '.author a, [itemprop="author"] a, .info .author');
        Status = query(doc, '.status, .novel-status');
        Genre = query(doc, '.genre a, .category a, .tags a');
        Description = query(doc, '.description, .novel-desc, .summary, [itemprop="description"]');
      } else if (site === 'foxtruyen') {
        Title = query(doc, 'h1, .story-title, .book-name, .name');
        Thumb = getImg(doc, '.story-cover img, .cover img, .book-cover img');
        Author = query(doc, '.author a, .tac-gia a, .info .author');
        Status = query(doc, '.status, .trang-thai, .story-status');
        Genre = query(doc, '.the-loai a, .genre a, .category a, .tags a');
        Description = query(doc, '.story-desc, .description, .summary, .mota, .detail');
      } else if (site === 'qidian' || (isStvProxy && /qidian/i.test(url))) {
        // Qidian detail via STV proxy or direct
        Title = query(doc, '#bookName, h1, .book-name');
        Thumb = getImg(doc, '#bookImg img, .book-cover img, .cover img');
        Author = query(doc, 'meta[property="og:novel:author"], .author a, .book-author');
        Status = query(doc, '.status, .book-status');
        Genre = query(doc, '.book-category a, .tags a, .category a');
        Description = query(doc, '#book-intro-detail, .book-intro, .intro, .description');
      } else if (site === 'fanqie' || (isStvProxy && /fanqie/i.test(url))) {
        Title = query(doc, 'h1, .book-name, .title');
        Thumb = getImg(doc, '.book-cover img, .cover img, img.cover');
        Author = query(doc, '.author, .book-author, [itemprop="author"]');
        Status = query(doc, '.status, .book-status');
        Genre = query(doc, '.category a, .tags a, .genre a');
        Description = query(doc, '.intro, .description, .book-intro, .summary');
      } else if (site === '69shu' || (isStvProxy && /69shu/i.test(url))) {
        Title = query(doc, 'div.booknav2 > h1 > a, h1, .book-name');
        Thumb = getImg(doc, 'div.bookimg2 > img, .book-cover img, .cover img');
        Author = query(doc, 'div.booknav2 > p:nth-child(3) a, .author a, .book-author');
        Status = query(doc, '.status, .book-status');
        Genre = query(doc, '.category a, .tags a');
        Description = query(doc, '#jianjie-popup > div > div.content p, .intro, .description');
      } else if (site === 'ptwxz' || (isStvProxy && /ptwxz|piaotia/i.test(url))) {
        Title = query(doc, '#content h1, h1, .book-name');
        Thumb = getImg(doc, '#content table table a > img[align][hspace][vspace], .book-cover img, .cover img');
        Author = query(doc, '#content table table td:contains("作者"), .author');
        Status = query(doc, '.status, .book-status');
        Genre = query(doc, '#content table table td:contains("类别"), .category a, .tags a');
        Description = cleanHtml(queryHtml(doc, '#content table table div[style]:not([id]):not([onclick])', 'span, a'));
      } else if (site === 'qimao' || (isStvProxy && /qimao|7mao/i.test(url))) {
        Title = query(doc, 'h1, .book-name, .title');
        Thumb = getImg(doc, '.book-cover img, .cover img, img.cover');
        Author = query(doc, '.author, .book-author, [itemprop="author"]');
        Status = query(doc, '.status, .book-status');
        Genre = query(doc, '.category a, .tags a, .genre a');
        Description = query(doc, '.intro, .description, .book-intro, .summary');
      } else {
        Title = query(doc, 'h1');
        Thumb = getImg(doc, 'img.cover, img[itemprop="image"]');
        Author = query(doc, '.author, [itemprop="author"]');
        Status = query(doc, '.status');
        Description = query(doc, '.desc, .description, [itemprop="description"]');
      }

      BookDetail({
        Name: Title || 'Không rõ',
        Url: url,
        Thumb: Thumb || '',
        Author: Author || 'Đang cập nhật',
        Description: Description || 'Không có mô tả',
        Status: Status || 'Đang cập nhật',
        Genre: Genre || 'Không rõ'
      });
    })
    .catch(function() {
      BookDetail({Name: 'Lỗi', Url: url, Thumb: '', Author: '', Description: 'Không thể tải trang', Status: '', Genre: ''});
    });

  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }

  function queryHtml(doc, sel, removeSel) {
    var el = doc.querySelector(sel);
    if (!el) return '';
    if (removeSel) {
      var toRemove = el.querySelectorAll(removeSel);
      toRemove.forEach(function(r) { r.parentNode.removeChild(r); });
    }
    return el.innerHTML;
  }

  function getImg(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? (el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || '') : '';
  }

  function cleanHtml(html) {
    if (!html) return '';
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<br>\s*){2,}/gm, '<br>');
    html = html.replace(/<!--[^>]*-->/gm, '');
    html = html.replace(/&nbsp;/g, '');
    html = html.replace(/(^(\s*<br>\s*)+|(<br>\s*)+$)/gm, '');
    return html.trim();
  }
})();