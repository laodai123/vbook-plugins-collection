load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    
    // Akaytruyen uses Livewire - try the AJAX search endpoint
    var response = fetch(BASE_URL + "/ajax/search-story", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-CSRF-TOKEN": "",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
            query: key,
            page: page
        })
    });
    
    if (response.ok) {
        var data = response.json();
        if (data && data.stories && data.stories.data) {
            var novelList = [];
            data.stories.data.forEach(function(story) {
                novelList.push({
                    name: story.name,
                    link: BASE_URL + "/truyen/" + story.slug,
                    cover: story.cover_url,
                    description: story.author_name || "Đang cập nhật",
                    host: BASE_URL
                });
            });
            var next = (data.stories.current_page < data.stories.last_page) ? String(parseInt(page) + 1) : null;
            return Response.success(novelList, next);
        }
    }
    
    // Fallback: try GET search page
    var getResponse = fetch(BASE_URL + "/tim-kiem", {
        method: "GET",
        queries: { q: key, page: page }
    });
    
    if (getResponse.ok) {
        var doc = getResponse.html();
        var novelList = [];
        var items = doc.select(".story-item");
        for (var i = 0; i < items.size(); i++) {
            var e = items.get(i);
            var linkEl = e.select("a").first();
            var nameEl = e.select(".story-item__name").first();
            var imgEl = e.select("img").first();
            
            novelList.push({
                name: nameEl ? nameEl.text() : "",
                link: linkEl ? linkEl.attr("href") : "",
                cover: imgEl ? imgEl.attr("src") : "",
                description: "Đang cập nhật",
                host: BASE_URL
            });
        }
        var next = doc.select(".pagination .page-item.active + .page-item a").first();
        var nextPage = next ? next.attr("href").match(/page=(\d+)/) : null;
        return Response.success(novelList, nextPage ? nextPage[1] : null);
    }
    
    return null;
}
