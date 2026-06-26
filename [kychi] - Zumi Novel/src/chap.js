load('config.js');

function execute(url) {
    var target = String(url || '');
    if (target.indexOf('http') !== 0) {
        if (target.charAt(0) !== '/') target = '/' + target;
        target = BASE_URL + target;
    }

    var result = fetchPageWithBrowserFallback(target);
    if (!result.ok || !result.doc) {
        return Response.error('Không tải được nội dung chương. Lỗi kết nối mạng.');
    }
    
    var doc = result.doc;
    var hasContent = false;

    // Priority 1: Extract from Next.js RSC stream (handles modern App Router)
    try {
        var rsc = extractRscStrings(doc);
        if (rsc && rsc.length > 0) {
            var initialChapter = extractJsonObject(rsc, '"initialChapter"');
            var rawContent = null;
            
            if (initialChapter && initialChapter.content) {
                rawContent = initialChapter.content;
                
                // Resolve streamed reference: e.g. "$28" -> "28:T5150,HTML_HERE"
                if (String(rawContent).indexOf('$') === 0) {
                    var refId = String(rawContent).substring(1);
                    var refKey = refId + ':T';
                    var refIdx = rsc.indexOf(refKey);
                    
                    if (refIdx !== -1) {
                        var commaIdx = rsc.indexOf(',', refIdx);
                        if (commaIdx !== -1) {
                            // Discover the start of the next chunk in the concatenated RSC stream to prevent overflow
                            var nextChunkRegex = /[\r\n]*([0-9a-fA-F]+):([TIEM\[\{])/g;
                            nextChunkRegex.lastIndex = commaIdx + 1;
                            var nextMatch = nextChunkRegex.exec(rsc);
                            
                            var endIdx = rsc.length;
                            if (nextMatch) {
                                endIdx = nextMatch.index;
                            }
                            
                            rawContent = rsc.substring(commaIdx + 1, endIdx);
                        }
                    }
                }
            }
        
            // Generic RSC stream text chunk fallback (looks for large :T text chunks containing HTML paragraphs)
            if (!rawContent || String(rawContent).indexOf('$') === 0) {
                var pos = 0;
                var bestChunk = null;
                var maxLen = 0;
                while (pos < rsc.length) {
                    var tIdx = rsc.indexOf(':T', pos);
                    if (tIdx === -1) break;
                    
                    var commaIdx = rsc.indexOf(',', tIdx + 2);
                    if (commaIdx !== -1 && commaIdx < tIdx + 15) {
                        var lenStr = rsc.substring(tIdx + 2, commaIdx);
                        var length = parseInt(lenStr, 16);
                        if (!isNaN(length) && length > 200) {
                            // Discover the start of the next chunk in the concatenated RSC stream to prevent overflow
                            var nextChunkRegex = /[\r\n]*([0-9a-fA-F]+):([TIEM\[\{])/g;
                            nextChunkRegex.lastIndex = commaIdx + 1;
                            var nextMatch = nextChunkRegex.exec(rsc);
                            
                            var endIdx = rsc.length;
                            if (nextMatch) {
                                endIdx = nextMatch.index;
                            }
                            
                            var chunkContent = rsc.substring(commaIdx + 1, endIdx);
                            if (chunkContent && (
                                chunkContent.indexOf('<p>') !== -1 || chunkContent.indexOf('</p>') !== -1 ||
                                chunkContent.indexOf('<p ') !== -1 || chunkContent.indexOf('\\u003cp') !== -1 ||
                                chunkContent.indexOf('<br') !== -1 || chunkContent.indexOf('\\u003cbr') !== -1
                            )) {
                                if (chunkContent.length > maxLen) {
                                    maxLen = chunkContent.length;
                                    bestChunk = chunkContent;
                                }
                            }
                        }
                    }
                    pos = tIdx + 2;
                }
                if (bestChunk && bestChunk.length > 20) {
                    rawContent = bestChunk;
                }
            }
            
            if (rawContent && String(rawContent).indexOf('$') !== 0 && String(rawContent).length > 20) {
                var cleaned = cleanHtml(String(rawContent));
                if (cleaned && cleaned.length > 20) {
                    hasContent = true;
                    return Response.success(cleaned);
                }
            }
        }
    } catch (e) {
        // ignore and fallback
    }

    // Priority 2: Standard DOM Scraper fallback - try multiple selectors
    if (!hasContent) {
        var selectors = [
            '.read-content',
            '#chapter-content', 
            '#read-content', 
            '.prose',
            '.chapter-content',
            'article',
            '[contenteditable]',
            '.content'
        ];
        
        for (var si = 0; si < selectors.length; si++) {
            if (hasContent) break;
            var contentEl = doc.select(selectors[si]).first();
            if (contentEl) {
                var htmlContent = contentEl.html();
                if (htmlContent && htmlContent.length >= 100) {
                    var cleaned = cleanHtml(htmlContent);
                    if (cleaned && cleaned.length > 20) {
                        hasContent = true;
                        return Response.success(cleaned);
                    }
                }
            }
        }
    }

    // Friendly authentication wall check
    if (!hasContent) {
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

    return Response.error('Không lấy được nội dung chương. VIP hoặc yêu cầu đăng nhập tài khoản.');
}

/**
 * Clean chapter HTML, preserve structured uploader formatting and update relative image URLs to absolute.
 */
function cleanHtml(htm) {
    if (!htm) return '';
    
    try {
        var doc = Html.parse(htm);
        
        // Remove comment count buttons and unnecessary elements
        doc.select('button').remove();
        doc.select('[title*="bình luận"]').remove();
        
        // Convert any relative image URLs to absolute
        doc.select('img').forEach(function(img) {
            var src = img.attr('src') || img.attr('data-src') || img.attr('data-srcset') || img.attr('srcset') || img.attr('data-original') || '';
            src = src.trim();
            if (src) {
                if (src.indexOf(' ') !== -1) {
                    src = src.split(' ')[0];
                }
                if (src.indexOf('http') !== 0) {
                    if (src.charAt(0) === '/') {
                        src = BASE_URL + src;
                    } else {
                        src = BASE_URL + '/' + src;
                    }
                }
                img.attr('src', src);
                img.removeAttr('data-src');
                img.removeAttr('srcset');
                img.removeAttr('data-srcset');
            }
        });
        
        htm = doc.select('body').html() || htm;
    } catch (err) {
        // ignore DOM parsing errors during cleanup
    }

    // Clean control characters and strip unwanted elements
    return htm
        .replace(/·/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<p>\s*(?:&nbsp;)?\s*<\/p>/gi, '')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
        .replace(/<button[\s\S]*?<\/button>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .trim();
}
