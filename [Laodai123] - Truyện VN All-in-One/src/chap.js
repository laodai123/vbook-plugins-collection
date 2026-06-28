// VBook Plugin — Truyện VN All-in-One (Chapter Content)
// Format: VBook Legado
// Hỗ trợ: LNMTL, FoxTruyen2, Qidian, Fanqie, 69shu, Ptwxz, Qimao, STV Proxy

var STVHOST = "http://14.225.254.182";

function detectSite(url) {
  if (/lnmtl\.com/i.test(url)) return 'lnmtl';
  if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
  if (/sangtacviet|14\.225\.254\.182/i.test(url)) return 'stv';
  if (/qidian\.(com|cn)|m\.qidian/i.test(url)) return 'qidian';
  if (/fanqie|fanqienovel/i.test(url)) return 'fanqie';
  if (/69shu|69shuba/i.test(url)) return '69shu';
  if (/ptwxz|piaotia|piaotian/i.test(url)) return 'ptwxz';
  if (/qimao|7mao/i.test(url)) return 'qimao';
  return 'unknown';
}

function cleanHtml(html) {
  if (!html) return '';
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(<br>\s*){2,}/gm, '<br>');
  html = html.replace(/<!--[^>]*-->/gm, '');
  html = html.replace(/&nbsp;/g, '');
  html = html.replace(/(^(\s*<br>\s*)+|(<br>\s*)+$)/gm, '');
  html = html.replace(/本书源属于大灰狼独有公益书源.*?（企鹅：\d+）/g, '')
            .replace(/本书源属于.*?书源防失联：[^\s]+/g, '')
            .replace(/提供免费阅读服务.*?企鹅：\d+\)/g, '')
            .replace(/发现有倒狗盗用本接口.*?谨防上当受骗/g, '')
            .replace(/书源防失联：https:\/\/[^\s]+.*?企鹅：\d+\)/g, '')
            .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
            .replace(/本书[\s\S]*?（qq：.*?）\s*/g, '');
  return html.trim();
}

function lnmtlChap(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('LNMTL fetch failed');
  var doc = response.html();
  var content = doc.select('#chapter-content, .chapter-content, .content, .reading-content, article, main').first();
  var title = (doc.select('h1, .chapter-title, .title').first().text() || '').trim();
  if (content) {
    try { content.select('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner').remove(); } catch(e) {}
  }
  return Response.success({
    name: title || 'Đang tải...',
    content: content ? cleanHtml(content.html()) : '<p>Nội dung đang được tải...</p>'
  });
}

function foxtruyenChap(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('FoxTruyen fetch failed');
  var doc = response.html();
  var content = doc.select('#chapter-content, .chapter-content, .content, .reading-content, article, main, .story-detail').first();
  var title = (doc.select('h1, .chapter-title, .title').first().text() || '').trim();
  if (content) {
    try { content.select('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner').remove(); } catch(e) {}
  }
  return Response.success({
    name: title || 'Đang tải...',
    content: content ? cleanHtml(content.html()) : '<p>Nội dung đang được tải...</p>'
  });
}

function qidianChap(url) {
  // Qidian: https://m.qidian.com/chapter/{bookId}/{chapterId}/
  var m = url.match(/\/chapter\/(\d+)\/(\d+)\//);
  if (!m) return Response.error('Invalid Qidian URL');
  var bookId = m[1];
  var chapterId = m[2];

  var response = fetch(url, {
    headers: {'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'}
  });
  if (!response.ok) return Response.error('Qidian fetch failed');
  var doc = response.html();
  var content = doc.select('.content, .chapter-content, #chapter-content').first();
  var title = (doc.select('h1, .chapter-title').first().text() || '').trim();

  return Response.success({
    name: title || ('Chương ' + chapterId),
    content: content ? cleanHtml(content.html()) : '<p>Nội dung trống</p>'
  });
}

function fanqieChap(url) {
  // Fanqie: Use STV proxy API
  var m = url.match(/(\d+)\/(\d+)/);
  if (!m) return Response.error('Invalid Fanqie URL');
  var bookId = m[1];
  var chapterId = m[2];

  var apiUrl = STVHOST + '/index.php?ngmar=chapter&h=fanqie&bookid=' + bookId + '&chapterid=' + chapterId;
  var referer = STVHOST + '/truyen/fanqie/1/' + bookId + '/' + chapterId + '/';
  var response = fetch(apiUrl, {headers: {referer: referer}});
  if (!response.ok) return Response.error('Fanqie API failed');
  var json = response.json();
  var content = '';
  var title = '';
  if (json && json.code === 1) {
    content = json.content || '';
    title = json.title || '';
  }
  return Response.success({
    name: title || ('Chương ' + chapterId),
    content: cleanHtml(content) || '<p>Nội dung trống</p>'
  });
}

function shu69Chap(url) {
  // 69shu: GBK encoding, browser recommended
  // URL pattern: https://69shuba.com/txt/{bookId}/{chapterId}
  var m = url.match(/\/txt\/(\d+)\/(\d+)/);
  if (m) {
    var browser = Engine.newBrowser();
    var doc = browser.launch(url, 10000);
    browser.close();
    var content = doc.select('div.txtnav', {remove: ['h1', 'div']}).first();
    var htm = '';
    if (content) {
      htm = cleanHtml(content.html())
        .replace(/^ *第\d+章.*?<br>/, '')
        .replace('(本章完)', '')
        .replace(/无错版本在.*?吧首发本小说。/gmi, '')
        .replace(/本作品由六九.*?理上传~~/gmi, '');
    }
    var title = (doc.select('h1, .chapter-title').first().text() || '').trim();
    return Response.success({
      name: title || 'Chương',
      content: htm
    });
  }
  // Fallback: STV API
  m = url.match(/\/truyen\/69shu\/1\/(\d+)\/(\d+)/);
  if (m) {
    var bookId = m[1];
    var chapterId = m[2];
    var apiUrl = STVHOST + '/index.php?ngmar=chapter&h=69shu&bookid=' + bookId + '&chapterid=' + chapterId;
    var referer = STVHOST + '/truyen/69shu/1/' + bookId + '/' + chapterId + '/';
    var response = fetch(apiUrl, {headers: {referer: referer}});
    if (!response.ok) return Response.error('69shu STV failed');
    var json = response.json();
    var content = '';
    if (json && json.code === 1) content = json.content || '';
    return Response.success({
      name: 'Chương ' + chapterId,
      content: cleanHtml(content) || '<p>Nội dung trống</p>'
    });
  }
  return Response.error('Invalid 69shu URL');
}

function ptwxzChap(url) {
  // Ptwxz: GB2312 encoding
  var response = fetch(url);
  if (!response.ok) return Response.error('Ptwxz fetch failed');
  var doc = response.html('gb2312');
  var content = doc.select('body').first();
  if (content) {
    try { content.select('h1, div, table, script, center').remove(); } catch(e) {}
  }
  var title = (doc.select('h1').first().text() || '').trim();
  return Response.success({
    name: title || 'Chương',
    content: content ? cleanHtml(content.html()) : '<p>Nội dung trống</p>'
  });
}

function qimaoChap(url) {
  // Qimao: Use STV proxy API
  var m = url.match(/\/truyen\/qimao\/1\/(\d+)\/(\d+)/);
  if (!m) return Response.error('Invalid Qimao URL');
  var bookId = m[1];
  var chapterId = m[2];
  var apiUrl = STVHOST + '/index.php?ngmar=chapter&h=qimao&bookid=' + bookId + '&chapterid=' + chapterId;
  var referer = STVHOST + '/truyen/qimao/1/' + bookId + '/' + chapterId + '/';
  var response = fetch(apiUrl, {headers: {referer: referer}});
  if (!response.ok) return Response.error('Qimao STV failed');
  var json = response.json();
  var content = '';
  if (json && json.code === 1) content = json.content || '';
  return Response.success({
    name: 'Chương ' + chapterId,
    content: cleanHtml(content) || '<p>Nội dung trống</p>'
  });
}

function stvChap(url) {
  // Generic STV proxy chapter
  var m = url.match(/\/truyen\/(\w+)\/1\/(\d+)\/(\d+)/);
  if (!m) return Response.error('Invalid STV URL');
  var source = m[1];
  var bookId = m[2];
  var chapterId = m[3];
  var apiUrl = STVHOST + '/index.php?ngmar=chapter&h=' + source + '&bookid=' + bookId + '&chapterid=' + chapterId;
  var referer = STVHOST + '/truyen/' + source + '/1/' + bookId + '/' + chapterId + '/';
  var response = fetch(apiUrl, {headers: {referer: referer}});
  if (!response.ok) return Response.error('STV API failed');
  var json = response.json();
  var content = '';
  var title = '';
  if (json && json.code === 1) {
    content = json.content || '';
    title = json.title || '';
  }
  return Response.success({
    name: title || ('Chương ' + chapterId),
    content: cleanHtml(content) || '<p>Nội dung trống</p>'
  });
}

function genericChap(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('Fetch failed');
  var doc = response.html();
  var content = doc.select('.chapter-content, .content, .reading-content, [itemprop="articleBody"], article').first();
  var title = (doc.select('h1').first().text() || '').trim();
  if (content) {
    try { content.select('script, style, iframe, .ads, .ad, .advertisement, .google-auto-placed, ins, .quang-cao, .banner').remove(); } catch(e) {}
  }
  return Response.success({
    name: title || 'Đang tải...',
    content: content ? cleanHtml(content.html()) : '<p>Nội dung đang được tải...</p>'
  });
}

function execute(url) {
  var site = detectSite(url);
  switch(site) {
    case 'lnmtl':    return lnmtlChap(url);
    case 'foxtruyen': return foxtruyenChap(url);
    case 'qidian':   return qidianChap(url);
    case 'fanqie':   return fanqieChap(url);
    case '69shu':    return shu69Chap(url);
    case 'ptwxz':    return ptwxzChap(url);
    case 'qimao':    return qimaoChap(url);
    case 'stv':      return stvChap(url);
    default:         return genericChap(url);
  }
}