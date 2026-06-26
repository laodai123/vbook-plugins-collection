load("config.js");

function execute() {
    return Response.success([
        {
            title: "Moi cap nhat",
            input: BASE_URL + "/danh-sach-truyen/trang/1",
            script: "gen.js"
        },
        {
            title: "Truyen sang tac",
            input: BASE_URL + "/oln/trang/1",
            script: "gen.js"
        },
        {
            title: "Action",
            input: BASE_URL + "/genres/action",
            script: "gen.js"
        },
        {
            title: "Adventure",
            input: BASE_URL + "/genres/adventure",
            script: "gen.js"
        },
        {
            title: "Comedy",
            input: BASE_URL + "/genres/comedy",
            script: "gen.js"
        },
        {
            title: "Fantasy",
            input: BASE_URL + "/genres/fantasy",
            script: "gen.js"
        },
        {
            title: "Romance",
            input: BASE_URL + "/genres/romance",
            script: "gen.js"
        }
    ]);
}
