var BASE_URL = "https://valvrareteam.net";
var DIRECTORY_PAGE_SIZE = 20;
var FILTER_PAGE_SIZE = 24;
var MAX_SCAN_PAGES = 15;
var SCAN_SECTIONS = ["danh-sach-truyen", "oln"];

try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}

function removeTrailingSlash(text) {
    return text ? text.replace(/\/+$/, "") : "";
}

function trimSlashes(text) {
    return text ? text.replace(/^\/+|\/+$/g, "") : "";
}

function cleanText(text) {
    return text ? text.replace(/\s+/g, " ").trim() : "";
}

function absoluteUrl(url) {
    if (!url) {
        return "";
    }
    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    if (url.charAt(0) === "/") {
        return removeTrailingSlash(BASE_URL) + url;
    }
    return removeTrailingSlash(BASE_URL) + "/" + url.replace(/^\/+/, "");
}

function normalizeUrl(url) {
    if (!url) {
        return removeTrailingSlash(BASE_URL);
    }
    return absoluteUrl(url).replace(/^https?:\/\/[^\/]+/i, removeTrailingSlash(BASE_URL));
}

function getPath(url) {
    var match = normalizeUrl(url).match(/^https?:\/\/[^\/]+(\/[^?#]*)?/i);
    return match && match[1] ? match[1] : "/";
}

function getPathParts(url) {
    var path = trimSlashes(getPath(url));
    return path ? path.split("/") : [];
}

function decodeHtmlEntities(text) {
    if (!text) {
        return "";
    }

    var output = text;
    output = output.replace(/&#(\d+);/g, function (match, code) {
        try {
            return String.fromCharCode(parseInt(code, 10));
        } catch (error) {
            return match;
        }
    });
    output = output.replace(/&#x([0-9a-fA-F]+);/g, function (match, code) {
        try {
            return String.fromCharCode(parseInt(code, 16));
        } catch (error) {
            return match;
        }
    });
    output = output.replace(/&nbsp;/gi, " ");
    output = output.replace(/&amp;/gi, "&");
    output = output.replace(/&quot;/gi, "\"");
    output = output.replace(/&#039;|&apos;/gi, "'");
    output = output.replace(/&lt;/gi, "<");
    output = output.replace(/&gt;/gi, ">");
    output = output.replace(/&hellip;/gi, "...");
    return output;
}

function stripHtml(html) {
    if (!html) {
        return "";
    }
    return cleanText(
        decodeHtmlEntities(
            html
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>/gi, "\n")
                .replace(/<[^>]+>/g, " ")
        )
    );
}

function truncateText(text, maxLength) {
    text = cleanText(text);
    if (!text || text.length <= maxLength) {
        return text;
    }
    return cleanText(text.substring(0, maxLength - 3)) + "...";
}

function joinNonEmpty(parts, separator) {
    var result = [];
    for (var i = 0; i < parts.length; i++) {
        var value = cleanText(parts[i]);
        if (value) {
            result.push(value);
        }
    }
    return result.join(separator || " | ");
}

function normalizeKeyword(text) {
    text = cleanText(decodeHtmlEntities(text)).toLowerCase();
    if (!text) {
        return "";
    }

    var map = {
        a: /[àáạảãâầấậẩẫăằắặẳẵ]/g,
        e: /[èéẹẻẽêềếệểễ]/g,
        i: /[ìíịỉĩ]/g,
        o: /[òóọỏõôồốộổỗơờớợởỡ]/g,
        u: /[ùúụủũưừứựửữ]/g,
        y: /[ỳýỵỷỹ]/g,
        d: /đ/g
    };

    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            text = text.replace(map[key], key);
        }
    }

    return text.replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyText(text) {
    return normalizeKeyword(text).replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function parseIntSafe(text, fallback) {
    var value = parseInt(text, 10);
    return isNaN(value) ? fallback : value;
}

function lastEight(text) {
    if (!text) {
        return "";
    }
    return String(text).slice(-8);
}

function fetchDocument(url) {
    var response = fetch(normalizeUrl(url));
    if (response && response.ok) {
        return response.html();
    }
    return null;
}

function getImageUrl(element) {
    if (!element) {
        return "";
    }

    var url = element.attr("data-src");
    if (!url) {
        url = element.attr("data-lazy-src");
    }
    if (!url) {
        url = element.attr("data-original");
    }
    if (!url) {
        url = element.attr("src");
    }
    return absoluteUrl(url);
}

function sanitizeContentHtml(html) {
    if (!cleanText(html)) {
        return "";
    }

    var doc = Html.parse("<div id='valvrare-root'>" + html + "</div>");
    var root = doc.select("#valvrare-root").first();
    if (!root) {
        return html;
    }

    root.select("script, style, iframe, form, noscript").remove();
    root.select(".tts-controls, .chapter-access-guard, .restricted-content-message").remove();

    root.select("img").forEach(function (element) {
        var src = getImageUrl(element);
        if (src) {
            element.attr("src", src);
        }
    });

    root.select("a").forEach(function (element) {
        var href = element.attr("href");
        if (href) {
            element.attr("href", absoluteUrl(href));
        }
    });

    return root.html();
}

function makeGenreItem(title) {
    return {
        title: title,
        input: removeTrailingSlash(BASE_URL) + "/genres/" + slugifyText(title),
        script: "gen.js"
    };
}

function pushUniqueGenre(genres, seen, title) {
    title = cleanText(title);
    if (!title) {
        return;
    }

    var key = normalizeKeyword(title);
    if (!key || seen[key]) {
        return;
    }

    seen[key] = true;
    genres.push(makeGenreItem(title));
}

function parseStatusLabel(text) {
    var normalized = normalizeKeyword(text);
    if (!normalized) {
        return "";
    }
    if (normalized.indexOf("hoan thanh") >= 0 || normalized === "completed") {
        return "Hoan thanh";
    }
    if (normalized.indexOf("tam ngung") >= 0 || normalized === "hiatus") {
        return "Tam ngung";
    }
    if (normalized.indexOf("drop") >= 0) {
        return "Da drop";
    }
    return "Dang tien hanh";
}

function isOngoingStatus(text) {
    var normalized = normalizeKeyword(text);
    return normalized.indexOf("hoan thanh") < 0 &&
        normalized.indexOf("completed") < 0 &&
        normalized.indexOf("tam ngung") < 0 &&
        normalized.indexOf("hiatus") < 0 &&
        normalized.indexOf("drop") < 0;
}

function buildChapterUrl(novelSlug, chapterId, chapterTitle) {
    if (!novelSlug || !chapterId) {
        return "";
    }
    var slug = slugifyText(chapterTitle || "chapter");
    var suffix = lastEight(chapterId);
    if (!slug) {
        slug = "chapter";
    }
    return removeTrailingSlash(BASE_URL) + "/truyen/" + trimSlashes(novelSlug) + "/chuong/" + slug + "-" + suffix;
}

function buildNovelUrl(novelId, title) {
    if (!novelId) {
        return "";
    }

    var slug = slugifyText(title || "novel");
    var suffix = lastEight(novelId);
    if (!slug) {
        slug = "novel";
    }

    return removeTrailingSlash(BASE_URL) + "/truyen/" + slug + "-" + suffix;
}

function getCanonicalUrl(doc) {
    var url = "";
    var link = doc.select("link[rel=canonical]").first();
    if (link) {
        url = absoluteUrl(link.attr("href"));
    }
    return url;
}

function getNovelSlug(url, doc) {
    var parts = getPathParts(url);
    if (parts.length >= 2 && parts[0] === "truyen") {
        return parts[1];
    }

    var canonical = getCanonicalUrl(doc);
    parts = getPathParts(canonical);
    if (parts.length >= 2 && parts[0] === "truyen") {
        return parts[1];
    }

    return "";
}

function collectScriptText(doc) {
    var text = "";
    doc.select("script").forEach(function (element) {
        var value = element.html();
        if (!value) {
            value = element.text();
        }
        if (value) {
            text += "\n" + value;
        }
    });
    return text;
}

function extractBracketed(text, startIndex) {
    var index = startIndex;
    while (index < text.length && /\s/.test(text.charAt(index))) {
        index++;
    }

    var opening = text.charAt(index);
    var closing = opening === "[" ? "]" : opening === "{" ? "}" : "";
    if (!closing) {
        return "";
    }

    var buffer = "";
    var depth = 0;
    var inString = false;
    var escaped = false;

    for (var i = index; i < text.length; i++) {
        var ch = text.charAt(i);
        buffer += ch;

        if (escaped) {
            escaped = false;
            continue;
        }

        if (ch === "\\") {
            escaped = true;
            continue;
        }

        if (ch === "\"") {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (ch === opening) {
                depth++;
            } else if (ch === closing) {
                depth--;
                if (depth === 0) {
                    return buffer;
                }
            }
        }
    }

    return "";
}

function decodeEmbeddedJson(text) {
    if (!text) {
        return "";
    }

    return text
        .replace(/\\u003c/g, "<")
        .replace(/\\u003e/g, ">")
        .replace(/\\u0026/g, "&")
        .replace(/\\"/g, "\"")
        .replace(/\\\\/g, "\\");
}

function extractEmbeddedJson(text, key) {
    var markers = [
        "\\\"" + key + "\\\":",
        "\"" + key + "\":"
    ];
    var marker = "";
    var index = -1;

    for (var i = 0; i < markers.length; i++) {
        var found = text.lastIndexOf(markers[i]);
        if (found > index) {
            index = found;
            marker = markers[i];
        }
    }

    if (index < 0) {
        return null;
    }

    var segment = extractBracketed(text, index + marker.length);
    if (!segment) {
        return null;
    }

    try {
        if (marker.indexOf("\\\"") >= 0) {
            return JSON.parse(decodeEmbeddedJson(segment));
        }
        return JSON.parse(segment);
    } catch (error) {
        return null;
    }
}

function extractPaginationInfo(doc) {
    var text = collectScriptText(doc);
    var totalMatch = text.match(/(?:\\?"totalPages\\?"|totalPages)\s*:\s*(\d+)/i);
    var currentMatch = text.match(/(?:\\?"currentPage\\?"|currentPage)\s*:\s*(\d+)/i);

    return {
        currentPage: currentMatch ? parseIntSafe(currentMatch[1], 1) : 1,
        totalPages: totalMatch ? parseIntSafe(totalMatch[1], 0) : 0
    };
}

function buildSectionPageUrl(section, pageNumber) {
    pageNumber = pageNumber && pageNumber > 0 ? pageNumber : 1;
    return removeTrailingSlash(BASE_URL) + "/" + trimSlashes(section) + "/trang/" + pageNumber;
}

function detectBrowseInput(url) {
    var parts = getPathParts(url);
    if (parts.length >= 2 && parts[0] === "genres") {
        return {
            mode: "genre",
            genreSlug: parts[1]
        };
    }

    if (parts.length && parts[0] === "oln") {
        return {
            mode: "directory",
            section: "oln"
        };
    }

    return {
        mode: "directory",
        section: "danh-sach-truyen"
    };
}

function parsePageValue(url, page) {
    if (page) {
        return parseIntSafe(page, 1);
    }

    var match = normalizeUrl(url).match(/\/trang\/(\d+)\/?$/i);
    return match ? parseIntSafe(match[1], 1) : 1;
}

function parseNovelCard(card) {
    var linkEl = card.select(".nd-novel-title-link, .nd-novel-image-link, a").first();
    if (!linkEl) {
        return null;
    }

    var link = absoluteUrl(linkEl.attr("href"));
    var name = cleanText(card.select(".nd-novel-title").text());
    if (!name) {
        name = cleanText(card.select("img").attr("alt"));
    }

    if (!name || !link) {
        return null;
    }

    var cover = getImageUrl(card.select(".nd-novel-image img, img").first());
    var status = cleanText(card.select(".nd-novel-status").text());
    var desc = cleanText(decodeHtmlEntities(card.select(".nd-novel-description").text()));
    var wordCount = cleanText(card.select(".nd-word-count").text()).replace(/^[^:]+:\s*/i, "");
    var views = cleanText(card.select(".nd-view-count").text()).replace(/^[^:]+:\s*/i, "");
    var genres = [];

    card.select(".nd-genre-tag").forEach(function (element) {
        var title = cleanText(element.text());
        if (title && genres.indexOf(title) < 0) {
            genres.push(title);
        }
    });

    return {
        name: name,
        link: link,
        cover: cover,
        description: truncateText(joinNonEmpty([
            parseStatusLabel(status),
            wordCount,
            views,
            genres.length ? genres.join(", ") : "",
            desc
        ], " | "), 280),
        host: BASE_URL,
        genreNames: genres
    };
}

function parseEmbeddedNovel(item) {
    if (!item || !item._id || !item.title) {
        return null;
    }

    var genres = [];
    var sourceGenres = item.genres || [];
    for (var i = 0; i < sourceGenres.length; i++) {
        var genre = sourceGenres[i];
        if (typeof genre !== "string") {
            genre = genre && genre.name ? genre.name : "";
        }
        genre = cleanText(genre);
        if (genre && genres.indexOf(genre) < 0) {
            genres.push(genre);
        }
    }

    var totalViews = "";
    if (item.views && item.views.total) {
        totalViews = String(item.views.total);
    } else if (item.dailyViews) {
        totalViews = String(item.dailyViews);
    }

    return {
        name: cleanText(item.title),
        link: buildNovelUrl(item._id, item.title),
        cover: absoluteUrl(item.illustration || ""),
        description: truncateText(joinNonEmpty([
            parseStatusLabel(item.status || ""),
            item.wordCount ? String(item.wordCount) + " tu" : "",
            totalViews ? totalViews + " luot xem" : "",
            genres.length ? genres.join(", ") : "",
            stripHtml(item.description || "")
        ], " | "), 280),
        host: BASE_URL,
        genreNames: genres
    };
}

function parseEmbeddedDirectoryItems(doc) {
    var novels = extractEmbeddedJson(collectScriptText(doc), "novels");
    if (!novels || !novels.length) {
        return [];
    }

    var items = [];
    for (var i = 0; i < novels.length; i++) {
        var item = parseEmbeddedNovel(novels[i]);
        if (item) {
            items.push(item);
        }
    }

    return items;
}

function parseDirectoryCards(doc) {
    var items = [];
    doc.select(".nd-novel-card").forEach(function (card) {
        var item = parseNovelCard(card);
        if (item) {
            items.push(item);
        }
    });

    if (items.length) {
        return items;
    }

    return parseEmbeddedDirectoryItems(doc);
}

function dedupeNovelItems(items) {
    var output = [];
    var seen = {};

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item || !item.link || seen[item.link]) {
            continue;
        }
        seen[item.link] = true;
        output.push(item);
    }

    return output;
}

function formatNovelItems(items) {
    var output = [];

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item) {
            continue;
        }

        output.push({
            name: item.name,
            link: item.link,
            cover: item.cover,
            description: item.description,
            host: item.host || BASE_URL
        });
    }

    return output;
}

function paginateItems(items, pageNumber, pageSize) {
    pageNumber = pageNumber && pageNumber > 0 ? pageNumber : 1;
    pageSize = pageSize || FILTER_PAGE_SIZE;

    var start = (pageNumber - 1) * pageSize;
    var end = start + pageSize;
    var next = end < items.length ? String(pageNumber + 1) : null;

    return {
        items: items.slice(start, end),
        next: next
    };
}

function normalizeGenreTarget(input) {
    var value = cleanText(input).replace(/-/g, " ");
    return normalizeKeyword(value);
}

function matchesGenre(item, target) {
    if (!item || !item.genreNames || !item.genreNames.length || !target) {
        return false;
    }

    for (var i = 0; i < item.genreNames.length; i++) {
        var normalized = normalizeKeyword(item.genreNames[i]);
        if (normalized === target) {
            return true;
        }
    }

    return false;
}

function collectDirectoryItems(section) {
    var output = [];

    for (var page = 1; page <= MAX_SCAN_PAGES; page++) {
        var doc = fetchDocument(buildSectionPageUrl(section, page));
        if (!doc) {
            break;
        }

        var items = parseDirectoryCards(doc);
        if (!items.length) {
            break;
        }

        output = output.concat(items);

        var pagination = extractPaginationInfo(doc);
        if (pagination.totalPages && page >= pagination.totalPages) {
            break;
        }
    }

    return dedupeNovelItems(output);
}

function collectAllDirectoryItems() {
    var all = [];
    for (var i = 0; i < SCAN_SECTIONS.length; i++) {
        all = all.concat(collectDirectoryItems(SCAN_SECTIONS[i]));
    }
    return dedupeNovelItems(all);
}

function scoreSearchItem(item, key) {
    var name = normalizeKeyword(item.name);
    var description = normalizeKeyword(item.description);
    var score = 0;

    if (name === key) {
        score += 1000;
    } else if (name.indexOf(key) === 0) {
        score += 500;
    } else if (name.indexOf(key) >= 0) {
        score += 250;
    }

    if (description && description.indexOf(key) >= 0) {
        score += 80;
    }

    if (item.genreNames) {
        for (var i = 0; i < item.genreNames.length; i++) {
            if (normalizeKeyword(item.genreNames[i]).indexOf(key) >= 0) {
                score += 40;
                break;
            }
        }
    }

    return score;
}
