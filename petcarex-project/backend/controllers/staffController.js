const db = require('../config/database');

// Lấy danh sách nhân viên
exports.getAllStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', branchId = '', chucVu = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    
    if (search) {
      whereConditions.push(`nv.HoTen LIKE '%${search}%'`);
    }
    if (branchId) {
      whereConditions.push(`nv.MaChiNhanh = ${branchId}`);
    }
    if (chucVu) {
      whereConditions.push(`nv.ChucVu = '${chucVu}'`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [staff] = await db.query(`
      SELECT 
        nv.*,
        cn.Ten as TenChiNhanh,
        bs.ChuyenMon,
        TIMESTAMPDIFF(YEAR, nv.NgayVaoLam, CURRENT_DATE()) as NamKinhNghiem
      FROM NhanVien nv
      LEFT JOIN ChiNhanh cn ON nv.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN BacSi bs ON nv.MaNV = bs.MaNV
      ${whereClause}
      ORDER BY nv.MaNV DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM NhanVien nv ${whereClause}
    `);

    res.json({
      success: true,
      data: staff,
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

// Chi tiết nhân viên
exports.getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [staff] = await db.query(`
      SELECT 
        nv.*,
        cn.Ten as TenChiNhanh,
        bs.ChuyenMon
      FROM NhanVien nv
      LEFT JOIN ChiNhanh cn ON nv.MaChiNhanh = cn.MaChiNhanh
      LEFT JOIN BacSi bs ON nv.MaNV = bs.MaNV
      WHERE nv.MaNV = ?
    `, [id]);

    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy nhân viên'
      });
    }

    // Lịch sử điều động
    const [history] = await db.query(`
      SELECT 
        lsdd.*,
        cn.Ten as TenChiNhanh
      FROM LichSuDieuDong lsdd
      JOIN ChiNhanh cn ON lsdd.MaChiNhanh = cn.MaChiNhanh
      WHERE lsdd.MaNV = ?
      ORDER BY lsdd.NgayChuyen DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        staff: staff[0],
        transferHistory: history
      }
    });
  } catch (error) {
    next(error);
  }
};

// Hiệu suất nhân viên
exports.getStaffPerformance = async (req, res, next) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    const [performance] = await db.query(`
      CALL sp_HieuSuatNhanVien(?, ?, ?)
    `, [branchId, fromDate, toDate]);

    res.json({
      success: true,
      data: performance[0]
    });
  } catch (error) {
    next(error);
  }
};

// Thêm nhân viên
exports.createStaff = async (req, res, next) => {
  try {
    const { HoTen, NgaySinh, GioiTinhNV, ChucVu, LuongCoBan, MaChiNhanh, ChuyenMon } = req.body;

    const [result] = await db.query(`
      CALL sp_ThemNhanVien(?, ?, ?, ?, ?, ?, ?)
    `, [HoTen, NgaySinh, GioiTinhNV, ChucVu, LuongCoBan, MaChiNhanh, ChuyenMon || null]);

    res.status(201).json({
      success: true,
      data: result[0][0]
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật nhân viên
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HoTen, NgaySinh, GioiTinhNV, ChucVu, LuongCoBan, ChuyenMon } = req.body;

    await db.query(`
      UPDATE NhanVien
      SET HoTen = ?, NgaySinh = ?, GioiTinhNV = ?, ChucVu = ?, LuongCoBan = ?
      WHERE MaNV = ?
    `, [HoTen, NgaySinh, GioiTinhNV, ChucVu, LuongCoBan, id]);

    // Cập nhật chuyên môn nếu là bác sĩ
    if (ChucVu === 'Bac Si' && ChuyenMon) {
      await db.query(`
        UPDATE BacSi SET ChuyenMon = ? WHERE MaNV = ?
      `, [ChuyenMon, id]);
    }

    res.json({
      success: true,
      message: 'Cập nhật nhân viên thành công'
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật lương
exports.updateSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { LuongCoBan } = req.body;

    const [result] = await db.query(`
      CALL sp_CapNhatLuong(?, ?)
    `, [id, LuongCoBan]);

    res.json({
      success: true,
      data: result[0][0]
    });
  } catch (error) {
    next(error);
  }
};

// Điều động nhân viên
exports.transferStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { MaChiNhanhMoi } = req.body;

    const [result] = await db.query(`
      CALL sp_DieuDongNhanVien(?, ?)
    `, [id, MaChiNhanhMoi]);

    res.json({
      success: true,
      data: result[0][0]
    });
  } catch (error) {
    next(error);
  }
};

// Xóa nhân viên
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`
      CALL sp_XoaNhanVien(?)
    `, [id]);

    res.json({
      success: true,
      data: result[0][0]
    });
  } catch (error) {
    next(error);
  }
};