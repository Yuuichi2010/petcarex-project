USE petcarex;

-- =====================================================
-- TẠO CÁC CHỈ MỤC ĐỂ TỐI ƯU HIỆU SUẤT
-- =====================================================

-- Indexes cho bảng KhachHang
CREATE INDEX idx_khachhang_hoten ON KhachHang(HoTen);
CREATE INDEX idx_khachhang_sdt ON KhachHang(SDT);
CREATE INDEX idx_khachhang_email ON KhachHang(Email);
CREATE INDEX idx_khachhang_ngaydangky ON KhachHang(NgayDangKy);

-- Indexes cho bảng HoiVien
CREATE INDEX idx_hoivien_hang ON HoiVien(MaHangHV);
CREATE INDEX idx_hoivien_tongchitieu ON HoiVien(TongChiTieu);
CREATE INDEX idx_hoivien_diem ON HoiVien(DiemTichLuy);

-- Indexes cho bảng ThuCung
CREATE INDEX idx_thucung_ten ON ThuCung(TenThuCung);
CREATE INDEX idx_thucung_loai ON ThuCung(LoaiThuCung);
CREATE INDEX idx_thucung_khachhang ON ThuCung(MaKhachHang);
CREATE INDEX idx_thucung_loai_giong ON ThuCung(LoaiThuCung, GiongThuCung);

-- Indexes cho bảng HoaDon (đã có partition)
CREATE INDEX idx_hoadon_khachhang ON HoaDon(MaKhachHang);
CREATE INDEX idx_hoadon_chinhanh ON HoaDon(MaChiNhanh);
CREATE INDEX idx_hoadon_nhanvien ON HoaDon(MaNhanVienBanHang);
CREATE INDEX idx_hoadon_ngaylap_chinhanh ON HoaDon(NgayLap, MaChiNhanh);

-- Indexes cho bảng ChiTietHoaDon
CREATE INDEX idx_chitiethoadon_hoadon ON ChiTietHoaDon(MaHoaDon);
CREATE INDEX idx_chitiethoadon_dichvu ON ChiTietHoaDon(MaDV);

-- Indexes cho bảng LichSuKhamBenh
CREATE INDEX idx_lichsukhambenh_thucung ON LichSuKhamBenh(MaThuCung);
CREATE INDEX idx_lichsukhambenh_bacsi ON LichSuKhamBenh(MaBacSi);
CREATE INDEX idx_lichsukhambenh_ngaykham ON LichSuKhamBenh(NgayKham);
CREATE INDEX idx_lichsukhambenh_ngayhen ON LichSuKhamBenh(NgayHenTaiKham);

-- Indexes cho bảng LichSuTiemPhong
CREATE INDEX idx_lichsutiemphong_thucung ON LichSuTiemPhong(MaThuCung);
CREATE INDEX idx_lichsutiemphong_bacsi ON LichSuTiemPhong(MaBacSi);
CREATE INDEX idx_lichsutiemphong_ngaytiem ON LichSuTiemPhong(NgayTiem);
CREATE INDEX idx_lichsutiemphong_muitiem ON LichSuTiemPhong(MaMuiTiem);

-- Indexes cho bảng NhanVien
CREATE INDEX idx_nhanvien_hoten ON NhanVien(HoTen);
CREATE INDEX idx_nhanvien_chinhanh ON NhanVien(MaChiNhanh);
CREATE INDEX idx_nhanvien_chucvu ON NhanVien(ChucVu);
CREATE INDEX idx_nhanvien_ngayvaolam ON NhanVien(NgayVaoLam);

-- Indexes cho bảng SanPham
CREATE INDEX idx_sanpham_ten ON SanPham(TenSanPham);
CREATE INDEX idx_sanpham_loai ON SanPham(LoaiSanPham);
CREATE INDEX idx_sanpham_tonkho ON SanPham(SoLuongTonKho);

-- Indexes cho bảng VacXin
CREATE INDEX idx_vacxin_ten ON VacXin(TenVacXin);
CREATE INDEX idx_vacxin_loai ON VacXin(LoaiVacXin);
CREATE INDEX idx_vacxin_ngaysanxuat ON VacXin(NgaySanXuat);
CREATE INDEX idx_vacxin_tonkho ON VacXin(SoLuongTonKho);

-- Indexes cho bảng DanhGiaDichVu
CREATE INDEX idx_danhgia_hoadon ON DanhGiaDichVu(MaHoaDon);
CREATE INDEX idx_danhgia_khachhang ON DanhGiaDichVu(MaKhachHang);
CREATE INDEX idx_danhgia_ngay ON DanhGiaDichVu(NgayDanhGia);

-- Composite indexes cho truy vấn phức tạp
CREATE INDEX idx_hoadon_composite ON HoaDon(MaChiNhanh, NgayLap, MaKhachHang);
CREATE INDEX idx_thucung_composite ON ThuCung(MaKhachHang, LoaiThuCung);
CREATE INDEX idx_lichsukhambenh_composite ON LichSuKhamBenh(MaThuCung, NgayKham);

-- Full-text search indexes
ALTER TABLE KhachHang ADD FULLTEXT idx_khachhang_fulltext (HoTen, Email);
ALTER TABLE ThuCung ADD FULLTEXT idx_thucung_fulltext (TenThuCung);
ALTER TABLE SanPham ADD FULLTEXT idx_sanpham_fulltext (TenSanPham);

SHOW INDEX FROM HoaDon;
SHOW INDEX FROM KhachHang;
SHOW INDEX FROM ThuCung;
