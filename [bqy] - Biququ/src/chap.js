function execute(url) {
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        let htm = doc.select("#content p").html();
        htm = htm.replace(/\&nbsp;/g, "").replace(/\<\a(.*?)<\/a>/g,'').replace(/【.*?www.yeguoyuedu.com.*?】/g,'').replace(/。/g,"。<br><br>");
        
        return Response.success(htm);
    }
    return null;
}