// link test: https://www.qidian.com/all/action0-size1-update1-orderId2

function execute(url, page) {
    if (!page) {
        page = "1";
    }

    let response = fetch(url + "-page" + page);
    if (response.ok) {
        let doc = response.html();
        let bookList = [];
        var next = doc.select('a.lbf-pagination-page.lbf-pagination-current').text();
        // var next = $.Q(doc, 'a.lbf-pagination-page.lbf-pagination-current').text();
        if (next) next = parseInt(next, 10) + 1;
        doc.select("#book-img-text > ul > li").forEach(e => {
            bookList.push({
                name: e.select(".book-mid-info h2 a").first().text(),
                link: "https:" + e.select( '.book-mid-info h2 a').first().attr("href"),
                cover: "https:" + e.select("div a img").first().attr("src"),
                description: "",
                host: "http://www.qidian.com/"
            });
        });
        return Response.success(bookList, next);
    }

    return null;
}