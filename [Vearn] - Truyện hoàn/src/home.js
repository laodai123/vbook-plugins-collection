function execute() {
    return Response.success([
        {title: "Mới cập nhật", input:  "https://truyenhoan.com/truyen-moi-cap-nhat/", script: "gen.js"},
        {title: "Thịnh hành", input:  "https://truyenhoan.com/truyen-hot/", script: "gen.js"},
        {title: "Hoàn thành", input:  "https://truyenhoan.com/truyen-full/", script: "gen.js"},
    ]);
}