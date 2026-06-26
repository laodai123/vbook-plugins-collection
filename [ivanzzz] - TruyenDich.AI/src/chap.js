load("config.js");

function formatContent(content) {
    let text = (content || "").toString().trim();
    if (!text) return "";

    if (/<p[\s>]|<br\s*\/?>|<div[\s>]/i.test(text)) return text;

    return text.split(/\n+/).map(function(line) {
        return cleanText(line);
    }).filter(function(line) {
        return line.length > 0;
    }).map(function(line) {
        return "<p>" + escapeHtml(line) + "</p>";
    }).join("");
}

function execute(url) {
    let parts = chapterPartsFromUrl(url);
    if (!parts || !parts.slug || !parts.chapter) {
        return Response.error("Khong lay duoc thong tin chuong.");
    }

    let data = requestJson("/novels/" + parts.slug + "/chapters/" + parts.chapter);
    if (!data) return Response.error("Khong lay duoc noi dung chuong.");
    if (cleanText(data.status).toUpperCase() === "FAILED") return Response.error("Chuong dang loi tren nguon.");

    let content = formatContent(data.content || "");
    if (!content) return Response.error("Noi dung chuong trong.");

    return Response.success(content);
}
