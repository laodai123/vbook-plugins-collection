function execute() {
    let response = fetch("http://api.beiniai.com/novel/category?channel=1");
    if (response.ok) {
        let genres = [];
        response.json().data.categories.forEach(item => {
            genres.push({
                title: item.categoryName,
                input: item.categoryId,
                script: 'gen.js'
            });
        });
        return Response.success(genres);
    }
    return null;
}
