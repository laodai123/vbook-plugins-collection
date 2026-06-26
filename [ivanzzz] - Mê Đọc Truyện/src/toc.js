load("config.js");

function execute(url) {
    url = normalizeUrl(url);

    var doc = loadDocument(url, 20000, "a[href*='/chuong-']");
    if (!doc) return Response.success([]);

    var chapters = [];
    var seen = {};
    var elements = doc.select("a[href*='/chuong-']");

    for (var i = 0; i < getSize(elements); i++) {
        var el = getElement(elements, i);
        if (!el) continue;

        var name = cleanText(el.text());
        var href = el.attr("href") || "";
        if (!name || !href) continue;

        name = name.replace(/miễn phí|free/gi, "").trim();
        name = cleanText(name);
        if (!name || name === "Đọc từ đầu" || name === "Đọc tiếp" || name === "Đọc ngay") continue;

        var chapUrl = normalizeUrl(href);
        if (seen[chapUrl]) continue;
        seen[chapUrl] = true;

        chapters.push({
            name: name,
            url: chapUrl,
            host: BASE_URL
        });
    }

    return Response.success(chapters);
}