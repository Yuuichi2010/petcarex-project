USE petcarex;

-- =====================================================
-- TEST HIỆU SUẤT TRƯỚC VÀ SAU KHI TẠO INDEX
-- =====================================================

-- BẬT PROFILING
SET profiling = 1;

-- =====================================================
-- TEST 1: TÌM KIẾM KHÁCH HÀNG THEO TÊN
-- =====================================================

-- Không có index (đã xóa)
-- ALTER TABLE KhachHang DROP INDEX idx_khachhang_hoten;

EXPLAIN SELECT * FROM KhachHang WHERE HoTen LIKE '%Nguyen%';
SELECT * FROM KhachHang WHERE HoTen LIKE '%Nguyen%' LIMIT 100;

-- Có index
-- CREATE INDEX idx_khachhang_hoten ON KhachHang(HoTen);

EXPLAIN SELECT * FROM KhachHang WHERE HoTen LIKE 'Nguyen%';
SELECT * FROM KhachHang WHERE HoTen LIKE 'Nguyen%' LIMIT 100;

-- =====================================================
-- TEST 2: TÌM HÓA ĐƠN THEO KHOẢNG THỜI GIAN
-- =====================================================

EXPLAIN SELECT * FROM HoaDon 
WHERE NgayLap BETWEEN '2024-01-01' AND '2024-12-31';

SELECT 
    YEAR(NgayLap) as Nam,
    MONTH(NgayLap) as Thang,
    COUNT(*) as SoHoaDon,
    SUM(TongTien - KhuyenMai) as DoanhThu
FROM HoaDon
WHERE NgayLap BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY YEAR(NgayLap), MONTH(NgayLap);

-- =====================================================
-- TEST 3: TÌM THÚ CƯNG VÀ CHỦ SỞ HỮU
-- =====================================================

EXPLAIN SELECT 
    tc.TenThuCung,
    tc.LoaiThuCung,
    kh.HoTen,
    kh.SDT
FROM ThuCung tc
JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
WHERE tc.LoaiThuCung = 'Cho'
LIMIT 100;

-- =====================================================
-- TEST 4: THỐNG KÊ DOANH THU CHI NHÁNH
-- =====================================================

EXPLAIN SELECT 
    cn.Ten,
    COUNT(h.MaHoaDon) as SoHoaDon,
    SUM(h.TongTien - h.KhuyenMai) as DoanhThu
FROM ChiNhanh cn
LEFT JOIN HoaDon h ON cn.MaChiNhanh = h.MaChiNhanh
    AND YEAR(h.NgayLap) = 2024
GROUP BY cn.MaChiNhanh, cn.Ten;

-- =====================================================
-- TEST 5: LỊCH SỬ KHÁM BỆNH CỦA THÚ CƯNG
-- =====================================================

EXPLAIN SELECT 
    lskb.NgayKham,
    lskb.TrieuChung,
    lskb.ChuanDoan,
    nv.HoTen as BacSi
FROM LichSuKhamBenh lskb
JOIN NhanVien nv ON lskb.MaBacSi = nv.MaNV
WHERE lskb.MaThuCung = 1
ORDER BY lskb.NgayKham DESC;

-- =====================================================
-- TEST 6: TÌM SẢN PHẨM CẦN NHẬP HÀNG
-- =====================================================

EXPLAIN SELECT 
    MaSanPham,
    TenSanPham,
    LoaiSanPham,
    SoLuongTonKho
FROM SanPham
WHERE SoLuongTonKho < 100
ORDER BY SoLuongTonKho ASC;

-- =====================================================
-- XEM KẾT QUẢ PROFILING
-- =====================================================

SHOW PROFILES;

-- Xem chi tiết query cụ thể (thay N bằng Query_ID)
-- SHOW PROFILE FOR QUERY N;

-- =====================================================
-- SO SÁNH PARTITION
-- =====================================================

-- Test truy vấn trên bảng có partition
EXPLAIN PARTITIONS 
SELECT * FROM HoaDon 
WHERE NgayLap BETWEEN '2024-01-01' AND '2024-12-31';

-- Xem thông tin partition
SELECT 
    PARTITION_NAME,
    TABLE_ROWS,
    AVG_ROW_LENGTH,
    DATA_LENGTH
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_SCHEMA = 'petcarex' 
    AND TABLE_NAME = 'HoaDon';

-- TẮT PROFILING
SET profiling = 0;
