// VBook All-in-One — Detail Page Handler
(function() {
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
      var Title = '', Thumb = '', Author = '', Status = '', Genre = '', Description = '';

      if (site === 'truyenfull') {
        Title = query(doc, 'h1.title, .title-book, [itemprop="name"], h1');
        Thumb = getImg(doc, '.book-thumb img, .cover img, [itemprop="image"]');
        Author = query(doc, '.author a, [itemprop="author"] a, a.author');
        Status = query(doc, '.status, .truyen-status, .info .status');
        Genre = query(doc, '.category a, .genre a, .the-loai a');
        Description = query(doc, '.desc-text, .book-desc, .gioi-thieu, [itemprop="description"]');
      } else if (site === 'mtc') {
        Title = query(doc, 'h1.title, .story-title, .book-name, h1');
        Thumb = getImg(doc, '.book-cover img, .cover img, [itemprop="image"]');
        Author = query(doc, '.author a, [itemprop="author"] a, .info .author');
        Status = query(doc, '.status, .info .status, .trangthai');
        Genre = query(doc, '.genre a, .category a, .theloai a');
        Description = query(doc, '.desc, .story-desc, .intro, .description');
      } else if (site === 'wikidich') {
        Title = query(doc, 'h1.title, .book-title, h1');
        Thumb = getImg(doc, '.book-img img, .cover img');
        Author = query(doc, '.author a, .tac-gia a');
        Status = query(doc, '.status, .trangthai');
        Genre = query(doc, '.category a, .the-loai a');
        Description = query(doc, '.desc-text, .book-desc, .gioi-thieu');
      } else if (site === 'truyenazz') {
        Title = query(doc, 'h1.title, .book-name, h1');
        Thumb = getImg(doc, '.book-cover img, .cover img');
        Author = query(doc, '.author, .tacgia, a.author');
        Status = query(doc, '.status, .trangthai');
        Genre = query(doc, '.category a, .theloai a');
        Description = query(doc, '.book-desc, .desc, .gioithieu');
      } else {
        Title = query(doc, 'h1');
        Thumb = getImg(doc, 'img.cover, img[itemprop="image"]');
        Author = query(doc, '.author, [itemprop="author"]');
        Status = query(doc, '.status');
        Description = query(doc, '.desc, .description, [itemprop="description"]');
      }

      BookDetail({
        Name: Title,
        Url: url,
        Thumb: Thumb,
        Author: Author,
        Description: Description,
        Status: Status,
        Genre: Genre
      });
    });

  function query(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }
  function getImg(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? (el.src || el.getAttribute('data-src') || '') : '';
  }
})();
