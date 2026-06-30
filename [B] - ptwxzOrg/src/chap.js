load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace('ptwxz.org', 'piaotia.com').replace('piaotian.com', 'piaotia.com');
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let htm = doc.select('#content').html();
        return Response.success(htm);
    }
    return null;
}