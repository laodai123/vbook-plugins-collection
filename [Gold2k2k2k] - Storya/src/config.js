// ===== Storya Configuration =====
var HOST = "https://storya.click";

/**
 * Normalize any storya URL to the canonical HOST.
 */
function normalizeUrl(url) {
    if (!url) return url;
    url = url.replace(/https?:\/\/(www\.)?storya\.click/g, HOST);
    if (url.indexOf("http") !== 0) {
        if (url.charAt(0) !== "/") {
            url = "/" + url;
        }
        url = HOST + url;
    }
    return url;
}

/**
 * Build full URL from a relative path.
 */
function buildUrl(path) {
    if (!path) return HOST;
    if (path.indexOf("http") === 0) return normalizeUrl(path);
    if (path.charAt(0) !== "/") {
        path = "/" + path;
    }
    return HOST + path;
}

/**
 * Fetch a page and parse as HTML.
 */
function fetchDoc(url) {
    url = normalizeUrl(url);
    var res = fetch(url);
    if (!res.ok) return null;
    return res.html();
}

/**
 * Extract the best image URL from a Next.js img element.
 * srcset uses /_next/image?url=encodedUrl&w=...
 * We extract the original image URL for the best quality.
 */
function extractImgUrl(imgEl) {
    if (!imgEl) return "";
    // Try to get original image URL from srcset or src
    var src = imgEl.attr("src");
    if (src && src.indexOf("/_next/image") >= 0) {
        // Parse the url param from /_next/image?url=ENCODED&w=...
        var match = src.match(/url=([^&]+)/);
        if (match) {
            try {
                var decoded = decodeURIComponent(match[1]);
                if (decoded.charAt(0) === "/") decoded = HOST + decoded;
                return decoded;
            } catch(e) {
                return src;
            }
        }
    }
    // Fallback: try srcset for the largest image
    var srcset = imgEl.attr("srcset");
    if (srcset) {
        var parts = srcset.split(",");
        var lastPart = parts[parts.length - 1].trim();
        var lastUrl = lastPart.split(" ")[0];
        if (lastUrl && lastUrl.indexOf("/_next/image") >= 0) {
            var match2 = lastUrl.match(/url=([^&]+)/);
            if (match2) {
                try {
                    var decoded2 = decodeURIComponent(match2[1]);
                    if (decoded2.charAt(0) === "/") decoded2 = HOST + decoded2;
                    return decoded2;
                } catch(e) {}
            }
        }
    }
    if (src && src.charAt(0) === "/") {
        return HOST + src;
    }
    return src || "";
}

/**
 * Parse novel items from genre/list/search pages.
 * The site uses .divide-y > div cards with .flex.gap-4 layout.
 */
function parseNovelList(doc) {
    var data = [];
    // Genre/List card format: .divide-y > div > .flex > a[href=/truyen/]
    var cards = doc.select(".divide-y > div");
    for (var i = 0; i < cards.size(); i++) {
        var card = cards.get(i);
        // Find novel link
        var linkEl = card.select("a[href*=/truyen/]").first();
        if (!linkEl) continue;
        var href = linkEl.attr("href");
        if (!href || href.indexOf("/truyen/") < 0) continue;

        // Find title: h3 or the alt text of img
        var titleEl = card.select("h3").first();
        var name = titleEl ? titleEl.text().trim() : "";
        if (!name) {
            var imgEl = card.select("img").first();
            name = imgEl ? imgEl.attr("alt") : "";
        }
        if (!name) continue;

        // Cover image
        var imgEl = card.select("img").first();
        var cover = extractImgUrl(imgEl);

        // Description
        var descEl = card.select("p.text-muted-foreground, p.line-clamp-2, p.line-clamp-3").first();
        var desc = descEl ? descEl.text().trim() : "";

        data.push({
            name: name,
            link: buildUrl(href),
            cover: cover,
            description: desc,
            host: HOST
        });
    }

    // Fallback: home page grid cards (a.group with img inside)
    if (data.length === 0) {
        var gridCards = doc.select("a.group[href*=/truyen/]");
        for (var j = 0; j < gridCards.size(); j++) {
            var a = gridCards.get(j);
            var href = a.attr("href");
            if (!href) continue;

            var imgEl = a.select("img").first();
            var name = imgEl ? imgEl.attr("alt") : "";
            var cover = extractImgUrl(imgEl);
            
            // Title might be in a p/h3 within or after the card
            if (!name) {
                var titleEl = a.select("h3, p.font-medium, p.font-semibold").first();
                name = titleEl ? titleEl.text().trim() : "";
            }
            if (!name) continue;

            data.push({
                name: name,
                link: buildUrl(href),
                cover: cover,
                description: "",
                host: HOST
            });
        }
    }

    return data;
}
