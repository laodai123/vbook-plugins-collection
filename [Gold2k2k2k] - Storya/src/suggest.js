function execute(input, page) {
    load("config.js");

    // input is author URL path like "/tac-gia/nham-nga-tieu"
    if (!page) page = "1";

    var authorUrl = buildUrl(input);
    if (parseInt(page) > 1) {
        var separator = authorUrl.indexOf("?") >= 0 ? "&" : "?";
        authorUrl = authorUrl + separator + "page=" + page;
    }

    var doc = fetchDoc(authorUrl);
    if (!doc) return Response.success([]);

    var data = parseNovelList(doc);

    // Pagination
    var nextPage = null;
    if (data.length >= 10) {
        nextPage = String(parseInt(page) + 1);
    }

    return nextPage ? Response.success(data, nextPage) : Response.success(data);
}
