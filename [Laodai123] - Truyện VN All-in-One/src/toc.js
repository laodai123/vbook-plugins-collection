// VBook Plugin — Truyện VN All-in-One (TOC)
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

function lnmtlToc(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('LNMTL fetch failed');
  var doc = response.html();
  var links = doc.select('a[href*="chapter"], a[href*="chuong"], .chapter-list a, .list-chap a, ul.chapters a, .chapters a');
  var result = [];
  links.forEach(function(a) {
    var href = a.attr('href');
    var text = (a.text() || '').trim();
    if (href && text && text.length > 1) {
      result.push({name: text, url: href});
    }
  });
  if (result.length === 0) {
    doc.select('ul li a, ol li a').forEach(function(a) {
      var href = a.attr('href');
      var text = (a.text() || '').trim();
      if (href && text && (text.toLowerCase().indexOf('chương') > -1 || text.toLowerCase().indexOf('chapter') > -1 || /^\d+$/.test(text))) {
        result.push({name: text, url: href});
      }
    });
  }
  return Response.success(result.length > 0 ? result : [{name: 'Chương 1', url: url}]);
}

function foxtruyenToc(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('FoxTruyen fetch failed');
  var doc = response.html();
  var links = doc.select('.chapter-list a, .list-chap a, .list-chapter a, a[href*="chap-"], a[href*="chapter"], a[href*="chuong"], ul.chapters a');
  var result = [];
  links.forEach(function(a) {
    var href = a.attr('href');
    var text = (a.text() || '').trim();
    if (href && text && text.length > 1) {
      result.push({name: text, url: href});
    }
  });
  if (result.length === 0) {
    doc.select('ul li a, ol li a').forEach(function(a) {
      var href = a.attr('href');
      var text = (a.text() || '').trim();
      if (href && text && (text.toLowerCase().indexOf('chương') > -1 || /^\d+$/.test(text))) {
        result.push({name: text, url: href});
      }
    });
  }
  return Response.success(result.length > 0 ? result : [{name: 'Chương 1', url: url}]);
}

function stvApiChapterList(bookId, source) {
  var referer = STVHOST + '/truyen/' + source + '/1/' + bookId + '/';
  var apiUrl = STVHOST + '/index.php?ngmar=chapterlist&h=' + source + '&bookid=' + bookId + '&sajax=getchapterlist';
  var response = fetch(apiUrl, {
    headers: {referer: referer}
  });
  if (!response.ok) return Response.error('STV API failed');
  var json = response.json();
  var chapters = [];
  if (json && json.code === 1 && json.data) {
    var cacheChapter = json.data.split('-//-');
    for (var i = 0; i < cacheChapter.length; i++) {
      var da = cacheChapter[i].split('-/-');
      if (da.length >= 3) {
        var chUrl = '';
        if (source === 'qidian') {
          chUrl = 'https://m.qidian.com/chapter/' + bookId + '/' + da[1] + '/';
        } else if (source === 'fanqie') {
          chUrl = STVHOST + '/truyen/fanqie/1/' + bookId + '/' + da[1] + '/';
        } else if (source === '69shu') {
          chUrl = 'https://69shuba.com/txt/' + bookId + '/' + da[1];
        } else if (source === 'ptwxz') {
          chUrl = 'https://www.piaotia.com/html/' + Math.floor(bookId/1000) + '/' + bookId + '/' + da[1] + '.html';
        } else if (source === 'qimao') {
          chUrl = STVHOST + '/truyen/qimao/1/' + bookId + '/' + da[1] + '/';
        }
        chapters.push({
          name: da[2].replace(/^(\d+)\.第(\d+)章/, '第$2章'),
          url: chUrl
        });
      }
    }
  }
  return chapters;
}

function stvToc(url) {
  // Parse URL: http://14.225.254.182/truyen/{source}/1/{bookId}/
  var m = url.match(/\/truyen\/(\w+)\/1\/(\d+)\/?/);
  if (!m) return Response.error('Invalid STV URL');
  var source = m[1];
  var bookId = m[2];
  var chapters = stvApiChapterList(bookId, source);
  return Response.success(chapters.length > 0 ? chapters : [{name: 'Chương 1', url: url}]);
}

function qidianToc(url) {
  // Direct Qidian: https://m.qidian.com/book/{bookId}/catalog/
  var m = url.match(/\/book\/(\d+)\//);
  var bookId = m ? m[1] : (url.match(/\d+/g) || [])[0];
  if (!bookId) return Response.error('No book ID');

  // Try mobile catalog
  var response = fetch('https://m.qidian.com/book/' + bookId + '/catalog/', {
    headers: {'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'}
  });
  if (!response.ok) return Response.error('Qidian catalog failed');

  var html = response.text();
  var chapters = [];
  try {
    var match = html.match(/vite-plugin-ssr_pageContext[^>]*>([\s\S]*?)<\/script>/);
    if (match) {
      var jsonText = match[1].replace(/<\/?script.*?>/g, '');
      var json = JSON.parse(jsonText);
      var qList = json.pageContext && json.pageContext.pageProps && json.pageContext.pageProps.pageData && json.pageContext.pageProps.pageData.vs;
      if (qList) {
        qList.forEach(function(q) {
          q.cs.forEach(function(e) {
            chapters.push({
              name: e.cN,
              url: 'https://m.qidian.com/chapter/' + bookId + '/' + e.id + '/',
              pay: e.sS == 1 ? false : true
            });
          });
        });
      }
    }
  } catch(e) {}

  return Response.success(chapters.length > 0 ? chapters : [{name: 'Chương 1', url: url}]);
}

function fanqieToc(url) {
  // Direct Fanqie: https://fanqienovel.com/page/{bookId}
  var m = url.match(/(\d+)/);
  var bookId = m ? m[1] : null;
  if (!bookId) return Response.error('No book ID');
  // Use STV for Fanqie
  return stvToc(STVHOST + '/truyen/fanqie/1/' + bookId + '/');
}

function shu69Toc(url) {
  // Direct 69shu: https://69shuba.com/book/{id}/
  var m = url.match(/\/book\/(\d+)/);
  if (m) {
    var bookId = m[1];
    var response = fetch('https://69shuba.com/book/' + bookId + '/');
    if (response.ok) {
      var doc = response.html('gbk');
      var chapters = [];
      doc.select('div.catalog > ul > li > a:not(#bookcase)').forEach(function(a) {
        chapters.push({
          name: (a.text() || '').trim().replace(/^(\d+)\.第(\d+)章/, '第$2章'),
          url: a.attr('href')
        });
      });
      return Response.success(chapters.reverse());
    }
    // Fallback to STV
    return stvToc(STVHOST + '/truyen/69shu/1/' + bookId + '/');
  }
  return Response.error('Invalid 69shu URL');
}

function ptwxzToc(url) {
  // Direct Ptwxz: https://www.piaotia.com/bookinfo/{id1}/{id2}.html
  var m = url.match(/bookinfo\/(\d+)\/(\d+)\.html/);
  if (m) {
    var bookId = m[2];
    var tocUrl = url.replace(/bookinfo\/(\d+)\/(\d+)\.html$/, '/html/$1/$2/');
    if (tocUrl.slice(-1) !== '/') tocUrl += '/';
    var response = fetch(tocUrl);
    if (!response.ok) return Response.error('Ptwxz fetch failed');
    var doc = response.html('gb2312');
    var chapters = [];
    doc.select('div.centent li > a').forEach(function(a) {
      var href = a.attr('href');
      chapters.push({
        name: (a.text() || '').trim(),
        url: href.startsWith('http') ? href : tocUrl + href.replace(/^\//, '')
      });
    });
    return Response.success(chapters.length > 0 ? chapters : [{name: 'Chương 1', url: url}]);
  }
  return Response.error('Invalid Ptwxz URL');
}

function genericToc(url) {
  var response = fetch(url);
  if (!response.ok) return Response.error('Fetch failed');
  var doc = response.html();
  var links = doc.select('.list-chapter a, .chapter-list a, a[href*="chuong"], a[href*="chapter"], a[href*="chap"]');
  var result = [];
  links.forEach(function(a) {
    var href = a.attr('href');
    var text = (a.text() || '').trim();
    if (href && text && text.length > 1) {
      result.push({name: text, url: href});
    }
  });
  return Response.success(result.length > 0 ? result : [{name: 'Chương 1', url: url}]);
}

function execute(url) {
  var site = detectSite(url);
  switch(site) {
    case 'lnmtl':    return lnmtlToc(url);
    case 'foxtruyen': return foxtruyenToc(url);
    case 'stv':      return stvToc(url);
    case 'qidian':   return qidianToc(url);
    case 'fanqie':   return fanqieToc(url);
    case '69shu':    return shu69Toc(url);
    case 'ptwxz':    return ptwxzToc(url);
    case 'qimao':    return stvToc(url); // Use STV for Qimao
    default:         return genericToc(url);
  }
}