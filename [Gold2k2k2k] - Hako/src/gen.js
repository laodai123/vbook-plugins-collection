load('config.js');

function execute(url, page) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    if (!page) page = '1';

    // Append page param to URL
    let separator = url.indexOf('?') > -1 ? '&' : '?';
    let fullUrl = url + separator + 'page=' + page;

    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.android());
    let doc = browser.launch(fullUrl, 15000);

    if (doc) {
        let next = doc.select(".pagination-footer a.current + a").text();

        let novelList = [];
        doc.select(".thumb-section-flow .thumb-item-flow").forEach(e => {
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