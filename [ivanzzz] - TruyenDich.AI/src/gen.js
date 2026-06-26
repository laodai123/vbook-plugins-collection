load("config.js");

function pickTitle(anchor) {
    let title = cleanText(anchor.select("h3 span").text());
    if (title) return title;

    title = cleanText(anchor.select("h3").text());
    if (title) return title;

    title = cleanText(anchor.select("h2").text());
    if (title) return title;

    let img = anchor.select("img").first();
    if (img) {
        title = cleanText(img.attr("alt")).replace(/^Anh bia truyen\s*/i, "").replace(/^Ảnh bìa truyện\s*/i, "");
        if (title) return title;
    }

    title = cleanText(anchor.attr("title"));
    if (title) return title;

    return "";
}

function pickCover(anchor) {
    let img = anchor.select("img").first();
    if (!img) return "";

    return normalizeCover(img.attr("data-src") || img.attr("src") || img.attr("srcset") || "");
}

function parseList(doc) {
    let list = [];
    let seen = {};

    doc.select("a[href*=\"/doc-truyen/\"]").forEach(function(anchor) {
        let link = normalizeNovelUrl(anchor.attr("href"));
        if (!link || seen[link]) return;

        let title = pickTitle(anchor);
        if (!title) return;

        seen[link] = true;
        list.push({
            name: title,
            link: link,
            cover: pickCover(anchor),
            description: cleanText(anchor.select("p").text()),
            host: BASE_URL
        });
    });

    return list;
}

function execute(url, page) {
    let pageNum = parseInt(page || "1", 10);
    if (!pageNum || pageNum < 1) pageNum = 1;

    let pageUrl = addPageParam(url, pageNum);
    let response = fetch(pageUrl, {
        headers: {
            "user-agent": "Mozilla/5.0"
        }
    });
    if (!response || !response.ok) return null;

    let doc = response.html();
    let list = parseList(doc);
    let next = list.length > 0 ? "" + (pageNum + 1) : "";

    return Response.success(list, next);
}
