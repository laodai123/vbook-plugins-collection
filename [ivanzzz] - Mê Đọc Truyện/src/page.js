load("config.js");

function execute(url) {
    url = normalizeUrl(url);

    var doc = loadDocument(url, 15000, "a[href*='?ch=']");
    if (!doc) return Response.success([url]);

    var maxPage = 1;
    var links = doc.select("a[href*='?ch=']");
    for (var i = 0; i < getSize(links); i++) {
        var link = getElement(links, i);
        if (!link) continue;
        var href = link.attr("href") || "";
        var match = href.match(/[?&]ch=(\d+)/);
        if (match) {
            var p = parseInt(match[1], 10);
            if (p > maxPage) maxPage = p;
        }
    }

    var pages = [];
    for (var p = 1; p <= maxPage; p++) {
        pages.push(url + (url.indexOf("?") >= 0 ? "&" : "?") + "ch=" + p);
    }

    return Response.success(pages);
}