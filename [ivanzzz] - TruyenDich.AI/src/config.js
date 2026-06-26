const BASE_URL = "https://truyendich.ai";
const API_URL = BASE_URL + "/api";

function cleanText(text) {
    return (text || "").toString().replace(/\s+/g, " ").trim();
}

function stripQueryAndHash(url) {
    return (url || "").toString().replace(/[?#].*$/, "").replace(/\/+$/, "");
}

function absoluteUrl(value) {
    let url = (value || "").toString().trim().replace(/&amp;/g, "&");
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.charAt(0) === "/") return BASE_URL + url;
    return BASE_URL + "/" + url.replace(/^\/+/, "");
}

function decodeSafe(value) {
    try {
        return decodeURIComponent(value);
    } catch (e) {
        return value;
    }
}

function normalizeCover(value) {
    let url = absoluteUrl(value);
    let match = url.match(/[?&]url=([^&#]+)/);
    if (match && match[1]) return absoluteUrl(decodeSafe(match[1]));
    return url;
}

function requestJson(url) {
    let target = /^https?:\/\//i.test(url) ? url : API_URL + url;
    let response = fetch(target, {
        headers: {
            "accept": "application/json",
            "user-agent": "Mozilla/5.0"
        }
    });

    if (!response || !response.ok) return null;
    return response.json();
}

function normalizeNovelUrl(url) {
    let clean = stripQueryAndHash(absoluteUrl(url));
    let match = clean.match(/\/doc-truyen\/(?:ai\/|cv\/)?([^\/?#]+)(?:\/.*)?$/i);
    if (!match || !match[1]) return "";
    if (/\/chuong-\d+/i.test(clean)) return "";
    return BASE_URL + "/doc-truyen/" + match[1];
}

function slugFromNovelUrl(url) {
    let clean = stripQueryAndHash(absoluteUrl(url));
    let apiMatch = clean.match(/\/api\/novels\/([^\/?#]+)(?:\/chapters.*)?$/i);
    if (apiMatch && apiMatch[1]) return apiMatch[1];

    let webMatch = clean.match(/\/doc-truyen\/(?:ai\/|cv\/)?([^\/?#]+)/i);
    if (webMatch && webMatch[1]) return webMatch[1];

    return "";
}

function chapterPartsFromUrl(url) {
    let clean = stripQueryAndHash(absoluteUrl(url));
    let apiMatch = clean.match(/\/api\/novels\/([^\/?#]+)\/chapters\/(\d+)$/i);
    if (apiMatch && apiMatch[1] && apiMatch[2]) {
        return {
            slug: apiMatch[1],
            chapter: apiMatch[2]
        };
    }

    let webMatch = clean.match(/\/doc-truyen\/(?:ai\/|cv\/)?([^\/?#]+)\/chuong-(\d+)$/i);
    if (webMatch && webMatch[1] && webMatch[2]) {
        return {
            slug: webMatch[1],
            chapter: webMatch[2]
        };
    }

    return null;
}

function mapStatus(status) {
    let value = cleanText(status).toLowerCase();
    if (value === "completed" || value === "complete" || value === "full") return "Hoan thanh";
    if (value === "pending" || value === "ongoing" || value === "updating") return "Dang ra";
    if (value === "paused") return "Tam ngung";
    return cleanText(status);
}

function isOngoing(status) {
    let value = cleanText(status).toLowerCase();
    return !(value === "completed" || value === "complete" || value === "full");
}

function formatNumber(value) {
    if (value === undefined || value === null || value === "") return "";
    return ("" + value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toSearchItem(item) {
    if (!item || !item.slug) return null;

    let parts = [];
    if (item.author) parts.push("Tac gia: " + item.author);
    if (item.latest_chapter_number) parts.push("Chuong: " + item.latest_chapter_number);
    if (item.status) parts.push("Trang thai: " + mapStatus(item.status));

    return {
        name: cleanText(item.title),
        link: BASE_URL + "/doc-truyen/" + item.slug,
        cover: normalizeCover(item.image_url || ""),
        description: parts.join(" | "),
        host: BASE_URL
    };
}

function addPageParam(url, page) {
    let pageNum = parseInt(page || "1", 10);
    if (!pageNum || pageNum < 1) pageNum = 1;

    let base = absoluteUrl(url);
    base = base.replace(/([?&])page=\d+/i, "$1").replace(/[?&]$/, "");
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + "page=" + pageNum;
}

function escapeHtml(text) {
    return (text || "").toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
