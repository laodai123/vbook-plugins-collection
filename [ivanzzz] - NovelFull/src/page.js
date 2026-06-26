load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let baseUrl = url.split('?')[0];

    let response = fetch(baseUrl);
    if (!response.ok) {
        sleep(500);
        response = fetch(baseUrl);
    }
    if (response.ok) {
        let doc = response.html();

        let listChapter = doc.select("div#list-chapter").first();
        if (!listChapter) {
            return Response.success([baseUrl]);
        }

        // Get total pages from the "Last" pagination link (e.g. ?page=20)
        let lastLink = listChapter.select("ul.pagination > li.last a").attr("href");
        let totalPages = 1;
        if (lastLink) {
            let parts = lastLink.split("page=");
            if (parts.length > 1) {
                totalPages = parseInt(parts[1]);
            }
        }

        if (totalPages <= 1) {
            return Response.success([baseUrl]);
        }

        let urls = [];
        urls.push(baseUrl);
        for (let i = 2; i <= totalPages; i++) {
            urls.push(baseUrl + "?page=" + i);
        }
        return Response.success(urls);
    }
    return null;
}