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
        
        // Get next page from pagination
        let nextEl = doc.select("ul.pagination > li.next a");
        let next = nextEl ? nextEl.attr("data-page") : "";
        if (next) {
            next = String(parseInt(next) + 1);
        }

        // Select novel rows from main content area
        doc.select(".col-truyen-main .row").forEach(e => {
            let img = e.select("img.cover").first();
            let cover = img ? img.attr("src") : "";
            if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
            let titleEl = e.select("h3.truyen-title a").first();
            let name = titleEl ? titleEl.text() : "";
            let link = titleEl ? titleEl.attr("href") : "";
            if (link && !link.startsWith("http")) link = BASE_URL + link;
            let author = e.select("span.author").text().trim();
            if (name) {
                novelList.push({
                    name: name,
                    link: link,
                    description: author,
                    cover: cover,
                    host: BASE_URL,
                });
            }
        });
        return Response.success(novelList, next);
    }
    return null;
}