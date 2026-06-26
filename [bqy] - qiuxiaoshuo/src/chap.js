function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img,"https://www.qiuxiaoshuo.org");
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        let htm = doc.select("#txtContent").html() +"☀️☀️☀️" ;
        htm = htm.replace(/\&nbsp;/g, "").replace(/。/g,"。<br><br>");;
        return Response.success(htm);
    }
    return null;
}