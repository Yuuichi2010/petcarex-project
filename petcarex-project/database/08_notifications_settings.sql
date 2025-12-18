USE petcarex;

-- =====================================================
-- BẢNG THÔNG BÁO
-- =====================================================

CREATE TABLE ThongBao (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    TieuDe VARCHAR(255) NOT NULL,
    NoiDung TEXT,
    LoaiThongBao VARCHAR(50), -- 'HoaDon', 'LichHen', 'HeThong', 'KhuyenMai'
    DoUuTien VARCHAR(20) DEFAULT 'Binh thuong', -- 'Cao', 'Binh thuong', 'Thap'
    TrangThai VARCHAR(20) DEFAULT 'Chua doc', -- 'Chua doc', 'Da doc'
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaNguoiNhan INT, -- NULL = gửi tất cả
    MaLienKet INT, -- ID liên kết (MaHoaDon, MaLichHen, etc)
    FOREIGN KEY (MaNguoiNhan) REFERENCES NhanVien(MaNV),
    INDEX idx_thongbao_nguoinhan (MaNguoiNhan),
    INDEX idx_thongbao_trangthai (TrangThai),
    INDEX idx_thongbao_ngaytao (NgayTao)
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG CÀI ĐẶT HỆ THỐNG
-- =====================================================

CREATE TABLE CaiDatHeThong (
    MaCaiDat INT AUTO_INCREMENT PRIMARY KEY,
    TenCaiDat VARCHAR(100) UNIQUE NOT NULL,
    GiaTri TEXT,
    MoTa TEXT,
    LoaiCaiDat VARCHAR(50), -- 'HeThong', 'Email', 'ThanhToan', 'KhuyenMai'
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    NguoiCapNhat INT,
    FOREIGN KEY (NguoiCapNhat) REFERENCES NhanVien(MaNV)
) ENGINE=InnoDB;

-- Insert dữ liệu cài đặt mặc định
INSERT INTO CaiDatHeThong (TenCaiDat, GiaTri, MoTa, LoaiCaiDat) VALUES
('TenHeThong', 'PetCareX', 'Tên hiển thị của hệ thống', 'HeThong'),
('EmailHeThong', 'admin@petcarex.vn', 'Email chính của hệ thống', 'Email'),
('SDTHotline', '1900-xxxx', 'Số điện thoại hotline', 'HeThong'),
('DiaChiTruSo', '123 Nguyen Hue, Q1, TP.HCM', 'Địa chỉ trụ sở chính', 'HeThong'),
('TyLeDiemTichLuy', '50000', 'Số tiền = 1 điểm (VNĐ)', 'KhuyenMai'),
('UuDaiHangThanThiet', '10', 'Ưu đãi hạng Thân thiết (%)', 'KhuyenMai'),
('UuDaiHangVIP', '15', 'Ưu đãi hạng VIP (%)', 'KhuyenMai'),
('ChiTieuDatHangThanThiet', '5000000', 'Chi tiêu để đạt hạng Thân thiết (VNĐ)', 'KhuyenMai'),
('ChiTieuDatHangVIP', '12000000', 'Chi tiêu để đạt hạng VIP (VNĐ)', 'KhuyenMai'),
('ChiTieuGiuHangThanThiet', '3000000', 'Chi tiêu để giữ hạng Thân thiết/năm (VNĐ)', 'KhuyenMai'),
('ChiTieuGiuHangVIP', '8000000', 'Chi tiêu để giữ hạng VIP/năm (VNĐ)', 'KhuyenMai'),
('ThoiGianMoCua', '08:00', 'Giờ mở cửa mặc định', 'HeThong'),
('ThoiGianDongCua', '20:00', 'Giờ đóng cửa mặc định', 'HeThong'),
('BaoTriHeThong', 'false', 'Chế độ bảo trì hệ thống', 'HeThong'),
('PhienBan', '1.0.0', 'Phiên bản hệ thống', 'HeThong');

-- =====================================================
-- BẢNG LỊCH SỬ THAO TÁC
-- =====================================================

CREATE TABLE LichSuThaoTac (
    MaLichSu INT AUTO_INCREMENT PRIMARY KEY,
    MaNhanVien INT,
    HanhDong VARCHAR(50), -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    BangThaoTac VARCHAR(50), -- Tên bảng bị thao tác
    MaBanGhi INT, -- ID của bản ghi
    NoiDungCu TEXT, -- Dữ liệu trước khi thay đổi
    NoiDungMoi TEXT, -- Dữ liệu sau khi thay đổi
    DiaChi_IP VARCHAR(50),
    ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNV),
    INDEX idx_lichsu_nhanvien (MaNhanVien),
    INDEX idx_lichsu_thoigian (ThoiGian),
    INDEX idx_lichsu_hanhdong (HanhDong)
) ENGINE=InnoDB;

-- =====================================================
-- STORED PROCEDURES CHO THÔNG BÁO
-- =====================================================

DELIMITER //

-- Tạo thông báo mới
CREATE PROCEDURE sp_TaoThongBao(
    IN p_TieuDe VARCHAR(255),
    IN p_NoiDung TEXT,
    IN p_LoaiThongBao VARCHAR(50),
    IN p_DoUuTien VARCHAR(20),
    IN p_MaNguoiNhan INT,
    IN p_MaLienKet INT
)
BEGIN
    INSERT INTO ThongBao (TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaNguoiNhan, MaLienKet)
    VALUES (p_TieuDe, p_NoiDung, p_LoaiThongBao, p_DoUuTien, p_MaNguoiNhan, p_MaLienKet);
END //

-- Đánh dấu đã đọc
CREATE PROCEDURE sp_DanhDauDaDoc(
    IN p_MaThongBao INT
)
BEGIN
    UPDATE ThongBao
    SET TrangThai = 'Da doc'
    WHERE MaThongBao = p_MaThongBao;
END //

-- Đánh dấu tất cả đã đọc
CREATE PROCEDURE sp_DanhDauTatCaDaDoc(
    IN p_MaNguoiNhan INT
)
BEGIN
    UPDATE ThongBao
    SET TrangThai = 'Da doc'
    WHERE (MaNguoiNhan = p_MaNguoiNhan OR MaNguoiNhan IS NULL)
        AND TrangThai = 'Chua doc';
END //

-- Lấy thông báo chưa đọc
CREATE PROCEDURE sp_LayThongBaoChuaDoc(
    IN p_MaNguoiNhan INT
)
BEGIN
    SELECT *
    FROM ThongBao
    WHERE (MaNguoiNhan = p_MaNguoiNhan OR MaNguoiNhan IS NULL)
        AND TrangThai = 'Chua doc'
    ORDER BY DoUuTien DESC, NgayTao DESC;
END //

-- Lấy tất cả thông báo
CREATE PROCEDURE sp_LayTatCaThongBao(
    IN p_MaNguoiNhan INT,
    IN p_Limit INT,
    IN p_Offset INT
)
BEGIN
    SELECT *
    FROM ThongBao
    WHERE (MaNguoiNhan = p_MaNguoiNhan OR MaNguoiNhan IS NULL)
    ORDER BY NgayTao DESC
    LIMIT p_Limit OFFSET p_Offset;
END //

-- Xóa thông báo cũ (> 30 ngày)
CREATE PROCEDURE sp_XoaThongBaoCu()
BEGIN
    DELETE FROM ThongBao
    WHERE TrangThai = 'Da doc'
        AND DATEDIFF(CURRENT_DATE, DATE(NgayTao)) > 30;
END //

DELIMITER ;

-- =====================================================
-- TRIGGER TẠO THÔNG BÁO TỰ ĐỘNG
-- =====================================================

DELIMITER //

-- Thông báo khi có hóa đơn mới
CREATE TRIGGER trg_ThongBaoHoaDonMoi
AFTER INSERT ON HoaDon
FOR EACH ROW
BEGIN
    DECLARE v_TenKhachHang VARCHAR(100);
    DECLARE v_TenChiNhanh VARCHAR(100);
    
    SELECT HoTen INTO v_TenKhachHang
    FROM KhachHang WHERE MaKhachHang = NEW.MaKhachHang;
    
    SELECT Ten INTO v_TenChiNhanh
    FROM ChiNhanh WHERE MaChiNhanh = NEW.MaChiNhanh;
    
    INSERT INTO ThongBao (TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaLienKet)
    VALUES (
        'Hóa đơn mới',
        CONCAT('Hóa đơn #', NEW.MaHoaDon, ' từ khách hàng ', v_TenKhachHang, ' tại ', v_TenChiNhanh),
        'HoaDon',
        'Binh thuong',
        NEW.MaHoaDon
    );
END //

-- Thông báo sản phẩm sắp hết hàng
CREATE TRIGGER trg_ThongBaoSapHetHang
AFTER UPDATE ON SanPham
FOR EACH ROW
BEGIN
    IF NEW.SoLuongTonKho < 50 AND OLD.SoLuongTonKho >= 50 THEN
        INSERT INTO ThongBao (TieuDe, NoiDung, LoaiThongBao, DoUuTien, MaLienKet)
        VALUES (
            'Cảnh báo tồn kho',
            CONCAT('Sản phẩm "', NEW.TenSanPham, '" sắp hết hàng (Còn ', NEW.SoLuongTonKho, ')'),
            'HeThong',
            'Cao',
            NEW.MaSanPham
        );
    END IF;
END //

DELIMITER ;

-- =====================================================
-- DỮ LIỆU MẪU THÔNG BÁO
-- =====================================================

INSERT INTO ThongBao (TieuDe, NoiDung, LoaiThongBao, DoUuTien, TrangThai) VALUES
('Chào mừng đến với PetCareX', 'Hệ thống quản lý trung tâm chăm sóc thú cưng đã sẵn sàng!', 'HeThong', 'Cao', 'Chua doc'),
('Cập nhật phiên bản mới', 'Phiên bản 1.0.0 đã được cài đặt thành công với nhiều tính năng mới', 'HeThong', 'Binh thuong', 'Chua doc'),
('Khuyến mãi tháng 12', 'Giảm giá 20% cho tất cả gói tiêm phòng trong tháng 12', 'KhuyenMai', 'Cao', 'Chua doc');
