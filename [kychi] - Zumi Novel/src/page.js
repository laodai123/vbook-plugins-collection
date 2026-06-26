load('config.js');

function execute(url) {
    var target = normalizeLink(url);
    return Response.success([target]);
}
