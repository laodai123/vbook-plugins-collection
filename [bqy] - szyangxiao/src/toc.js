function execute(url) {
    
    var doc = fetch(url).html();
    var el = doc.select(".nav a")
    const list = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        list.push({
            name: e.text(),
            url: e.attr("href"),
            host: "https://www.szyangxiao.com"
        })
    }
    return Response.success(list)
}
