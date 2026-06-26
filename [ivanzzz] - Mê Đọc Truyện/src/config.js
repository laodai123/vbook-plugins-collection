var BASE_URL = "https://medoctruyen.vn";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

var BASE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

function cleanText(text) {
    if (!text) return "";
    return String(text).replace(/\s+/g, " ").trim();
}

function normalizeUrl(url) {
    if (!url) return "";
    url = String(url).trim();
    if (url.indexOf("http") === 0) return url;
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    return BASE_URL + "/" + url;
}

function extractCoverUrl(url) {
    if (!url) return "";
    url = String(url).trim();
    var match = url.match(/[?&]url=([^&]+)/);
    if (match) {
        try { url = decodeURIComponent(match[1]); }
        catch (e) { url = match[1]; }
    }
    if (url.indexOf("http") === 0 || url.indexOf("//") === 0) {
        url = normalizeUrl(url);
    }
    return url;
}

function getSize(list) {
    if (!list) return 0;
    if (typeof list.size === "function") return list.size();
    if (typeof list.length !== "undefined") return list.length;
    return 0;
}

function getElement(list, index) {
    if (!list) return null;
    if (typeof list.get === "function") return list.get(index);
    if (typeof list[index] !== "undefined") return list[index];
    return null;
}

function loadDocument(url, timeout, waitSelector) {
    var browser = Engine.newBrowser();
    browser.setUserAgent(BASE_UA);
    var doc = browser.launch(url, timeout || 15000);
    if (!doc) { browser.close(); return null; }

    if (waitSelector) {
        var elapsed = 0;
        var interval = 500;
        while (elapsed < (timeout || 15000)) {
            var found = doc.select(waitSelector);
            if (found.size() > 0) break;
            sleep(interval);
            elapsed += interval;
            doc = browser.html();
        }
    }

    var result = browser.html();
    browser.close();
    return result;
}

function parseListItems(doc) {
    var list = [];
    if (!doc) return list;

    var cards = doc.select("a[href]:has(img)");
    if (cards.size() === 0) cards = doc.select("div[class*=card] a[href]:has(img), div[class*=item] a[href]:has(img)");

    var seen = {};

    for (var i = 0; i < getSize(cards); i++) {
        var card = getElement(cards, i);
        if (!card) continue;

        var href = card.attr("href") || "";
        if (!href || href.indexOf("/browse") >= 0 || href.indexOf("/login") >= 0) continue;
        if (!href.match(/^https?:\/\//)) href = normalizeUrl(href);
        if (seen[href]) continue;
        seen[href] = true;

        var name = cleanText(card.attr("title") || card.select("img").attr("alt") || card.text());
        if (!name || name.length < 2) continue;

        var imgEl = card.select("img").first();
        var cover = "";
        if (imgEl) {
            cover = imgEl.attr("src") || imgEl.attr("data-src") || "";
            cover = extractCoverUrl(cover);
        }

        var descEl = card.select("p, span[class*=author], span[class*=desc], div[class*=author], div[class*=desc]").first();
        var description = descEl ? cleanText(descEl.text()) : "";

        list.push({
            name: name,
            link: href,
            cover: cover,
            description: description,
            host: BASE_URL
        });
    }

    return list;
}

function detectNextPage(doc, currentPage) {
    if (!doc) return "";
    var cur = parseInt(currentPage || "1", 10);
    var links = doc.select("a[href*='page=']");
    var maxPage = cur;

    for (var i = 0; i < getSize(links); i++) {
        var link = getElement(links, i);
        if (!link) continue;
        var href = link.attr("href") || "";
        var match = href.match(/page=(\d+)/);
        if (match) {
            var p = parseInt(match[1], 10);
            if (p > maxPage) maxPage = p;
        }
    }

    if (maxPage > cur) return String(cur + 1);
    return "";
}