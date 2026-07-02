load("config.js");
load("crypto.js");

/**
 * QuyKiep chapter content loader
 * Site: quykiep.com (Next.js + unlock API)
 * Flow:
 * 1. Frontend gọi GET https://api-comic.quykiep.com/api/unlock/{base64(timestamp)} -> trả về {id, key, content(base64), keywords}
 *    - content là trang captcha (base64 HTML)
 * 2. User giải captcha trên WebView VBook -> cookie được lưu
 * 3. Frontend gọi POST https://api-comic.quykiep.com/api/unlock với FormData {id, key, code} -> trả về content thật
 * 
 * Plugin strategy: Gọi GET unlock API. Nếu VBook đã có cookie từ WebView đã giải captcha,
 * API có thể trả về content thật thay vì captcha.
 * Dùng Http.get() của VBook (tự động mang cookie).
 */
function execute(url) {
    // Tạo timestamp ISO string và encode base64 (giống frontend JS)
    var now = new Date();
    var ts = now.toISOString();
    // Base64 encode UTF-8 bytes
    var tsEncoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(ts));
    
    // Gọi unlock API - VBook Http.get() sẽ tự động đính kèm cookie
    var unlockUrl = "https://api-comic.quykiep.com/api/unlock/" + encodeURIComponent(tsEncoded);
    var response = Http.get(unlockUrl).json();
    
    if (response && response.content) {
        // Giải mã content từ base64
        var decodedBytes = CryptoJS.enc.Base64.parse(response.content);
        var decodedContent = decodedBytes.toString(CryptoJS.enc.Utf8);
        
        // Kiểm tra xem có phải trang captcha không (chứa từ khóa "bán nhà" hoặc "mở khoá")
        if (decodedContent.indexOf("bán nhà") === -1 && decodedContent.indexOf("mở khoá") === -1 && decodedContent.indexOf("captcha") === -1) {
            // Đã là nội dung truyện thật
            return Response.success(decodedContent);
        }
        
        // Nếu vẫn là captcha, thử lấy từ __NEXT_DATA__ (cách cũ)
        var doc = Http.get(url).html();
        var nextDataScript = doc.select("#__NEXT_DATA__");
        if (nextDataScript && nextDataScript.html()) {
            var data = JSON.parse(nextDataScript.html());
            if (data.props && data.props.pageProps && data.props.pageProps.chapter && data.props.pageProps.chapter.content) {
                return Response.success(data.props.pageProps.chapter.content);
            }
        }
        
        // Trả về content captcha để VBook hiển thị (user có thể giải trong WebView)
        return Response.success(decodedContent);
    }
    
    // Fallback: thử cách cũ
    var doc = Http.get(url).html();
    var nextDataScript = doc.select("#__NEXT_DATA__");
    if (nextDataScript && nextDataScript.html()) {
        var data = JSON.parse(nextDataScript.html());
        if (data.props && data.props.pageProps && data.props.pageProps.chapter && data.props.pageProps.chapter.content) {
            return Response.success(data.props.pageProps.chapter.content);
        }
    }
    
    return Response.error("Không thể tải nội dung chương");
}