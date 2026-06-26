load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.android());
    let doc = browser.launch(url, 15000);

    if (doc) {
        let list = [];
        doc.select(".volume-list").forEach(section => {
            let sectionName = section.select(".sect-title").text();
            let chapters = section.select(".list-chapters li");

            for (let j = 0; j < chapters.size(); j++) {
                let chapter = chapters.get(j);
                let name = chapter.select(".chapter-name a").text();
                if (j === 0)
                    name = sectionName + " " + name;
                list.push({
                    name: name,
                    url: chapter.select(".chapter-name").select("a").first().attr("href"),
                    host: BASE_URL
                });
            }
        });

        browser.close();
        return Response.success(list);
    }

    browser.close();
}