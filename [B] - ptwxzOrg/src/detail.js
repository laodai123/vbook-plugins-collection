load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace('ptwxz.org', 'piaotia.com').replace('piaotian.com', 'piaotia.com');
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        return Response.success({
            name: doc.select('#info h1').text(),
            cover: doc.select('#fmimg img').attr('src'),
            author: doc.select('#info p').first().text().replace('作者：', '').trim(),
            description: doc.select('#intro').text(),
            detail: 'Piaotia - ' + doc.select('#info p').get(1).text() + '<br>' + doc.select('#info p').get(2).text(),
            host: BASE_URL
        });
    }
    return null;
}