function execute(url) {
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
        let el = doc.select('ul.chapter a');
        const data = [];
        for (let i = 0; i < el.size(); i++) {
            var e = el.get(i);
            data.push({
                name: e.select('a').text(),
                url: 'https://m.aixdzs.com' + e.attr('href'),
                host: 'https://m.aixdzs.com'
            });
        }
        return Response.success(data);
    }
    return null;
}