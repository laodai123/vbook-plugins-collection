load('config.js');

function execute(url) {
    // Normalize base story URL (strip any existing ?page=N)
    const baseUrl = url.replace(/\?page=\d+/, '');

    // Fetch first page to determine pagination
    const firstRes = fetch(baseUrl);
    if (!firstRes.ok) return Response.error("Cannot fetch story page");
    const firstDoc = firstRes.html();

    // Limit to first 3 pages for faster loading
    // Most users only need recent chapters anyway
    // Change this number if you want more/fewer chapters
    let maxPage = 1;

    const chapters = [];
    const seenUrls = new Set();

    // Load pages in parallel for faster execution
    const pages = [];
    for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        const pageUrl = baseUrl + '?page=' + currentPage;
        if (currentPage === 1) {
            pages.push({ page: currentPage, doc: firstDoc });
        } else {
            const res = fetch(pageUrl);
            if (res.ok) {
                pages.push({ page: currentPage, doc: res.html() });
            }
        }
    }

    // Process all pages
    pages.forEach(({ page, doc }) => {

        // Select chapter links from the main chapter list container
        const chapterLinks = doc.select('.story-detail__list-chapter--list a.chapter-link-mobile, .story-detail__list-chapter--list a.chapter-link-desktop');
        
        chapterLinks.forEach(link => {
            const href = link.attr('href');
            if (!href || seenUrls.has(href)) return;

            // Extract chapter information
            const chapterNumber = link.select('.chapter-number').text().trim();
            const chapterTitle = link.select('.chapter-title').text().trim();
            
            // Build chapter name
            let name = '';
            if (chapterNumber) {
                name = chapterNumber;
                if (chapterTitle) {
                    name += ': ' + chapterTitle;
                }
            } else if (chapterTitle) {
                name = chapterTitle;
            } else {
                // Fallback to link text
                name = link.text().trim().replace(/\s+/g, ' ');
            }

            // Extract chapter number for sorting
            let chapterNum = null;
            // Try to extract from URL first (e.g., .../3480-title)
            const urlMatch = href.match(/\/(\d+)(?:-[^\/]*)?$/);
            if (urlMatch) {
                chapterNum = parseInt(urlMatch[1], 10);
            } else {
                // Try to extract from chapter number text
                const numMatch = chapterNumber.match(/(\d+)/);
                if (numMatch) {
                    chapterNum = parseInt(numMatch[1], 10);
                }
            }

            seenUrls.add(href);
            chapters.push({
                name: name,
                url: href,
                host: BASE_URL,
                _sortNum: chapterNum
            });
        });
    });

    // Sort chapters by chapter number (ascending order - oldest first)
    chapters.sort((a, b) => {
        if (a._sortNum !== null && b._sortNum !== null) {
            return a._sortNum - b._sortNum;
        }
        if (a._sortNum !== null) return -1;
        if (b._sortNum !== null) return 1;
        // Fallback to URL comparison
        return a.url.localeCompare(b.url);
    });

    // Remove sorting helper and return clean result
    const result = chapters.map(chapter => ({
        name: chapter.name,
        url: chapter.url,
        host: chapter.host
    }));

    return Response.success(result);
}