load('config.js')
function execute(url, page) {
    if (!page) page = '1';
    let response = fetch(`http://api.beiniai.com/novel?sort=1&page=${page}&categoryId=${url}`);
    if (response.ok) {
        let json = response.json();
        let books = [];
        json.data.forEach(item => {
            books.push({
                name: item.novelName,
                link: BASE_URL+'/novel/' + item.novelId,//http://api.beiniai.com/novel/aQnGo9?isSearch=0
                cover: item.cover,
                description: item.authorName,
            });
        });
        return Response.success(books, (parseInt(page) + 1) + "");
    }
    return null;
}
