function execute(url) {
    const yUrl = url.replace('m.','www.');
    var doc = fetch(yUrl).html();
    var el = doc.select(".details .chapterlist a")
    const list = [];
    for (var i = 15; i < el.size(); i++) {
        var e = el.get(i);
        list.push({
            name: e.text(),
            url: e.attr("href"),
            host: "https://www.121du.net"
        })
    }
    return Response.success(list)
}
