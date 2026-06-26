load("config.js");

function execute() {
    return Response.success([
        { title: "Truyen moi", input: BASE_URL + "/danh-sach/truyen-moi", script: "gen.js" },
        { title: "Truyen hot", input: BASE_URL + "/danh-sach/truyen-hot", script: "gen.js" },
        { title: "Truyen full", input: BASE_URL + "/danh-sach/truyen-full", script: "gen.js" },
        { title: "Truyen dich", input: BASE_URL + "/danh-sach/truyen-dich", script: "gen.js" },
        { title: "Truyen dich AI", input: BASE_URL + "/danh-sach/truyen-dich-ai", script: "gen.js" },
        { title: "Truyen convert", input: BASE_URL + "/danh-sach/truyen-convert", script: "gen.js" }
    ]);
}
