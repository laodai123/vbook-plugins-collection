load("config.js");

const CHAPTER_PAGE_SIZE = 200;
const MAX_CHAPTER_PAGES = 120;

function execute(url) {
    let slug = slugFromNovelUrl(url);
    if (!slug) return Response.error("Khong lay duoc slug truyen.");

    let list = [];
    let page = 1;
    let total = 0;
    let seen = {};

    while (page <= MAX_CHAPTER_PAGES) {
        let data = requestJson("/novels/" + slug + "/chapters?page=" + page + "&size=" + CHAPTER_PAGE_SIZE);
        if (!data || !data.items) break;

        if (!total) total = parseInt(data.total || "0", 10);
        let items = data.items || [];
        if (items.length === 0) break;

        items.forEach(function(chap) {
            if (!chap || chap.chapter_number === undefined || chap.chapter_number === null) return;

            let chapterNumber = "" + chap.chapter_number;
            if (seen[chapterNumber]) return;
            seen[chapterNumber] = true;

            let title = cleanText(chap.title);
            list.push({
                name: "Chuong " + chapterNumber + (title ? ": " + title : ""),
                url: BASE_URL + "/api/novels/" + slug + "/chapters/" + chapterNumber,
                host: BASE_URL
            });
        });

        if (total && list.length >= total) break;
        if (items.length < CHAPTER_PAGE_SIZE) break;
        page += 1;
    }

    if (list.length === 0) return Response.error("Khong lay duoc danh sach chuong.");
    return Response.success(list);
}
