load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (!response.ok) {
        sleep(500);
        response = fetch(url);
    }
    if (response.ok) {
        let doc = response.html();
        let list = [];
        doc.select("div#list-chapter ul.list-chapter li a").forEach(e => {
            let name = e.select("span.chapter-text").text();
            if (!name) name = e.text();
            let href = e.attr("href");
            if (href && !href.startsWith("http")) href = BASE_URL + href;
            list.push({
                name: name.trim(),
                url: href,
                host: BASE_URL
            });
        });
        return Response.success(list);
    }
    return null;
}
