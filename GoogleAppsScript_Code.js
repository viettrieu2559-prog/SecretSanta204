// =============================================================================
// MÃ NGUỒN GOOGLE APPS SCRIPT CHO SỰ KIỆN SECRET SANTA 2026
// DÙNG MIỄN PHÍ VĨNH VIỄN - HỖ TRỢ 20,000 LƯỢT GỌI/NGÀY - KHÔNG LO 429 HẾT HẠN MỨC!
// =============================================================================
// CÁCH CÀI ĐẶT TRONG 1 PHÚT:
// 1. Mở Google Sheets của bạn.
// 2. Bấm vào menu "Tiện ích mở rộng" (Extensions) -> chọn "Apps Script".
// 3. Xóa hết mã cũ trong cửa sổ đó, dán toàn bộ đoạn mã bên dưới vào.
// 4. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> chọn "Tùy chọn triển khai mới" (New deployment).
// 5. Chọn loại: "Ứng dụng web" (Web app).
//    - Mô tả: Secret Santa 2026 API
//    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
//    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG!
// 6. Bấm "Triển khai" (Deploy) -> Bấm "Cấp quyền truy cập" (Authorize access) -> Chọn tài khoản Google của bạn -> Bấm "Advanced" -> "Go to Secret Santa (unsafe)" -> Bấm "Allow".
// 7. Copy đường link "URL ứng dụng web" (dạng https://script.google.com/macros/s/..../exec).
// 8. Mở web Secret Santa -> Vào Admin (mật khẩu 1234) -> Dán link này vào ô API URL -> Bấm "💾 Lưu URL"!
// =============================================================================

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return jsonResponse([]);
    }

    var headers = data[0].map(function(h) { return String(h || '').trim().toLowerCase(); });
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Bỏ qua dòng trống hoàn toàn
      var hasVal = row.some(function(cell) { return String(cell || '').trim() !== ''; });
      if (!hasVal) continue;

      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        if (key) {
          obj[key] = (row[j] !== undefined && row[j] !== null) ? String(row[j]) : '';
        }
      }
      rows.push(obj);
    }

    return jsonResponse(rows);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '';
    var body = {};
    if (contents) {
      try { body = JSON.parse(contents); } catch (ex) { body = {}; }
    }

    var action = (e.parameter && e.parameter.action) || body.action || 'INSERT';
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Đảm bảo hàng tiêu đề chuẩn nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['thoigian', 'hoten', 'phongban', 'wishlist', 'blacklist']);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h || '').trim().toLowerCase(); });

    // 1. THÊM BẢN GHI MỚI (INSERT)
    if (action === 'INSERT') {
      var items = body.data || body;
      if (!Array.isArray(items)) items = [items];
      var added = 0;

      items.forEach(function(item) {
        if (!item) return;
        var rowArr = [];
        headers.forEach(function(h) {
          rowArr.push(item[h] !== undefined ? String(item[h]) : '');
        });
        sheet.appendRow(rowArr);
        added++;
      });

      return jsonResponse({ success: true, created: added });
    }

    // 2. CẬP NHẬT BẢN GHI (PATCH / UPDATE)
    if (action === 'PATCH' || action === 'UPDATE') {
      var colName = String(body.column || body.key || 'hoten').toLowerCase();
      var colVal = String(body.value || '');
      var patchData = body.data || {};
      var colIdx = headers.indexOf(colName);
      var updatedCount = 0;

      if (colIdx >= 0 && colVal) {
        for (var r = 1; r < data.length; r++) {
          if (String(data[r][colIdx] || '').trim() === colVal.trim()) {
            headers.forEach(function(h, cIdx) {
              if (patchData[h] !== undefined) {
                sheet.getRange(r + 1, cIdx + 1).setValue(String(patchData[h]));
              }
            });
            updatedCount++;
          }
        }
      }

      return jsonResponse({ success: true, updated: updatedCount });
    }

    // 3. XÓA BẢN GHI (DELETE)
    if (action === 'DELETE') {
      var delCol = String(body.column || body.key || 'hoten').toLowerCase();
      var delVal = String(body.value || '');
      var delColIdx = headers.indexOf(delCol);
      var deletedCount = 0;

      if (delColIdx >= 0 && delVal) {
        // Duyệt từ dưới lên để không bị lệch chỉ số dòng khi xóa
        for (var r = data.length - 1; r >= 1; r--) {
          if (String(data[r][delColIdx] || '').trim() === delVal.trim()) {
            sheet.deleteRow(r + 1);
            deletedCount++;
          }
        }
      }

      return jsonResponse({ success: true, deleted: deletedCount });
    }

    return jsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function jsonResponse(data, status) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
