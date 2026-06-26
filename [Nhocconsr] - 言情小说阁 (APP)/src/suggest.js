load('config.js')
function execute(url, page) {
    if (!page) page = '1';
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
    });
    if (response.ok) {
        let json = response.json();
        let books = [];
        json.data.list.forEach(item => {
            books.push({
                name: item.novelName,
                link: BASE_URL+'/novel/' + item.novelId,
                cover: item.cover,
                description: item.authorName,
            });
        });
        return Response.success(books);
    }
    return null;
}
