USE petcarex;

DELIMITER //

-- =====================================================
-- 1. THỐNG KÊ DOANH THU
-- =====================================================

-- Doanh thu theo ngày/tháng/quý/năm của chi nhánh
CREATE PROCEDURE sp_DoanhThuChiNhanh(
    IN p_MaChiNhanh INT,
    IN p_LoaiThongKe VARCHAR(10), -- 'NGAY', 'THANG', 'QUY', 'NAM'
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    IF p_LoaiThongKe = 'NGAY' THEN
        SELECT 
            DATE(NgayLap) as Ngay,
            COUNT(*) as SoHoaDon,
            SUM(TongTien - KhuyenMai) as DoanhThu
        FROM HoaDon
        WHERE MaChiNhanh = p_MaChiNhanh
            AND DATE(NgayLap) BETWEEN p_TuNgay AND p_DenNgay
        GROUP BY DATE(NgayLap)
        ORDER BY DATE(NgayLap);
        
    ELSEIF p_LoaiThongKe = 'THANG' THEN
        SELECT 
            YEAR(NgayLap) as Nam,
            MONTH(NgayLap) as Thang,
            COUNT(*) as SoHoaDon,
            SUM(TongTien - KhuyenMai) as DoanhThu
        FROM HoaDon
        WHERE MaChiNhanh = p_MaChiNhanh
            AND DATE(NgayLap) BETWEEN p_TuNgay AND p_DenNgay
        GROUP BY YEAR(NgayLap), MONTH(NgayLap)
        ORDER BY YEAR(NgayLap), MONTH(NgayLap);
        
    ELSEIF p_LoaiThongKe = 'QUY' THEN
        SELECT 
            YEAR(NgayLap) as Nam,
            QUARTER(NgayLap) as Quy,
            COUNT(*) as SoHoaDon,
            SUM(TongTien - KhuyenMai) as DoanhThu
        FROM HoaDon
        WHERE MaChiNhanh = p_MaChiNhanh
            AND DATE(NgayLap) BETWEEN p_TuNgay AND p_DenNgay
        GROUP BY YEAR(NgayLap), QUARTER(NgayLap)
        ORDER BY YEAR(NgayLap), QUARTER(NgayLap);
        
    ELSE -- NAM
        SELECT 
            YEAR(NgayLap) as Nam,
            COUNT(*) as SoHoaDon,
            SUM(TongTien - KhuyenMai) as DoanhThu
        FROM HoaDon
        WHERE MaChiNhanh = p_MaChiNhanh
            AND DATE(NgayLap) BETWEEN p_TuNgay AND p_DenNgay
        GROUP BY YEAR(NgayLap)
        ORDER BY YEAR(NgayLap);
    END IF;
END //

-- Doanh thu toàn hệ thống
CREATE PROCEDURE sp_DoanhThuToanHeThong(
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT 
        cn.MaChiNhanh,
        cn.Ten as TenChiNhanh,
        COUNT(h.MaHoaDon) as SoHoaDon,
        COALESCE(SUM(h.TongTien - h.KhuyenMai), 0) as DoanhThu
    FROM ChiNhanh cn
    LEFT JOIN HoaDon h ON cn.MaChiNhanh = h.MaChiNhanh
        AND DATE(h.NgayLap) BETWEEN p_TuNgay AND p_DenNgay
    GROUP BY cn.MaChiNhanh, cn.Ten
    ORDER BY DoanhThu DESC;
END //

-- =====================================================
-- 2. QUẢN LÝ TIÊM PHÒNG
-- =====================================================

-- Danh sách thú cưng được tiêm phòng trong kỳ
CREATE PROCEDURE sp_DanhSachThuCungTiemPhong(
    IN p_MaChiNhanh INT,
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT DISTINCT
        tc.MaThuCung,
        tc.TenThuCung,
        tc.LoaiThuCung,
        tc.GiongThuCung,
        kh.HoTen as TenChuSoHuu,
        kh.SDT,
        COUNT(DISTINCT lst.MaMuiTiem) as SoMuiDaTiem,
        MAX(lst.NgayTiem) as NgayTiemGanNhat
    FROM ThuCung tc
    JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
    JOIN LichSuTiemPhong lst ON tc.MaThuCung = lst.MaThuCung
    JOIN ChiTietHoaDon cthd ON lst.MaChiTietHoaDon = cthd.MaChiTietHoaDon
    JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
    WHERE h.MaChiNhanh = p_MaChiNhanh
        AND DATE(lst.NgayTiem) BETWEEN p_TuNgay AND p_DenNgay
    GROUP BY tc.MaThuCung, tc.TenThuCung, tc.LoaiThuCung, tc.GiongThuCung, kh.HoTen, kh.SDT
    ORDER BY NgayTiemGanNhat DESC;
END //

-- Thống kê vắc-xin được đặt nhiều nhất
CREATE PROCEDURE sp_ThongKeVacXinPhoBien(
    IN p_MaChiNhanh INT,
    IN p_TuNgay DATE,
    IN p_DenNgay DATE,
    IN p_Top INT
)
BEGIN
    SELECT 
        vx.MaVacXin,
        vx.TenVacXin,
        vx.LoaiVacXin,
        COUNT(*) as SoLanSuDung,
        SUM(mt.Gia) as TongDoanhThu
    FROM VacXin vx
    JOIN MuiTiem mt ON vx.MaVacXin = mt.MaVacXin
    JOIN LichSuTiemPhong lst ON mt.MaMuiTiem = lst.MaMuiTiem
    JOIN ChiTietHoaDon cthd ON lst.MaChiTietHoaDon = cthd.MaChiTietHoaDon
    JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
    WHERE h.MaChiNhanh = p_MaChiNhanh
        AND DATE(lst.NgayTiem) BETWEEN p_TuNgay AND p_DenNgay
    GROUP BY vx.MaVacXin, vx.TenVacXin, vx.LoaiVacXin
    ORDER BY SoLanSuDung DESC
    LIMIT p_Top;
END //

-- Tra cứu lịch sử tiêm chủng của thú cưng
CREATE PROCEDURE sp_LichSuTiemChung(
    IN p_MaThuCung INT
)
BEGIN
    SELECT 
        lst.NgayTiem,
        vx.TenVacXin,
        vx.LoaiVacXin,
        mt.TenMuiTiem,
        lst.LieuLuong,
        nv.HoTen as TenBacSi,
        cn.Ten as TenChiNhanh
    FROM LichSuTiemPhong lst
    JOIN MuiTiem mt ON lst.MaMuiTiem = mt.MaMuiTiem
    JOIN VacXin vx ON mt.MaVacXin = vx.MaVacXin
    JOIN NhanVien nv ON lst.MaBacSi = nv.MaNV
    JOIN ChiTietHoaDon cthd ON lst.MaChiTietHoaDon = cthd.MaChiTietHoaDon
    JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
    JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
    WHERE lst.MaThuCung = p_MaThuCung
    ORDER BY lst.NgayTiem DESC;
END //

-- =====================================================
-- 3. QUẢN LÝ SẢN PHẨM & TỒN KHO
-- =====================================================

-- Tồn kho sản phẩm tại chi nhánh (giả định phân tán theo chi nhánh)
CREATE PROCEDURE sp_TonKhoSanPham(
    IN p_LoaiSanPham VARCHAR(50)
)
BEGIN
    SELECT 
        MaSanPham,
        TenSanPham,
        LoaiSanPham,
        GiaBan,
        SoLuongTonKho,
        CASE 
            WHEN SoLuongTonKho < 50 THEN 'Sap Het'
            WHEN SoLuongTonKho < 100 THEN 'Can Nhap'
            ELSE 'Du'
        END as TinhTrang
    FROM SanPham
    WHERE (p_LoaiSanPham IS NULL OR LoaiSanPham = p_LoaiSanPham)
    ORDER BY SoLuongTonKho ASC;
END //

-- Tra cứu vắc-xin
CREATE PROCEDURE sp_TraCuuVacXin(
    IN p_TenVacXin VARCHAR(100),
    IN p_LoaiVacXin VARCHAR(50),
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT 
        MaVacXin,
        TenVacXin,
        LoaiVacXin,
        NgaySanXuat,
        SoLuongTonKho,
        DATEDIFF(CURRENT_DATE, NgaySanXuat) as SoNgayTuSanXuat
    FROM VacXin
    WHERE (p_TenVacXin IS NULL OR TenVacXin LIKE CONCAT('%', p_TenVacXin, '%'))
        AND (p_LoaiVacXin IS NULL OR LoaiVacXin = p_LoaiVacXin)
        AND (p_TuNgay IS NULL OR NgaySanXuat >= p_TuNgay)
        AND (p_DenNgay IS NULL OR NgaySanXuat <= p_DenNgay)
    ORDER BY NgaySanXuat DESC;
END //

-- =====================================================
-- 4. LỊCH SỬ KHÁM BỆNH
-- =====================================================

-- Tra cứu lịch sử khám bệnh của thú cưng
CREATE PROCEDURE sp_LichSuKhamBenh(
    IN p_MaThuCung INT
)
BEGIN
    SELECT 
        lskb.MaLichSuKhamBenh,
        lskb.NgayKham,
        lskb.TrieuChung,
        lskb.ChuanDoan,
        lskb.ToaThuoc,
        lskb.NgayHenTaiKham,
        nv.HoTen as TenBacSi,
        cn.Ten as TenChiNhanh
    FROM LichSuKhamBenh lskb
    JOIN NhanVien nv ON lskb.MaBacSi = nv.MaNV
    LEFT JOIN ChiTietHoaDonKhamBenh cthdk ON lskb.MaLichSuKhamBenh = cthdk.MaLichSuKhamBenh
    LEFT JOIN ChiTietHoaDon cthd ON cthdk.MaChiTietHoaDon = cthd.MaChiTietHoaDon
    LEFT JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
    LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
    WHERE lskb.MaThuCung = p_MaThuCung
    ORDER BY lskb.NgayKham DESC;
END //

-- =====================================================
-- 5. HIỆU SUẤT NHÂN VIÊN
-- =====================================================

-- Thống kê hiệu suất nhân viên
CREATE PROCEDURE sp_HieuSuatNhanVien(
    IN p_MaChiNhanh INT,
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT 
        nv.MaNV,
        nv.HoTen,
        nv.ChucVu,
        COUNT(DISTINCT h.MaHoaDon) as SoDonHang,
        COALESCE(SUM(h.TongTien - h.KhuyenMai), 0) as TongDoanhThu,
        COALESCE(AVG(dg.MucHaiLongTongThe), 0) as DiemTrungBinh,
        COUNT(DISTINCT dg.MaHoaDon) as SoDanhGia
    FROM NhanVien nv
    LEFT JOIN NhanVienBanHang nvbh ON nv.MaNV = nvbh.MaNV
    LEFT JOIN HoaDon h ON nvbh.MaNV = h.MaNhanVienBanHang
        AND DATE(h.NgayLap) BETWEEN p_TuNgay AND p_DenNgay
    LEFT JOIN DanhGiaDichVu dg ON h.MaHoaDon = dg.MaHoaDon
    WHERE nv.MaChiNhanh = p_MaChiNhanh
    GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
    ORDER BY TongDoanhThu DESC;
END //

-- =====================================================
-- 6. THỐNG KÊ KHÁCH HÀNG
-- =====================================================

-- Thống kê khách hàng tại chi nhánh
CREATE PROCEDURE sp_ThongKeKhachHang(
    IN p_MaChiNhanh INT
)
BEGIN
    -- Tổng số khách hàng
    SELECT COUNT(DISTINCT h.MaKhachHang) as TongKhachHang
    FROM HoaDon h
    WHERE h.MaChiNhanh = p_MaChiNhanh;
    
    -- Khách hàng lâu chưa quay lại (>6 tháng)
    SELECT 
        kh.MaKhachHang,
        kh.HoTen,
        kh.SDT,
        kh.Email,
        MAX(h.NgayLap) as LanCuoiDen,
        DATEDIFF(CURRENT_DATE, MAX(h.NgayLap)) as SoNgayChuaDen
    FROM KhachHang kh
    JOIN HoaDon h ON kh.MaKhachHang = h.MaKhachHang
    WHERE h.MaChiNhanh = p_MaChiNhanh
    GROUP BY kh.MaKhachHang, kh.HoTen, kh.SDT, kh.Email
    HAVING DATEDIFF(CURRENT_DATE, MAX(h.NgayLap)) > 180
    ORDER BY SoNgayChuaDen DESC;
END //

-- =====================================================
-- 7. THỐNG KÊ CẤP CÔNG TY
-- =====================================================

-- Dịch vụ mang lại doanh thu cao nhất
CREATE PROCEDURE sp_DichVuDoanhThuCao(
    IN p_SoThangGanNhat INT
)
BEGIN
    SELECT 
        dv.MaDV,
        dv.TenDV,
        COUNT(*) as SoLanSuDung,
        SUM(cthd.Gia) as TongDoanhThu
    FROM DichVu dv
    JOIN ChiTietHoaDon cthd ON dv.MaDV = cthd.MaDV
    JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
    WHERE h.NgayLap >= DATE_SUB(CURRENT_DATE, INTERVAL p_SoThangGanNhat MONTH)
    GROUP BY dv.MaDV, dv.TenDV
    ORDER BY TongDoanhThu DESC;
END //

-- Thống kê thú cưng theo loài và giống
CREATE PROCEDURE sp_ThongKeThuCung()
BEGIN
    SELECT 
        LoaiThuCung,
        GiongThuCung,
        COUNT(*) as SoLuong,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ThuCung), 2) as TyLePhanTram
    FROM ThuCung
    GROUP BY LoaiThuCung, GiongThuCung
    ORDER BY SoLuong DESC;
END //

-- Tình hình hội viên
CREATE PROCEDURE sp_TinhHinhHoiVien()
BEGIN
    SELECT 
        lhv.TenHangHV,
        COUNT(*) as SoLuong,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM HoiVien), 2) as TyLe,
        AVG(hv.DiemTichLuy) as DiemTrungBinh,
        AVG(hv.TongChiTieu) as ChiTieuTrungBinh
    FROM HoiVien hv
    JOIN LoaiHoiVien lhv ON hv.MaHangHV = lhv.MaHangHV
    GROUP BY lhv.MaHangHV, lhv.TenHangHV
    ORDER BY lhv.MaHangHV;
END //

-- =====================================================
-- 8. QUẢN LÝ NHÂN VIÊN
-- =====================================================

-- Thêm nhân viên mới
CREATE PROCEDURE sp_ThemNhanVien(
    IN p_HoTen VARCHAR(100),
    IN p_NgaySinh DATE,
    IN p_GioiTinh VARCHAR(10),
    IN p_ChucVu VARCHAR(50),
    IN p_LuongCoBan DECIMAL(15,2),
    IN p_MaChiNhanh INT,
    IN p_ChuyenMon VARCHAR(100)
)
BEGIN
    DECLARE v_MaNV INT;
    
    INSERT INTO NhanVien (HoTen, NgaySinh, GioiTinhNV, NgayVaoLam, ChucVu, LuongCoBan, MaChiNhanh)
    VALUES (p_HoTen, p_NgaySinh, p_GioiTinh, CURRENT_DATE, p_ChucVu, p_LuongCoBan, p_MaChiNhanh);
    
    SET v_MaNV = LAST_INSERT_ID();
    
    IF p_ChucVu = 'Bac Si' THEN
        INSERT INTO BacSi (MaNV, ChuyenMon) VALUES (v_MaNV, p_ChuyenMon);
    ELSEIF p_ChucVu = 'Nhan Vien Ban Hang' THEN
        INSERT INTO NhanVienBanHang (MaNV) VALUES (v_MaNV);
    END IF;
    
    SELECT v_MaNV as MaNV, 'Them nhan vien thanh cong' as ThongBao;
END //

-- Cập nhật lương nhân viên
CREATE PROCEDURE sp_CapNhatLuong(
    IN p_MaNV INT,
    IN p_LuongMoi DECIMAL(15,2)
)
BEGIN
    UPDATE NhanVien
    SET LuongCoBan = p_LuongMoi
    WHERE MaNV = p_MaNV;
    
    SELECT 'Cap nhat luong thanh cong' as ThongBao;
END //

-- Điều động nhân viên
CREATE PROCEDURE sp_DieuDongNhanVien(
    IN p_MaNV INT,
    IN p_MaChiNhanhMoi INT
)
BEGIN
    DECLARE v_MaChiNhanhCu INT;
    
    SELECT MaChiNhanh INTO v_MaChiNhanhCu
    FROM NhanVien
    WHERE MaNV = p_MaNV;
    
    -- Lưu lịch sử
    INSERT INTO LichSuDieuDong (MaNV, MaChiNhanh, NgayChuyen)
    VALUES (p_MaNV, v_MaChiNhanhCu, CURRENT_DATE);
    
    -- Cập nhật chi nhánh mới
    UPDATE NhanVien
    SET MaChiNhanh = p_MaChiNhanhMoi
    WHERE MaNV = p_MaNV;
    
    SELECT 'Dieu dong nhan vien thanh cong' as ThongBao;
END //

-- Xóa nhân viên (soft delete - chỉ cập nhật trạng thái)
CREATE PROCEDURE sp_XoaNhanVien(
    IN p_MaNV INT
)
BEGIN
    -- Trong thực tế nên có cột TrangThai, ở đây demo bằng cách set LuongCoBan = 0
    UPDATE NhanVien
    SET LuongCoBan = 0
    WHERE MaNV = p_MaNV;
    
    SELECT 'Xoa nhan vien thanh cong' as ThongBao;
END //

DELIMITER ;
