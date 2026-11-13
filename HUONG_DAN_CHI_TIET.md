# HƯỚNG DẪN SỬ DỤNG & ĐỒNG BỘ SECRET SANTA 2026 (CLOUD + SQL SERVER SSMS)

## 1. Khắc phục lỗi SheetDB HTTP 429 & Đồng bộ Điện Thoại ↔ Máy Tính ↔ GitHub Pages
Link SheetDB cũ (`fnqbi32e6xcc0`) đang bị giới hạn **HTTP 429 (hết 500 lượt miễn phí/tháng)**. Để tất cả mọi người (PC, điện thoại 4G/Wi-Fi, GitHub Pages) **luôn nhìn thấy cùng danh sách thành viên, điểm BXH, cây thông, bảng tin và chat**:

### Cách khuyên dùng (Miễn phí 20,000 lượt/ngày): Google Apps Script
1. Mở Google Sheet chứa 5 cột ở dòng 1: `thoigian`, `hoten`, `phongban`, `wishlist`, `blacklist`.
2. Trên Google Sheet chọn **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Copy toàn bộ mã trong file [GoogleAppsScript_Code.js](file:///e:/Check/GoogleAppsScript_Code.js) dán vào `Code.gs` và lưu (`Ctrl + S`).
4. Chọn **Deploy → New deployment**:
   - **Select type**: `Web app`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
5. Copy đường link dạng `https://script.google.com/macros/s/.../exec`.
6. Mở web Secret Santa → chọn tab **🛡️ Admin** (mật khẩu mặc định: `1234`) → dán link vào ô **Địa chỉ API Database** → bấm **`💾 Lưu & Kiểm Tra`**.
   - Ngoài ra bạn có thể dán vào `DEFAULT_SHEETDB_API` trong [index.html](file:///e:/Check/index.html) trước khi đẩy lên GitHub để mọi người mở link là dùng được ngay.

> **Mẹo chống lỗi link GitHub Pages chỉ hiện chữ `SecretSanta204-3-`:**
> Đảm bảo đẩy `index.html` và `christmas-bg.jpg` lên **thư mục gốc (root)** của repo (hoặc truy cập đúng đường dẫn `/Check/index.html` nếu để trong thư mục `Check`).

---

## 2. Dùng với Microsoft SQL Server (SSMS) trên máy tính
Bạn có **2 cách** dùng trực tiếp với SQL Server Management Studio (SSMS):

### Cách A: Xuất file `.SQL` nạp vào SSMS bất cứ lúc nào
1. Vào tab **🛡️ Admin (`1234`)** trên web.
2. Bấm nút **`📄 Xuất File .SQL (SSMS)`** → tải về `SecretSanta2026_SSMS_Database.sql`.
3. Mở file này bằng **SQL Server Management Studio (SSMS)** → nhấn **F5 (Execute)** để tạo & cập nhật CSDL `SecretSanta2026` gồm 5 bảng chuẩn:
   - `dbo.SinhVien`
   - `dbo.CheckinQua`
   - `dbo.BangTin`
   - `dbo.KenhChat`
   - `dbo.SecretSantaRows`

### Cách B: Chạy Backend SQL Server trực tiếp trên máy (`localhost:8080`)
1. Chạy file [run_sqlserver_backend.bat](file:///e:/Check/run_sqlserver_backend.bat) (gọi [start_sqlserver_api.ps1](file:///e:/Check/start_sqlserver_api.ps1), tự khởi tạo schema từ [sqlserver_setup.sql](file:///e:/Check/sqlserver_setup.sql)).
2. Truy cập `http://localhost:8080/index.html` (hoặc trong Admin bấm nút **`🗄️ SQL Server (8080)`** nếu đang chạy Live Server HTTP).
   - Lưu ý: Khi phát hành lên HTTPS GitHub Pages cho điện thoại ở xa dùng, hãy dùng **Google Apps Script** (Cách 1) vì trình duyệt HTTPS không thể gọi trực tiếp `http://localhost:8080`.
