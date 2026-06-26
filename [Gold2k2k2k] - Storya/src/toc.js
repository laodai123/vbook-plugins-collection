function execute(url) {
    load("config.js");

    url = normalizeUrl(url);
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Failed to load TOC page");

    var data = [];

    // Strategy 1: Try to get chapters from the page HTML (if SSR rendered)
    var chapterLinks = doc.select("a[href*=chuong-]");
    for (var i = 0; i < chapterLinks.size(); i++) {
        var a = chapterLinks.get(i);
        // Skip buttons (read first / read latest)
        if (a.attr("data-slot") === "button") continue;
        var href = a.attr("href");
        var name = "";
        var nameSpan = a.select("span.truncate").first();
        if (nameSpan) name = nameSpan.text().trim();
        if (!name) name = a.text().trim();
        if (!name || !href || name.length < 3) continue;

        data.push({
            name: name,
            url: buildUrl(href),
            host: HOST
        });
    }

    // Strategy 2: If no chapters found in HTML, generate from JSON-LD metadata
    if (data.length === 0) {
        // Extract total chapters from JSON-LD (numberOfPages) or title
        var totalChapters = 0;
        var novelSlug = "";

        // Get slug from URL
        var slugMatch = url.match(/\/truyen\/([^\/]+)/);
        if (slugMatch) novelSlug = slugMatch[1];

        // Try JSON-LD first
        var jsonLds = doc.select("script[type=application/ld+json]");
        for (var j = 0; j < jsonLds.size(); j++) {
            try {
                var ld = JSON.parse(jsonLds.get(j).html());
                if (ld && ld["@type"] === "Book" && ld.numberOfPages) {
                    totalChapters = parseInt(ld.numberOfPages);
                    break;
                }
            } catch(e) {}
        }

        // Fallback: try parsing from title "[Tới Chương 1131]"
        if (totalChapters === 0) {
            var titleEl = doc.select("title").first();
            if (titleEl) {
                var titleText = titleEl.text();
                var chapMatch = titleText.match(/Chương\s+(\d+)\]/);
                if (chapMatch) {
                    totalChapters = parseInt(chapMatch[1]);
                }
            }
        }

        // Fallback: try from h1 or page text
        if (totalChapters === 0) {
            var pageText = doc.text();
            var chapMatch2 = pageText.match(/(\d+)\s*chương/i);
            if (chapMatch2) {
                totalChapters = parseInt(chapMatch2[1]);
            }
        }

        if (totalChapters > 0 && novelSlug) {
            for (var k = 1; k <= totalChapters; k++) {
                data.push({
                    name: "Chương " + k,
                    url: HOST + "/truyen/" + novelSlug + "/chuong-" + k,
                    host: HOST
                });
            }
        }
    }

    if (data.length === 0) {
        return Response.error("No chapters found");
    }

    return Response.success(data);
}
