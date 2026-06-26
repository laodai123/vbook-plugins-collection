load("config.js");

function execute(url) {
    let slug = slugFromNovelUrl(url);
    if (!slug) return Response.error("Khong lay duoc slug truyen.");

    let data = requestJson("/novels/" + slug);
    if (!data || !data.slug) return Response.error("Khong lay duoc thong tin truyen.");

    let genres = [];
    if (data.categories && data.categories.forEach) {
        data.categories.forEach(function(cat) {
            if (!cat || !cat.slug) return;
            genres.push({
                title: cleanText(cat.name || cat.slug),
                input: BASE_URL + "/the-loai/" + cat.slug,
                script: "gen.js"
            });
        });
    }

    let editions = [];
    if (data.editions && data.editions.forEach) {
        data.editions.forEach(function(edition) {
            if (edition && edition.edition_name) editions.push(edition.edition_name);
        });
    }

    let detail = [];
    if (data.author) detail.push("Tac gia: " + data.author);
    if (genres.length > 0) detail.push("The loai: " + genres.map(function(item) { return item.title; }).join(", "));
    if (data.latest_chapter_number) detail.push("So chuong: " + formatNumber(data.latest_chapter_number));
    if (data.view !== undefined && data.view !== null) detail.push("Luot xem: " + formatNumber(data.view));
    if (data.status) detail.push("Trang thai: " + mapStatus(data.status));
    if (editions.length > 0) detail.push("Phien ban: " + editions.join(", "));

    return Response.success({
        name: cleanText(data.title),
        cover: normalizeCover(data.image_url || ""),
        host: BASE_URL,
        author: cleanText(data.author),
        description: data.description || "",
        detail: detail.join("<br>"),
        ongoing: isOngoing(data.status),
        genres: genres
    });
}
