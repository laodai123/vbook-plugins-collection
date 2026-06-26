function execute(url) {
    load("config.js");

    url = normalizeUrl(url);
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Failed to load chapter");

    // Strategy 1: Find div.mb-4 elements (chapter paragraphs on storya)
    var mb4Divs = doc.select("div.mb-4");
    if (mb4Divs.size() > 3) {
        var htm = "";
        for (var i = 0; i < mb4Divs.size(); i++) {
            var text = mb4Divs.get(i).html().trim();
            if (text.length > 0) {
                htm = htm + "<p>" + text + "</p>\n";
            }
        }
        if (htm.length > 100) {
            return Response.success(htm);
        }
    }

    // Strategy 2: Parse content from raw HTML using regex for mb-4 blocks
    var fullHtml = doc.html();
    var blocks = [];
    var blockRegex = /<div class="mb-4">([\s\S]*?)<\/div>/g;
    var m;
    while ((m = blockRegex.exec(fullHtml)) !== null) {
        var blockText = m[1].trim();
        if (blockText.length > 0) {
            blocks.push("<p>" + blockText + "</p>");
        }
    }
    if (blocks.length > 3) {
        return Response.success(blocks.join("\n"));
    }

    // Strategy 3: Fallback to any prose/article content
    var contentEl = doc.select(".prose, article, .chapter-content, #chapter-content").first();
    if (contentEl) {
        var htm = contentEl.html();
        if (htm && htm.length > 100) {
            return Response.success(htm);
        }
    }

    return Response.error("No content found");
}
