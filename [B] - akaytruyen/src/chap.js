load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        // Extract content from chapter page
        let contentEl = doc.select('#chapter-content').first();
        if (contentEl) {
            return Response.success(contentEl.html());
        }
        
        // Fallback: look for content in common selectors
        let contentSelectors = ['.chapter-content', '.content', '.chapter-body', 'article'];
        for (let selector of contentSelectors) {
            let el = doc.select(selector).first();
            if (el) {
                return Response.success(el.html());
            }
        }
        
        // Last resort: get all text from body
        let body = doc.select('body').first();
        if (body) {
            return Response.success(body.html());
        }
    }
    return null;
}
