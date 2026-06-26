load('config.js')
function execute(key, page) {
    if (!page) page = '1';
    let response = fetch(`http://api.daislou.com/search?keyword=${key}&page=${page}`);
    if (response.ok) {
        let json = response.json();
        let books = [];
        json.data.forEach(item => {
            books.push({
                name: item.novelName,
                link: BASE_URL+'/novel/' + item.novelId,
                cover: item.cover,
                description: item.authorName,
            });
        });
        return Response.success(books, (parseInt(page) + 1) + "");
    }
    return null;
}
