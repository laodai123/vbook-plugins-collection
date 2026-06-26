load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();

        // Extract cover image
        let cover = doc.select(".bd.column-2 .left img").attr("src");
        cover = cover ? BASE_URL + cover : null;

        // Extract other details
        let title = doc.select(".bd.column-2 .right h1").text();
        let author = doc.select(".bd.column-2 .right .info").text().match(/作者：([^<]+)/)[1].trim();
        let category = doc.select(".bd.column-2 .right .info").text().match(/类型：([^<]+)/)[1].trim();
        let wordCount = doc.select(".bd.column-2 .right .info").text().match(/字数：([^<]+)/)[1].trim();
        let popularity = doc.select(".bd.column-2 .right .info").text().match(/人气：([^<]+)/)[1].trim();
        let status = doc.select(".bd.column-2 .right .status").text().trim();

        // Extract book intro
        let bookIntro = doc.select(".mod.book-intro .bd").text().trim();

        // Combine all information into description
        let description = `**Author:** ${author}\n**Category:** ${category}\n**Word Count:** ${wordCount}\n**Popularity:** ${popularity}\n**Status:** ${status}\n\n${bookIntro}`;

        // Create the response object
        return Response.success({
            name: title,
            author: author,
            description: description,
            cover: cover,
            host: BASE_URL
        });
    }
    return null;
}
