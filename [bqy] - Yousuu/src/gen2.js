function execute(url, page) {
	for (var i = 1; i < 5; i++) {   
		  let next = url + i;
		var doc = fetch(next).html();
        const data = [];      
		let content= doc.select(".result-item-layout")
        content.forEach(e => {
        let coverImg  = e.select(".list-card-header .card-bookInfo-cover").first().attr("cover");
            data.push({
                name: e.select(".book-name").first().text(),
                link: e.select(".book-name").first().attr("href"),
                cover: coverImg,
                description: e.select(".book-info p").get(1).text(),
                host: "http://www.yousuu.com"
            })
        });
        }
        return Response.success(data);
    
}