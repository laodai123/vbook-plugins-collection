function execute(key, page) {
    if (!page) page = '1';
    let searchUrl = "https://api5-normal-lf.fqnovel.com/reading/bookapi/search/page/v/?query=" + key + "&aid=1967&channel=0&os_version=0&device_type=0&device_platform=0&iid=466614321180296&passback=" + ((page - 1) * 10) + "&version_code=999";
    let response = fetch(searchUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "Cookie": "novel_web_id=7181715568649700927" } });
    if (response.ok) {
        let res = response.json();
        let books;
        if (res.search_tabs) {
            res.search_tabs.forEach((i) => {
                if (i.tab_type == 3) books = i.data;
            });
        } else books = res.data;
        let data = [];
        if (books) {
            books.forEach(w => {
                data.push({
                    name: w.book_data[0].book_name,
                    link: "https://api5-normal-lf.fqnovel.com/reading/bookapi/multi-detail/v/?aid=1967&iid=1&version_code=999&book_id=" + w.book_data[0].book_id,
                    cover: w.book_data[0].thumb_url,
                    description: w.book_data[0].abstract.replace(/\n/g, ''),
                    author: w.book_data[0].author,
                    kind: "男生" + w.book_data[0].gender + "女生\n" + "连载" + w.book_data[0].creation_status + "完结\n" + w.book_data[0].score + "分\n" + w.book_data[0].text + "\n" + w.book_data[0].sub_info
                });
            });
        }
        let next_page = parseInt(page) + 1;
        return Response.success(data, next_page.toString());
    }
    return null;
}