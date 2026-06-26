function execute(url) {
    let response = fetch(url)
    if (response.ok) {
        let doc = response.json();
        let book = doc.model
        return Response.success({
            name: book.title,
            cover: book.coverUrl,
            author: book.authors,
            description: book.brief.replace(/\r?\n/g,"<br>"),
            detail: "作者： " + book.authors + "<br>" + book.updateTime,
            host: "https://www.uaa.com"
        });
    }
    return null;
}