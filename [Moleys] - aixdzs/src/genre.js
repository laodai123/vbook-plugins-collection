function execute() {
    let base = 'https://m.ixdzs8.tw';
    let response = fetch(base + '/sort/all');
    if (!response.ok) {
        base = 'https://m.ixdzs.tw';
        response = fetch(base + '/sort/all');
    }
    if (!response.ok) {
        base = 'https://m.aixdzs.com';
        response = fetch(base + '/sort/all');
    }
    if (response.ok) {
        let doc = response.html();
        let menu = doc.select('ul.ix-list li')
        var nav = []
        menu.forEach(e => {
            let input = base + e.select('a').attr('href')
            nav.push({ 
                title: e.select('a').text() + ' (' + e.select('em.smallblue').text() + ')', 
                input: input, 
                script: 'gen.js' 
            })
        })
        return Response.success(nav)
    }
    return null;
}