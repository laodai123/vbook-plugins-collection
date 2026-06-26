load("config.js");

function execute(key, page) {
    if (!key) return Response.success([]);

    var searchUrl = BASE_URL + "/browse?q=" + encodeURIComponent(key) + "&page=" + (page || "1");
    var doc = loadDocument(searchUrl, 15000, "img[alt]");
    if (!doc) return Response.success([]);

    var list = parseListItems(doc);
    var next = detectNextPage(doc, page || "1");
    return Response.success(list, next);
}