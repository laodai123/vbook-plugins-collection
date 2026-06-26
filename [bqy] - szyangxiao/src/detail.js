function execute(url) {
    const doc = fetch(url).html();
        
        return Response.success({
            name: doc.select(".wrapper h1 a").text(),
            author: doc.select(".wrapper p a").first().text(),
            description: doc.select(".wrapper p").text(),
            host: "https://www.szyangxiao.com"
        });
    
}