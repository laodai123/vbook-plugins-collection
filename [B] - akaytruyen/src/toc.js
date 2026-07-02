load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let chapters = [];
        
        // Try to find chapter links from story detail page
        let chapterLinks = doc.select('a[href*="/chuong-"]');
        for (let i = 0; i < chapterLinks.size(); i++) {
            let link = chapterLinks.get(i);
            chapters.push({
                name: link.text(),
                url: link.attr("href"),
                host: BASE_URL
            });
        }
        
        // If no chapters found, might need to fetch from AJAX
        if (chapters.length === 0) {
            // Try to get story slug from URL
            let slugMatch = url.match(/truyen\/([^\/]+)/);
            if (slugMatch) {
                let storySlug = slugMatch[1];
                let chapResponse = fetch(BASE_URL + "/ajax/get-chapters", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify({ story_slug: storySlug })
                });
                if (chapResponse.ok) {
                    let data = chapResponse.json();
                    if (data && data.chapters) {
                        data.chapters.forEach(function(chap) {
                            chapters.push({
                                name: chap.name,
                                url: BASE_URL + "/" + storySlug + "/" + chap.slug,
                                host: BASE_URL
                            });
                        });
                    }
                }
            }
        }
        
        return Response.success(chapters);
    }
    return null;
}
