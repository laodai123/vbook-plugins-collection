function execute(url) {
    let response = fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0", "Cookie": "novel_web_id=7181715568649700927" } });
    if (response.ok) {
        let json = response.json();
        let contentText = json.data.content;
        contentText = contentText.replace(/\n/g, '<br>');
        contentText = contentText.trim();
        return Response.success(contentText);
    }
    return null;
}