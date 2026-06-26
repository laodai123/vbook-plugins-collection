load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);


    const doc = fetch(url).html();
    var content = doc.select("#nr1").html();
    var nextPage = doc.select('.chapterPages a').last();
    while(nextPage.text() === '【2】'){
        var doc2 = fetch(BASE_URL+nextPage.attr('href')).html();
        content += doc2.select("#nr1").html();
        var nextPage = doc2.select('.chapterPages a').last();
    }
    content = content.replace(/<p><\/p>/g,'')
    return Response.success(content);
}