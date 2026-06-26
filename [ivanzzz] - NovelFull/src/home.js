load('config.js');
function execute() {
    return Response.success([
        {title: "Latest Release", input: BASE_URL + "/latest-release-novel", script: "gen.js"},
        {title: "Hot Novel", input: BASE_URL + "/hot-novel", script: "gen.js"},
        {title: "Completed Novel", input: BASE_URL + "/completed-novel", script: "gen.js"},
        {title: "Most Popular", input: BASE_URL + "/most-popular", script: "gen.js"}
    ]);
}