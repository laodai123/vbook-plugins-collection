# Truyện VN All-in-One 📚

**Plugin cho VBook Reader — tổng hợp truyện từ các trang truyện tiếng Việt**

## 📊 Nguồn dữ liệu

| Plugin | URL | Số truyện | Loại |
|--------|-----|-----------|------|
| **LNMTL** 🟢 | lnmtl.com | 891+ novels | Novel dịch Anh→Việt |
| **FoxTruyen** 🟢 | foxtruyen2.com | 10,000+ | Truyện tranh + chữ |

## 🎯 Tính năng

- ✅ Tự động phát hiện site từ URL
- ✅ Home: 50 truyện mới nhất từ LNMTL + FoxTruyen
- ✅ Detail: tên, tác giả, ảnh, thể loại, mô tả
- ✅ Search: tìm kiếm đồng thời 2 nguồn
- ✅ TOC: danh sách chapter
- ✅ Chap: nội dung chapter + xoá quảng cáo

## 📁 Cấu trúc

```
[Laodai123] - Truyện VN All-in-One/
├─ plugin.json      # Metadata
└─ src/
   ├─ home.js       → BookList()
   ├─ detail.js     → BookDetail()
   ├─ search.js     → BookList()
   ├─ toc.js        → BookList()
   └─ chap.js       → BookChapter()
```

## 🔧 Cài đặt

1. Tải ZIP từ [Releases](https://github.com/Laodai123/vbook-plugins-collection/releases)
2. VBook → Cài đặt → Plugin → Import ZIP
3. Hoặc copy thư mục vào `VBook/plugins/`

## 🛠️ Phát triển

Plugin dùng JS thuần, không build tool. Mỗi handler nhận `BookUrl` và gọi:
- `BookList(items[])` — danh sách (home, search, toc)
- `BookDetail(obj)` — chi tiết truyện
- `BookChapter(obj)` — nội dung chapter
