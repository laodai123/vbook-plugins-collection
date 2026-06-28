# 📚 Truyện VN All-in-One

**Plugin VBook Reader** tổng hợp truyện từ **7+ nguồn** khác nhau trong một plugin duy nhất. Tự động phát hiện và chuyển đổi nguồn dựa trên URL.

## 🌐 Nguồn hỗ trợ

| Nguồn | Site | Loại | Số lượng | API |
|---|---|---|---|---|
| **LNMTL** | lnmtl.com | Light Novel EN | ~891 | JSON static |
| **FoxTruyen2** | foxtruyen2.com | Truyện tranh VN | 10,000+ | HTML parse |
| **TruyenGGG** | truyenggg.com | Mirror FoxTruyen | - | HTML parse |
| **Qidian/起点** | qidian.com | Tiếng Trung | Hàng triệu | Browser + STV |
| **Fanqie/番茄** | fanqienovel.com | Tiếng Trung | Hàng triệu | STV proxy + AES |
| **69shu/69书吧** | 69shuba.com | Tiếng Trung | Hàng chục ngàn | STV proxy |
| **Ptwxz/飘天** | piaotia.com | Tiếng Trung | Hàng chục ngàn | STV proxy |
| **Qimao/七猫** | qimao.7mao.com | Tiếng Trung | Hàng triệu | STV proxy |

## 🚀 Cài đặt

Tải file `.zip` release mới nhất và import vào VBook Reader:
```
https://github.com/laodai123/vbook-plugins-collection/releases/latest
```

## 📂 Cấu trúc

```
[Laodai123] - Truyện VN All-in-One/
├── plugin.json      # Cấu hình plugin (metadata, script mappings)
├── README.md        # File này
└── src/
    ├── libs.js      # String.format, $, $$, cleanHtml, type checker
    ├── home.js      # Trang chủ / danh sách truyện
    ├── detail.js    # Chi tiết truyện (cover, author, desc, status, genre)
    ├── search.js    # Tìm kiếm (chạy song song 7 nguồn)
    ├── toc.js       # Mục lục chương
    └── chap.js      # Nội dung chương (cleanHtml, xóa quảng cáo)
```

## 🔧 Cách hoạt động

Plugin hoạt động theo cơ chế **URL-based routing**:

1. **Regex** trong `plugin.json` match với URL của nhiều domain
2. Mỗi file `.js` (`home/detail/search/toc/chap`) sẽ:
   - Phát hiện site dựa vào URL (regex test)
   - Route tới hàm xử lý riêng cho từng nguồn
   - Trả về dữ liệu qua callback VBook (`BookList`, `BookDetail`, `BookChapter`)

### Phát hiện site:
```javascript
function detectSite() {
  if (/lnmtl\.com/i.test(url)) return 'lnmtl';
  if (/foxtruyen2\.com|truyenggg\.com/i.test(url)) return 'foxtruyen';
  if (/qidian\.(com|cn)/i.test(url)) return 'qidian';
  if (/fanqie|fanqienovel/i.test(url)) return 'fanqie';
  if (/69shu|69shuba/i.test(url)) return '69shu';
  if (/ptwxz|piaotia|piaotian/i.test(url)) return 'ptwxz';
  if (/qimao|7mao/i.test(url)) return 'qimao';
  return 'unknown';
}
```

## 🔌 Nguồn Trung Quốc qua STV Proxy

Các nguồn **Qidian, Fanqie, 69shu, Ptwxz, Qimao** sử dụng **SangTacViet (STV) proxy** để:
- Tránh bị chặn IP
- Vượt Cloudflare
- Lấy dữ liệu đã được giải mã sẵn (AES cho Fanqie/Qimao)
- Format chapter chuẩn chữ Hán

**STV API endpoints:**
```
http://14.225.254.182/
  truyen/{source}/1/{bookId}/{chapterId}/     # Detail/chapter
  index.php?ngmar=chapterlist&h={source}&bookid={id}&sajax=getchapterlist
  index.php?ngmar=chapter&h={source}&bookid={id}&chapterid={cid}
  search/{source}/1/{query}                    # Search
```

## 🆚 Version History

| Version | Thay đổi |
|---|---|
| **v2** (current) | Thêm Qidian + Fanqie + 69shu + Ptwxz + Qimao (merge từ plugin 5in1 của daik) |
| **v1** | Initial: LNMTL + FoxTruyen2 + TruyenGGG |

## 📜 License

MIT - Tự do sử dụng, sửa đổi, phân phối.

## 👤 Tác giả

- **Laodai123** - Maintainer & developer
- **daik** - Tác giả gốc plugin 5in1 (merged vào v2)