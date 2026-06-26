load("config.js");

function normalizeSearchKeyword(value) {
    let text = (value || "").toString().trim();
    if (!text) return "";

    try {
        text = text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    } catch (e) {
    }

    return text.replace(/\s+/g, " ").trim();
}

function execute(key, page) {
    let pageNum = parseInt(page || "1");
    if (!pageNum || pageNum < 1) pageNum = 1;

    let pageSize = 24;
    let normalizedKey = normalizeSearchKeyword(key);
    let response = requestPost("/stories/get-search", {
        page: pageNum,
        items_per_page: pageSize,
        search: normalizedKey,
        sort_by: "updated"
    });

    if (!response || !response.ok) return null;

    let json = safeJson(response);
    if (!json) return null;

    let list = [];
    let rows = json.data || [];
    rows.forEach(item => {
        let mapped = mapStoryItem(item);
        if (mapped) list.push(mapped);
    });

    let next = "";
    if (list.length > 0) {
        let count = parseInt(json.count || "0");
        if (!count || pageNum * pageSize < count) {
            next = (pageNum + 1).toString();
        }
    }

    return Response.success(list, next);
}
