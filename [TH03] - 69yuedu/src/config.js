let BASE_URL = "https://www.69shumi.net";
let HOME_URL=BASE_URL+"/articlelist/weekvisit_0_0_1.html";
let TAG_URL=BASE_URL+"/articlelist/tags/";
try {
    if (typeof CONFIG_URL !== 'undefined' && CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {}
try {
    if (typeof HOME !== 'undefined' && HOME) {
        HOME_URL = HOME;
    }
} catch (error) {}
try {
    if (typeof TAG !== 'undefined' && TAG) {
        TAG_URL = TAG;
    }
} catch (error) {}
