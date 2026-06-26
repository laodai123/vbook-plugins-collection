function execute(url, page) {
    if (!page) page = '1';
    let inputUrl = url;
    let paginatedUrl = inputUrl.replace(/offset=(\d+)/, 'offset=' + ((parseInt(page) - 1) * 100));
    let response = fetch(paginatedUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "Cookie": "novel_web_id=7181715568649700927" } });
    if (response.ok) {
        let json = response.json();
        let bookList = json.data.data;
        const data = [];
        bookList.forEach(item => {
            let bookData = item;
            data.push({
                name: bookData.book_name,
                link: "https://api5-normal-sinfonlineb.fqnovel.com/reading/bookapi/multi-detail/v/?aid=1967&iid=1&version_code=999&book_id=" + bookData.book_id,
                cover: replaceCover(bookData.thumb_url),
                description: bookData.abstract.replace(/\s/g, ''),
                author: bookData.author,
                kind: bookData.category + "," + bookData.score + "\n" + "连载" + bookData.creation_status + "完结," + bookData.source
            });
        });
        let next_page = parseInt(page) + 1;
        return Response.success(data, next_page.toString());
    }
    return null;
}
function replaceCover(coverUrl) {
    if (!coverUrl) return "";
    return coverUrl.replace(/(\d+)-tt/, '6-novel');
}