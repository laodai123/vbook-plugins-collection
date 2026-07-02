load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let coverImg = doc.select('meta[property="og:image"]').attr("content");
        let authorEl = doc.select('.story-detail__bottom--info strong:contains("Tác giả") + a').first();
        let author = authorEl ? authorEl.text() : "Akay Hau";
        let descEl = doc.select('.story-detail__top--desc').first();
        let description = descEl ? descEl.text() : "";
        
        return Response.success({
            name: doc.select('h3.story-name, .story-name').first().text(),
            cover: coverImg,
            author: author,
            description: description
        });
    }
    return null;
}
