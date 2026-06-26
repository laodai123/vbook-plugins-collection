load("config.js");

function execute() {
    return Response.success([
        { title: "Top Đề Cử",   input: BASE_URL + "/bang-xep-hang/de-cu?page={{page}}",   script: "gen.js" },
        { title: "Top Theo Dõi", input: BASE_URL + "/bang-xep-hang/theo-doi?page={{page}}", script: "gen.js" },
        { title: "Top Lượt Đọc", input: BASE_URL + "/bang-xep-hang/luot-doc?page={{page}}", script: "gen.js" }
    ]);
}