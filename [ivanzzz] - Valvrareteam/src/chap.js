load("config.js");

function execute(url) {
    var doc = fetchDocument(url);
    if (!doc) {
        return null;
    }

    var contentEl = doc.select(".chapter-content").first();
    if (contentEl) {
        return Response.success(sanitizeContentHtml(contentEl.html()));
    }

    if (doc.select(".restricted-content-message, .chapter-access-guard").size() > 0) {
        return Response.success(
            "<p>Chuong nay dang bi khoa hoac can mo khoa tren Valvrareteam.</p>"
        );
    }

    return null;
}
