load('config.js');

function formatNumber(num) {
    if (!num) return '0';
    var n = parseInt(num, 10);
    if (isNaN(n)) return String(num);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function execute(url) {
    var novelSlug = '';
    var m = String(url).match(/\/novel\/([^\/\?#]+)/);
    if (m && m[1]) {
        novelSlug = m[1];
    }
    
    if (!novelSlug) return Response.error('Thiếu mã định danh truyện');

    var name = '';
    var cover = '';
    var author = '';
    var description = '';
    var status = 'ongoing';
    var genresList = [];
    var views = 0;
    var wordCount = 0;
    var followers = 0;
    var bookmarks = 0;
    var nominations = 0;
    var rating = 0;
    var ratingCount = 0;
    var novelType = '';
    var uploaderName = '';
    var apiSuccess = false;

    // Method 1: Fetch via public JSON API first for 100% accuracy and rich metadata
    try {
        var apiUrl = BASE_URL + '/api/novels/' + novelSlug;
        var res = fetchPage(apiUrl);
        if (res.ok) {
            var json = JSON.parse(res.text());
            if (json && json.success && json.data) {
                var novelObj = json.data;
                apiSuccess = true;
                name = novelObj.title || novelObj.name || '';
                cover = novelObj.coverUrl || novelObj.cover || '';
                author = novelObj.author || '';
                description = novelObj.description || '';
                status = novelObj.status || 'ongoing';
                genresList = novelObj.genres || [];
                views = novelObj.views || 0;
                wordCount = novelObj.wordCount || 0;
                followers = novelObj.followers || 0;
                bookmarks = novelObj.bookmarks || 0;
                nominations = novelObj.nominations || 0;
                rating = novelObj.rating || 0;
                ratingCount = novelObj.ratingCount || 0;
                novelType = novelObj.novelType || '';
                if (novelObj.uploader && novelObj.uploader.username) {
                    uploaderName = novelObj.uploader.username;
                }
            }
        }
    } catch (e) {
        // ignore and fallback to parsing HTML
    }

    if (!apiSuccess) {
        // Fallback to HTML parsing if API failed
        var result = fetchPageWithBrowserFallback(url);
        if (!result.ok || !result.doc) {
            return Response.error('Không tải được thông tin chi tiết truyện. Lỗi kết nối mạng.');
        }
        
        var doc = result.doc;

        // Extract from Next RSC
        var hasRsc = false;
        try {
            var rscStr = extractRscStrings(doc);
            if (rscStr && rscStr.length > 0) {
                var novelObj = extractJsonObject(rscStr, '"initialNovel"');
                if (novelObj) {
                    hasRsc = true;
                    name = novelObj.title || novelObj.name || '';
                    cover = novelObj.coverUrl || novelObj.cover || novelObj.image || '';
                    author = novelObj.author || novelObj.authorName || '';
                    description = novelObj.description || novelObj.summary || '';
                    status = novelObj.status || 'ongoing';
                    genresList = novelObj.genres || novelObj.tags || [];
                }
            }
        } catch (e) {
            // ignore
        }

        // Friendly authentication wall check
        if (!hasRsc) {
            var hasCookie = false;
            try {
                var authCookie = getAuthCookie();
                if (authCookie && authCookie.trim().length > 0) {
                    hasCookie = true;
                }
            } catch(e) {}
            
            var loginElements = doc.select('input[type="password"], button:contains(Đăng nhập), a:contains(Đăng nhập)').size();
            if (loginElements > 0) {
                return Response.error('YÊU CẦU ĐĂNG NHẬP: Vui lòng mở Trình duyệt vBook trong app, truy cập zuminovel.com và đăng nhập tài khoản của bạn để đọc truyện.');
            }
        }

        // Extract from application/ld+json
        if (!name || !cover || !author) {
            var ldScript = doc.select('script[type="application/ld+json"]').first();
            if (ldScript && ldScript.html()) {
                try {
                    var ldHtml = ldScript.html();
                    if (ldHtml && ldHtml.length > 0) {
                        var ld = JSON.parse(ldHtml);
                        if (ld.name && !name) name = ld.name;
                        if (ld.image && !cover) cover = ld.image;
                        if (ld.author && ld.author.name && !author) author = ld.author.name;
                        if (ld.description && !description) description = ld.description;
                        if (ld.genre && genresList.length === 0) {
                            if (ld.genre instanceof Array) {
                                genresList = ld.genre;
                            } else if (typeof ld.genre === 'string') {
                                genresList = [ld.genre];
                            }
                        }
                    }
                } catch (e) {}
            }
        }

        // Standard DOM selectors
        if (!name) {
            var h1El = doc.select('h1').first();
            if (h1El) name = h1El.text().trim();
        }
        if (!name) {
            var ogTitleEl = doc.select('meta[property="og:title"]').first();
            if (ogTitleEl) name = ogTitleEl.attr('content');
        }
        if (!cover) {
            var ogImageEl = doc.select('meta[property="og:image"]').first();
            if (ogImageEl) cover = ogImageEl.attr('content');
        }
        if (!author) {
            var authorEl = doc.select('a[href*="/tac-gia/"], a[href*="/author/"], .author-link').first();
            if (authorEl) author = authorEl.text().trim();
        }
        if (!author) author = 'Đang cập nhật';
        if (!description) {
            var descEl = doc.select('[itemprop="description"], .prose, .description, .summary').first();
            if (descEl) description = descEl.html();
        }
    }

    // Clean description to remove bis_skin_checked, style tags, and potential oklch colors
    if (description && description.length > 0) {
        description = String(description)
            .replace(/&nbsp;/gi, ' ')
            .replace(/style\s*=\s*"[^"]*"/gi, '')
            .replace(/style\s*=\s*'[^']*'/gi, '')
            .replace(/class\s*=\s*"[^"]*"/gi, '')
            .replace(/class\s*=\s*'[^']*'/gi, '')
            .replace(/bis_skin_checked\s*=\s*"[^"]*"/gi, '')
            .replace(/bis_skin_checked\s*=\s*'[^']*'/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .trim();
    }

    var isOngoing = String(status).toLowerCase() === 'ongoing' || String(status).toLowerCase() === 'đang ra';
    var statusText = isOngoing ? 'Đang ra' : 'Hoàn thành';

    var detailParts = [];
    detailParts.push('<p><strong>Tác giả:</strong> ' + author + '</p>');
    detailParts.push('<p><strong>Trạng thái:</strong> ' + statusText + '</p>');
    if (views) detailParts.push('<p><strong>Lượt xem:</strong> ' + formatNumber(views) + '</p>');
    if (wordCount) detailParts.push('<p><strong>Số chữ:</strong> ' + formatNumber(wordCount) + '</p>');
    if (followers) detailParts.push('<p><strong>Theo dõi:</strong> ' + formatNumber(followers) + '</p>');
    if (bookmarks) detailParts.push('<p><strong>Đánh dấu:</strong> ' + formatNumber(bookmarks) + '</p>');
    if (nominations) detailParts.push('<p><strong>Đề cử:</strong> ' + formatNumber(nominations) + '</p>');
    if (rating) detailParts.push('<p><strong>Đánh giá:</strong> ' + rating + '★ (' + formatNumber(ratingCount) + ' lượt)</p>');
    if (novelType) detailParts.push('<p><strong>Phân loại:</strong> ' + (novelType === 'original' ? 'Truyện Sáng Tác' : 'Truyện Dịch') + '</p>');
    if (uploaderName) detailParts.push('<p><strong>Người đăng:</strong> ' + uploaderName + '</p>');

    var genres = [];
    if (genresList && genresList.length > 0) {
        genresList.forEach(function(g) {
            if (!g) return;
            genres.push({
                title: g,
                input: '/list?tag=' + encodeURIComponent(g),
                script: 'gen.js'
            });
        });
    }

    var comments = null;
    if (novelSlug) {
        comments = {
            title: 'Bình luận',
            input: novelSlug,
            script: 'comment.js'
        };
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detailParts.join('<br>'),
        ongoing: isOngoing,
        genres: genres,
        comment: comments,
        comments: comments
    });
}
