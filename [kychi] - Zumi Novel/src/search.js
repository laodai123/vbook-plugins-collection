load('config.js');

function execute(key, page) {
    var q = encodeURIComponent(key);
    var url = BASE_URL + '/list?search=' + q;
    return parseNovelList(url, page);
}
