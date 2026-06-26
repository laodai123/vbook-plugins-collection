function execute(url) {
    let response = fetch(url, {
        headers: {
            'cookie': '_ga=GA1.1.316026359.1685377249; _ga_4BC3P9JVX3=GS1.1.1685401323.2.1.1685401938.60.0.0',
            'token': 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ODYwNzIxNzA0MDMxMzU4OTc2LCJ0eXBlIjoiY3VzdG9tZXIiLCJ0aW1lc3RhbXAiOjE2ODUzNzg1MTE1NzQsImV4cCI6MTY4NTk4MzMxMX0.-FX7rOJP7I10ApjeM5NVaGj57aeYnkVyopniC7U_Dv8'
        }
    });
    if (response.ok) {
        let doc = response.json();
        let content = doc.model.lines.join("<br>");
        return Response.success(content);
    }
    return null;
}