load('config.js');

function execute(url, page) {
    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.android());
    let doc = browser.launch(BASE_URL + "/danh-sach", 15000);

    if (doc) {
        const data = [];
        doc.select("ul.filter-type.unstyled.clear li.filter-type_item a").forEach(e => {
            data.push({
                title: e.select("a").text(),
                input: e.select("a").attr("href"),
                script: "gen.js"
            });
        });

        browser.close();
        return Response.success(data);
    }

    browser.close();
    return null;
}