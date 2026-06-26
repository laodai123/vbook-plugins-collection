load("crypto.js");
load("config.js");

function formatStatus(status) {
    let s = (status || "").toString().trim();
    let lower = s.toLowerCase();

    if (lower === "complete" || lower === "completed" || lower === "done" || lower === "full") return "Hoan thanh";
    if (lower === "ongoing" || lower === "updating") return "Dang ra";
    if (lower === "d") return "Hoan thanh";
    if (lower === "o") return "Dang ra";

    return s;
}

function addCategory(categories, value) {
    let title = "";

    if (typeof value === "string") {
        title = value.trim();
    } else if (value) {
        title = (value.category_title || value.title || value.name || "").toString().trim();
    }

    if (!title || categories.indexOf(title) > -1) return;
    categories.push(title);
}

function collectCategories(story, pageProps) {
    let categories = [];
    let rawCategories = (pageProps && pageProps.categories) || [];
    rawCategories.forEach(cat => addCategory(categories, cat));

    if (categories.length === 0 && Array.isArray(story.story_categories)) {
        story.story_categories.forEach(cat => addCategory(categories, cat));
    }

    if (categories.length === 0 && story.name_category) {
        addCategory(categories, story.name_category);
    }

    return categories;
}

function getStoryPayload(storyUrl) {
    let nextData = parseNextDataByUrl(storyUrl);
    let pageProps = (((nextData || {}).props || {}).pageProps || {});

    if (pageProps.story) {
        return {
            story: pageProps.story,
            pageProps: pageProps
        };
    }

    let apiPayload = fetchStoryPayloadByUrl(storyUrl);
    if (apiPayload && apiPayload.story) {
        return {
            story: apiPayload.story,
            pageProps: {
                categories: apiPayload.categories || []
            }
        };
    }

    return null;
}

function execute(url) {
    let storyUrl = normalizeStoryUrl(url);
    let payload = getStoryPayload(storyUrl);
    if (!payload) {
        return Response.error("Khong lay duoc du lieu truyen.");
    }

    let story = payload.story || null;
    if (!story) {
        return Response.error("Khong tim thay thong tin truyen.");
    }

    let name = (story.title || "").trim();
    let author = (story.author || story.pen_name_user || story.name_user || "").trim();
    let cover = toAbsoluteUrl(story.image || "");
    let description = (story.detail || story.description || "").trim();
    let categories = collectCategories(story, payload.pageProps || {});

    let detailParts = [];
    if (author) detailParts.push("Tac gia: " + author);
    if (categories.length > 0) detailParts.push("The loai: " + categories.join(", "));
    if (story.count_chapter) detailParts.push("So chuong: " + story.count_chapter);
    if (story.view) detailParts.push("Luot xem: " + story.view);

    let status = formatStatus(story.status);
    if (status) detailParts.push("Trang thai: " + status);

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: detailParts.join("<br>"),
        host: BASE_URL
    });
}
