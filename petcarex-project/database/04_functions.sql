USE petcarex;

DELIMITER //

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Tính tổng chi tiêu của khách hàng trong khoảng thời gian
CREATE FUNCTION fn_TongChiTieuKhachHang(
    p_MaKhachHang INT,
    p_TuNgay DATE,
    p_DenNgay DATE
)
RETURNS DECIMAL(15,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TongChiTieu DECIMAL(15,2);
    
    SELECT COALESCE(SUM(TongTien - KhuyenMai), 0)
    INTO v_TongChiTieu
    FROM HoaDon
    WHERE MaKhachHang = p_MaKhachHang
        AND DATE(NgayLap) BETWEEN p_TuNgay AND p_DenNgay;
    
    RETURN v_TongChiTieu;
END //

-- Tính hạng hội viên dựa trên tổng chi tiêu
CREATE FUNCTION fn_XacDinhHangHoiVien(
    p_TongChiTieu DECIMAL(15,2)
)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_HangHV VARCHAR(50);
    
    IF p_TongChiTieu >= 12000000 THEN
        SET v_HangHV = 'VIP';
    ELSEIF p_TongChiTieu >= 5000000 THEN
        SET v_HangHV = 'Than Thiet';
    ELSE
        SET v_HangHV = 'Co Ban';
    END IF;
    
    RETURN v_HangHV;
END //

-- Tính điểm tích lũy (1 điểm = 50,000 VNĐ)
CREATE FUNCTION fn_TinhDiemTichLuy(
    p_SoTien DECIMAL(15,2)
)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN FLOOR(p_SoTien / 50000);
END //

-- Kiểm tra số lượng tồn kho
CREATE FUNCTION fn_KiemTraTonKho(
    p_MaSanPham INT
)
RETURNS VARCHAR(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_SoLuong INT;
    DECLARE v_TinhTrang VARCHAR(20);
    
    SELECT SoLuongTonKho INTO v_SoLuong
    FROM SanPham
    WHERE MaSanPham = p_MaSanPham;
    
    IF v_SoLuong IS NULL THEN
        SET v_TinhTrang = 'Khong ton tai';
    ELSEIF v_SoLuong = 0 THEN
        SET v_TinhTrang = 'Het hang';
    ELSEIF v_SoLuong < 50 THEN
        SET v_TinhTrang = 'Sap het';
    ELSEIF v_SoLuong < 100 THEN
        SET v_TinhTrang = 'Can nhap';
    ELSE
        SET v_TinhTrang = 'Du';
    END IF;
    
    RETURN v_TinhTrang;
END //

-- Tính tuổi thú cưng
CREATE FUNCTION fn_TinhTuoiThuCung(
    p_NgaySinh DATE
)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_NgaySinh, CURRENT_DATE);
END //

DELIMITER ;
