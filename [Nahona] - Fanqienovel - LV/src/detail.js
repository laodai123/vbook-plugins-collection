function execute(url) {
    let bookId = null;
    let apiUrl = url;
    if (url.includes('fanqienovel.com/page/')) {
        bookId = url.split('/page/').pop();
        apiUrl = `https://api5-normal-lf.fqnovel.com/reading/bookapi/multi-detail/v/?aid=1967&iid=1&version_code=999&book_id=${bookId}`;
    }
    let response = fetch(apiUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "Cookie": "novel_web_id=7181715568649700927" } });
    if (response.ok) {
        let json = response.json();
        let bookInfo = json.data[0];
        let categoryText = "";
        if (Array.isArray(bookInfo.category_v2)) {
            categoryText = bookInfo.category_v2.map(cat => cat.Name).join('<br>');
        } else if (bookInfo.category_v2) {
            categoryText = String(bookInfo.category_v2);
        }
        let intro = "  <br>📕 源名：" + bookInfo.original_book_name + "<br>📖 别名：" + bookInfo.book_flight_alias_name + "<br>✏️ 开坑：" + bookInfo.create_time.split('T')[0] + "<br>🏷️ 标签：" + bookInfo.tags + "<br>👤 主角：" + bookInfo.roles.replace(/\[|\"|\\]/g, '') + "<br>👁️ 在线：" + bookInfo.read_count + "人在读<br>📜 简介：" + bookInfo.book_abstract_v2 + "<br>📍 " + bookInfo.copyright_info.split('，')[0] + "。<br>";
        let kind = "男生" + bookInfo.gender + "女生<br>" + bookInfo.category + "<br>" + "连载" + bookInfo.creation_status + "完结<br>" + bookInfo.score + "分<br>" + javaTimeFormatUTC(bookInfo.last_chapter_update_time * 1000, 'yyyy-MM-dd', 8) + "<br>" + "##连载0|1完结|男生0|1女生<br>";
        kind = kind.replace("男生2女生", "出版").replace("连载0完结", '完结').replace("连载1完结", '连载').replace("连载4完结", "断更").replace("连载-1完结", "未知");
        let detail = "作者： " + bookInfo.author + "<br>" + "字数： " + bookInfo.word_number + "<br>" + kind;
        return Response.success({
            name: bookInfo.book_name,
            cover: replaceCover(javaGetString(bookInfo.thumb_url)),
            author: bookInfo.author,
            description: intro,
            detail: detail,
            host: "https://fanqienovel.com",
            lastChapter: bookInfo.last_chapter_title + " • " + javaTimeFormat(bookInfo.last_chapter_update_time * 1000),
            tocUrl: bookInfo.book_id
        });
    }
    return null;
}
function replaceCover(coverUrl) {
    if (!coverUrl) return "";
    return coverUrl.replace(/(\d+)-tt/, '6-novel');
}
function javaGetString(str) {
    return str;
}
function javaTimeFormatUTC(timestamp, format, timezoneOffset) {
    const date = new Date(timestamp);
    const utcDate = new Date(date.getTime() + timezoneOffset * 3600 * 1000);
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getDate()).padStart(2, '0');
    return format.replace('yyyy', year).replace('MM', month).replace('dd', day);
}
function javaTimeFormat(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}