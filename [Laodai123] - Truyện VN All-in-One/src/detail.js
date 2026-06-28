// VBook Plugin — Truyện VN All-in-One (Detail)
// Format: VBook Legado
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian, Fanqie, 69shu, Ptwxz, Qimao, STV Proxy

var STVHOST = "http://14.225.254.182";

function detectSite(url) {
  if (/lnmtl\.com/i.test(url)) return 'lnmtl';
  if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
  if (/sangtacviet|14\.225\.254\.182/i.test(url)) return 'stv';
  if (/qidian\.(com|cn)/i.test(url)) return 'qidian';
  if (/fanqie|fanqienovel/i.test(url)) return 'fanqie';
  if (/69shu|69shuba/i.test(url)) return '69shu';
  if (/ptwxz|piaotia|piaotian/i.test(url)) return 'ptwxz';
  if (/qimao|7mao/i.test(url)) return 'qimao';
  return 'unknown';
}

function q(doc, sel) {
  var el = doc.select(sel).first();
  return el ? el.text().trim() : '';
}

function qHtml(doc, sel) {
  var el = doc.select(sel).first();
  return el ? el.html() : '';
}

function attr(doc, sel, name) {
  var el = doc.select(sel).first();
  return el ? el.attr(name) : '';
}

function lnmtlDetail(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('LNMTL fetch failed');
  var doc = response.html();
  return Response.success({
    name: q(doc, 'h1, [itemprop="name"], .novel-title') || 'Không rõ',
    cover: attr(doc, 'img.cover, img[itemprop="image"], .novel-cover img', 'src'),
    author: q(doc, '.author a, [itemprop="author"] a, .info .author') || 'Đang cập nhật',
    description: qHtml(doc, '.description, .novel-desc, .summary, [itemprop="description"]') || 'Không có mô tả',
    detail: 'Status: ' + (q(doc, '.status, .novel-status') || 'Đang cập nhật'),
    ongoing: true,
    host: 'https://lnmtl.com'
  });
}

function foxtruyenDetail(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('FoxTruyen fetch failed');
  var doc = response.html();
  return Response.success({
    name: q(doc, 'h1, .story-title, .book-name, .name') || 'Không rõ',
    cover: attr(doc, '.story-cover img, .cover img, .book-cover img', 'src'),
    author: q(doc, '.author a, .tac-gia a, .info .author') || 'Đang cập nhật',
    description: qHtml(doc, '.story-desc, .description, .summary, .mota, .detail') || 'Không có mô tả',
    detail: 'Status: ' + (q(doc, '.status, .trang-thai, .story-status') || 'Đang cập nhật'),
    ongoing: true,
    host: 'https://foxtruyen2.com'
  });
}

function stvDetail(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('STV fetch failed');
  var doc = response.html();

  var name = q(doc, '#oriname, h1, .book-name');
  var author = '';
  try {
    var cap = doc.select("i.cap").first();
    if (cap && cap.attr("onclick")) {
      author = cap.attr("onclick").replace(/location=\'\/\?find\=&findinname\=(.*?)\'/g, "$1");
    }
  } catch(e) {}
  var desc = '';
  try { desc = doc.select(".blk:has(.fa-water) .blk-body").html() || ''; } catch(e) {}
  var detailHtml = '';
  try {
    var _detail = doc.select("#inner > div.container.px-md-4.px-sm-0.px-0 > div:nth-child(5) .blk-body");
    try { _detail.select("a").remove(); } catch(e) {}
    detailHtml = _detail.html().replace(/\n/g, "<br>");
  } catch(e) {}

  var cover = '';
  try {
    var ogImg = doc.select('meta[property="og:image"]').first().attr("content");
    cover = (ogImg || '').replace("/cdn/images/nc.jpg", "https://static.sangtacvietcdn.xyz/img/bookcover256.jpg");
  } catch(e) {}

  if (url.includes("69shu")) {
    var m = url.match(/(\d+)\/(\d+)\/?$/);
    if (m) {
      cover = String.format(
        '{0}/files/article/image/{1}/{2}/{2}s.jpg',
        'https://static.69shuba.com',
        Math.floor(m[2] / 1000),
        m[2]
      );
    }
  }

  return Response.success({
    name: name || 'Không rõ',
    cover: cover,
    author: author || 'Unknown',
    description: desc,
    detail: detailHtml,
    ongoing: true,
    host: STVHOST,
    suggests: [{
      title: 'Truyện từ các nguồn khác:',
      input: name,
      script: 'suggests.js'
    }]
  });
}

function qidianDetail(url) {
  var bookId = url.match(/\d+/g);
  if (!bookId) return Response.error('Cannot extract Qidian book ID');
  return stvDetail(STVHOST + '/truyen/qidian/1/' + bookId[bookId.length - 1] + '/');
}

function fanqieDetail(url) {
  var m = url.match(/(\d+)\/(\d+)/);
  if (!m) return Response.error('Cannot extract Fanqie book ID');
  return stvDetail(STVHOST + '/truyen/fanqie/1/' + m[1] + '/');
}

function shu69Detail(url) {
  var response = fetch(url);
  if (response.ok) {
    var doc = response.html('gbk');
    return Response.success({
      name: q(doc, 'div.booknav2 > h1 > a, h1'),
      cover: '',
      author: q(doc, 'div.booknav2 > p:nth-child(3) a'),
      description: qHtml(doc, '#jianjie-popup > div > div.content p'),
      detail: '',
      ongoing: true,
      host: 'https://69shuba.com'
    });
  }
  var m = url.match(/\/book\/(\d+)/);
  if (m) return stvDetail(STVHOST + '/truyen/69shu/1/' + m[1] + '/');
  return Response.error('69shu detail failed');
}

function ptwxzDetail(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('Ptwxz fetch failed');
  var doc = response.html('gb2312');
  return Response.success({
    name: q(doc, '#content h1, h1'),
    cover: attr(doc, '#content table table a > img[align][hspace][vspace]', 'src'),
    author: '',
    description: qHtml(doc, '#content table table div[style]:not([id]):not([onclick])'),
    detail: '',
    ongoing: true,
    host: 'https://www.piaotia.com'
  });
}

function genericDetail(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('Fetch failed');
  var doc = response.html();
  return Response.success({
    name: q(doc, 'h1') || 'Không rõ',
    cover: '',
    author: q(doc, '.author, [itemprop="author"]') || 'Unknown',
    description: qHtml(doc, '.desc, .description, [itemprop="description"]'),
    detail: '',
    ongoing: true,
    host: url
  });
}

// ========== Entry Point ==========
function execute(url) {
  var site = detectSite(url);
  switch(site) {
    case 'lnmtl':    return lnmtlDetail(url);
    case 'foxtruyen': return foxtruyenDetail(url);
    case 'stv':      return stvDetail(url);
    case 'qidian':   return qidianDetail(url);
    case 'fanqie':   return fanqieDetail(url);
    case '69shu':    return shu69Detail(url);
    case 'ptwxz':    return ptwxzDetail(url);
    case 'qimao':    return Response.error('Qimao cần dùng STV proxy');
    default:         return genericDetail(url);
  }
}