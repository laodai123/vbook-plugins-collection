load("config.js");
function execute(url) {
    let response = fetch(url, {
        method: 'GET',
        headers: {
            'client-device': 'd75d43e71c3c8e24f8f73bc3d78496f0',
            'client-brand': 'Xiaomi',
            'client-version': '1.0.0',
            'client-name': 'app.maoyankanshu.novel',
            'client-source': 'android',
            Authorization: 'bearereyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGkuYW53YWJlbi5jb21cL2F1dGhcL3RoaXJkIiwiaWF0IjoxNzE2OTkxNTc0LCJleHAiOjE4MTAzMDM1NzQsIm5iZiI6MTcxNjk5MTU3NCwianRpIjoiTkh1VmxIckRlc0k4M0RDeiIsInN1YiI6NDcwNzkwLCJwcnYiOiJhMWNiMDM3MTgwMjk2YzZhMTkzOGVmMzBiNDM3OTQ2NzJkZDAxNmM1In0.CccxEw8ea5lqvHhSPetuvwvriA7Z0y7bgXm0jVMo3sM'
        }
    })
    if (response.ok) {
        let json = response.json().data;
        return Response.success({
            name: json.novelName,
            cover: json.cover,
            author: json.authorName,
            description: json.summary,
            detail: "Tác Giả : " + json.authorName + "<br>" + json.chapterNum + " chương" + "<br>" + json.wordNum + "<br>" + json.readInfo + " đọc",
            ongoing: json.status === 0,
            suggests: [
                {
                    title: "Có thể bạn thích",
                    input: BASE_URL + "/novel/recommend?novelId=" + url.split('/').pop(),
                    script: "suggest.js"
                }
            ],
        });
    }
    return Response.success('Many Request!');
}