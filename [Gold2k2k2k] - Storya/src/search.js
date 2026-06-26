function execute(key, page) {
    load("config.js");

    if (!page) page = "1";

    // The /tim-kiem page is client-side only. Use danh-sach/truyen-hot as a search workaround.
    // First try direct search URL
    var searchUrl = HOST + "/tim-kiem?q=" + encodeURIComponent(key);
    if (parseInt(page) > 1) {
        searchUrl = searchUrl + "&page=" + page;
    }

    var res = fetch(searchUrl);
    var data = [];

    if (res.ok) {
        var doc = res.html();
        // Check if we got actual results (not just loading placeholder)
        data = parseNovelList(doc);

        // Also check for truyen links directly (some may be SSR rendered)
        if (data.length === 0) {
            var links = doc.select("a[href*=/truyen/]");
            var addedSlugs = {};
            for (var i = 0; i < links.size(); i++) {
                var linkEl = links.get(i);
                var href = linkEl.attr("href");
                if (!href || href.indexOf("/truyen/") < 0 || href.indexOf("/chuong-") >= 0) continue;
                if (href.indexOf("/danh-sach/") >= 0) continue;
                var slugMatch = href.match(/\/truyen\/([^\/]+)/);
                if (!slugMatch || addedSlugs[slugMatch[1]]) continue;
                addedSlugs[slugMatch[1]] = true;

                var titleEl = linkEl.select("h3").first();
                var name = titleEl ? titleEl.text().trim() : "";
                if (!name) {
                    var imgEl = linkEl.select("img").first();
                    name = imgEl ? imgEl.attr("alt") : "";
                }
                if (!name) name = linkEl.text().trim();
                if (!name || name.length < 2 || name.length > 200) continue;
                if (name === "Truyện Mới" || name === "Truyện Hot" || name === "Truyện Full") continue;

                var imgEl2 = linkEl.select("img").first();
                data.push({
                    name: name,
                    link: buildUrl(href),
                    cover: extractImgUrl(imgEl2),
                    description: "",
                    host: HOST
                });
            }
        }
    }

    // Fallback: If search page didn't work, try the-loai page if key matches a genre
    if (data.length === 0) {
        // Convert key to slug format for genre search
        var slug = key.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
            .replace(/[èéẹẻẽêềếệểễ]/g, "e")
            .replace(/[ìíịỉĩ]/g, "i")
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
            .replace(/[ùúụủũưừứựửữ]/g, "u")
            .replace(/[ỳýỵỷỹ]/g, "y")
            .replace(/[đ]/g, "d");

        var genreUrl = HOST + "/the-loai/" + slug;
        var genreDoc = fetchDoc(genreUrl);
        if (genreDoc) {
            data = parseNovelList(genreDoc);
        }
    }

    // Pagination
    var nextPage = null;
    if (data.length >= 10) {
        nextPage = String(parseInt(page) + 1);
    }

    return nextPage ? Response.success(data, nextPage) : Response.success(data);
}
