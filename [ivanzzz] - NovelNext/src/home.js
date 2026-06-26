load('config.js');
function execute() {
    return Response.success([
        {title: "Latest Release", input: BASE_URL + "/dayvisit/", script: "gen.js"},
        {title: "Hot Novel", input: BASE_URL + "/allvisit/", script: "gen.js"},
        {title: "Completed Novel", input: BASE_URL + "/full.html", script: "gen.js"},
        {title: "Most Popular", input: BASE_URL + "/monthvisit/", script: "gen.js"}
    ]);
}
