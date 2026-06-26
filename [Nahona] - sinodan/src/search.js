load('config.js');

function execute(key) {
    let response = fetch(BASE_URL + "/wap.php?action=search", {
        method: "POST",
        queries: {
            "wd": key
        }
    });

    if (response.ok) {
        let doc = response.html();
        const books = [];
        doc.select(".bd ul li").forEach(e => {
            books.push({
                name: e.select(".name").first().text(),
                link: BASE_URL + e.select("a").first().attr("href"),
                description: e.select(".update a").text(),
                host: BASE_URL
            });
        });
        return Response.success(books);
    }

    return null;
}
