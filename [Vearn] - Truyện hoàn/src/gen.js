function execute(url,page) {
    if(!page) page = '1';
    let response = fetch(url + "trang-" + page + "/");
    if (response.ok) {
        let doc = response.html('utf-8');
        const data = [];
		let table = doc.select(".list.list-truyen").get(0).select("div.row")
        table.forEach(e => {
            data.push({
                name: e.select("h3 a").first().attr("title"),
                link: e.select("h3 a").first().attr("href"),
                //cover: e.select("img").first().attr("src"),
                //description: e.select("span.author").first().text(),
                host: "https://truyenhoan.com"
            })
        });
        //let next = doc.select("ul.pagination.pagination-sm li.active +li").select("a").text()
        return Response.success(data)
    }
    return null;
}
