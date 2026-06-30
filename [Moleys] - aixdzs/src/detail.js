function execute(url) {
    // Support both aixdzs.com and ixdzs8.tw/ixdzs.tw domains
    if (url.includes('aixdzs.com')) {
        url = url.replace('www.aixdzs.com', 'm.aixdzs.com');
    } else if (url.includes('ixdzs8.tw')) {
        url = url.replace('www.ixdzs8.tw', 'm.ixdzs8.tw').replace('ixdzs8.tw', 'm.ixdzs8.tw');
    } else if (url.includes('ixdzs.tw')) {
        url = url.replace('www.ixdzs.tw', 'm.ixdzs.tw').replace('ixdzs.tw', 'm.ixdzs.tw');
    }
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let coverImg = doc.select("div.ix-list-img-square img").first().attr("src");
        let author =  doc.select("div.ix-list-info p a").first().text();
        return Response.success({
            name: doc.select("header h1").text(),
            cover: coverImg,
            author: author,
            description: doc.select("#intro").text(),
            detail: "作者： " + author + "<br>" + doc.select("#info p").last().text(),
            host: "https://m.aixdzs.com"  // Keep original host for consistency
        });
    }
    return null;
}