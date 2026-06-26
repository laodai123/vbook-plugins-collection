load('config.js');

function execute(url) {
    url = url.replace("/intro?id=", "/catalog/")
    let response = fetch(url, {
        headers: {
            "token": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ODYwNzIxNzA0MDMxMzU4OTc2LCJ0eXBlIjoiY3VzdG9tZXIiLCJ0aW1lc3RhbXAiOjE2ODUzNzg1MTE1NzQsImV4cCI6MTY4NTk4MzMxMX0.-FX7rOJP7I10ApjeM5NVaGj57aeYnkVyopniC7U_Dv8"
        }
    });
    if (response.ok) {
        let json = response.json();
        let chapters = [];
        let volumes = [];
        if (json.model) {
            if (json.model.children) {
                chapters = extractChaptersWithVolume(json);
            } else if (json.model.menus) {
                chapters = extractChaptersWithoutVolume(json);
            }
            let ele = json.model.children || json.model.menus;
            ele.forEach(e => {
                if (e.children && e.children.length > 0) {
                    volumes.push({
                        name: e.title.replace("••", "").replace(/^(\d+).第/, '第').replace(/^(正文|VIP章节|最新章节)?(\s+|_)|[\(\{（｛【].*[求更谢乐发推票盟补加字Kk\/].*[\)\}）｝】]/g, '').replace(/^(\d+)[、．]第.+章/, '第$1章').replace(/^(\d+)、\d+、/, '第$1章 ').replace(/^(\d+)、\d+/, '第$1章').replace(/^(\d+)、/, '第$1章 ').replace(/^(第.+章)\s?第.+章/, '$1').replace(/\(.+\)/, '').replace(/\[|。/, ''),
                        chapters: extractChapters(e)
                    });
                } else {
                    chapters.push({
                        name: e.content.replace("••", "").replace(/^(\d+).第/, '第').replace(/^(正文|VIP章节|最新章节)?(\s+|_)|[\(\{（｛【].*[求更谢乐发推票盟补加字Kk\/].*[\)\}）｝】]/g, '').replace(/^(\d+)[、．]第.+章/, '第$1章').replace(/^(\d+)、\d+、/, '第$1章 ').replace(/^(\d+)、\d+/, '第$1章').replace(/^(\d+)、/, '第$1章 ').replace(/^(第.+章)\s?第.+章/, '$1').replace(/\(.+\)/, '').replace(/\[|。/, ''),
                        url: "https://www.uaa.com/api/novel/app/novel/chapter?id=" + e.id + "&offset=0&viewId=" + e.volumeNum,
                        host: BASE_URL
                    });
                }
            });
        }
        return Response.success(chapters.concat(volumes));
    }
    return null;
}

function extractChaptersWithVolume(data) {
    const chapters = [];
    let ele = data.model.children;
    for (let i = 0; i < ele.length; i++) {
        let e = ele[i];
        chapters.push({
            name: e.content.replace("••", "").replace(/^(\d+).第/, '第').replace(/^(正文|VIP章节|最新章节)?(\s+|_)|[\(\{（｛【].*[求更谢乐发推票盟补加字Kk\/].*[\)\}）｝】]/g, '').replace(/^(\d+)[、．]第.+章/, '第$1章').replace(/^(\d+)、\d+、/, '第$1章 ').replace(/^(\d+)、\d+/, '第$1章').replace(/^(\d+)、/, '第$1章 ').replace(/^(第.+章)\s?第.+章/, '$1').replace(/\(.+\)/, '').replace(/\[|。/, '') || e.title,
            url: "https://www.uaa.com/api/novel/app/novel/chapter?force=false&id=" + e.id + "&offset=0&viewId=17180288706036914",
            host: BASE_URL
        });
    }
    if (data.model.menus) {
        data.model.menus.forEach(volume => {
            if (volume.children && volume.children.length > 0) {
                chapters.push({
                    name: volume.title,
                    url: "https://www.uaa.com/api/novel/app/novel/chapter?force=false&id=" + volume.id + "&offset=0&viewId=17180288706036914",
                    host: BASE_URL
                });
                volume.children.forEach(chapter => {
                    chapters.push({
                        name: chapter.title,
                        url: "https://www.uaa.com/api/novel/app/novel/chapter?force=false&id=" + chapter.id + "&offset=0&viewId=17180288706036914",
                        host: BASE_URL
                    });
                });
            }
        });
    }
    return chapters;
}

function extractChaptersWithoutVolume(data) {
    const chapters = [];
    data.model.menus.forEach(volume => {
        if (volume.children && volume.children.length > 0) {
            volume.children.forEach(chapter => {
                chapters.push({
                    name: chapter.title,
                    url: "https://www.uaa.com/api/novel/app/novel/chapter?force=false&id=" + chapter.id + "&offset=0&viewId=17180288706036914",
                    host: BASE_URL
                });
            });
        }
    });
    return chapters;
}

function extractChapters(data) {
    const chapters = [];
    if (data.children) {
        data.children.forEach(chapter => {
            chapters.push({
                name: chapter.content.replace("••", "").replace(/^(\d+).第/, '第').replace(/^(正文|VIP章节|最新章节)?(\s+|_)|[\(\{（｛【].*[求更谢乐发推票盟补加字Kk\/].*[\)\}）｝】]/g, '').replace(/^(\d+)[、．]第.+章/, '第$1章').replace(/^(\d+)、\d+、/, '第$1章 ').replace(/^(\d+)、\d+/, '第$1章').replace(/^(\d+)、/, '第$1章 ').replace(/^(第.+章)\s?第.+章/, '$1').replace(/\/\(.+\)/, '').replace(/\[|。/, '') || chapter.title,
                url: "https://www.uaa.com/api/novel/app/novel/chapter?id=" + chapter.id + "&offset=0&viewId=" + chapter.volumeNum,
                host: BASE_URL
            });
        });
    }
    return chapters;
}