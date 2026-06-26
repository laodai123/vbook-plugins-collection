var BASE_URL = 'https://zuminovel.com';
var BASE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

try {
    if (typeof CONFIG_URL !== 'undefined' && CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
    if (typeof CONFIG_UA !== 'undefined' && CONFIG_UA) {
        BASE_UA = CONFIG_UA;
    }
} catch (error) {
    // ignore
}

/**
 * Get active auth cookie from vBook session storage or user settings.
 */
function getAuthCookie() {
    try {
        var autoCookie = localCookie.getCookie();
        if (autoCookie && typeof autoCookie === 'string' && autoCookie.trim().length > 0) {
            return autoCookie;
        }
    } catch (e) {
        // localCookie not available
    }
    
    try {
        if (typeof CONFIG_COOKIE !== 'undefined' && CONFIG_COOKIE) {
            return CONFIG_COOKIE;
        }
    } catch (e) {
        // CONFIG_COOKIE not defined
    }
    
    return '';
}

function fetchPage(url, options) {
    if (!options) options = {};

    var headers = {
        'User-Agent': BASE_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
    };

    var cookie = getAuthCookie();
    if (cookie) {
        headers['Cookie'] = cookie;
    }

    if (options.headers) {
        for (var key in options.headers) {
            headers[key] = options.headers[key];
        }
    }

    options.headers = headers;
    return fetch(url, options);
}

/**
 * Advanced page fetcher with automatic headless WebView browser fallback.
 * Essential for SPA, Cloudflare, and sharing hydrated login sessions.
 */
function fetchPageWithBrowserFallback(url) {
    var response = null;
    try {
        response = fetchPage(url);
        if (response.ok) {
            var doc = response.html();
            var html = doc.html() || '';
            // If the fetched HTML already contains loaded react server components and is not a login page
            if (html.indexOf('__next_f') !== -1 && html.indexOf('đăng nhập') === -1 && html.indexOf('Đăng nhập') === -1) {
                return { ok: true, doc: doc, viaBrowser: false };
            }
        }
    } catch (e) {
        // ignore fetch failures
    }

    // Fallback: Engine.newBrowser() ngầm để kích hoạt session đã login của WebView
    try {
        var browser = Engine.newBrowser();
        browser.setUserAgent(BASE_UA);
        var doc = browser.launch(url, 15000);
        if (doc) {
            var html = doc.html();
            browser.close();
            return { ok: true, doc: Html.parse(html), viaBrowser: true };
        }
        browser.close();
    } catch (err) {
        // ignore browser failure
    }

    if (response) {
        return { ok: response.ok, doc: response.html(), viaBrowser: false };
    }
    return { ok: false, doc: null, viaBrowser: false };
}

var Response = {
    success: function(data, data2) {
        return JSON.stringify({ code: 0, data: data, data2: data2 });
    },
    error: function(data) {
        return JSON.stringify({ code: 1, data: String(data || '') });
    }
};

/**
 * Reconstruct Next.js RSC (React Server Component) hydration payload streams.
 */
function extractRscStrings(doc) {
    if (!doc) return '';
    var rsc = '';
    
    doc.select('script').forEach(function(script) {
        var js = script.html() || '';
        if (js.indexOf('__next_f') === -1) return;
        
        var idx = 0;
        while (idx < js.length) {
            var pushIdx = js.indexOf('push([', idx);
            if (pushIdx === -1) break;
            
            var strStart = js.indexOf('"', pushIdx);
            var isDouble = true;
            var singleStart = js.indexOf("'", pushIdx);
            if (singleStart !== -1 && (strStart === -1 || singleStart < strStart)) {
                strStart = singleStart;
                isDouble = false;
            }
            
            if (strStart !== -1 && strStart < pushIdx + 30) {
                var quoteChar = isDouble ? '"' : "'";
                var startPos = strStart + 1;
                var endPos = startPos;
                var escape = false;
                
                while (endPos < js.length) {
                    var char = js.charAt(endPos);
                    if (escape) {
                        escape = false;
                        endPos++;
                    } else if (char === '\\') {
                        escape = true;
                        endPos++;
                    } else if (char === quoteChar) {
                        break;
                    } else {
                        endPos++;
                    }
                }
                
                var rawStr = js.substring(startPos, endPos);
                try {
                    var decoded = '';
                    if (isDouble) {
                        decoded = JSON.parse('"' + rawStr + '"');
                    } else {
                        var prepared = rawStr.replace(/\\'/g, "'").replace(/"/g, '\\"');
                        decoded = JSON.parse('"' + prepared + '"');
                    }
                    rsc += decoded;
                } catch (e) {
                    var val = rawStr
                        .replace(/\\"/g, '"')
                        .replace(/\\'/g, "'")
                        .replace(/\\\\/g, '\\')
                        .replace(/\\n/g, '\n')
                        .replace(/\\r/g, '\r')
                        .replace(/\\t/g, '\t');
                    val = val.replace(/\\u([0-9a-fA-F]{4})/g, function(match, grp) {
                        return String.fromCharCode(parseInt(grp, 16));
                    });
                    rsc += val;
                }
                idx = endPos + 1;
            } else {
                idx = pushIdx + 6;
            }
        }
    });
    return rsc;
}

/**
 * Safely parse a JSON object containing a given key from a Next RSC payload stream.
 */
function extractJsonObject(str, key) {
    if (!str) return null;
    var index = str.indexOf(key);
    if (index === -1) return null;
    var startPos = str.indexOf('{', index + key.length);
    if (startPos === -1) return null;

    var braceCount = 0;
    var inString = false;
    var escape = false;
    
    for (var i = startPos; i < str.length; i++) {
        var char = str.charAt(i);
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    var jsonStr = str.substring(startPos, i + 1);
                    try {
                        return JSON.parse(jsonStr);
                    } catch (e) {
                        // ignore and continue
                    }
                }
            }
        }
    }
    return null;
}

function normalizeLink(href) {
    if (!href) return '';
    if (String(href).indexOf('http') === 0) return String(href);
    if (String(href).charAt(0) === '/') return BASE_URL + href;
    return BASE_URL + '/' + href;
}

/**
 * Convert Vietnamese volume/arc names into URL slugs.
 */
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
        .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
        .replace(/[íìỉĩị]/g, 'i')
        .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
        .replace(/[úùủũụưứừửữự]/g, 'u')
        .replace(/[ýỳỷỹỵ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function extractNovelsFromRsc(rsc) {
    var novels = [];
    var seenSlug = {};
    var pos = 0;
    while (pos < rsc.length) {
        var slugIdx = rsc.indexOf('"slug":', pos);
        if (slugIdx === -1) break;
        
        var startPos = rsc.lastIndexOf('{', slugIdx);
        if (startPos !== -1) {
            var braceCount = 0;
            var inString = false;
            var escape = false;
            var endPos = -1;
            for (var i = startPos; i < rsc.length; i++) {
                var char = rsc.charAt(i);
                if (escape) { escape = false; continue; }
                if (char === '\\') { escape = true; continue; }
                if (char === '"') { inString = !inString; continue; }
                if (!inString) {
                    if (char === '{') braceCount++;
                    else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) { endPos = i; break; }
                    }
                }
            }
            if (endPos !== -1) {
                var jsonStr = rsc.substring(startPos, endPos + 1);
                try {
                    var obj = JSON.parse(jsonStr);
                    if (obj && obj.slug && (obj.title || obj.name)) {
                        var isNovel = (obj.coverUrl || obj.cover || obj.author || obj.genres);
                        if (isNovel && !seenSlug[obj.slug]) {
                            seenSlug[obj.slug] = true;
                            novels.push(obj);
                        }
                    }
                } catch (e) {}
                pos = endPos + 1;
            } else {
                pos = slugIdx + 7;
            }
        } else {
            pos = slugIdx + 7;
        }
    }
    return novels;
}

function parseNovelList(url, page) {
    var target = String(url || '');
    if (target.indexOf('/list') !== -1) {
        target = target.replace('/list', '/api/novels');
    }
    if (target.indexOf('/api/novels') !== -1) {
        target = target.replace('tag=', 'genre=');
    }
    if (target.indexOf('http') !== 0) {
        if (target.charAt(0) !== '/') target = '/' + target;
        target = BASE_URL + target;
    }
    if (page) {
        target = target.replace(/([?&])page=\d+/, '');
        target += (target.indexOf('?') >= 0 ? '&' : '?') + 'page=' + page;
    }

    // Direct JSON API fetch if targeting API
    if (target.indexOf('/api/novels') !== -1) {
        try {
            var response = fetchPage(target);
            if (response.ok) {
                var json = JSON.parse(response.text());
                if (json && json.success && Array.isArray(json.data)) {
                    var data = [];
                    json.data.forEach(function(novel) {
                        var title = novel.title || novel.name || '';
                        var slug = novel.slug || '';
                        if (!title || !slug) return;
                        data.push({
                            name: String(title).trim(),
                            link: normalizeLink('/novel/' + slug),
                            cover: novel.coverUrl || novel.cover || '',
                            description: novel.description || novel.author || '',
                            host: BASE_URL
                        });
                    });
                    
                    var next = null;
                    if (json.data.length >= 10) {
                        next = String(parseInt(page || '1', 10) + 1);
                    }
                    if (data.length > 0) {
                        return Response.success(data, next);
                    }
                }
            }
        } catch (e) {
            // fallback
        }
    }

    var result = fetchPageWithBrowserFallback(target);
    if (!result.ok || !result.doc) return Response.error('Không tải được danh sách truyện.');
    
    var doc = result.doc;
    var data = [];
    var seen = {};

    try {
        var rsc = extractRscStrings(doc);
        if (rsc && rsc.length > 0) {
            var novels = extractNovelsFromRsc(rsc);
            novels.forEach(function(novel) {
                var title = novel.title || novel.name || '';
                var slug = novel.slug || '';
                if (!title || !slug) return;
                var link = normalizeLink('/novel/' + slug);
                if (!seen[link]) {
                    var item = {
                        name: String(title).trim(),
                        link: link,
                        cover: novel.coverUrl || novel.cover || novel.image || '',
                        description: novel.description || novel.author || '',
                        host: BASE_URL
                    };
                    seen[link] = item;
                    data.push(item);
                }
            });
        }
    } catch (e) {}

    if (data.length === 0) {
        var novelLinks = doc.select('a[href*="/novel/"]');
        novelLinks.forEach(function(e) {
            var href = e.attr('href');
            var link = normalizeLink(href);
            if (!link) return;

            if (link.indexOf('/novel/') === -1 || link.endsWith('/chapters') || link.endsWith('/reviews') || link.indexOf('/read/') !== -1) return;

            var cover = '';
            var imgEl = e.select('img').first();
            if (imgEl) {
                cover = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-srcset') || imgEl.attr('srcset') || imgEl.attr('data-original') || '';
            }

            var name = '';
            if (imgEl) {
                name = imgEl.attr('alt') || '';
            }
            if (!name) {
                name = e.attr('title') || '';
            }
            if (!name) {
                var heading = e.select('h1, h2, h3, h4, p, span').first();
                if (heading) name = heading.text().trim();
            }
            if (!name) {
                name = e.text().trim();
            }

            name = name.trim();
            if (name && (name.toLowerCase() === 'đọc ngay' || name.toLowerCase() === 'đọc truyện')) {
                name = '';
            }

            if (seen[link]) {
                var existing = seen[link];
                if (!existing.cover && cover) {
                    existing.cover = cover;
                }
                return;
            }

            var desc = '';
            var parent = e.parent();
            if (parent) {
                var authorEl = parent.select('a[href*="/tac-gia/"], .author, .uploader, a[href*="/user/"]').first();
                if (authorEl) {
                    desc = authorEl.text().trim();
                } else {
                    var grandparent = parent.parent();
                    if (grandparent) {
                        var gAuthor = grandparent.select('a[href*="/tac-gia/"], .author, .uploader, a[href*="/user/"]').first();
                        if (gAuthor) desc = gAuthor.text().trim();
                    }
                }
            }

            if (name && name.length > 1) {
                var item = {
                    name: name,
                    link: link,
                    cover: cover,
                    description: desc,
                    host: BASE_URL
                };
                seen[link] = item;
                data.push(item);
            }
        });
    }

    var next = null;
    var nextEl = doc.select("a[aria-label='Go to next page'], a[rel='next'], li.next a, .pagination a.next, a.next").first();
    if (nextEl) {
        var nextHref = nextEl.attr('href') || '';
        if (nextHref) {
            var match = String(nextHref).match(/page=(\d+)/);
            if (match) {
                next = match[1];
            } else {
                var pageMatch = String(nextHref).match(/(?:page|p)\/(\d+)|(\d+)/);
                if (pageMatch) {
                    next = pageMatch[1] || pageMatch[2];
                }
            }
        }
    }
    if (!next && data.length >= 10) {
        next = String(parseInt(page || '1', 10) + 1);
    }
    if (data.length === 0) return Response.error('Không tìm thấy truyện nào.');
    return Response.success(data, next);
}
