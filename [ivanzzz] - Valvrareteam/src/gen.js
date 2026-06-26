load("config.js");

function execute(url, page) {
    var browse = detectBrowseInput(url);

    if (browse.mode === "genre") {
        var genrePage = parsePageValue(url, page);
        var genreTarget = normalizeGenreTarget(browse.genreSlug);
        var genreItems = [];
        var allItems = collectAllDirectoryItems();

        for (var i = 0; i < allItems.length; i++) {
            if (matchesGenre(allItems[i], genreTarget)) {
                genreItems.push(allItems[i]);
            }
        }

        var genreResult = paginateItems(genreItems, genrePage, FILTER_PAGE_SIZE);
        return Response.success(formatNovelItems(genreResult.items), genreResult.next);
    }

    var pageNumber = parsePageValue(url, page);
    var requestUrl = buildSectionPageUrl(browse.section, pageNumber);
    var doc = fetchDocument(requestUrl);
    if (!doc) {
        return null;
    }

    var items = parseDirectoryCards(doc);
    var pagination = extractPaginationInfo(doc);
    var next = null;
    if (pagination.totalPages > 0) {
        next = pageNumber < pagination.totalPages ? String(pageNumber + 1) : null;
    } else if (items.length >= DIRECTORY_PAGE_SIZE) {
        next = String(pageNumber + 1);
    }

    return Response.success(formatNovelItems(items), next);
}
