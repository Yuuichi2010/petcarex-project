const db = require('../config/database');

// Thống kê tổng quan
exports.getStats = async (req, res, next) => {
  try {
    const [customers] = await db.query('SELECT COUNT(*) as total FROM KhachHang');
    const [pets] = await db.query('SELECT COUNT(*) as total FROM ThuCung');
    const [branches] = await db.query('SELECT COUNT(*) as total FROM ChiNhanh');
    
    const [revenue] = await db.query(`
      SELECT 
        COALESCE(SUM(TongTien - KhuyenMai), 0) as total,
        COUNT(*) as orders
      FROM HoaDon 
      WHERE YEAR(NgayLap) = YEAR(CURRENT_DATE()) 
        AND MONTH(NgayLap) = MONTH(CURRENT_DATE())
    `);

    const [todayAppointments] = await db.query(`
      SELECT COUNT(*) as total
      FROM LichSuKhamBenh
      WHERE DATE(NgayKham) = CURRENT_DATE()
    `);

    res.json({
      success: true,
      data: {
        totalCustomers: customers[0].total,
        totalPets: pets[0].total,
        totalBranches: branches[0].total,
        monthlyRevenue: revenue[0].total,
        monthlyOrders: revenue[0].orders,
        todayAppointments: todayAppointments[0].total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Lịch hẹn gần đây
exports.getRecentAppointments = async (req, res, next) => {
  try {
    const [appointments] = await db.query(`
      SELECT 
        lskb.MaLichSuKhamBenh,
        lskb.NgayKham,
        lskb.NgayHenTaiKham,
        tc.TenThuCung,
        tc.LoaiThuCung,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        nv.HoTen as TenBacSi,
        cn.Ten as TenChiNhanh
      FROM LichSuKhamBenh lskb
      JOIN ThuCung tc ON lskb.MaThuCung = tc.MaThuCung
      JOIN KhachHang kh ON tc.MaKhachHang = kh.MaKhachHang
      JOIN NhanVien nv ON lskb.MaBacSi = nv.MaNV
      LEFT JOIN ChiTietHoaDonKhamBenh cthdk ON lskb.MaLichSuKhamBenh = cthdk.MaLichSuKhamBenh
      LEFT JOIN ChiTietHoaDon cthd ON cthdk.MaChiTietHoaDon = cthd.MaChiTietHoaDon
      LEFT JOIN HoaDon h ON cthd.MaHoaDon = h.MaHoaDon
      LEFT JOIN ChiNhanh cn ON h.MaChiNhanh = cn.MaChiNhanh
      WHERE DATE(lskb.NgayKham) >= CURRENT_DATE()
      ORDER BY lskb.NgayKham ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// Doanh thu theo chi nhánh
exports.getRevenueByBranch = async (req, res, next) => {
  try {
    const [revenue] = await db.query(`
      SELECT 
        cn.MaChiNhanh,
        cn.Ten as TenChiNhanh,
        COUNT(h.MaHoaDon) as SoHoaDon,
        COALESCE(SUM(h.TongTien - h.KhuyenMai), 0) as DoanhThu
      FROM ChiNhanh cn
      LEFT JOIN HoaDon h ON cn.MaChiNhanh = h.MaChiNhanh
        AND YEAR(h.NgayLap) = YEAR(CURRENT_DATE())
        AND MONTH(h.NgayLap) = MONTH(CURRENT_DATE())
      GROUP BY cn.MaChiNhanh, cn.Ten
      ORDER BY DoanhThu DESC
    `);

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};