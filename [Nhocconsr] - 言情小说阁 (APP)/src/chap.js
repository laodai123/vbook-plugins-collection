function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let data = response.json();
        let content = data.content.replace(/<!-- (.*?) -->/gm, '')
            .replace(/<p(.*?)>(.*?)<?p>/g, '')
            .replace(/\n/g, '<br>');
        return Response.success(content);
    }
}