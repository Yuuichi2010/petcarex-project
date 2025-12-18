USE petcarex;

DELIMITER //

-- =====================================================
-- TRIGGERS
-- =====================================================

-- 1. Tự động cập nhật điểm tích lũy và hạng hội viên khi có hóa đơn mới
CREATE TRIGGER trg_CapNhatHoiVien_AfterInsert
AFTER INSERT ON HoaDon
FOR EACH ROW
BEGIN
    DECLARE v_DiemMoi INT;
    DECLARE v_TongChiTieuMoi DECIMAL(15,2);
    DECLARE v_HangMoi INT;
    
    -- Tính điểm mới
    SET v_DiemMoi = FLOOR((NEW.TongTien - NEW.KhuyenMai) / 50000);
    
    -- Cập nhật điểm và tổng chi tiêu
    UPDATE HoiVien
    SET DiemTichLuy = DiemTichLuy + v_DiemMoi,
        TongChiTieu = TongChiTieu + (NEW.TongTien - NEW.KhuyenMai)
    WHERE MaKhachHang = NEW.MaKhachHang;
    
    -- Lấy tổng chi tiêu mới
    SELECT TongChiTieu INTO v_TongChiTieuMoi
    FROM HoiVien
    WHERE MaKhachHang = NEW.MaKhachHang;
    
    -- Xác định hạng mới
    IF v_TongChiTieuMoi >= 12000000 THEN
        SET v_HangMoi = 3; -- VIP
    ELSEIF v_TongChiTieuMoi >= 5000000 THEN
        SET v_HangMoi = 2; -- Thân thiết
    ELSE
        SET v_HangMoi = 1; -- Cơ bản
    END IF;
    
    -- Cập nhật hạng
    UPDATE HoiVien
    SET MaHangHV = v_HangMoi
    WHERE MaKhachHang = NEW.MaKhachHang;
END //

-- 2. Giảm tồn kho khi bán sản phẩm
CREATE TRIGGER trg_GiamTonKho_AfterInsert
AFTER INSERT ON ChiTietHoaDonMuaHang
FOR EACH ROW
BEGIN
    UPDATE SanPham
    SET SoLuongTonKho = SoLuongTonKho - NEW.SoLuong
    WHERE MaSanPham = NEW.MaSanPham;
END //

-- 3. Giảm tồn kho vắc-xin khi tiêm
CREATE TRIGGER trg_GiamTonKhoVacXin_AfterInsert
AFTER INSERT ON LichSuTiemPhong
FOR EACH ROW
BEGIN
    DECLARE v_MaVacXin INT;
    
    SELECT MaVacXin INTO v_MaVacXin
    FROM MuiTiem
    WHERE MaMuiTiem = NEW.MaMuiTiem;
    
    UPDATE VacXin
    SET SoLuongTonKho = SoLuongTonKho - 1
    WHERE MaVacXin = v_MaVacXin;
END //

-- 4. Kiểm tra tồn kho trước khi bán
CREATE TRIGGER trg_KiemTraTonKho_BeforeInsert
BEFORE INSERT ON ChiTietHoaDonMuaHang
FOR EACH ROW
BEGIN
    DECLARE v_TonKho INT;
    
    SELECT SoLuongTonKho INTO v_TonKho
    FROM SanPham
    WHERE MaSanPham = NEW.MaSanPham;
    
    IF v_TonKho < NEW.SoLuong THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Khong du hang trong kho';
    END IF;
END //

-- 5. Tự động tạo hội viên khi thêm khách hàng mới
CREATE TRIGGER trg_TaoHoiVien_AfterInsert
AFTER INSERT ON KhachHang
FOR EACH ROW
BEGIN
    INSERT INTO HoiVien (MaKhachHang, DiemTichLuy, TongChiTieu, MaHangHV)
    VALUES (NEW.MaKhachHang, 0, 0, 1); -- Hạng Cơ bản
END //

DELIMITER ;
