load("config.js");

function execute(url) {
    url = normalizeUrl(url);

    var doc = loadDocument(url, 15000, "article p");
    if (!doc) return null;

    var article = doc.select("article").first();
    if (!article) return null;

    article.select("script, style, iframe, [class*=ads], [class*=preview-gate]").remove();

    var paragraphs = article.select("p");
    var html = "";
    for (var i = 0; i < getSize(paragraphs); i++) {
        var p = getElement(paragraphs, i);
        if (!p) continue;
        var text = cleanText(p.text());
        if (!text) continue;
        if (text.indexOf("Đăng nhập để đọc tiếp") >= 0) continue;
        if (text.indexOf("theo dõi chương mới") >= 0) continue;
        html += "<p>" + text + "</p>";
    }

    if (!html) return null;
    return Response.success(html);
}