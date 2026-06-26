load("config.js");
function execute(key, page) {
    var key = encodeURIComponent(key)
    if (!page) page = 1;
    let response = httpGet(BASE_URL + "/search.html?q=" + key + "&p=" + page)
    if (response) {
        let doc = response.html();
        let data = [];
        let elems = doc.select(".list-group .list-group-item")
        if (!elems.length) return Response.error(key);

        elems.forEach(function (e) {
            var link = e.select("h5 a").first().attr("href")
            var statusEl = e.select("h5 small.text-muted").first();
            var tag = "";
            if (statusEl) {
                var statusText = statusEl.text().trim();
                if (statusText.indexOf("\u5df2\u5b8c\u7ed3") !== -1 || statusText.indexOf("\u5b8c\u672c") !== -1) {
                    tag = "Completed";
                } else if (statusText.indexOf("\u8fde\u8f7d") !== -1) {
                    tag = "Ongoing";
                }
            }
            data.push({
                name: e.select("h5 a").text(),
                link: link,
                cover: "https://i.postimg.cc/T2WtdmBM/5BdXa90.webp",
                description: e.select(".text-muted").text(),
                tag: tag,
                host: BASE_URL
            })
        })
        let next = parseInt(page) + 1;
        return Response.success(data, next);
    }
    return null;
}
