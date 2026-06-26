load('config.js');

function execute(url) {
    var result = fetchPageWithBrowserFallback(url);
    if (!result.ok || !result.doc) {
        return Response.error('Không tải được mục lục truyện. Lỗi kết nối mạng.');
    }
    
    var doc = result.doc;
    var listchapter = [];

    // Extract novelSlug
    var novelSlug = '';
    var novelMatch = url.match(/\/novel\/([^\/\?#]+)/);
    if (novelMatch && novelMatch[1]) {
        novelSlug = novelMatch[1];
    }

    var hasRsc = false;
    try {
        var rscStr = extractRscStrings(doc);
        if (rscStr && rscStr.length > 0) {
            var novelObj = extractJsonObject(rscStr, '"initialNovel"');
            
            if (!novelObj) novelObj = extractJsonObject(rscStr, '"novel"');
            if (!novelObj) novelObj = extractJsonObject(rscStr, '"book"');

            if (novelObj) {
                var chapters = novelObj.chapters || novelObj.chaptersData || novelObj.chaps || [];
                
                if (chapters && chapters.length > 0) {
                    hasRsc = true;

                    // Sort chapters globally by order sequence first
                    if (typeof chapters.sort === 'function') {
                        chapters.sort(function(a, b) {
                            return (a.order || a.chapterNumber || 0) - (b.order || b.chapterNumber || 0);
                        });
                    }

                    // Group chapters by volume to keep volume lists contiguous and correct in UI
                    var volumesMap = {};
                    var volumesList = [];
                    
                    chapters.forEach(function(e) {
                        if (!e) return;
                        var vol = e.volume || e.arc || e.section || 'Truyện Chữ';
                        if (!volumesMap[vol]) {
                            volumesMap[vol] = [];
                            volumesList.push(vol);
                        }
                        volumesMap[vol].push(e);
                    });

                    volumesList.forEach(function(vol) {
                        listchapter.push({
                            name: vol,
                            type: "section"
                        });
                        
                        var volChapters = volumesMap[vol];
                        volChapters.forEach(function(e) {
                            var name = e.title || e.name || e.chapterTitle || '';
                            if (e.isVIP || e.vip) {
                                name += ' [VIP]';
                            }
                            
                            if (!name) name = 'Chương';

                            // Arc slug - try from arc/section object or generate
                            var arcSlug = e.arcSlug || (typeof e.arc === 'string' ? slugify(e.arc) : slugify(vol));
                            if (!arcSlug || arcSlug.length === 0) {
                                arcSlug = 'volume-1';
                            }
                            
                            var chapterId = e.id || e._id || e.chapterId || '';
                            var chapterSlug = e.slug || slugify(name) || 'chapter';
                            
                            // Try alternative URL formats
                            var chapUrl = '';
                            if (novelSlug && chapterId && e.slug) {
                                chapUrl = '/novel/' + novelSlug + '/read/' + arcSlug + '/' + e.slug + '-' + chapterId;
                            } else if (novelSlug && chapterId) {
                                chapUrl = '/novel/' + novelSlug + '/chapter/' + chapterId;
                            } else if (e.url && e.url.length > 0) {
                                chapUrl = e.url;
                            } else if (novelSlug) {
                                chapUrl = '/novel/' + novelSlug + '/read/' + arcSlug + '/' + chapterSlug;
                            }
                            
                            if (chapUrl && chapUrl.length > 0) {
                                listchapter.push({
                                    name: name,
                                    url: chapUrl,
                                    host: BASE_URL
                                });
                            }
                        });
                    });
                }
            }
        }
    } catch (err) {
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

    // Fallback: parse from application/ld+json
    if (listchapter.length === 0) {
        var ldScript = doc.select('script[type="application/ld+json"]').first();
        if (ldScript) {
            try {
                var ld = JSON.parse(ldScript.html());
                if (ld.hasPart && (ld.hasPart instanceof Array || typeof ld.hasPart.length === 'number')) {
                    ld.hasPart.forEach(function(part) {
                        listchapter.push({
                            name: part.name,
                            url: part.url,
                            host: BASE_URL
                        });
                    });
                }
            } catch (e) {}
        }
    }

    if (listchapter.length === 0) {
        return Response.error('Không tìm thấy chương nào hoặc mục lục yêu cầu đăng nhập.');
    }

    return Response.success(listchapter);
}
