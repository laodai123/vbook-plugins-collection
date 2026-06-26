function execute(url) {
    let response = fetch(url);
    if (response.ok) {
		let chapurl = url.slice(0, url.lastIndexOf(".")) + "/chuong-";
        let doc = response.html('utf-8');
        let chapnum = Number(doc.select("ul.l-chapters li a").get(0).attr("href").split(".html")[0].split("chuong-")[1]) +1
        const data = [];
        for (let i = 1;i < chapnum ; i++) {
            data.push({
                name: "Chương " + i,
                url: chapurl + i +".html",
                host: "https://truyenhoan.com"
            })
        }
        return Response.success(data);
    }
    return null;
}