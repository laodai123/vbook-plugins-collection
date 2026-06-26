load("config.js");

function execute() {
    var doc = loadDocument(BASE_URL + "/browse", 15000, "a[href*='/browse?genres=']");
    if (!doc) return Response.success([]);

    var genres = [];
    var links = doc.select("a[href*='/browse?genres=']");
    var seen = {};

    for (var i = 0; i < getSize(links); i++) {
        var link = getElement(links, i);
        if (!link) continue;
        var title = cleanText(link.text());
        var href = link.attr("href") || "";
        if (!title || !href || seen[title]) continue;
        seen[title] = true;
        genres.push({
            title: title,
            input: normalizeUrl(href).replace(/page=\d+/, "page={{page}}"),
            script: "gen.js"
        });
    }

    return Response.success(genres);
}