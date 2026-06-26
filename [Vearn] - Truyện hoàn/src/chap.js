function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('utf-8');
        let htm = "<p>" + doc.select("h1 a.chapter-title").attr("title") + "</p>" + doc.select("#chapter-c").html();
        return Response.success(htm);
    }
    return null;
}