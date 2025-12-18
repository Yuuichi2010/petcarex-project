-- =====================================================
-- PETCAREX DATABASE - COMPLETE SETUP
-- =====================================================

DROP DATABASE IF EXISTS petcarex;
CREATE DATABASE petcarex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petcarex;

-- =====================================================
-- 1. CÁC BẢNG CƠ BẢN
-- =====================================================

CREATE TABLE ChiNhanh (
    MaChiNhanh INT AUTO_INCREMENT PRIMARY KEY,
    Ten VARCHAR(100) NOT NULL,
    DiaChi VARCHAR(255),
    SDT CHAR(15),
    TGMoCua TIME,
    TGDongCua TIME,
    INDEX idx_ten (Ten)
) ENGINE=InnoDB;

CREATE TABLE DichVu (
    MaDV INT PRIMARY KEY,
    TenDV VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

INSERT INTO DichVu (MaDV, TenDV) VALUES 
(1, 'Mua Hang'), 
(2, 'Kham Benh'), 
(3, 'Tiem Phong');

CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSanPham VARCHAR(100) NOT NULL,
    LoaiSanPham VARCHAR(50),
    GiaBan DECIMAL(15,2),
    SoLuongTonKho INT DEFAULT 0,
    INDEX idx_ten_sanpham (TenSanPham),
    INDEX idx_loai_sanpham (LoaiSanPham),
    INDEX idx_tonkho (SoLuongTonKho)
) ENGINE=InnoDB;

CREATE TABLE VacXin (
    MaVacXin INT AUTO_INCREMENT PRIMARY KEY,
    TenVacXin VARCHAR(100) NOT NULL,
    LoaiVacXin VARCHAR(50),
    NgaySanXuat DATE,
    SoLuongTonKho INT DEFAULT 0,
    INDEX idx_ten_vacxin (TenVacXin),
    INDEX idx_loai_vacxin (LoaiVacXin),
    INDEX idx_ngay_sanxuat (NgaySanXuat)
) ENGINE=InnoDB;

CREATE TABLE MuiTiem (
    MaMuiTiem INT AUTO_INCREMENT PRIMARY KEY,
    TenMuiTiem VARCHAR(100),
    Gia DECIMAL(15,2),
    MaVacXin INT NOT NULL,
    FOREIGN KEY (MaVacXin) REFERENCES VacXin(MaVacXin),
    INDEX idx_vacxin (MaVacXin)
) ENGINE=InnoDB;

CREATE TABLE GoiTiem (
    MaGoi INT AUTO_INCREMENT PRIMARY KEY,
    TenGoi VARCHAR(100),
    SoThang INT,
    UuDai DECIMAL(5,2),
    INDEX idx_ten_goi (TenGoi)
) ENGINE=InnoDB;

CREATE TABLE GoiTiem_MuiTiem (
    MaGoi INT,
    MaMuiTiem INT,
    PRIMARY KEY (MaGoi, MaMuiTiem),
    FOREIGN KEY (MaGoi) REFERENCES GoiTiem(MaGoi),
    FOREIGN KEY (MaMuiTiem) REFERENCES MuiTiem(MaMuiTiem)
) ENGINE=InnoDB;

CREATE TABLE LoaiHoiVien (
    MaHangHV INT AUTO_INCREMENT PRIMARY KEY,
    TenHangHV VARCHAR(50),
    MucChiTieuDat DECIMAL(15,2),
    MucGiuHang DECIMAL(15,2)
) ENGINE=InnoDB;

INSERT INTO LoaiHoiVien (TenHangHV, MucChiTieuDat, MucGiuHang) VALUES
('Co Ban', 0, 0),
('Than Thiet', 5000000, 3000000),
('VIP', 12000000, 8000000);

-- =====================================================
-- 2. NHÂN SỰ
-- =====================================================

CREATE TABLE NhanVien (
    MaNV INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinhNV VARCHAR(10),
    NgayVaoLam DATE,
    ChucVu VARCHAR(50),
    LuongCoBan DECIMAL(15,2),
    MaChiNhanh INT NOT NULL,
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh),
    INDEX idx_hoten (HoTen),
    INDEX idx_chinhanh (MaChiNhanh),
    INDEX idx_chucvu (ChucVu)
) ENGINE=InnoDB;

CREATE TABLE BacSi (
    MaNV INT PRIMARY KEY,
    ChuyenMon VARCHAR(100),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
) ENGINE=InnoDB;

CREATE TABLE NhanVienBanHang (
    MaNV INT PRIMARY KEY,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
) ENGINE=InnoDB;

CREATE TABLE LichSuDieuDong (
    MaNV INT,
    MaChiNhanh INT,
    NgayChuyen DATE,
    PRIMARY KEY (MaNV, MaChiNhanh, NgayChuyen),
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh),
    INDEX idx_ngay_chuyen (NgayChuyen)
) ENGINE=InnoDB;

-- =====================================================
-- 3. KHÁCH HÀNG & THÚ CƯNG
-- =====================================================

CREATE TABLE KhachHang (
    MaKhachHang INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SDT CHAR(15),
    Email VARCHAR(100),
    CCCD CHAR(12),
    GioiTinhKH VARCHAR(10),
    NgaySinh DATE,
    NgayDangKy DATE,
    INDEX idx_hoten_kh (HoTen),
    INDEX idx_sdt (SDT),
    INDEX idx_email (Email)
) ENGINE=InnoDB;

CREATE TABLE HoiVien (
    MaKhachHang INT PRIMARY KEY,
    DiemTichLuy INT DEFAULT 0,
    TongChiTieu DECIMAL(15,2) DEFAULT 0,
    MaHangHV INT DEFAULT 1,
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaHangHV) REFERENCES LoaiHoiVien(MaHangHV),
    INDEX idx_hang_hv (MaHangHV),
    INDEX idx_tong_chitieu (TongChiTieu)
) ENGINE=InnoDB;

CREATE TABLE ThuCung (
    MaThuCung INT AUTO_INCREMENT PRIMARY KEY,
    TenThuCung VARCHAR(50),
    LoaiThuCung VARCHAR(50),
    GiongThuCung VARCHAR(50),
    NgaySinh DATE,
    GioiTinhThuCung VARCHAR(10),
    TinhTrangSucKhoe TEXT,
    MaKhachHang INT NOT NULL,
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    INDEX idx_ten_thucung (TenThuCung),
    INDEX idx_loai_thucung (LoaiThuCung),
    INDEX idx_khachhang (MaKhachHang)
) ENGINE=InnoDB;

-- =====================================================
-- 4. HÓA ĐƠN - PARTITION BY RANGE (Theo năm)
-- =====================================================

CREATE TABLE HoaDon (
    MaHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(15,2),
    KhuyenMai DECIMAL(15,2),
    HinhThucThanhToan VARCHAR(50),
    MaKhachHang INT,
    MaNhanVienBanHang INT,
    MaChiNhanh INT,

    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    FOREIGN KEY (MaNhanVienBanHang) REFERENCES NhanVienBanHang(MaNV),
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh),

    INDEX idx_ngaylap (NgayLap),
    INDEX idx_khachhang_hd (MaKhachHang),
    INDEX idx_chinhanh_hd (MaChiNhanh)
) ENGINE=InnoDB;

CREATE TABLE ChiTietHoaDon (
    MaChiTietHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    Gia DECIMAL(15,2),
    MaDV INT NOT NULL,
    MaHoaDon INT NOT NULL,
    FOREIGN KEY (MaDV) REFERENCES DichVu(MaDV),
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon),
    INDEX idx_hoadon (MaHoaDon),
    INDEX idx_dichvu (MaDV)
) ENGINE=InnoDB;

CREATE TABLE ChiTietHoaDonMuaHang (
    MaChiTietHoaDon INT PRIMARY KEY,
    SoLuong INT NOT NULL,
    MaSanPham INT NOT NULL,
    FOREIGN KEY (MaChiTietHoaDon) REFERENCES ChiTietHoaDon(MaChiTietHoaDon),
    FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham),
    INDEX idx_sanpham (MaSanPham)
) ENGINE=InnoDB;

CREATE TABLE ChiTietHoaDonTiemPhong (
    MaChiTietHoaDon INT PRIMARY KEY,
    MaGoi INT NOT NULL,
    FOREIGN KEY (MaChiTietHoaDon) REFERENCES ChiTietHoaDon(MaChiTietHoaDon),
    FOREIGN KEY (MaGoi) REFERENCES GoiTiem(MaGoi)
) ENGINE=InnoDB;

-- =====================================================
-- 5. LỊCH SỬ KHÁM & TIÊM
-- =====================================================

CREATE TABLE LichSuKhamBenh (
    MaLichSuKhamBenh INT AUTO_INCREMENT PRIMARY KEY,
    NgayKham DATETIME DEFAULT CURRENT_TIMESTAMP,
    TrieuChung TEXT,
    ChuanDoan TEXT,
    ToaThuoc TEXT,
    NgayHenTaiKham DATE,
    MaBacSi INT,
    MaThuCung INT,
    FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaNV),
    FOREIGN KEY (MaThuCung) REFERENCES ThuCung(MaThuCung),
    INDEX idx_ngay_kham (NgayKham),
    INDEX idx_thucung_kham (MaThuCung),
    INDEX idx_bacsi_kham (MaBacSi)
) ENGINE=InnoDB;

CREATE TABLE ChiTietHoaDonKhamBenh (
    MaChiTietHoaDon INT PRIMARY KEY,
    MaLichSuKhamBenh INT NOT NULL,
    FOREIGN KEY (MaChiTietHoaDon) REFERENCES ChiTietHoaDon(MaChiTietHoaDon),
    FOREIGN KEY (MaLichSuKhamBenh) REFERENCES LichSuKhamBenh(MaLichSuKhamBenh)
) ENGINE=InnoDB;

CREATE TABLE LichSuTiemPhong (
    MaChiTietHoaDon INT,
    STT INT,
    NgayTiem DATETIME,
    LieuLuong VARCHAR(50),
    MaBacSi INT,
    MaThuCung INT,
    MaMuiTiem INT,
    PRIMARY KEY (MaChiTietHoaDon, STT),
    FOREIGN KEY (MaChiTietHoaDon) REFERENCES ChiTietHoaDonTiemPhong(MaChiTietHoaDon),
    FOREIGN KEY (MaBacSi) REFERENCES BacSi(MaNV),
    FOREIGN KEY (MaThuCung) REFERENCES ThuCung(MaThuCung),
    FOREIGN KEY (MaMuiTiem) REFERENCES MuiTiem(MaMuiTiem),
    INDEX idx_ngay_tiem (NgayTiem),
    INDEX idx_thucung_tiem (MaThuCung)
) ENGINE=InnoDB;

-- =====================================================
-- 6. ĐÁNH GIÁ
-- =====================================================

CREATE TABLE DanhGiaDichVu (
    MaHoaDon INT,
    STT INT,
    DiemChatLuongDV INT,
    ThaiDoNV INT,
    MucHaiLongTongThe INT,
    BinhLuan TEXT,
    NgayDanhGia DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaKhachHang INT,
    PRIMARY KEY (MaHoaDon, STT),
    FOREIGN KEY (MaKhachHang) REFERENCES KhachHang(MaKhachHang),
    INDEX idx_ngay_danhgia (NgayDanhGia)
) ENGINE=InnoDB;

CREATE TABLE ThongBao (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TieuDe VARCHAR(200) NOT NULL,
    NoiDung TEXT,
    MucDo VARCHAR(20),
    DaDoc TINYINT(1) DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    MaChiNhanh INT,
    FOREIGN KEY (MaChiNhanh) REFERENCES ChiNhanh(MaChiNhanh),
    INDEX idx_created (CreatedAt)
) ENGINE=InnoDB;
