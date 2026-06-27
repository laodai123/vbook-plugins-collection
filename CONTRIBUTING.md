# Hướng Dẫn Đóng Góp — VBook Plugins Collection

Cảm ơn bạn đã quan tâm đến việc đóng góp cho **VBook Plugins Collection**! 🎉

Đây là bộ sưu tập gồm **393+ plugin** đọc truyện dành cho ứng dụng **VBook Reader**. Các plugin này là tập lệnh JavaScript giúp VBook có thể lấy nội dung từ các trang web truyện. Mỗi plugin đóng vai trò như một "cầu nối" để bạn đọc truyện trực tiếp từ trình đọc VBook yêu thích của mình.

**Repository:** [Laodai123/vbook-plugins-collection](https://github.com/Laodai123/vbook-plugins-collection)

---

## Mục Lục

1. [Câu Chuyện / Tại Sao Nên Đóng Góp](#1-câu-chuyện--tại-sao-nên-đóng-góp)
2. [Yêu Cầu Hệ Thống](#2-yêu-cầu-hệ-thống)
3. [Cấu Trúc Plugin](#3-cấu-trúc-plugin)
4. [Cách Viết Plugin Mới Từ Đầu (Step by Step)](#4-cách-viết-plugin-mới-từ-đầu-step-by-step)
5. [Cách Sửa Plugin Lỗi](#5-cách-sửa-plugin-lỗi)
6. [Quy Tắc Đặt Tên Thư Mục](#6-quy-tắc-đặt-tên-thư-mục)
7. [Cách Submit PR](#7-cách-submit-pr)
8. [Code Style Guidelines Cho JS Plugins](#8-code-style-guidelines-cho-js-plugins)
9. [Test Plugin Local](#9-test-plugin-local)
10. [Báo Lỗi](#10-báo-lỗi)

---

## 1. Câu Chuyện / Tại Sao Nên Đóng Góp

VBook là trình đọc truyện mã nguồn mở trên Android được cộng đồng yêu thích. Sức mạnh của nó nằm ở hệ thống plugin — mỗi plugin là một tệp JavaScript nhỏ cho phép VBook kết nối với một trang web truyện cụ thể.

Khi bạn đóng góp một plugin:

- **📚 Hàng nghìn người đọc có thể đọc truyện từ nguồn bạn thêm vào.**
- **🐛 Bạn giúp sửa các plugin bị hỏng do trang web thay đổi.**
- **🌍 Bạn mở rộng thêm kho tàng truyện cho cộng đồng (cả Việt Nam, Trung Quốc, manga).**
- **🧠 Bạn rèn luyện kỹ năng viết JavaScript, xử lý DOM, và làm việc với GitHub.**

Dù bạn là người mới học code hay lập trình viên giàu kinh nghiệm, mọi đóng góp đều được trân trọng!

---

## 2. Yêu Cầu Hệ Thống

Để viết và kiểm thử plugin, bạn cần:

### Tối Thiểu
- **Trình soạn thảo văn bản** (VS Code, Sublime Text, Notepad++, ...)
- **Git** (để clone repo và tạo pull request)
- **Tài khoản GitHub**
- **Kiến thức cơ bản về JavaScript** (ES5/ES6)

### Khuyến Nghị (Không Bắt Buộc)
- **Node.js** (v14 trở lên) — để chạy thử cú pháp JavaScript cục bộ
- **Một máy Android có cài VBook Reader** — để test plugin thực tế
- **Trình duyệt web** (Chrome/Firefox) với DevTools — để phân tích cấu trúc trang web nguồn

> **Lưu ý:** VBook plugin chạy trong môi trường JavaScript riêng của ứng dụng, không phải Node.js hay trình duyệt. Bạn **không cần** cài Node.js nếu chỉ muốn viết plugin đơn giản.

---

## 3. Cấu Trúc Plugin

Mỗi plugin là một **thư mục riêng** nằm trong thư mục gốc của repository, có cấu trúc như sau:

```
[Tên Tác Giả] - TênPlugin/
├── plugin.json        # Tệp metadata bắt buộc
├── icon.png           # Biểu tượng plugin (khuyến nghị)
└── src/
    ├── home.js        # Scrape trang chủ / truyện mới
    ├── detail.js      # Scrape trang chi tiết truyện
    ├── genre.js       # Scrape trang thể loại
    ├── search.js      # Scrape chức năng tìm kiếm
    ├── toc.js         # Scrape mục lục / danh sách chương
    └── chap.js        # Scrape nội dung chương
```

### Giải Thích Chi Tiết

#### `plugin.json` — Tệp Metadata (Bắt Buộc)

Tệp này chứa thông tin định danh cho plugin. Ví dụ:

```json
{
  "name": "Tên Plugin",
  "author": "Tên Tác Giả",
  "sourceUrl": "https://example.com",
  "regexp": "example\\.com",
  "description": "Plugin đọc truyện từ Example.com",
  "locale": "vi_VN",
  "type": "novel",
  "icon": "icon.png"
}
```

| Trường | Kiểu | Bắt Buộc | Mô Tả |
|--------|------|----------|-------|
| `name` | string | ✅ | Tên hiển thị của plugin |
| `author` | string | ✅ | Tên tác giả viết plugin |
| `sourceUrl` | string | ✅ | URL gốc của trang web nguồn |
| `regexp` | string | ✅ | Biểu thức chính quy để nhận diện URL từ trang này |
| `description` | string | ✅ | Mô tả ngắn về plugin |
| `locale` | string | ✅ | Mã ngôn ngữ: `"vi_VN"`, `"zh_CN"`, `"en_US"` |
| `type` | string | ✅ | Loại plugin: `"novel"`, `"chinese_novel"`, `"manga"` |
| `icon` | string | ❌ | Đường dẫn đến tệp icon (mặc định: `"icon.png"`) |

#### Các Tệp JavaScript (`src/`)

Mỗi tệp `.js` trong thư mục `src/` là một module riêng biệt, được VBook gọi khi cần lấy dữ liệu tương ứng.

| Tệp | Chức Năng |
|-----|-----------|
| `home.js` | Lấy danh sách truyện từ trang chủ (truyện mới, truyện hot) |
| `detail.js` | Lấy thông tin chi tiết của một truyện (tác giả, mô tả, thể loại,...) |
| `genre.js` | Lấy danh sách truyện theo thể loại |
| `search.js` | Tìm kiếm truyện theo từ khóa |
| `toc.js` | Lấy danh sách chương (mục lục) của truyện |
| `chap.js` | Lấy nội dung văn bản của một chương |

> **Không phải tệp nào cũng bắt buộc.** Nếu trang web không hỗ trợ một chức năng nào đó (ví dụ: không có tìm kiếm), bạn có thể bỏ qua tệp tương ứng. Tuy nhiên, nên có ít nhất `home.js`, `detail.js`, `toc.js` và `chap.js`.

---

## 4. Cách Viết Plugin Mới Từ Đầu (Step by Step)

### Bước 1: Chọn Trang Web Nguồn

Chọn một trang web truyện mà bạn muốn viết plugin. Đảm bảo rằng:
- Trang web có cấu trúc HTML ổn định (không thay đổi quá thường xuyên)
- Nội dung có thể truy cập mà không cần đăng nhập (hoặc đăng nhập đơn giản)
- Plugin cho trang đó chưa tồn tại trong bộ sưu tập (kiểm tra danh sách hiện tại)

### Bước 2: Phân Tích Trang Web

Sử dụng **Developer Tools** trên trình duyệt (F12) để phân tích:

1. Mở trang chủ → xác định các phần tử HTML chứa danh sách truyện
2. Mở một truyện → xác định vị trí tiêu đề, tác giả, mô tả, ảnh bìa
3. Mở mục lục → xác định cấu trúc danh sách chương
4. Mở một chương → xác định vùng chứa nội dung văn bản

> **Mẹo:** Viết ra giấy các selector CSS hoặc XPath bạn sẽ dùng trước khi bắt đầu code.

### Bước 3: Fork & Clone Repository

```bash
# Fork repository trên GitHub, sau đó clone bản fork về máy
git clone https://github.com/your-username/vbook-plugins-collection.git
cd vbook-plugins-collection
```

### Bước 4: Tạo Thư Mục Plugin

```bash
mkdir -p "YourName - TenPlugin/src"
```

Ví dụ:

```bash
mkdir -p "NguyenVanA - DocTruyenNhanh/src"
```

### Bước 5: Viết `plugin.json`

Tạo tệp `plugin.json`:

```json
{
  "name": "DocTruyenNhanh",
  "author": "NguyenVanA",
  "sourceUrl": "https://doctruyennhanh.com",
  "regexp": "doctruyennhanh\\.com",
  "description": "Đọc truyện từ DocTruyenNhanh",
  "locale": "vi_VN",
  "type": "novel",
  "icon": "icon.png"
}
```

### Bước 6: Viết Các Tệp JavaScript

Dưới đây là các mẫu cơ bản cho từng tệp:

#### `src/home.js` — Trang Chủ

```javascript
function execute() {
    const response = fetch('https://doctruyennhanh.com');
    const html = response.body;
    const $ = cheerio.load(html);
    const books = [];

    // Ví dụ: mỗi truyện nằm trong thẻ .book-item
    $('.book-item').each(function () {
        books.push({
            name: $(this).find('.book-name a').text().trim(),
            link: $(this).find('.book-name a').attr('href'),
            cover: $(this).find('img').attr('src'),
            description: $(this).find('.book-desc').text().trim()
        });
    });

    return JSON.stringify(books);
}
```

#### `src/detail.js` — Chi Tiết Truyện

```javascript
function execute() {
    const response = fetch(BookUrl);
    const html = response.body;
    const $ = cheerio.load(html);

    return JSON.stringify({
        name: $('h1.book-title').text().trim(),
        author: $('.book-author').text().replace('Tác giả:', '').trim(),
        description: $('.book-description').text().trim(),
        cover: $('.book-cover img').attr('src'),
        genre: $('.book-genre').text().trim(),
        status: $('.book-status').text().trim()
    });
}
```

#### `src/toc.js` — Mục Lục

```javascript
function execute() {
    const response = fetch(BookUrl);
    const html = response.body;
    const $ = cheerio.load(html);
    const chapters = [];

    $('.chapter-list a').each(function () {
        chapters.push({
            name: $(this).text().trim(),
            link: $(this).attr('href')
        });
    });

    return JSON.stringify(chapters);
}
```

#### `src/chap.js` — Nội Dung Chương

```javascript
function execute() {
    const response = fetch(ChapterUrl);
    const html = response.body;
    const $ = cheerio.load(html);

    // Lấy nội dung chính, loại bỏ các quảng cáo/quảng cáo xen kẽ nếu có
    const content = $('#chapter-content').html();

    return JSON.stringify({
        content: content
    });
}
```

#### `src/search.js` — Tìm Kiếm (Tùy Chọn)

```javascript
function execute() {
    const response = fetch(BookUrl + '/search?q=' + SearchKey);
    const html = response.body;
    const $ = cheerio.load(html);
    const results = [];

    $('.search-result-item').each(function () {
        results.push({
            name: $(this).find('.result-name').text().trim(),
            link: $(this).find('a').attr('href'),
            cover: $(this).find('img').attr('src')
        });
    });

    return JSON.stringify(results);
}
```

#### `src/genre.js` — Thể Loại (Tùy Chọn)

```javascript
function execute() {
    const response = fetch(BookUrl + '/the-loai');
    const html = response.body;
    const $ = cheerio.load(html);
    const genres = [];

    $('.genre-item a').each(function () {
        genres.push({
            name: $(this).text().trim(),
            link: $(this).attr('href')
        });
    });

    return JSON.stringify(genres);
}
```

### Bước 7: Biến Đặc Biệt Trong VBook Plugins

VBook cung cấp một số biến toàn cục mà bạn có thể sử dụng:

| Biến | Mô Tả |
|------|-------|
| `BookUrl` | URL của trang truyện hiện tại |
| `ChapterUrl` | URL của chương hiện tại |
| `SearchKey` | Từ khóa tìm kiếm (chỉ dùng trong `search.js`) |
| `fetch(url)` | Hàm gửi HTTP request, trả về object có thuộc tính `.body` |
| `cheerio` | Thư viện jQuery-like để parse HTML |

### Bước 8: Kiểm Tra Plugin (Xem Mục 9)

Sao chép thư mục plugin vào thư mục plugin của VBook trên điện thoại và kiểm tra.

### Bước 9: Commit & Push

```bash
git add "YourName - TenPlugin/"
git commit -m "Thêm plugin [TenPlugin] từ [TenAuthor]"
git push origin main
```

### Bước 10: Tạo Pull Request (Xem Mục 7)

---

## 5. Cách Sửa Plugin Lỗi

Plugin có thể bị lỗi khi trang web nguồn thay đổi cấu trúc HTML. Dưới đây là cách sửa:

### Quy Trình Sửa Lỗi

1. **Xác nhận lỗi:** Mở VBook và thử tải nội dung từ plugin bị lỗi. Ghi lại lỗi cụ thể:
   - Không hiển thị danh sách truyện?
   - Không tải được nội dung chương?
   - Báo lỗi JavaScript?

2. **Phân tích trang web:** Mở trang web nguồn trên trình duyệt, kiểm tra xem cấu trúc HTML có thay đổi không:
   - Class name có bị đổi không?
   - ID có bị thay đổi không?
   - URL pattern có thay đổi không?

3. **Sửa tệp tương ứng:**
   - Lỗi trang chủ → sửa `home.js`
   - Lỗi chi tiết → sửa `detail.js`
   - Lỗi danh sách chương → sửa `toc.js`
   - Lỗi nội dung → sửa `chap.js`
   - Lỗi tìm kiếm → sửa `search.js`

4. **Cập nhật `plugin.json` nếu cần:**
   - Nếu URL gốc thay đổi → cập nhật `sourceUrl`
   - Nếu domain thay đổi → cập nhật `regexp`

5. **Test lại** (xem Mục 9)

### Ví Dụ Sửa Lỗi

```javascript
// Trước (cũ) — class name cũ
$('.chapter-content').html()

// Sau (mới) — class name mới do web thay đổi
$('.reading-content').html()
```

### Ghi Chú Khi Sửa

- **Không thay đổi** cấu trúc thư mục hoặc tên plugin trừ khi thực sự cần thiết
- **Ghi rõ** trong commit message bạn đã sửa gì: `Sửa chap.js cho [Plugin] do web thay đổi selector`
- **Giữ nguyên** tên tác giả gốc trong `plugin.json`

---

## 6. Quy Tắc Đặt Tên Thư Mục

Tuân thủ nghiêm ngặt quy tắc đặt tên sau:

```
[TênTácGiả] - TênPlugin
```

### Quy Tắc Chi Tiết

1. **Định dạng:** `Tên Tác Giả` + ` - ` (khoảng trắng, dấu gạch ngang, khoảng trắng) + `Tên Plugin`
2. **Tên tác giả:** Không dấu, viết liền, viết hoa chữ cái đầu mỗi từ (PascalCase). Ví dụ: `NguyenVanA`, `JohnDoe`
3. **Tên plugin:** Tên trang web hoặc tên gợi nhớ, viết liền, PascalCase. Ví dụ: `DocTruyenNhanh`, `TangThuVien`, `MangaFox`
4. **Không có khoảng trắng trong tên tác giả hoặc tên plugin** — chỉ có khoảng trắng ở hai bên dấu `-`

### Ví Dụ Hợp Lệ

```
NguyenVanA - DocTruyenNhanh
Laodai123 - TangThuVien
JohnDoe - MangaFox
TranThiB - BaoTruyen
```

### Ví Dụ Không Hợp Lệ

```
Nguyen Van A - DocTruyenNhanh    # ❌ Tên tác giả có khoảng trắng
nguyenvanA-doctruyennhanh         # ❌ Thiếu khoảng trắng quanh dấu -
NguyenVanA-DocTruyenNhanh         # ❌ Thiếu khoảng trắng sau dấu -
nguyenvan_a - doc_truyen_nhanh    # ❌ Dùng underscore thay vì PascalCase
```

### Mẹo Quan Trọng

Khi fork repository về, **luôn đặt plugin mới của bạn vào thư mục gốc** (cùng cấp với các thư mục plugin khác), **không** lồng vào thư mục con nào khác.

---

## 7. Cách Submit PR

### Quy Trình Pull Request

1. **Fork repository** trên GitHub
2. **Clone** bản fork về máy
3. **Tạo branch** cho thay đổi của bạn:
   ```bash
   git checkout -b feature/them-plugin-doctruyennhanh
   # hoặc
   git checkout -b fix/sua-chap-tangthuvien
   ```
4. **Thực hiện thay đổi** (thêm/sửa plugin)
5. **Commit** với message rõ ràng:
   ```bash
   git add .
   git commit -m "✨ Thêm plugin DocTruyenNhanh từ NguyenVanA"
   ```
   Một số emoji gợi ý:
   - `✨` — Thêm plugin mới
   - `🐛` — Sửa lỗi
   - `📝` — Cập nhật tài liệu
   - `🔧` — Cập nhật cấu hình
6. **Push** lên GitHub:
   ```bash
   git push origin feature/them-plugin-doctruyennhanh
   ```
7. **Tạo Pull Request** trên GitHub từ branch của bạn vào `main` của repository gốc

### Tiêu Chuẩn PR

| Tiêu Chí | Chi Tiết |
|----------|----------|
| **Một PR = Một thay đổi** | Không gộp nhiều plugin/sửa lỗi vào một PR |
| **Commit message rõ ràng** | Bằng tiếng Việt hoặc tiếng Anh, mô tả ngắn gọn |
| **Kiểm tra trước** | Đảm bảo plugin hoạt động trước khi tạo PR |
| **Tôn trọng tác giả gốc** | Khi sửa plugin của người khác, giữ nguyên tên tác giả |
| **plugin.json đầy đủ** | Kiểm tra các trường bắt buộc |

### Sau Khi Tạo PR

- Một người bảo trì repository sẽ review
- Có thể sẽ có yêu cầu chỉnh sửa — hãy phản hồi kịp thời
- Sau khi được duyệt, PR sẽ được merge

---

## 8. Code Style Guidelines Cho JS Plugins

### Quy Tắc Chung

- **Sử dụng ES5** — VBook hỗ trợ JavaScript ES5, không dùng arrow function, `const`/`let`, template literals, v.v.
- **Không dùng module** — Không sử dụng `import`/`export` hay require
- **Mỗi tệp một hàm** — Mỗi tệp `.js` chỉ chứa một hàm `execute()` duy nhất
- **Luôn return JSON** — Hàm `execute()` luôn trả về `JSON.stringify(...)`

### Cụ Thể

```javascript
// ✅ Đúng — ES5, var, function
function execute() {
    var response = fetch(BookUrl);
    var html = response.body;
    var $ = cheerio.load(html);
    var books = [];

    $('.book-item').each(function () {
        books.push({
            name: $(this).find('.name').text().trim(),
            link: $(this).find('a').attr('href')
        });
    });

    return JSON.stringify(books);
}

// ❌ Sai — ES6+, không chạy được trong VBook
function execute() {
    const response = fetch(BookUrl);
    const $ = cheerio.load(response.body);
    const books = $('.book-item').map((i, el) => ({
        name: $(el).find('.name').text().trim(),
        link: $(el).find('a').attr('href')
    })).get();
    return JSON.stringify(books);
}
```

### Quy Tắc Đặt Tên

- **Biến:** camelCase (`bookList`, `chapterUrl`)
- **Hàm:** camelCase (`getContent`, `parseList`)
- **Hằng số:** UPPER_SNAKE_CASE (`BASE_URL`)
- **Tên có ý nghĩa:** `a` ❌ → `bookList` ✅

### Cheerio / jQuery Selectors

Sử dụng các selector CSS thông dụng:

```javascript
// Selector cơ bản
$('.classname')            // class
$('#id')                   // id
$('tag')                   // thẻ HTML
$('div.classname')         // kết hợp

// Duyệt DOM
$(this).find('selector')
$(this).parent()
$(this).next()
$(this).prev()

// Lấy dữ liệu
$(el).text()               // nội dung text
$(el).html()               // nội dung HTML
$(el).attr('src')          // thuộc tính
$(el).val()                // giá trị input
```

### Xử Lý Lỗi (Error Handling)

Luôn kiểm tra dữ liệu trước khi xử lý:

```javascript
function execute() {
    var response = fetch(BookUrl);

    if (response.status !== 200) {
        return JSON.stringify({ error: 'Không thể kết nối đến trang web' });
    }

    var html = response.body;
    var $ = cheerio.load(html);

    var name = $('h1.book-title').text().trim();
    if (!name) {
        return JSON.stringify({ error: 'Không tìm thấy tiêu đề truyện' });
    }

    return JSON.stringify({
        name: name,
        author: $('.author').text().trim() || 'Đang cập nhật',
        description: $('.desc').text().trim() || ''
    });
}
```

### Xử Lý URL

Xây dựng URL đầy đủ nếu trang web dùng đường dẫn tương đối:

```javascript
// ✅ Đúng
var link = $(this).find('a').attr('href');
if (link && link.startsWith('/')) {
    link = 'https://doctruyennhanh.com' + link;
}

// ❌ Sai — thiếu xử lý đường dẫn tương đối
var link = $(this).find('a').attr('href');
// link có thể là '/truyen/abc' thay vì 'https://...'
```

### Xóa Ký Tự Thừa

```javascript
// Loại bỏ khoảng trắng thừa
var text = $(el).text().replace(/\s+/g, ' ').trim();

// Xóa quảng cáo xen kẽ nội dung
$('.ads, .advertisement, .banner').remove();
var content = $('#content').html();
```

---

## 9. Test Plugin Local

### Phương Pháp 1: Test Trên Điện Thoại (Khuyến Nghị)

1. **Kết nối điện thoại Android** với máy tính qua USB
2. **Sao chép thư mục plugin** vào bộ nhớ điện thoại:
   ```
   /storage/emulated/0/VBook/plugins/[Author] - PluginName/
   ```
   Hoặc nếu dùng thẻ SD:
   ```
   /storage/XXXX-XXXX/VBook/plugins/[Author] - PluginName/
   ```
3. **Mở VBook** → Plugin → plugin của bạn sẽ xuất hiện
4. **Kiểm tra từng chức năng:** Trang chủ, tìm kiếm, chi tiết, mục lục, đọc chương
5. **Ghi lại lỗi** nếu có và sửa

> **Mẹo:** Dùng ứng dụng quản lý tệp để sao chép dễ dàng hơn (như Solid Explorer, CX File Explorer).

### Phương Pháp 2: Test Bằng Node.js (Cơ Bản)

Nếu bạn đã cài Node.js, bạn có thể kiểm tra cú pháp JavaScript:

```bash
# Kiểm tra cú pháp cơ bản
node -e "
var fs = require('fs');
var code = fs.readFileSync('path/to/plugin/src/home.js', 'utf-8');
try {
    new Function(code);
    console.log('✅ Cú pháp OK');
} catch (e) {
    console.log('❌ Lỗi cú pháp:', e.message);
}
"
```

> **Lưu ý:** Phương pháp này chỉ kiểm tra cú pháp, **không** kiểm tra logic vì các biến đặc biệt như `fetch`, `cheerio`, `BookUrl` không tồn tại trong Node.js.

### Phương Pháp 3: Kiểm Tra Tệp `plugin.json`

Đảm bảo `plugin.json` là JSON hợp lệ:

```bash
node -e "JSON.parse(require('fs').readFileSync('path/to/plugin/plugin.json','utf-8')); console.log('✅ JSON hợp lệ')"
```

### Checklist Trước Khi Test

- [ ] `plugin.json` có đầy đủ các trường bắt buộc
- [ ] `regexp` escape đúng ký tự đặc biệt (dấu `.` thành `\.`)
- [ ] Các URL trong code sử dụng đúng domain
- [ ] Không dùng cú pháp ES6 (`=>`, `const`, `let`, `` `template` ``)
- [ ] Hàm `execute()` trả về `JSON.stringify(...)`
- [ ] Icon/ảnh bìa sử dụng URL tuyệt đối (có `http://` hoặc `https://`)

---

## 10. Báo Lỗi

Khi bạn gặp plugin bị lỗi, hãy báo cáo qua **GitHub Issues**.

### Cách Tạo Issue

1. Vào tab **Issues** của repository: [Issues](https://github.com/Laodai123/vbook-plugins-collection/issues)
2. Nhấn **New Issue**
3. Chọn template nếu có, hoặc tạo issue tự do
4. Điền thông tin theo mẫu dưới đây

### Mẫu Báo Lỗi

**Tiêu đề:** `[Lỗi] TênPlugin - Mô tả ngắn`

```
## Mô Tả Lỗi
Mô tả rõ ràng lỗi gặp phải.

## Plugin
- Tên plugin: [Tên plugin]
- Tác giả: [Tên tác giả]
- Trang web: [URL trang web nguồn]

## Thông Tin Lỗi
- Chức năng bị lỗi: (Trang chủ / Chi tiết / Mục lục / Nội dung / Tìm kiếm)
- Thông báo lỗi: (ghi lại chính xác thông báo lỗi nếu có)
- Thời gian phát hiện: (ngày/tháng/năm)

## Tái Hiện Lỗi
Các bước để tái hiện lỗi:
1. Mở VBook
2. Chọn plugin [Tên plugin]
3. Chọn truyện [Tên truyện]
4. Ấn đọc chương → thấy lỗi

## Thông Tin Bổ Sung
- Phiên bản VBook: (ví dụ: 8.15)
- Thiết bị: (ví dụ: Xiaomi Redmi Note 10, Android 12)
- Màn hình lỗi: (có thể chụp ảnh màn hình và đính kèm)

## Kiểm Tra Ban Đầu
- [ ] Trang web nguồn vẫn hoạt động bình thường trên trình duyệt
- [ ] Plugin đã được cập nhật lần cuối: (bao lâu trước)
```

### Trước Khi Báo Lỗi

- ✅ Kiểm tra xem **trang web nguồn** còn hoạt động không (mở bằng trình duyệt)
- ✅ Tìm xem **issue tương tự** đã được báo cáo chưa
- ✅ Thử **cập nhật plugin** (nếu VBook có chức năng cập nhật plugin)
- ✅ **Khởi động lại** VBook trước khi báo lỗi

---

## Cảm Ơn

Một lần nữa, cảm ơn bạn đã đóng góp cho cộng đồng VBook! 🌟

Dù bạn đóng góp plugin mới, sửa lỗi, hay chỉ báo cáo vấn đề — tất cả đều giúp kho plugin ngày càng phong phú và chất lượng hơn.

**Happy coding!** 🚀

---

*Hướng dẫn này được cập nhật lần cuối: 2026*
