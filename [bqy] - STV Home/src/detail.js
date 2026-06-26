function execute(url) {
    let response = fetch(url + '/');
    function toCapitalize(sentence) {
        const words = sentence.split(" ");

        return words.map((word) => {
            return word[0].toUpperCase() + word.substring(1);
        }).join(" ");
    }
    if (response.ok) {
        let doc = response.html();
        let author = doc.html().match(/Tác giả:.*?\s+(.*?)\s*</);
        if (author) author = author[1];
        let des = doc.select(".blk:has(.fa-water) .blk-body").html();
        let _detail = 'Tên gốc : ' + doc.select("#oriname").text() + '<br>' + doc.select(".blk:has(.fa-info-circle) > div:nth-child(4)").text() + '<br>' + doc.select(".blk:has(.fa-info-circle) > div:nth-child(3)").text();
            
        return Response.success({
name: toCapitalize(doc.select("#book_name2").first().text()),
            cover: doc.select('meta[property="og:image"]').first().attr("content").replace("/cdn/images/nc.jpg", "https://static.sangtacvietcdn.xyz/img/bookcover256.jpg"),
            author: author || 'Unknow',
            description: des,
            detail: _detail,
            ongoing: true,
            host: "http://14.225.254.182"       
        });
    }
    return null;
}