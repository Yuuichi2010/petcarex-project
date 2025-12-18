const db = require('../config/database');

// Lấy tất cả chi nhánh
exports.getAllBranches = async (req, res, next) => {
  try {
    const [branches] = await db.query(`
      SELECT 
        cn.*,
        COUNT(DISTINCT nv.MaNV) as SoNhanVien,
        COUNT(DISTINCT h.MaHoaDon) as SoHoaDon,
        COALESCE(SUM(h.TongTien - h.KhuyenMai), 0) as DoanhThu
      FROM ChiNhanh cn
      LEFT JOIN NhanVien nv ON cn.MaChiNhanh = nv.MaChiNhanh
      LEFT JOIN HoaDon h ON cn.MaChiNhanh = h.MaChiNhanh
        AND YEAR(h.NgayLap) = YEAR(CURRENT_DATE())
        AND MONTH(h.NgayLap) = MONTH(CURRENT_DATE())
      GROUP BY cn.MaChiNhanh
      ORDER BY cn.MaChiNhanh
    `);

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    next(error);
  }
};

// Chi tiết chi nhánh
exports.getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [branch] = await db.query(`
      SELECT * FROM ChiNhanh WHERE MaChiNhanh = ?
    `, [id]);

    if (branch.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy chi nhánh'
      });
    }

    // Nhân viên của chi nhánh
    const [staff] = await db.query(`
      SELECT * FROM NhanVien 
      WHERE MaChiNhanh = ?
      ORDER BY ChucVu, HoTen
    `, [id]);

    res.json({
      success: true,
      data: {
        branch: branch[0],
        staff: staff
      }
    });
  } catch (error) {
    next(error);
  }
};

// Doanh thu chi nhánh
exports.getBranchRevenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'THANG', fromDate, toDate } = req.query;

    const [revenue] = await db.query(`
      CALL sp_DoanhThuChiNhanh(?, ?, ?, ?)
    `, [id, type, fromDate, toDate]);

    res.json({
      success: true,
      data: revenue[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thêm chi nhánh
exports.createBranch = async (req, res, next) => {
  try {
    const { Ten, DiaChi, SDT, TGMoCua, TGDongCua } = req.body;

    const [result] = await db.query(`
      INSERT INTO ChiNhanh (Ten, DiaChi, SDT, TGMoCua, TGDongCua)
      VALUES (?, ?, ?, ?, ?)
    `, [Ten, DiaChi, SDT, TGMoCua, TGDongCua]);

    res.status(201).json({
      success: true,
      data: {
        MaChiNhanh: result.insertId,
        message: 'Thêm chi nhánh thành công'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật chi nhánh
exports.updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Ten, DiaChi, SDT, TGMoCua, TGDongCua } = req.body;

    await db.query(`
      UPDATE ChiNhanh
      SET Ten = ?, DiaChi = ?, SDT = ?, TGMoCua = ?, TGDongCua = ?
      WHERE MaChiNhanh = ?
    `, [Ten, DiaChi, SDT, TGMoCua, TGDongCua, id]);

    res.json({
      success: true,
      message: 'Cập nhật chi nhánh thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Chi tiết đầy đủ của chi nhánh
exports.getBranchDetailFull = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fromDate, toDate } = req.query;
    
    const from = fromDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const to = toDate || new Date().toISOString().split('T')[0];

    const [results] = await db.query(`
      CALL sp_ChiTietChiNhanh(?, ?, ?)
    `, [id, from, to]);

    res.json({
      success: true,
      data: {
        overview: results[0][0],
        staff: results[1],
        dailyRevenue: results[2],
        serviceRevenue: results[3]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách hóa đơn của chi nhánh
exports.getBranchInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;

    let dateFilter = '';
    if (fromDate && toDate) {
      dateFilter = `AND DATE(h.NgayLap) BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    const [invoices] = await db.query(`
      SELECT 
        h.MaHoaDon,
        h.NgayLap,
        h.TongTien,
        h.KhuyenMai,
        h.HinhThucThanhToan,
        kh.HoTen as TenKhachHang,
        kh.SDT,
        tc.TenThuCung,
        nv.HoTen as TenNhanVien,
        (h.TongTien - h.KhuyenMai) as ThanhTien
      FROM HoaDon h
      LEFT JOIN KhachHang kh ON h.MaKhachHang = kh.MaKhachHang
      LEFT JOIN ThuCung tc ON h.MaThuCung = tc.MaThuCung
      LEFT JOIN NhanVien nv ON h.MaNhanVienBanHang = nv.MaNV
      WHERE h.MaChiNhanh = ? ${dateFilter}
      ORDER BY h.NgayLap DESC
      LIMIT ${limit} OFFSET ${offset}
    `, [id]);

    const [total] = await db.query(`
      SELECT COUNT(*) as total
      FROM HoaDon h
      WHERE h.MaChiNhanh = ? ${dateFilter}
    `, [id]);

    res.json({
      success: true,
      data: invoices,
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