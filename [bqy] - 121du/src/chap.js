function execute(url) {
    const doc = fetch(url).html();
    var content = doc.select("#BookText").html();
    
    
    content = content.replace(/<p><\/p>/g,'')
    return Response.success(content);
}