const db = require('../config/database');

// Lấy danh sách thú cưng
exports.getAllPets = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', loai = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    if (search) {
      whereConditions.push(`(tc.TenThuCung LIKE '%${search}%' OR kh.HoTen LIKE '%${search}%')`);
    }
    if (loai) {
      whereConditions.push(`tc.LoaiThuCung = '${loai}'`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const [pets] = await db.query(`
      SELECT 
        tc.*,
        kh.HoTen as TenChuSoHuu,
        kh.SDT,
        kh.Email
      FROM ThuCung tc
      JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
      ${whereClause}
      ORDER BY tc.MaThuCung DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total 
      FROM ThuCung tc
      JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
      ${whereClause}
    `);

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        totalPages: Math.ceil(total[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Chi tiết thú cưng
exports.getPetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [pet] = await db.query(`
      SELECT 
        tc.*,
        kh.HoTen as TenChuSoHuu,
        kh.SDT,
        kh.Email,
        kh.DiaChi
      FROM ThuCung tc
      JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
      WHERE tc.MaThuCung = ?
    `, [id]);

    if (pet.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thú cưng'
      });
    }

    res.json({
      success: true,
      data: pet[0]
    });
  } catch (error) {
    next(error);
  }
};

// Lịch sử khám bệnh
exports.getMedicalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [history] = await db.query(`
      CALL sp_LichSuKhamBenh(?)
    `, [id]);

    res.json({
      success: true,
      data: history[0]
    });
  } catch (error) {
    next(error);
  }
};

// Lịch sử tiêm chủng
exports.getVaccinationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [history] = await db.query(`
      CALL sp_LichSuTiemChung(?)
    `, [id]);

    res.json({
      success: true,
      data: history[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoicesByPet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [invoices] = await db.query(`
      SELECT DISTINCT
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        cn.Ten as TenChiNhanh,
        nv.HoTen as TenNhanVien,
        'KhamBenh' as Loai
      FROM LichSuKhamBenh lskb
      JOIN ChiTietHoaDonKhamBenh cthdk ON lskb.MaLichSuKhamBenh = cthdk.MaLichSuKhamBenh
      JOIN ChiTietHoaDon cthd ON cthdk.MaChiTietHoaDon = cthd.MaChiTietHoaDon
      JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE lskb.MaThuCung = ?
      UNION
      SELECT DISTINCT
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        cn.Ten as TenChiNhanh,
        nv.HoTen as TenNhanVien,
        'TiemPhong' as Loai
      FROM LichSuTiemPhong lst
      JOIN ChiTietHoaDon cthd ON lst.MaChiTietHoaDon = cthd.MaChiTietHoaDon
      JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE lst.MaThuCung = ?
      ORDER BY NgayLap DESC
    `, [id, id]);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};
// Lấy hóa đơn liên quan đến thú cưng
exports.getPetInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lấy hóa đơn từ khám bệnh
    const [invoicesFromMedical] = await db.query(`
      SELECT DISTINCT
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        cn.Ten as TenChiNhanh,
        nv.HoTen as TenNhanVien,
        'Khám bệnh' as LoaiDichVu,
        lskb.NgayKham,
        lskb.ChuanDoan
      FROM HoaDon h
      JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
      JOIN ChiTietHoaDonKhamBenh ctkb ON cthd.MaChiTietHoaDon = ctkb.MaChiTietHoaDon
      JOIN LichSuKhamBenh lskb ON ctkb.MaLichSuKhamBenh = lskb.MaLichSuKhamBenh
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE lskb.MaThuCung = ?
    `, [id]);

    // Lấy hóa đơn từ tiêm phòng
    const [invoicesFromVaccination] = await db.query(`
      SELECT DISTINCT
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        cn.Ten as TenChiNhanh,
        nv.HoTen as TenNhanVien,
        'Tiêm phòng' as LoaiDichVu,
        lstp.NgayTiem as NgayKham,
        gt.TenGoi as ChuanDoan
      FROM HoaDon h
      JOIN ChiTietHoaDon cthd ON h.MaHoaDon = cthd.MaHoaDon
      JOIN ChiTietHoaDonTiemPhong cttp ON cthd.MaChiTietHoaDon = cttp.MaChiTietHoaDon
      JOIN GoiTiem gt ON cttp.MaGoi = gt.MaGoi
      JOIN LichSuTiemPhong lstp ON cttp.MaChiTietHoaDon = lstp.MaChiTietHoaDon
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE lstp.MaThuCung = ?
    `, [id]);

    // Gộp và sắp xếp theo ngày
    const allInvoices = [...invoicesFromMedical, ...invoicesFromVaccination];
    const uniqueInvoices = Array.from(
      new Map(allInvoices.map(inv => [inv.MaHoaDon, inv])).values()
    ).sort((a, b) => new Date(b.NgayLap) - new Date(a.NgayLap));

    res.json({
      success: true,
      data: uniqueInvoices
    });
  } catch (error) {
    next(error);
  }
};

// Thêm thú cưng
exports.createPet = async (req, res, next) => {
  try {
    const { TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe, MaKhachHang } = req.body;

    const [result] = await db.query(`
      INSERT INTO ThuCung (TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe, MaKhachHang)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe, MaKhachHang]);

    res.status(201).json({
      success: true,
      data: {
        MaThuCung: result.insertId,
        message: 'Thêm thú cưng thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thú cưng
exports.updatePet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe } = req.body;

    await db.query(`
      UPDATE ThuCung
      SET TenThuCung = ?, LoaiThuCung = ?, GiongThuCung = ?, NgaySinh = ?, 
          GioiTinhThuCung = ?, TinhTrangSucKhoe = ?
      WHERE MaThuCung = ?
    `, [TenThuCung, LoaiThuCung, GiongThuCung, NgaySinh, GioiTinhThuCung, TinhTrangSucKhoe, id]);

    res.json({
      success: true,
      message: 'Cập nhật thú cưng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa thú cưng
exports.deletePet = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM ThuCung WHERE MaThuCung = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa thú cưng thành công'
    });
  } catch (error) {
    next(error);
  }
};
