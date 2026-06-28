# Truyện VN All-in-One Plugin 📚

**Plugin cho VBook Reader — tổng hợp truyện từ các trang truyện tiếng Việt**

## 📊 Nguồn dữ liệu tích hợp

| Nguồn | URL | Số truyện | Loại |
|-------|-----|-----------|------|
| **LNMTL** 🟢 | lnmtl.com | 891+ novels | Novel translation (EN→VN) |
| **FoxTruyen** 🟢 | foxtruyen2.com / truyenggg.com | 10,000+ stories | Truyện tranh + chữ Việt |

## 🎯 Tính năng

- ✅ **Tự động phát hiện nguồn** từ URL
- ✅ **Home**: Hiển thị danh sách truyện mới nhất từ cả 2 nguồn
- ✅ **Detail**: Lấy thông tin chi tiết (tên, tác giả, thumbnail, mô tả)
- ✅ **Search**: Tìm kiếm đồng thời trên cả 2 nguồn
- ✅ **TOC**: Danh sách chapter
- ✅ **Chap**: Đọc nội dung chapter với xoá quảng cáo

## 📁 Cấu trúc plugin

```
[Laodai123] - Truyện VN All-in-One/
├─ plugin.json       # Metadata + script mapping
├─ icon.png          # App icon
└─ src/
   ├─ home.js        # Danh sách truyện → BookList()
   ├─ detail.js      # Chi tiết truyện → BookDetail()
   ├─ search.js      # Tìm kiếm → BookList()
   ├─ toc.js         # Danh sách chapter → BookList()
   └─ chap.js        # Nội dung chapter → BookChapter()
```

## 🔧 Cài đặt

1. Tải file `.zip` từ [Releases](https://github.com/Laodai123/vbook-plugins-collection/releases)
2. Mở VBook → Cài đặt → Plugin → Import file `.zip`
3. Kích hoạt "Truyện VN All-in-One"

Hoặc clone repo và copy thư mục vào `VBook/plugins/`:

```bash
git clone https://github.com/Laodai123/vbook-plugins-collection.git
cp -r "vbook-plugins-collection/[Laodai123] - Truyện VN All-in-One" /sdcard/VBook/plugins/
```

## 🛠️ Phát triển

Script sử dụng JavaScript thuần (không cần build tool). Mỗi file handler nhận `BookUrl` và gọi callback:
- `BookList(items[])` — trả về danh sách (home, search, toc)
- `BookDetail(obj)` — trả về chi tiết truyện
- `BookChapter(obj)` — trả về nội dung chapter

## 📌 Ghi chú

- Plugin chưa mã hoá (`encrypt: false`) — có thể xem source, học hỏi, phát triển thêm
- Một số site khác (metruyenchu.com, waka.vn, truyenqq.com.vn) đang bị Cloudflare chặn
- Nếu bạn muốn thêm nguồn mới, xem `home.js` để hiểu pattern
