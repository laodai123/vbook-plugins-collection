function execute(url) {
    /////////const yUrl = url.replace('m.','www.');
    const doc = fetch(url).html();
    
    return Response.success({
        name: doc.select("h1").text(),
        cover: doc.select(".baseinfo img").first().attr('src'),
        author: doc.select(".pt-info:nth-child(2)").first().text(),
        description: doc.select(".intro").html(),
        detail: doc.select(".pt-info:nth-child(3)").html(),
        category: doc.select(".booktitle p").html(),
        host: "https://www.121du.net"
    });
}