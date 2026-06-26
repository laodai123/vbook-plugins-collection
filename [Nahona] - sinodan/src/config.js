let BASE_URL = 'http://www.sinodan.link';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}