load("config.js");

function execute() {
    var items = [
        "Action",
        "Adventure",
        "Comedy",
        "Drama",
        "Fantasy",
        "Romance",
        "Supernatural",
        "School Life",
        "Slice of Life",
        "Isekai",
        "Harem",
        "Ecchi",
        "Magic",
        "Mystery",
        "Parody",
        "Seinen",
        "Shounen",
        "Shoujo",
        "Josei",
        "Tragedy",
        "Game",
        "Martial Arts",
        "Science Fiction",
        "Character Growth",
        "Female Protagonist",
        "Web Novel",
        "Japanese Novel",
        "Korean Novel",
        "Chinese Novel",
        "Vietnamese Novel",
        "One shot"
    ];

    var genres = [];
    for (var i = 0; i < items.length; i++) {
        genres.push(makeGenreItem(items[i]));
    }

    return Response.success(genres);
}
