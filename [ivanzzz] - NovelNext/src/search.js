load('config.js');
function execute(key, page) {
    if (!page) page = '1';
    let response = fetch(BASE_URL + "/search", {
        queries: {
            keyword: key,
            page: page
        }
    });
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
