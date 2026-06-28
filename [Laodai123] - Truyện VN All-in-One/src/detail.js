// Truyện VN All-in-One — Detail Page Handler
// Hiển thị chi tiết truyện: tên, tác giả, thể loại, mô tả
(function() {
  var url = BookUrl || '';
  var site = '';
  if (/lnmtl\.com/i.test(url)) site = 'lnmtl';
  else if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) site = 'foxtruyen';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var Title = '', Thumb = '', Author = '', Status = '', Genre = '', Description = '';

      if (site === 'lnmtl') {
        // LNMTL layout
        Title = query(doc, 'h1, [itemprop="name"], .novel-title, .title');
        Thumb = getImg(doc, 'img.cover, img[itemprop="image"], .novel-cover img');
        Author = query(doc, '.author a, [itemprop="author"] a, .info .author');
        Status = query(doc, '.status, .novel-status');
        Genre = query(doc, '.genre a, .category a, .tags a, .the-loai a');
        Description = query(doc, '.description, .novel-desc, .summary, [itemprop="description"]');
      } else if (site === 'foxtruyen') {
        // FoxTruyen layout
        Title = query(doc, 'h1, .story-title, .book-name, .name, h1');
        Thumb = getImg(doc, '.story-cover img, .cover img, .book-cover img');
        Author = query(doc, '.author a, .tac-gia a, .info .author');
        Status = query(doc, '.status, .trang-thai, .story-status');
        Genre = query(doc, '.the-loai a, .genre a, .category a, .tags a');
        Description = query(doc, '.story-desc, .description, .summary, .mota, .detail');
      } else {
        // Generic
        Title = query(doc, 'h1');
        Thumb = getImg(doc, 'img.cover, img[itemprop="image"]');
        Author = query(doc, '.author, [itemprop="author"]');
        Status = query(doc, '.status');
        Genre = query(doc, '.genre a, .the-loai a, .category a');
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
  function getImg(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? (el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || '') : '';
  }
})();
