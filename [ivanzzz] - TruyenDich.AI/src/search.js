load("config.js");

function execute(key, page) {
    let query = cleanText(key);
    if (!query) return Response.success([]);

    let pageNum = parseInt(page || "1", 10);
    if (!pageNum || pageNum < 1) pageNum = 1;

    let data = requestJson("/novels/search?q=" + encodeURIComponent(query) + "&page=" + pageNum + "&size=20");
    if (!data || !data.items) return Response.success([]);

    let list = [];
    data.items.forEach(function(item) {
        let mapped = toSearchItem(item);
        if (mapped) list.push(mapped);
    });

    let total = parseInt(data.total || "0", 10);
    let size = parseInt(data.size || "20", 10);
    let next = total > pageNum * size ? "" + (pageNum + 1) : "";

    return Response.success(list, next);
}
