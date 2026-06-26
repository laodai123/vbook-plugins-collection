function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('utf-8');
        let coverImg = doc.select("div.book img").first().attr("src");
        let author =  doc.select("div.info div").get(0).text();
        let detail = doc.select("div.info div").get(1).text();
        //detail = Html.clean(detail, ["span"]);
        let description = doc.select(".desc-text.desc-text-full").get(0).html();
        //let ongoing = doc.select(".mb-3.d-flex.flex-wrap.gap-2.align-items-center span").text()
        return Response.success({
            name: doc.select("h1.title").text(),
            cover: coverImg,
            author: author,
            description: description,
            detail: detail,
            //ongoing: ongoing,
            host: "https://truyenhoan.com"
        });
    }
    return null;
}