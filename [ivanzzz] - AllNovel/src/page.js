load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    // Remove .html and trailing stuff to get base URL
    let baseUrl = url.replace(/\.html.*$/, '');

    let response = fetch(baseUrl + '.html');
    if (!response.ok) {
        sleep(500);
        response = fetch(baseUrl + '.html');
    }
    if (response.ok) {
        let doc = response.html();
        // Get the last page number from pagination in list-chapter section
        let listChapter = doc.select("div#list-chapter").first();
        if (!listChapter) {
            return Response.success([baseUrl + '.html']);
        }

        let lastLink = listChapter.select("ul.pagination > li.last a").attr("href");
        let totalPages = 1;
        if (lastLink) {
            let parts = lastLink.split("page=");
            if (parts.length > 1) {
                totalPages = parseInt(parts[1]);
            }
        }

        let urls = [];
        // Page 1 has no ?page param
        urls.push(baseUrl + '.html');
        for (let i = 2; i <= totalPages; i++) {
            urls.push(baseUrl + '.html?page=' + i);
        }
        return Response.success(urls);
    }
    return null;
}
