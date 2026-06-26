load("config.js");

function formatChapterName(moduleTitle, chapter) {
    var name = cleanText(chapter.title);
    var prefix = cleanText(moduleTitle);
    var label = prefix ? prefix + " - " + name : name;

    if (chapter.mode === "paid" || parseIntSafe(chapter.chapterBalance, 0) > 0) {
        label += " [Paid]";
    } else if (chapter.mode === "protected") {
        label += " [Locked]";
    }

    return label;
}

function execute(url) {
    var doc = fetchDocument(url);
    if (!doc) {
        return null;
    }

    var scripts = collectScriptText(doc);
    var modules = extractEmbeddedJson(scripts, "modules");
    var novelSlug = getNovelSlug(url, doc);
    var chapters = [];

    if (!modules || !modules.length) {
        return Response.success(chapters);
    }

    modules.sort(function (left, right) {
        return parseIntSafe(left.order, 0) - parseIntSafe(right.order, 0);
    });

    for (var i = 0; i < modules.length; i++) {
        var moduleItem = modules[i];
        var moduleTitle = cleanText(moduleItem.title);
        var moduleChapters = moduleItem.chapters || [];

        moduleChapters.sort(function (left, right) {
            return parseIntSafe(left.order, 0) - parseIntSafe(right.order, 0);
        });

        for (var j = 0; j < moduleChapters.length; j++) {
            var chapter = moduleChapters[j];
            var chapterUrl = buildChapterUrl(novelSlug, chapter._id, chapter.title);
            if (!chapterUrl) {
                continue;
            }

            chapters.push({
                name: formatChapterName(moduleTitle, chapter),
                url: chapterUrl,
                host: BASE_URL
            });
        }
    }

    return Response.success(chapters);
}
