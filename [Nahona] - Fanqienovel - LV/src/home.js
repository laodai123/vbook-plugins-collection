function execute() {
    var fxlist = [];

    fxlist.push({
        title: "无敌",
        input: "https://novel.snssdk.com/api/novel/channel/homepage/new_category/book_list/v1/?app_version=4.6.0&device_platform=android&aid=1319&app_name=super&parent_enterfrom=novel_channel_category.tab.&channel=ppx_wy_and_gaox_d_5&version_code=460&version_name=4.6.0&word_count=9&genre_type=0&creation_status=9&offset=0&limit=100&category_id=384&gender=1",
        script: "gen.js"
    });

    return Response.success(fxlist);
}