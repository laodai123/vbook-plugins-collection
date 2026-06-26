function execute() {
    return Response.success([
        {title: "都市",input: "&category_id=1&gender=1&creation_status=1&word_count=1&book_type=-1&sort=2",script: "gen3.js"},
    ]);
}