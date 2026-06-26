load("config.js");

function execute(key, page) {
    var keyword = normalizeKeyword(key);
    var pageNumber = parseIntSafe(page, 1);
    if (!keyword) {
        return Response.success([], null);
    }

    var allItems = collectAllDirectoryItems();
    var matches = [];

    for (var i = 0; i < allItems.length; i++) {
        var score = scoreSearchItem(allItems[i], keyword);
        if (score > 0) {
            allItems[i]._score = score;
            matches.push(allItems[i]);
        }
    }

    matches.sort(function (left, right) {
        if (right._score !== left._score) {
            return right._score - left._score;
        }
        return left.name.localeCompare(right.name);
    });

    for (var j = 0; j < matches.length; j++) {
        delete matches[j]._score;
    }

    var result = paginateItems(matches, pageNumber, FILTER_PAGE_SIZE);
    return Response.success(formatNovelItems(result.items), result.next);
}
