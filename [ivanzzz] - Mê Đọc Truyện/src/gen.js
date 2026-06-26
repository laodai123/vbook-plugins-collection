load("config.js");

function execute(url, page) {
    url = normalizeUrl(url);
    url = url.replace("{{page}}", page || "1");

    var doc = loadDocument(url, 15000, "img[alt]");
    if (!doc) return Response.success([]);

    var list = parseListItems(doc);
    var next = detectNextPage(doc, page || "1");
    return Response.success(list, next);
}