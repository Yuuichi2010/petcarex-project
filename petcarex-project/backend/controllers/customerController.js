const db = require('../config/database');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const searchCondition = search 
      ? `WHERE kh.HoTen LIKE '%${search}%' OR kh.SDT LIKE '%${search}%' OR kh.Email LIKE '%${search}%'`
      : '';

    const [customers] = await db.query(`
      SELECT 
        kh.*,
        hv.DiemTichLuy,
        hv.TongChiTieu,
        lhv.TenHangHV,
        COUNT(DISTINCT tc.MaThuCung) as SoThuCung
      FROM KhachHang kh
      LEFT JOIN HoiVien hv ON kh.MaKhachHang = hv.MaKhachHang
      LEFT JOIN LoaiHoiVien lhv ON hv.MaHangHV = lhv.MaHangHV
      LEFT JOIN ThuCung tc ON kh.MaKhachHang = tc.MaKhachHang
      ${searchCondition}
      GROUP BY kh.MaKhachHang
      ORDER BY kh.MaKhachHang DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM KhachHang kh
      ${searchCondition}
    `);

    res.json({
      success: true,
      data: customers,
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

// Lấy chi tiết khách hàng
exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [customer] = await db.query(`
      SELECT 
        kh.*,
        hv.DiemTichLuy,
        hv.TongChiTieu,
        lhv.TenHangHV,
        lhv.MucChiTieuDat,
        lhv.MucGiuHang
      FROM KhachHang kh
      LEFT JOIN HoiVien hv ON kh.MaKhachHang = hv.MaKhachHang
      LEFT JOIN LoaiHoiVien lhv ON hv.MaHangHV = lhv.MaHangHV
      WHERE kh.MaKhachHang = ?
    `, [id]);

    if (customer.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy khách hàng'
      });
    }

    // Lấy danh sách thú cưng
    const [pets] = await db.query(`
      SELECT * FROM ThuCung
      WHERE MaKhachHang = ?
    `, [id]);

    // Lịch sử hóa đơn
    const [invoices] = await db.query(`
      SELECT 
        h.*,
        cn.Ten as TenChiNhanh
      FROM HoaDon h
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      WHERE h.MaKhachHang = ?
      ORDER BY h.NgayLap DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: {
        customer: customer[0],
        pets: pets,
        recentInvoices: invoices
      }
    });
  } catch (error) {
    next(error);
  }
};

// Thêm khách hàng mới
exports.createCustomer = async (req, res, next) => {
  try {
    const { HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh } = req.body;

    const [result] = await db.query(`
      INSERT INTO KhachHang (HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh, NgayDangKy)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE())
    `, [HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh]);

    res.status(201).json({
      success: true,
      data: {
        MaKhachHang: result.insertId,
        message: 'Thêm khách hàng thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh } = req.body;

    await db.query(`
      UPDATE KhachHang
      SET HoTen = ?, SDT = ?, Email = ?, CCCD = ?, GioiTinhKH = ?, NgaySinh = ?
      WHERE MaKhachHang = ?
    `, [HoTen, SDT, Email, CCCD, GioiTinhKH, NgaySinh, id]);

    res.json({
      success: true,
      message: 'Cập nhật khách hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM KhachHang WHERE MaKhachHang = ?', [id]);

    res.json({
      success: true,
      message: 'Xóa khách hàng thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Lấy hóa đơn gần đây của khách hàng
exports.getCustomerRecentInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const [invoices] = await db.query(`
      CALL sp_HoaDonGanDayKhachHang(?, ?)
    `, [id, limit]);

    res.json({
      success: true,
      data: invoices[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thống kê chi tiêu của khách hàng
exports.getCustomerSpendingStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT h.MaHoaDon) as TongHoaDon,
        COALESCE(SUM(h.TongTien - h.KhuyenMai), 0) as TongChiTieu,
        COALESCE(AVG(h.TongTien - h.KhuyenMai), 0) as ChiTieuTrungBinh,
        MAX(h.NgayLap) as LanMuaGanNhat,
        COUNT(DISTINCT h.MaThuCung) as SoThuCungDaSuDung
      FROM HoaDon h
      WHERE h.MaKhachHang = ?
    `, [id]);

    // Thống kê theo dịch vụ
    const [serviceStats] = await db.query(`
      SELECT 
        dv.TenDV,
        COUNT(*) as SoLan,
        SUM(cthd.Gia) as TongTien
      FROM ChiTietHoaDon cthd
      JOIN DichVu dv ON cthd.MaDV = dv.MaDV
      JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
      WHERE h.MaKhachHang = ?
      GROUP BY dv.MaDV, dv.TenDV
      ORDER BY SoLan DESC
    `, [id]);

    // Chi tiêu theo tháng
    const [monthlySpending] = await db.query(`
      SELECT 
        YEAR(NgayLap) as Nam,
        MONTH(NgayLap) as Thang,
        COUNT(*) as SoHoaDon,
        SUM(TongTien - KhuyenMai) as TongTien
      FROM HoaDon
      WHERE MaKhachHang = ?
        AND NgayLap >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY YEAR(NgayLap), MONTH(NgayLap)
      ORDER BY Nam DESC, Thang DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        byService: serviceStats,
        monthly: monthlySpending
      }
    });
  } catch (error) {
    next(error);
  }
};