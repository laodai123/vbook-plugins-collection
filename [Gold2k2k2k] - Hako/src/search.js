load('config.js');

function execute(key, page) {
    if (!page) page = '1';

    let url = BASE_URL + "/tim-kiem?keywords=" + encodeURIComponent(key) + "&page=" + page;

    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.android());
    let doc = browser.launch(url, 15000);

    if (doc) {
        let next = doc.select(".pagination-footer a.current + a").text();
        let novelList = [];
        doc.select(".sect-body .thumb-item-flow").forEach(e => {
            novelList.push({
                name: e.select(".series-title a").text(),
                link: e.select(".series-title a").attr("href"),
                description: e.select(".chapter-title").text(),
                cover: e.select(".img-in-ratio").attr("data-bg"),
                host: BASE_URL
            });
        });

        browser.close();
        return Response.success(novelList, next);
    }

    browser.close();
    return null;
}
