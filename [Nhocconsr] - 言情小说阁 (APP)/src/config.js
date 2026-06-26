let BASE_URL = "http://api.beiniai.com";

try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}