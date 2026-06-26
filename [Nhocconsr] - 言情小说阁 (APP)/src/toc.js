load("config.js");
load('crypto.js');
function execute(url) {
    const tocUrl = url.split('/api')[0]
    let response = fetch(url+'/chapters', {
        method: 'GET',
        headers: {
            'client-device': 'd75d43e71c3c8e24f8f73bc3d78496f0',
            'client-brand': 'Xiaomi',
            'client-version': '1.0.0',
            'client-name': 'app.maoyankanshu.novel',
            'client-source': 'android',
            Authorization: 'bearereyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9hcGkuYW53YWJlbi5jb21cL2F1dGhcL3RoaXJkIiwiaWF0IjoxNzE2OTkxNTc0LCJleHAiOjE4MTAzMDM1NzQsIm5iZiI6MTcxNjk5MTU3NCwianRpIjoiTkh1VmxIckRlc0k4M0RDeiIsInN1YiI6NDcwNzkwLCJwcnYiOiJhMWNiMDM3MTgwMjk2YzZhMTkzOGVmMzBiNDM3OTQ2NzJkZDAxNmM1In0.CccxEw8ea5lqvHhSPetuvwvriA7Z0y7bgXm0jVMo3sM'
        }
    });
    if (response.ok) {
        let chapters = [];
        response.json().data.list.forEach(item => {
            chapters.push({
                name: item.chapterName,
                url: decrypt(item.path),
                pay: item.bookCoin > 0
            });
        });
        return Response.success(chapters);
    }
    return null;
}
function decrypt(encodedString) {
    const keyBytes = CryptoJS.enc.Utf8.parse('f041c49714d39908');
    const ivBytes = CryptoJS.enc.Utf8.parse('0123456789abcdef');
    const ciphertextBytes = CryptoJS.enc.Base64.parse(encodedString);
    const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: ciphertextBytes },
        keyBytes,
        { iv: ivBytes, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
}