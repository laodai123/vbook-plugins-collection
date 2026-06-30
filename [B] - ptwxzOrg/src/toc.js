load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace('ptwxz.org', 'piaotia.com').replace('piaotian.com', 'piaotia.com');
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let el = doc.select('#list dd a');
        const data = [];
        for (let i = 0; i < el.size(); i++) {
            var e = el.get(i);
            data.push({
                name: e.text(),
                url: url.substring(0, url.lastIndexOf('/') + 1) + e.attr('href'),
                host: BASE_URL
            });
        }
        return Response.success(data);
    }
    return null;
}