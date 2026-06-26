function execute() {
    load("config.js");
    return Response.success([
        {title: "Hệ Thống", input: HOST + "/the-loai/he-thong", script: "gen.js"},
        {title: "Tiên Hiệp", input: HOST + "/the-loai/tien-hiep", script: "gen.js"},
        {title: "Đô Thị", input: HOST + "/the-loai/do-thi", script: "gen.js"},
        {title: "Huyền Huyễn", input: HOST + "/the-loai/huyen-huyen", script: "gen.js"},
        {title: "Kiếm Hiệp", input: HOST + "/the-loai/kiem-hiep", script: "gen.js"},
        {title: "Đam Mỹ", input: HOST + "/the-loai/am-my", script: "gen.js"},
        {title: "Ngôn Tình", input: HOST + "/the-loai/ngon-tinh", script: "gen.js"},
        {title: "Linh Dị", input: HOST + "/the-loai/linh-di", script: "gen.js"},
        {title: "Lịch Sử", input: HOST + "/the-loai/lich-su", script: "gen.js"},
        {title: "Quân Sự", input: HOST + "/the-loai/quan-su", script: "gen.js"},
        {title: "Khoa Huyễn", input: HOST + "/the-loai/khoa-huyen", script: "gen.js"},
        {title: "Trọng Sinh", input: HOST + "/the-loai/trong-sinh", script: "gen.js"},
        {title: "Xuyên Không", input: HOST + "/the-loai/xuyen-khong", script: "gen.js"}
    ]);
}
