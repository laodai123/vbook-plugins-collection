function execute() {
    load("config.js");
    return Response.success([
        {title: "Truyện Hot", input: HOST + "/danh-sach/truyen-hot", script: "gen.js"},
        {title: "Truyện Mới", input: HOST + "/danh-sach/truyen-moi", script: "gen.js"},
        {title: "Truyện Full", input: HOST + "/danh-sach/truyen-full", script: "gen.js"}
    ]);
}
