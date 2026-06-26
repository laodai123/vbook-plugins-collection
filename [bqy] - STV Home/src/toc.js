function execute(url) {
    url = url.replace("sangtacviet.vip/truyen/fanqie/1/", "fanqienovel.com/page/");
    
    const idBook = url.match(/\d+/)[0];
    url ="https://fanqienovel.com/page/" +  idBook;
    const reader = 'http://sangtacviet.vip/truyen/fanqie/1/';
    
    const json = Http.get('https://fanqienovel.com/api/reader/directory/detail').params({bookId: idBook}).string();
    if (json) {
        var allChap = JSON.parse(json).data.chapterListWithVolume;
        const list = [];
        for(var book in allChap){
            for (var chapter in allChap[book]){
                var item = allChap[book][chapter];
                list.push({
                    name: item['title'],
                    url: reader+idBook+'/'+item['itemId']+'/',
                    host: "https://fanqienovel.com"
                })
            }
        }
        return Response.success(list);
    }
    return Response.success(Burl)
    // return Response.success(url)
}