-- =====================================================
-- SINH DỮ LIỆU MẪU (70,000+ ROWS)
-- =====================================================

USE petcarex;

-- Tắt kiểm tra khóa ngoại tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- 1. CHI NHÁNH (10 chi nhánh)
INSERT INTO ChiNhanh (Ten, DiaChi, SDT, TGMoCua, TGDongCua) VALUES
('Chi Nhanh Quan 1', '123 Nguyen Hue, Q1, TP.HCM', '0281234567', '08:00:00', '20:00:00'),
('Chi Nhanh Quan 3', '456 Vo Van Tan, Q3, TP.HCM', '0282345678', '08:00:00', '20:00:00'),
('Chi Nhanh Quan 7', '789 Nguyen Thi Thap, Q7, TP.HCM', '0283456789', '08:00:00', '20:00:00'),
('Chi Nhanh Thu Duc', '321 Vo Van Ngan, Thu Duc, TP.HCM', '0284567890', '08:00:00', '20:00:00'),
('Chi Nhanh Binh Thanh', '654 Xo Viet Nghe Tinh, Binh Thanh', '0285678901', '08:00:00', '20:00:00'),
('Chi Nhanh Ha Noi', '147 Hoang Quoc Viet, Cau Giay, HN', '0243456789', '08:00:00', '20:00:00'),
('Chi Nhanh Da Nang', '258 Tran Phu, Hai Chau, Da Nang', '0236456789', '08:00:00', '20:00:00'),
('Chi Nhanh Can Tho', '369 30 Thang 4, Ninh Kieu, Can Tho', '0292456789', '08:00:00', '20:00:00'),
('Chi Nhanh Hai Phong', '741 Dinh Tien Hoang, Hong Bang, HP', '0225456789', '08:00:00', '20:00:00'),
('Chi Nhanh Nha Trang', '852 Tran Phu, Nha Trang', '0258456789', '08:00:00', '20:00:00');

-- 2. SẢN PHẨM (1000 sản phẩm)
DELIMITER //
CREATE PROCEDURE GenerateSanPham()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE loai VARCHAR(50);
    
    WHILE i <= 1000 DO
        SET loai = ELT(FLOOR(1 + RAND() * 3), 'Thuc An', 'Phu Kien', 'Thuoc');
        
        INSERT INTO SanPham (TenSanPham, LoaiSanPham, GiaBan, SoLuongTonKho)
        VALUES (
            CONCAT(loai, ' - SP', LPAD(i, 4, '0')),
            loai,
            ROUND(50000 + RAND() * 950000, -3),
            FLOOR(10 + RAND() * 490)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerateSanPham();

-- 3. VẮC-XIN (200 loại vắc-xin)
DELIMITER //
CREATE PROCEDURE GenerateVacXin()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE ten_vx VARCHAR(100);
    DECLARE loai_vx VARCHAR(50);
    
    WHILE i <= 200 DO
        SET loai_vx = ELT(FLOOR(1 + RAND() * 5), 'Phong Dich', 'Dai', 'Viem Gan', 'Lepto', 'Parvo');
        SET ten_vx = CONCAT('VacXin ', loai_vx, ' - V', LPAD(i, 3, '0'));
        
        INSERT INTO VacXin (TenVacXin, LoaiVacXin, NgaySanXuat, SoLuongTonKho)
        VALUES (
            ten_vx,
            loai_vx,
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 730) DAY),
            FLOOR(50 + RAND() * 450)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerateVacXin();

-- 4. MŨI TIÊM (500 mũi tiêm)
INSERT INTO MuiTiem (TenMuiTiem, Gia, MaVacXin)
SELECT 
    CONCAT('Mui ', v.TenVacXin),
    ROUND(150000 + RAND() * 350000, -3),
    v.MaVacXin
FROM VacXin v
LIMIT 500;

-- 5. GÓI TIÊM (50 gói)
INSERT INTO GoiTiem (TenGoi, SoThang, UuDai) VALUES
('Goi Tiem 3 Thang', 3, 5.00),
('Goi Tiem 6 Thang', 6, 8.00),
('Goi Tiem 12 Thang', 12, 12.00),
('Goi Tiem VIP 6 Thang', 6, 15.00),
('Goi Tiem VIP 12 Thang', 12, 20.00);

-- Liên kết gói tiêm với mũi tiêm
INSERT INTO GoiTiem_MuiTiem (MaGoi, MaMuiTiem)
SELECT g.MaGoi, m.MaMuiTiem
FROM GoiTiem g
CROSS JOIN MuiTiem m
WHERE m.MaMuiTiem <= 20
LIMIT 100;

-- 6. NHÂN VIÊN (500 nhân viên)
DELIMITER //
CREATE PROCEDURE GenerateNhanVien()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE ho_arr TEXT DEFAULT 'Nguyen,Tran,Le,Pham,Hoang,Phan,Vu,Dang,Bui,Do';
    DECLARE ten_arr TEXT DEFAULT 'An,Binh,Cuong,Dung,Hieu,Khanh,Linh,Minh,Nam,Quan';
    DECLARE chucvu VARCHAR(50);
    DECLARE v_MaNV INT;
    
    WHILE i <= 500 DO
        SET chucvu = ELT(FLOOR(1 + RAND() * 4), 'Bac Si', 'Nhan Vien Ban Hang', 'Le Tan', 'Quan Ly');
        
        INSERT INTO NhanVien (HoTen, NgaySinh, GioiTinhNV, NgayVaoLam, ChucVu, LuongCoBan, MaChiNhanh)
        VALUES (
            CONCAT(
                SUBSTRING_INDEX(SUBSTRING_INDEX(ho_arr, ',', FLOOR(1 + RAND() * 10)), ',', -1),
                ' Van ',
                SUBSTRING_INDEX(SUBSTRING_INDEX(ten_arr, ',', FLOOR(1 + RAND() * 10)), ',', -1)
            ),
            DATE_SUB(CURRENT_DATE, INTERVAL (20 + FLOOR(RAND() * 20)) YEAR),
            IF(RAND() > 0.5, 'Nam', 'Nu'),
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 1825) DAY),
            chucvu,
            ROUND(8000000 + RAND() * 12000000, -5),
            FLOOR(1 + RAND() * 10)
        );
        SET v_MaNV = LAST_INSERT_ID();
        
        -- Thêm vào bảng Bác Sĩ hoặc Nhân Viên Bán Hàng
        IF chucvu = 'Bac Si' THEN
            INSERT INTO BacSi (MaNV, ChuyenMon) 
            VALUES (v_MaNV, ELT(FLOOR(1 + RAND() * 3), 'Ngoai khoa', 'Noi khoa', 'Tong quat'));
        ELSEIF chucvu = 'Nhan Vien Ban Hang' THEN
            INSERT INTO NhanVienBanHang (MaNV) VALUES (v_MaNV);
        END IF;
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerateNhanVien();

-- 7. KHÁCH HÀNG (10,000 khách hàng)
DELIMITER //
CREATE PROCEDURE GenerateKhachHang()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE ho_arr TEXT DEFAULT 'Nguyen,Tran,Le,Pham,Hoang,Phan,Vu,Dang,Bui,Do';
    DECLARE ten_arr TEXT DEFAULT 'An,Binh,Chi,Dung,Em,Giang,Hoa,Khanh,Lan,Mai';
    DECLARE v_MaKhachHang INT;
    
    WHILE i <= 10000 DO
        INSERT INTO KhachHang (HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh, NgayDangKy)
        VALUES (
            CONCAT(
                SUBSTRING_INDEX(SUBSTRING_INDEX(ho_arr, ',', FLOOR(1 + RAND() * 10)), ',', -1),
                ' Thi ',
                SUBSTRING_INDEX(SUBSTRING_INDEX(ten_arr, ',', FLOOR(1 + RAND() * 10)), ',', -1)
            ),
            CONCAT('09', LPAD(FLOOR(RAND() * 100000000), 8, '0')),
            CONCAT('customer', i, '@email.com'),
            LPAD(FLOOR(RAND() * 1000000000000), 12, '0'),
            IF(RAND() > 0.5, 'Nam', 'Nu'),
            DATE_SUB(CURRENT_DATE, INTERVAL (18 + FLOOR(RAND() * 52)) YEAR),
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 1095) DAY)
        );
        SET v_MaKhachHang = LAST_INSERT_ID();
        
        -- Thêm vào bảng Hội Viên
        INSERT INTO HoiVien (MaKhachHang, DiemTichLuy, TongChiTieu, MaHangHV)
        VALUES (
            v_MaKhachHang,
            FLOOR(RAND() * 500),
            ROUND(RAND() * 20000000, -3),
            FLOOR(1 + RAND() * 3)
        );
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

CALL GenerateKhachHang();

-- 8. THÚ CƯNG (20,000 thú cưng)
DELIMITER //
CREATE PROCEDURE GenerateThuCung()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE ten_arr TEXT DEFAULT 'Milo,Lucky,Max,Bella,Lucy,Charlie,Luna,Cooper,Daisy,Buddy';
    DECLARE loai VARCHAR(50);
    DECLARE giong VARCHAR(50);
    
    WHILE i <= 20000 DO
        SET loai = ELT(FLOOR(1 + RAND() * 4), 'Cho', 'Meo', 'Tho', 'Chim');
        
        CASE loai
            WHEN 'Cho' THEN SET giong = ELT(FLOOR(1 + RAND() * 5), 'Golden Retriever', 'Husky', 'Corgi', 'Poodle', 'Bulldog');
            WHEN 'Meo' THEN SET giong = ELT(FLOOR(1 + RAND() * 5), 'British Shorthair', 'Persian', 'Munchkin', 'Siamese', 'Ragdoll');
            WHEN 'Tho' THEN SET giong = ELT(FLOOR(1 + RAND() * 3), 'Holland Lop', 'Mini Lop', 'Lionhead');
            ELSE SET giong = ELT(FLOOR(1 + RAND() * 3), 'Vet', 'Chao Mao', 'Buon');
        END CASE;
        
        INSERT INTO ThuCung (TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe, MaKhachHang)
        VALUES (
            SUBSTRING_INDEX(SUBSTRING_INDEX(ten_arr, ',', FLOOR(1 + RAND() * 10)), ',', -1),
            loai,
            giong,
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 3650) DAY),
            IF(RAND() > 0.5, 'Duc', 'Cai'),
            ELT(FLOOR(1 + RAND() * 3), 'Tot', 'Kha', 'Can theo doi'),
            FLOOR(1 + RAND() * 10000)
        );
        SET i = i + 1;
END WHILE;
END //
DELIMITER ;
CALL GenerateThuCung();
-- 9. HÓA ĐƠN (50,000 hóa đơn - từ 2022 đến 2025)
DELIMITER //
CREATE PROCEDURE GenerateHoaDon()
BEGIN
DECLARE i INT DEFAULT 1;
DECLARE ngay_lap DATETIME;
DECLARE ma_kh INT;
DECLARE ma_nv INT;
DECLARE ma_cn INT;
DECLARE tong_tien DECIMAL(15,2);
WHILE i <= 50000 DO
    -- Random ngày từ 2022-01-01 đến hiện tại
    SET ngay_lap = DATE_ADD('2022-01-01', INTERVAL FLOOR(RAND() * DATEDIFF(CURRENT_DATE, '2022-01-01')) DAY);
    SET ma_kh = FLOOR(1 + RAND() * 10000);
    SET ma_nv = (SELECT MaNV FROM NhanVienBanHang ORDER BY RAND() LIMIT 1);
    SET ma_cn = FLOOR(1 + RAND() * 10);
    SET tong_tien = ROUND(100000 + RAND() * 4900000, -3);
    
    INSERT INTO HoaDon (NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaKhachHang, MaNhanVienBanHang, MaChiNhanh)
    VALUES (
        ngay_lap,
        tong_tien,
        ROUND(tong_tien * RAND() * 0.15, -3),
        ELT(FLOOR(1 + RAND() * 3), 'Tien Mat', 'The', 'Chuyen Khoan'),
        ma_kh,
        ma_nv,
        ma_cn
    );
    
    SET i = i + 1;
END WHILE;
END //
DELIMITER ;
CALL GenerateHoaDon();
-- 10. CHI TIẾT HÓA ĐƠN (100,000+ chi tiết)
DELIMITER //
CREATE PROCEDURE GenerateChiTietHoaDon()
BEGIN
DECLARE i INT DEFAULT 1;
DECLARE ma_hd INT;
DECLARE loai_dv INT;
WHILE i <= 100000 DO
    SET ma_hd = FLOOR(1 + RAND() * 50000);
    SET loai_dv = FLOOR(1 + RAND() * 3);
    
    INSERT INTO ChiTietHoaDon (Gia, MaDV, MaHoaDon)
    VALUES (
        ROUND(100000 + RAND() * 1900000, -3),
        loai_dv,
        ma_hd
    );
    
    -- Thêm chi tiết tùy loại dịch vụ
    IF loai_dv = 1 THEN -- Mua hàng
        INSERT INTO ChiTietHoaDonMuaHang (MaChiTietHoaDon, SoLuong, MaSanPham)
        VALUES (LAST_INSERT_ID(), FLOOR(1 + RAND() * 5), FLOOR(1 + RAND() * 1000));
    ELSEIF loai_dv = 2 THEN -- Khám bệnh
        -- Tạo lịch sử khám trước
        INSERT INTO LichSuKhamBenh (NgayKham, TrieuChung, ChuanDoan, ToaThuoc, MaBacSi, MaThuCung)
        SELECT 
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 365) DAY),
            'Trieu chung benh',
            'Chuan doan',
            'Toa thuoc',
            (SELECT MaNV FROM BacSi ORDER BY RAND() LIMIT 1),
            FLOOR(1 + RAND() * 20000);
        
        INSERT INTO ChiTietHoaDonKhamBenh (MaChiTietHoaDon, MaLichSuKhamBenh)
        VALUES (LAST_INSERT_ID(), LAST_INSERT_ID());
    ELSE -- Tiêm phòng
        INSERT INTO ChiTietHoaDonTiemPhong (MaChiTietHoaDon, MaGoi)
        VALUES (LAST_INSERT_ID(), FLOOR(1 + RAND() * 5));
    END IF;
    
    SET i = i + 1;
END WHILE;
END //
DELIMITER ;
CALL GenerateChiTietHoaDon();
-- 11. LỊCH SỬ TIÊM PHÒNG (30,000 records)
DELIMITER //
CREATE PROCEDURE GenerateLichSuTiemPhong()
BEGIN
DECLARE i INT DEFAULT 1;
DECLARE ma_ct INT;
WHILE i <= 30000 DO
    SET ma_ct = (SELECT MaChiTietHoaDon FROM ChiTietHoaDonTiemPhong ORDER BY RAND() LIMIT 1);
    
    IF ma_ct IS NOT NULL THEN
        INSERT IGNORE INTO LichSuTiemPhong (MaChiTietHoaDon, STT, NgayTiem, LieuLuong, MaBacSi, MaThuCung, MaMuiTiem)
        VALUES (
            ma_ct,
            FLOOR(1 + RAND() * 3),
            DATE_SUB(CURRENT_DATE, INTERVAL FLOOR(RAND() * 180) DAY),
            CONCAT(ROUND(0.5 + RAND() * 2, 1), ' ml'),
            (SELECT MaNV FROM BacSi ORDER BY RAND() LIMIT 1),
            FLOOR(1 + RAND() * 20000),
            FLOOR(1 + RAND() * 500)
        );
    END IF;
    
    SET i = i + 1;
END WHILE;
END //
DELIMITER ;
CALL GenerateLichSuTiemPhong();
-- 12. ĐÁNH GIÁ (20,000 đánh giá)
INSERT INTO DanhGiaDichVu (MaHoaDon, STT, DiemChatLuongDV, ThaiDoNV, MucHaiLongTongThe, BinhLuan, NgayDanhGia, MaKhachHang)
SELECT
h.MaHoaDon,
1,
FLOOR(3 + RAND() * 3),
FLOOR(3 + RAND() * 3),
FLOOR(3 + RAND() * 3),
'Danh gia dich vu',
DATE_ADD(h.NgayLap, INTERVAL FLOOR(RAND() * 7) DAY),
h.MaKhachHang
FROM HoaDon h
LIMIT 20000;
-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;
-- Xóa các thủ tục tạm
DROP PROCEDURE IF EXISTS GenerateSanPham;
DROP PROCEDURE IF EXISTS GenerateVacXin;
DROP PROCEDURE IF EXISTS GenerateNhanVien;
DROP PROCEDURE IF EXISTS GenerateKhachHang;
DROP PROCEDURE IF EXISTS GenerateThuCung;
DROP PROCEDURE IF EXISTS GenerateHoaDon;
DROP PROCEDURE IF EXISTS GenerateChiTietHoaDon;
DROP PROCEDURE IF EXISTS GenerateLichSuTiemPhong;
