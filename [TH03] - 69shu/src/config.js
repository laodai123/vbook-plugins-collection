let BASE_URL = "https://www.69shuba.com";
let HOME_URL=BASE_URL+"/blist/class/0.htm";
let TAG_URL=BASE_URL+"/blist/tags";
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
