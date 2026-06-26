function execute(url) {
    url = url.replace("https://api5-normal-sinfonlineb.fqnovel.com/reading/bookapi/multi-detail/v/?aid=1967&iid=1&version_code=999&book_id=", "https://fanqienovel.com/api/reader/directory/detail?bookId=").replace("https://fanqienovel.com/page/", "https://fanqienovel.com/api/reader/directory/detail?bookId=").replace("https://api5-normal-lf.fqnovel.com/reading/bookapi/multi-detail/v/?aid=1967&iid=1&version_code=999&book_id=", "https://fanqienovel.com/api/reader/directory/detail?bookId=");
    let response = fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "Cookie": "novel_web_id=7181715568649700927" } });
    if (response.ok) {
        let json = response.json();
        let chapterListWithVolume = json.data.chapterListWithVolume;
        const data = [];
        chapterListWithVolume.forEach(volume => {
            volume.forEach(chapter => {
                data.push({
                    name: chapter.title,
                    url: "https://fqnovel.ceseet.me/content?item_id=" + chapter.itemId,
                    host: "https://fqnovel.ceseet.me",
                });
            });
        });
        return Response.success(data);
    }
    return null;
}