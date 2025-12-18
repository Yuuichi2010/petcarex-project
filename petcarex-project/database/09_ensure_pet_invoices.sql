-- =====================================================
-- ĐẢM BẢO MỖI THÚ CƯNG CÓ HÓA ĐƠN ĐỂ TEST
-- =====================================================

USE petcarex;

-- Tắt kiểm tra khóa ngoại tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TẠO HÓA ĐƠN KHÁM BỆNH CHO THÚ CƯNG
-- =====================================================

DELIMITER //

CREATE PROCEDURE EnsurePetInvoices()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_MaThuCung INT;
    DECLARE v_MaKhachHang INT;
    DECLARE v_MaBacSi INT;
    DECLARE v_MaChiNhanh INT;
    DECLARE v_MaNhanVien INT;
    DECLARE v_MaHoaDon INT;
    DECLARE v_MaChiTietHoaDon INT;
    DECLARE v_MaLichSuKhamBenh INT;
    DECLARE v_TongTien DECIMAL(15,2);
    DECLARE v_KhuyenMai DECIMAL(15,2);
    DECLARE v_SoLuongHoaDon INT DEFAULT 0;
    
    -- Cursor để lấy danh sách thú cưng
    DECLARE cur_pets CURSOR FOR 
        SELECT DISTINCT MaThuCung, MaKhachHang 
        FROM ThuCung 
        ORDER BY MaThuCung 
        LIMIT 2000; -- Tạo cho 2000 thú cưng đầu tiên để test
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur_pets;
    
    read_loop: LOOP
        FETCH cur_pets INTO v_MaThuCung, v_MaKhachHang;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Kiểm tra thú cưng này đã có hóa đơn chưa
        SELECT COUNT(*) INTO v_SoLuongHoaDon
        FROM HoaDon h
        JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
        JOIN ChiTietHoaDonKhamBenh ctkb ON cthd.MaChiTietHoaDon = ctkb.MaChiTietHoaDon
        JOIN LichSuKhamBenh lskb ON ctkb.MaLichSuKhamBenh = lskb.MaLichSuKhamBenh
        WHERE lskb.MaThuCung = v_MaThuCung;
        
        -- Nếu chưa có hóa đơn, tạo 1-3 hóa đơn cho thú cưng này
        IF v_SoLuongHoaDon = 0 THEN
            SET v_SoLuongHoaDon = FLOOR(1 + RAND() * 3); -- Tạo 1-3 hóa đơn
            
            WHILE v_SoLuongHoaDon > 0 DO
                -- Lấy bác sĩ ngẫu nhiên
                SELECT MaNV INTO v_MaBacSi
                FROM BacSi
                ORDER BY RAND()
                LIMIT 1;
                
                -- Lấy chi nhánh ngẫu nhiên
                SET v_MaChiNhanh = FLOOR(1 + RAND() * 10);
                
                -- Lấy nhân viên bán hàng ngẫu nhiên
                SELECT MaNV INTO v_MaNhanVien
                FROM NhanVienBanHang
                WHERE MaChiNhanh = v_MaChiNhanh
                ORDER BY RAND()
                LIMIT 1;
                
                -- Tính giá
                SET v_TongTien = ROUND(200000 + RAND() * 800000, -3);
                SET v_KhuyenMai = ROUND(v_TongTien * (RAND() * 0.1), -3);
                
                -- Tạo hóa đơn
                INSERT INTO HoaDon (NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaKhachHang, MaNhanVienBanHang, MaChiNhanh)
                VALUES (
                    DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY),
                    v_TongTien,
                    v_KhuyenMai,
                    ELT(FLOOR(1 + RAND() * 3), 'Tien Mat', 'The', 'Chuyen Khoan'),
                    v_MaKhachHang,
                    v_MaNhanVien,
                    v_MaChiNhanh
                );
                
                SET v_MaHoaDon = LAST_INSERT_ID();
                
                -- Tạo chi tiết hóa đơn (dịch vụ khám bệnh)
                INSERT INTO ChiTietHoaDon (Gia, MaDV, MaHoaDon)
                VALUES (v_TongTien, 2, v_MaHoaDon); -- MaDV = 2 là Khám bệnh
                
                SET v_MaChiTietHoaDon = LAST_INSERT_ID();
                
                -- Tạo lịch sử khám bệnh
                INSERT INTO LichSuKhamBenh (NgayKham, TrieuChung, ChuanDoan, ToaThuoc, NgayHenTaiKham, MaBacSi, MaThuCung)
                VALUES (
                    DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY),
                    CONCAT('Thú cưng có triệu chứng: ', ELT(FLOOR(1 + RAND() * 5), 'Ho, khó thở', 'Bỏ ăn, mệt mỏi', 'Sốt, run rẩy', 'Nôn mửa, tiêu chảy', 'Da có vết thương')),
                    CONCAT('Chẩn đoán: ', ELT(FLOOR(1 + RAND() * 5), 'Viêm đường hô hấp', 'Rối loạn tiêu hóa', 'Sốt virus', 'Nhiễm trùng da', 'Suy nhược')),
                    CONCAT('Toa thuốc: ', ELT(FLOOR(1 + RAND() * 3), 'Kháng sinh + Vitamin', 'Thuốc giảm đau + Bổ sung', 'Thuốc kháng viêm + Dinh dưỡng')),
                    DATE_ADD(CURRENT_DATE, INTERVAL FLOOR(7 + RAND() * 14) DAY),
                    v_MaBacSi,
                    v_MaThuCung
                );
                
                SET v_MaLichSuKhamBenh = LAST_INSERT_ID();
                
                -- Liên kết chi tiết hóa đơn với lịch sử khám bệnh
                INSERT INTO ChiTietHoaDonKhamBenh (MaChiTietHoaDon, MaLichSuKhamBenh)
                VALUES (v_MaChiTietHoaDon, v_MaLichSuKhamBenh);
                
                SET v_SoLuongHoaDon = v_SoLuongHoaDon - 1;
            END WHILE;
        END IF;
    END LOOP;
    
    CLOSE cur_pets;
END //

DELIMITER ;

-- =====================================================
-- TẠO HÓA ĐƠN TIÊM PHÒNG CHO THÚ CƯNG
-- =====================================================

DELIMITER //

CREATE PROCEDURE EnsurePetVaccinationInvoices()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_MaThuCung INT;
    DECLARE v_MaKhachHang INT;
    DECLARE v_MaBacSi INT;
    DECLARE v_MaChiNhanh INT;
    DECLARE v_MaNhanVien INT;
    DECLARE v_MaHoaDon INT;
    DECLARE v_MaChiTietHoaDon INT;
    DECLARE v_MaGoi INT;
    DECLARE v_TongTien DECIMAL(15,2);
    DECLARE v_KhuyenMai DECIMAL(15,2);
    DECLARE v_SoLuongHoaDon INT DEFAULT 0;
    DECLARE v_MaMuiTiem INT;
    
    -- Cursor để lấy danh sách thú cưng
    DECLARE cur_pets CURSOR FOR 
        SELECT DISTINCT MaThuCung, MaKhachHang 
        FROM ThuCung 
        ORDER BY MaThuCung 
        LIMIT 2000; -- Tạo cho 2000 thú cưng đầu tiên
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur_pets;
    
    read_loop: LOOP
        FETCH cur_pets INTO v_MaThuCung, v_MaKhachHang;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Kiểm tra thú cưng này đã có hóa đơn tiêm phòng chưa
        SELECT COUNT(*) INTO v_SoLuongHoaDon
        FROM HoaDon h
        JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
        JOIN ChiTietHoaDonTiemPhong cttp ON cthd.MaChiTietHoaDon = cttp.MaChiTietHoaDon
        JOIN LichSuTiemPhong lstp ON cttp.MaChiTietHoaDon = lstp.MaChiTietHoaDon
        WHERE lstp.MaThuCung = v_MaThuCung;
        
        -- Nếu chưa có hóa đơn tiêm phòng, tạo 1 hóa đơn
        IF v_SoLuongHoaDon = 0 AND RAND() > 0.5 THEN -- 50% thú cưng có tiêm phòng
            -- Lấy bác sĩ ngẫu nhiên
            SELECT MaNV INTO v_MaBacSi
            FROM BacSi
            ORDER BY RAND()
            LIMIT 1;
            
            -- Lấy chi nhánh ngẫu nhiên
            SET v_MaChiNhanh = FLOOR(1 + RAND() * 10);
            
            -- Lấy nhân viên bán hàng ngẫu nhiên
            SELECT MaNV INTO v_MaNhanVien
            FROM NhanVienBanHang
            WHERE MaChiNhanh = v_MaChiNhanh
            ORDER BY RAND()
            LIMIT 1;
            
            -- Lấy gói tiêm ngẫu nhiên
            SET v_MaGoi = FLOOR(1 + RAND() * 5);
            
            -- Tính giá (gói tiêm thường 500k - 2tr)
            SET v_TongTien = ROUND(500000 + RAND() * 1500000, -3);
            SET v_KhuyenMai = ROUND(v_TongTien * (RAND() * 0.15), -3);
            
            -- Tạo hóa đơn
            INSERT INTO HoaDon (NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaKhachHang, MaNhanVienBanHang, MaChiNhanh)
            VALUES (
                DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY),
                v_TongTien,
                v_KhuyenMai,
                ELT(FLOOR(1 + RAND() * 3), 'Tien Mat', 'The', 'Chuyen Khoan'),
                v_MaKhachHang,
                v_MaNhanVien,
                v_MaChiNhanh
            );
            
            SET v_MaHoaDon = LAST_INSERT_ID();
            
            -- Tạo chi tiết hóa đơn (dịch vụ tiêm phòng)
            INSERT INTO ChiTietHoaDon (Gia, MaDV, MaHoaDon)
            VALUES (v_TongTien, 3, v_MaHoaDon); -- MaDV = 3 là Tiêm phòng
            
            SET v_MaChiTietHoaDon = LAST_INSERT_ID();
            
            -- Liên kết với gói tiêm
            INSERT INTO ChiTietHoaDonTiemPhong (MaChiTietHoaDon, MaGoi)
            VALUES (v_MaChiTietHoaDon, v_MaGoi);
            
            -- Lấy mũi tiêm ngẫu nhiên
            SET v_MaMuiTiem = FLOOR(1 + RAND() * 500);
            
            -- Tạo lịch sử tiêm phòng
            INSERT INTO LichSuTiemPhong (MaChiTietHoaDon, STT, NgayTiem, LieuLuong, MaBacSi, MaThuCung, MaMuiTiem)
            VALUES (
                v_MaChiTietHoaDon,
                1,
                DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY),
                CONCAT(ROUND(0.5 + RAND() * 2, 1), ' ml'),
                v_MaBacSi,
                v_MaThuCung,
                v_MaMuiTiem
            );
        END IF;
    END LOOP;
    
    CLOSE cur_pets;
END //

DELIMITER ;

-- =====================================================
-- CHẠY CÁC PROCEDURE
-- =====================================================

-- Tạo hóa đơn khám bệnh cho thú cưng
CALL EnsurePetInvoices();

-- Tạo hóa đơn tiêm phòng cho thú cưng
CALL EnsurePetVaccinationInvoices();

-- =====================================================
-- XÓA CÁC PROCEDURE TẠM
-- =====================================================

DROP PROCEDURE IF EXISTS EnsurePetInvoices;
DROP PROCEDURE IF EXISTS EnsurePetVaccinationInvoices;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- KIỂM TRA KẾT QUẢ
-- =====================================================

-- Đếm số thú cưng có hóa đơn khám bệnh
SELECT 
    'Thú cưng có hóa đơn khám bệnh' as Loai,
    COUNT(DISTINCT lskb.MaThuCung) as SoLuong
FROM LichSuKhamBenh lskb
JOIN ChiTietHoaDonKhamBenh ctkb ON lskb.MaLichSuKhamBenh = ctkb.MaLichSuKhamBenh;

-- Đếm số thú cưng có hóa đơn tiêm phòng
SELECT 
    'Thú cưng có hóa đơn tiêm phòng' as Loai,
    COUNT(DISTINCT lstp.MaThuCung) as SoLuong
FROM LichSuTiemPhong lstp;

-- Xem ví dụ hóa đơn của thú cưng đầu tiên
SELECT 
    h.MaHoaDon,
    h.NgayLap,
    h.TongTien,
    h.KhuyenMai,
    tc.TenThuCung,
    CASE 
        WHEN ctkb.MaLichSuKhamBenh IS NOT NULL THEN 'Khám bệnh'
        WHEN cttp.MaGoi IS NOT NULL THEN 'Tiêm phòng'
        ELSE 'Mua hàng'
    END as LoaiDichVu
FROM HoaDon h
JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
LEFT JOIN ChiTietHoaDonKhamBenh ctkb ON cthd.MaChiTietHoaDon = ctkb.MaChiTietHoaDon
LEFT JOIN LichSuKhamBenh lskb ON ctkb.MaLichSuKhamBenh = lskb.MaLichSuKhamBenh
LEFT JOIN ThuCung tc ON lskb.MaThuCung = tc.MaThuCung
LEFT JOIN ChiTietHoaDonTiemPhong cttp ON cthd.MaChiTietHoaDon = cttp.MaChiTietHoaDon
LEFT JOIN LichSuTiemPhong lstp ON cttp.MaChiTietHoaDon = lstp.MaChiTietHoaDon
WHERE (lskb.MaThuCung IS NOT NULL OR lstp.MaThuCung IS NOT NULL)
ORDER BY h.MaHoaDon DESC
LIMIT 10;

