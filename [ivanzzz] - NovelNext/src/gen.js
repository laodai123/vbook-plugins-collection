load('config.js');
function execute(url, page) {
    if (!page) page = '1';

    // Handle URL with ?page= parameter
    let fetchUrl = url;
    if (url.indexOf("?") >= 0) {
        // Already has query params
        fetchUrl = url.replace(/page=\d+/, "page=" + page);
        if (fetchUrl.indexOf("page=") < 0) fetchUrl += "&page=" + page;
    } else {
        fetchUrl = url + (url.endsWith("/") ? "" : "/") + "?page=" + page;
    }

    let response = fetch(fetchUrl);
    if (response.ok) {
        let doc = response.html();
        let novelList = [];
        let next = doc.select("ul.pagination > li.next a").attr("href");
        if (next) {
            let parts = next.split("page=");
            if (parts.length > 1) next = parts[1];
            else next = "";
        }
        doc.select("div.list-novel div.row").forEach(e => {
            let img = e.select("img.cover").first();
            let cover = img ? img.attr("data-src") : "";
            if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
            let titleEl = e.select("h3.novel-title a").first();
            let name = titleEl ? titleEl.text() : "";
            let link = titleEl ? titleEl.attr("href") : "";
            if (link && !link.startsWith("http")) link = BASE_URL + link;
            let author = e.select("span.author").text();
            novelList.push({
                name: name,
                link: link,
                description: author,
                cover: cover,
                host: BASE_URL,
            });
        });
        return Response.success(novelList, next);
    }
    return null;
}
