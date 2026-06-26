load('config.js');
function execute(key,page) {
    if(!page) page = '1';
    let response = fetch("https://www.uaa.com/api/novel/app/novel/search?category=&excludeTags=&keyword=" + key + "&orderType=0&page=" + page + "&searchType=1&size=40");
    if (response.ok) {
        let json = response.json();
        let ele = json.model.data
        let books = [];
        ele.forEach(e => 
        {
            books.push({
                name: e.title,
                link: "https://www.uaa.com/api/novel/app/novel/intro?id=" + e.id,
                cover: e.coverUrl,
                description: e.authors,
                host: BASE_URL
            })
        });
        let next = (parseInt(page) + 1).toString();
        return Response.success(books,next);
    }

    return null;
}