function execute(url, page) {
    if (!page) page = '1';
    let response = fetch(url + '&p=' + page);
    if (response.ok) {
        let doc = response.html();
        let next = doc.select(".pagination").select("li.active + li").text();
        let el = doc.select("#searchviewdiv a.booksearch");
        let data = [];

        function toCapitalize(sentence) {
            const words = sentence.split(" ");
            return words.map((word) => {
                return word[0].toUpperCase() + word.substring(1);
            }).join(" ");
        }

        function extractNumber(text) {
            text = text.trim().toLowerCase();
            if (text.endsWith('k')) {
                return parseFloat(text.slice(0, -1)) * 1000;
            }
            return parseFloat(text);
        }

        const blacklistedWords = ["đấu la", "hogwarts", "tam quốc", "pokemon", "hoa ngu", "marvel", "tổng mạn", "tổng võ", "đại đường", "dân quốc", "hoa ngu", "tứ hợp viện", "hongkong", "hokage", "tenis", "đấu phá", "quỷ diệt:", "trảm thần:", "sụp đổ:", "hải tặc : ", "hồng hoang:", "tây du:", "đại tần:", "siêu thần:", "quỷ bí:", "comic", "giải trí:", "nhanh xuyên:", "long châu:", "mộc diệp","toàn chức pháp sư","đồng thời xuyên qua:","quyền bơi", "bóng đá:", "phong thần:", "tinh linh:", "lol:", "già thiên:", "tru tiên:", "tử thần:", "conan", "fairy tail", "chiến chùy:", "luân hồi nhạc viên:", "phàm nhân:", "dưới một người:", "inuyasha", "usa:", "võng vương:", "thần bí khôi phục:", "kamen rider", "hàn ngu", "kha học:", "đẹp tổng:", "toàn chức cao thủ", "harry potter", "lớn minh:", "sáu linh:", "niên đại:", "trộm mộ:", "video", "đen rổ:", "gotham", "cảng tổng:", "đại chúa tể:", "trực tiếp giám bảo:", "thôn phệ tinh không", "hương giang", "tuyệt thế đường môn", "batman", "thần thoại hi lạp", "tokyo", "type-moon", "vô hạn khủng bố", "văn hào:", "hồng lâu:", "hoàn mỹ thế giới", "già thiên chi", "từ già thiên", "thần ấn:", "naruto", "nguyên thần:"];

        el.forEach(e => {
            let img = e.select("img").first().attr("src");
            let viewCount = extractNumber(e.select(".info span:nth-child(1)").first().text());
            let chapterCount = extractNumber(e.select(".info span:nth-child(3)").first().text());
            let title = e.select(".searchbooktitle").first().text();
            
            if (img.startsWith('//')) {
                img = img.replace('//', 'https://');
            }

            // Kiểm tra title không chứa bất kỳ từ khóa nào trong blacklistedWords
            const titleLower = title.toLowerCase();
            const hasBlacklistedWord = blacklistedWords.some(word => titleLower.includes(word));

            if (viewCount > 35000 && chapterCount < 1500 && !hasBlacklistedWord) {
                data.push({
                    name: toCapitalize(title),
                    link: e.select("a").first().attr("href"),
                    cover: img,
                    description: e.select(".info span").first().text() + "⚡️" + 
                               e.select(".info span:nth-child(3)").first().text() + "c",
                    host: "http://14.225.254.182"
                });
            }
        });
        return Response.success(data, next);
    }
    return null;
}