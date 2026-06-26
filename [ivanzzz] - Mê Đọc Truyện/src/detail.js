load("config.js");

function execute(url) {
    url = normalizeUrl(url);

    var doc = loadDocument(url, 15000, "script[type='application/ld+json']");
    if (!doc) return null;

    var scripts = doc.select("script[type='application/ld+json']");
    var bookData = null;

    for (var i = 0; i < getSize(scripts); i++) {
        var script = getElement(scripts, i);
        if (!script) continue;
        var text = script.html() || script.text() || "";
        if (text.indexOf('"@type":"Book"') >= 0) {
            try { bookData = JSON.parse(text); } catch (e) {}
            break;
        }
    }

    if (!bookData) return null;

    var name = bookData.name || "";
    var author = bookData.author ? (bookData.author.name || "") : "";
    var description = bookData.description || "";
    var cover = extractCoverUrl(bookData.image || "");

    var genres = [];
    if (bookData.genre) {
        var genreList = typeof bookData.genre === "string" ? [bookData.genre] : bookData.genre;
        for (var j = 0; j < genreList.length; j++) {
            genres.push({
                title: genreList[j],
                input: BASE_URL + "/browse?genres=" + encodeURIComponent(genreList[j]) + "&page={{page}}",
                script: "gen.js"
            });
        }
    }

    var status = "Đang ra";
    var detail = "Tác giả: " + author;
    if (bookData.numberOfPages) {
        detail += "<br>Số chương: " + bookData.numberOfPages;
    }

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: detail,
        host: BASE_URL,
        ongoing: true,
        genres: genres
    });
}