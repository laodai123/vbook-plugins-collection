load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let name = doc.select("div.books h3.title").text();
        let cover = doc.select("div.book img").first().attr("data-src");
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        // Extract author, genres, status from info-meta
        let infoItems = doc.select("ul.info-meta li");
        let author = "";
        let genres = [];
        let statusText = "";
        let ongoing = true;

        infoItems.forEach(e => {
            let heading = e.select("h3").text().trim();
            if (heading.indexOf("Author") >= 0) {
                author = e.select("a").first().text();
            } else if (heading.indexOf("Genre") >= 0) {
                e.select("a").forEach(a => {
                    genres.push({
                        title: a.text(),
                        input: a.attr("href"),
                        script: "gen.js"
                    });
                });
            } else if (heading.indexOf("Status") >= 0) {
                statusText = e.select("a").first().text().trim();
                if (statusText.toLowerCase() === "completed") {
                    ongoing = false;
                }
            }
        });

        let description = doc.select("div.desc-text").html();

        // Suggests - related by author
        let suggests = [];
        if (author) {
            suggests.push({
                title: "More by " + author,
                input: BASE_URL + "/search?keyword=" + author,
                script: "search.js"
            });
        }

        return Response.success({
            name: name,
            cover: cover,
            author: author,
            description: description,
            detail: "Status: " + statusText,
            ongoing: ongoing,
            genres: genres,
            suggests: suggests,
            host: BASE_URL
        });
    }
    return null;
}
