function execute(url) {
    load("config.js");

    url = normalizeUrl(url);
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Failed to load detail page");

    // === Name from h1 ===
    var nameEl = doc.select("h1").first();
    var nameText = nameEl ? nameEl.text().trim() : "";

    // === Cover from main image ===
    var coverImg = doc.select("img[alt]").first();
    var coverSrc = extractImgUrl(coverImg);

    // === Author from /tac-gia/ link ===
    var author = "";
    var authorUrl = "";
    var authorEl = doc.select("a[href*=/tac-gia/]").first();
    if (authorEl) {
        author = authorEl.text().trim();
        authorUrl = authorEl.attr("href");
    }

    // === Description: try JSON-LD first, then page content ===
    var description = "";
    var jsonLdScripts = doc.select("script[type=application/ld+json]");
    for (var i = 0; i < jsonLdScripts.size(); i++) {
        try {
            var ld = JSON.parse(jsonLdScripts.get(i).html());
            if (ld && ld["@type"] === "Book") {
                if (ld.description) description = ld.description;
                if (!nameText && ld.name) nameText = ld.name;
                if (!author && ld.author && ld.author.name) author = ld.author.name;
                if (!coverSrc && ld.image) coverSrc = ld.image;
                break;
            }
        } catch(e) {}
    }

    // Fallback: extract description from visible tab content
    if (!description) {
        var introTab = doc.select("[data-state=active] p, .prose p, .whitespace-pre-line").first();
        if (introTab) {
            description = introTab.text().trim();
        }
    }

    // === Ongoing status ===
    // Look for "Hoàn thành" or "Full" badge
    var ongoing = true;
    var statusBadges = doc.select("span");
    for (var s = 0; s < statusBadges.size(); s++) {
        var badgeText = statusBadges.get(s).text().trim().toLowerCase();
        if (badgeText === "hoàn thành" || badgeText === "full") {
            ongoing = false;
            break;
        }
    }

    // === Detail (extra info) ===
    var detail = "";
    if (author) detail = "Tác giả: " + author;

    // === Genres from /the-loai/ links ===
    var genres = [];
    var genreLinks = doc.select("a[href*=/the-loai/]");
    for (var g = 0; g < genreLinks.size(); g++) {
        var gl = genreLinks.get(g);
        var gText = gl.text().trim();
        var gHref = gl.attr("href");
        if (gText && gHref) {
            // Deduplicate
            var exists = false;
            for (var k = 0; k < genres.length; k++) {
                if (genres[k].title === gText) { exists = true; break; }
            }
            if (!exists) {
                genres.push({
                    title: gText,
                    input: buildUrl(gHref),
                    script: "gen.js"
                });
            }
        }
    }

    // === Suggests: same author ===
    var suggests = [];
    if (author && authorUrl) {
        suggests.push({
            title: "Cùng tác giả: " + author,
            input: authorUrl,
            script: "suggest.js"
        });
    }

    // Related novels from sidebar or bottom section
    var relatedLinks = doc.select("a[href*=/truyen/]");
    var addedSlugs = {};
    // Get current novel slug to exclude it
    var currentSlug = url.match(/\/truyen\/([^\/]+)/);
    if (currentSlug) addedSlugs[currentSlug[1]] = true;
    
    for (var r = 0; r < relatedLinks.size() && suggests.length < 8; r++) {
        var rl = relatedLinks.get(r);
        var rHref = rl.attr("href");
        var rMatch = rHref ? rHref.match(/\/truyen\/([^\/]+)/) : null;
        if (rMatch && !addedSlugs[rMatch[1]]) {
            var rImg = rl.select("img").first();
            var rName = rImg ? rImg.attr("alt") : rl.text().trim();
            if (rName && rName.length > 2 && rName.length < 200) {
                addedSlugs[rMatch[1]] = true;
                suggests.push({
                    title: rName,
                    input: buildUrl(rHref),
                    script: "detail.js"
                });
            }
        }
    }

    // === Comments ===
    var comments = [];
    // Pass the detail URL slug for comment fetching
    var slugMatch = url.match(/\/truyen\/([^\/]+)/);
    if (slugMatch) {
        comments.push({
            title: "Bình luận",
            input: slugMatch[1],
            script: "comment.js"
        });
    }

    var result = {
        name: nameText,
        cover: coverSrc,
        host: HOST,
        author: author,
        description: description,
        detail: detail,
        ongoing: ongoing
    };

    if (genres.length > 0) result.genres = genres;
    if (suggests.length > 0) result.suggests = suggests;
    if (comments.length > 0) result.comments = comments;

    return Response.success(result);
}
