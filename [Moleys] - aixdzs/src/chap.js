function execute(url) {
    if (url.includes('aixdzs.com')) {
        url = url.replace('www.aixdzs.com', 'm.ixdzs8.tw');
    } else if (url.includes('ixdzs8.tw')) {
        url = url.replace('www.ixdzs8.tw', 'm.ixdzs8.tw').replace('ixdzs8.tw', 'm.ixdzs8.tw');
    } else if (url.includes('ixdzs.tw')) {
        url = url.replace('www.ixdzs.tw', 'm.ixdzs.tw').replace('ixdzs.tw', 'm.ixdzs.tw');
    }
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let htm = doc.select('article.page-content section').html();
        return Response.success(htm);
    }
    return null;
}