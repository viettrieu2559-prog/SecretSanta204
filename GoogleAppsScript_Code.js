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
    var mode = (e && e.parameter && e.parameter.mode) ? String(e.parameter.mode).toLowerCase() : '';
    var isFastMode = (mode === 'fast');
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
          var valStr = (row[j] !== undefined && row[j] !== null) ? String(row[j]) : '';
          if (isFastMode && key === 'phongban' && valStr.indexOf('data:image') === 0) {
            obj[key] = '__IMG_REF__:' + valStr.length;
          } else {
            obj[key] = valStr;
          }
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
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(12000);
    var contents = e.postData ? e.postData.contents : '';
    var body = {};
    if (contents) {
      try { body = JSON.parse(contents); } catch (ex) { body = {}; }
    }

    var action = (e.parameter && e.parameter.action) || body.action || 'INSERT';
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Đảm bảo hàng tiêu đề chuẩn nếu sheet còn trống
    var requiredCols = ['thoigian', 'hoten', 'phongban', 'wishlist', 'blacklist', 'mssv', 'email', 'diem_tich_luoi', 'ngay_diem_danh_cuoi', 'vat_pham_so_huu', 'lich_su_doi_qua'];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(requiredCols);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h || '').trim().toLowerCase(); });

    // Tự động bổ sung các cột mới của hệ thống tích điểm & đổi quà nếu Sheet cũ chưa có
    var addedHeader = false;
    requiredCols.forEach(function(col) {
      if (headers.indexOf(col) === -1) {
        headers.push(col);
        sheet.getRange(1, headers.length).setValue(col);
        addedHeader = true;
      }
    });
    if (addedHeader) {
      data = sheet.getDataRange().getValues();
    }

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

      SpreadsheetApp.flush();
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

      SpreadsheetApp.flush();
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

      SpreadsheetApp.flush();
      return jsonResponse({ success: true, deleted: deletedCount });
    }

    // 4. GỬI EMAIL MẬT THƯ BỐC THĂM SECRET SANTA (SEND_EMAIL / SEND_BULK_EMAIL)
    if (action === 'SEND_EMAIL') {
      var toEmail = String(body.to || '').trim();
      var subject = String(body.subject || 'Mật thư Secret Santa 2026 - Phòng 204');
      var mailBody = String(body.body || '');
      if (!toEmail) return jsonResponse({ success: false, message: 'Missing recipient email' });
      MailApp.sendEmail({
        to: toEmail,
        subject: subject,
        body: mailBody
      });
      return jsonResponse({ success: true, sent: 1 });
    }

    if (action === 'SEND_BULK_EMAIL') {
      var list = Array.isArray(body.emails) ? body.emails : [];
      var sentCount = 0;
      list.forEach(function(item) {
        if (item && item.to) {
          MailApp.sendEmail({
            to: String(item.to).trim(),
            subject: String(item.subject || 'Mật thư Secret Santa 2026 - Phòng 204'),
            body: String(item.body || '')
          });
          sentCount++;
        }
      });
      return jsonResponse({ success: true, sent: sentCount });
    }

    return jsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function jsonResponse(data, status) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
