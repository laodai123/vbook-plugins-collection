load("config.js");

function extractTitle(doc) {
    var name = cleanText(doc.select("meta[property='og:image:alt']").attr("content"));
    if (!name) {
        name = cleanText(doc.select(".rd-novel-title").text());
        name = name.replace(/\+\s*/g, " ");
        name = name.replace(/\b(Đang tiến hành|Hoàn thành|Tạm ngưng|Đã drop)\b/gi, "");
        name = cleanText(name);
    }
    return name;
}

function execute(url) {
    var doc = fetchDocument(url);
    if (!doc) {
        return null;
    }

    var name = extractTitle(doc);
    var cover = getImageUrl(doc.select(".rd-cover-image, .rd-novel-cover img").first());
    var author = "";
    var illustrator = "";
    var status = cleanText(doc.select(".rd-status-badge-inline").text());
    var otherNames = cleanText(doc.select(".rd-alt-title").text()).replace(/^Tên khác:\s*/i, "");
    var chapterCount = cleanText(doc.select(".rd-chapter-count-value").text());
    var description = "";
    var detailParts = [];
    var genres = [];
    var genreNames = [];
    var genreSeen = {};
    var statValues = [];

    doc.select(".rd-info-row").forEach(function (row) {
        var label = normalizeKeyword(row.select(".rd-info-label").text());
        var value = cleanText(row.select(".rd-info-value").text());
        if (!value) {
            return;
        }

        if (!author && label.indexOf("tac gia") >= 0) {
            author = value;
        } else if (!illustrator && label.indexOf("hoa si") >= 0) {
            illustrator = value;
        }
    });

    doc.select(".rd-genres-list .rd-genre-tag").forEach(function (element) {
        var title = cleanText(element.text());
        if (title) {
            genreNames.push(title);
            pushUniqueGenre(genres, genreSeen, title);
        }
    });

    doc.select(".rd-stat-item .rd-stat-value").forEach(function (element) {
        var value = cleanText(element.text());
        if (value) {
            statValues.push(value);
        }
    });

    var descriptionEl = doc.select(".rd-description-content").first();
    if (descriptionEl) {
        description = sanitizeContentHtml(descriptionEl.html());
    }

    if (status) {
        detailParts.push("<b>Trang thai:</b> " + parseStatusLabel(status));
    }
    if (author) {
        detailParts.push("<b>Tac gia:</b> " + author);
    }
    if (illustrator) {
        detailParts.push("<b>Hoa si:</b> " + illustrator);
    }
    if (genreNames.length) {
        detailParts.push("<b>The loai:</b> " + genreNames.join(", "));
    }
    if (chapterCount) {
        detailParts.push("<b>So chuong:</b> " + chapterCount);
    }
    if (statValues.length > 0) {
        detailParts.push("<b>Luot xem:</b> " + statValues[0]);
    }
    if (statValues.length > 1) {
        detailParts.push("<b>So tu:</b> " + statValues[1]);
    }
    if (otherNames) {
        detailParts.push("<b>Ten khac:</b> " + otherNames);
    }

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: detailParts.join("<br>"),
        host: BASE_URL,
        genres: genres,
        ongoing: isOngoingStatus(status)
    });
}
