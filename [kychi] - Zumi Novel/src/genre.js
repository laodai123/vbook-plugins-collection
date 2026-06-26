load('config.js');

function execute() {
    var genres = [
        { title: 'AI Dịch', tag: 'AI Dịch' },
        { title: 'Action', tag: 'Action' },
        { title: 'Adventure', tag: 'Adventure' },
        { title: 'Comedy', tag: 'Comedy' },
        { title: 'Drama', tag: 'Drama' },
        { title: 'Ecchi', tag: 'Ecchi' },
        { title: 'Fantasy', tag: 'Fantasy' },
        { title: 'Gender Bender', tag: 'Gender Bender' },
        { title: 'Harem', tag: 'Harem' },
        { title: 'Hài Hước', tag: 'Hài Hước' },
        { title: 'Kiếm Hiệp', tag: 'Kiếm Hiệp' },
        { title: 'Martial Arts', tag: 'Martial Arts' },
        { title: 'Mature', tag: 'Mature' },
        { title: 'Romance', tag: 'Romance' },
        { title: 'Slice of Life', tag: 'Slice of Life' },
        { title: 'Truyện Hàn', tag: 'Truyện Hàn' },
        { title: 'Web Novel', tag: 'Web Novel' }
    ];

    var data = [];
    for (var i = 0; i < genres.length; i++) {
        data.push({
            title: genres[i].title,
            input: BASE_URL + '/list?tag=' + encodeURIComponent(genres[i].tag),
            script: 'gen.js'
        });
    }
    
    return Response.success(data);
}
